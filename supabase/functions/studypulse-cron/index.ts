import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * StudyPulse Cron — sends daily check-in prompts at age-based times.
 *
 * Call this function every 15 minutes via:
 *   - pg_cron (SELECT net.http_post(...))
 *   - External cron (GitHub Actions, cron-job.org, etc.)
 *   - Supabase scheduled function
 *
 * It checks sq_checkin_schedule for timing, finds children who
 * haven't been prompted yet today, and sends WhatsApp check-ins.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Singapore timezone offset (+8h)
function getSGTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 8 * 60 * 60 * 1000);
}

function formatTime(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function getLevelGroup(level: string): string {
  const l = level.toUpperCase();
  if (/^P[1-3]$/.test(l)) return "primary_lower";
  if (/^P[4-6]$/.test(l)) return "primary_upper";
  if (/^SEC[1-3]$/i.test(l)) return "secondary_lower";
  return "secondary_upper_jc";
}

// FREE plan: only check-in on Tue/Thu/Sat
const FREE_DAYS = [2, 4, 6]; // 0=Sun, 1=Mon, ... 6=Sat

async function sendWhatsApp(
  to: string,
  templateName?: string,
  variables?: Record<string, string>,
  rawMessage?: string,
) {
  const url = `${supabaseUrl}/functions/v1/send-whatsapp`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(
      rawMessage
        ? { to, raw_message: rawMessage }
        : { to, template_name: templateName, variables },
    ),
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    const sgNow = getSGTime();
    const currentTime = formatTime(sgNow);
    const today = sgNow.toISOString().split("T")[0];
    const dayOfWeek = sgNow.getUTCDay(); // 0=Sun
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Get all schedule windows
    const { data: schedules } = await sb
      .from("sq_checkin_schedule")
      .select("*");

    if (!schedules || schedules.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No schedules configured", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let totalSent = 0;
    let totalReminders = 0;

    for (const schedule of schedules) {
      const checkinTime = isWeekend
        ? schedule.weekend_kid_checkin
        : schedule.weekday_kid_checkin;
      const followupTime = isWeekend
        ? schedule.weekend_kid_checkin // weekend has no separate followup
        : schedule.weekday_followup;
      const parentReportTime = isWeekend
        ? schedule.weekend_parent_report
        : schedule.weekday_parent_report;

      // ── SEND CHECK-IN PROMPTS ──
      // Check if current time matches this schedule's check-in window (±7 min)
      if (isWithinWindow(currentTime, checkinTime, 7)) {
        const sent = await sendCheckinPrompts(
          sb,
          schedule.level_group,
          today,
          dayOfWeek,
        );
        totalSent += sent;
      }

      // ── SEND FOLLOW-UP REMINDERS (no reply after 30-45 min) ──
      if (
        !isWeekend &&
        isWithinWindow(currentTime, followupTime, 7)
      ) {
        const reminded = await sendFollowupReminders(
          sb,
          schedule.level_group,
          today,
        );
        totalReminders += reminded;
      }

      // ── SEND PARENT REPORTS ──
      if (isWithinWindow(currentTime, parentReportTime, 7)) {
        await sendParentReports(sb, schedule.level_group, today);
      }
    }

    // ── CHECK EXAM PROXIMITY ──
    await checkExamProximity(sb, today);

    // ── WEEKLY SUMMARIES (Sunday 8pm SGT) ──
    if (dayOfWeek === 0 && isWithinWindow(currentTime, "20:00", 7)) {
      await sendWeeklySummaries(sb, today);
    }

    return new Response(
      JSON.stringify({
        success: true,
        time_sg: currentTime,
        sent: totalSent,
        reminders: totalReminders,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Cron error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Cron error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// ── CORE FUNCTIONS ──

async function sendCheckinPrompts(
  sb: ReturnType<typeof createClient>,
  levelGroup: string,
  today: string,
  dayOfWeek: number,
): Promise<number> {
  // Get all children in this level group
  const { data: children } = await sb
    .from("sq_children")
    .select("id, name, level, whatsapp_number, parent_id")
    .not("whatsapp_number", "is", null);

  if (!children) return 0;

  let sent = 0;

  for (const child of children) {
    if (getLevelGroup(child.level) !== levelGroup) continue;
    if (!child.whatsapp_number) continue;

    // Check plan — free users only get Tue/Thu/Sat
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("plan_type")
      .eq("user_id", child.parent_id)
      .single();

    if (
      membership?.plan_type === "free" &&
      !FREE_DAYS.includes(dayOfWeek)
    ) {
      continue; // Skip — not a check-in day for free plan
    }

    // Check if already prompted today
    const { data: existing } = await sb
      .from("sq_checkins")
      .select("id")
      .eq("child_id", child.id)
      .eq("checkin_date", today)
      .limit(1);

    if (existing && existing.length > 0) continue; // Already sent

    // Create pending checkin record
    await sb.from("sq_checkins").insert({
      child_id: child.id,
      checkin_date: today,
      status: "pending",
      prompt_sent_at: new Date().toISOString(),
    });

    // Send WhatsApp prompt
    const isPremium = membership?.plan_type !== "free";
    const message = isPremium
      ? `Hey ${child.name}! 📚 Time for your study check-in.\n\nReply with:\n✅ *done* — finished all tasks\n⚡ *did extra* — went beyond the plan\n📝 *partially* — did some\n❌ *no* — didn't study today`
      : `Hey ${child.name}! 📚 Study check-in time!\n\nDid you study today?\nReply: *yes* or *no*`;

    await sendWhatsApp(child.whatsapp_number, undefined, undefined, message);
    sent++;
  }

  return sent;
}

async function sendFollowupReminders(
  sb: ReturnType<typeof createClient>,
  levelGroup: string,
  today: string,
): Promise<number> {
  // Find children who were prompted but haven't replied
  const { data: pending } = await sb
    .from("sq_checkins")
    .select("id, child_id, prompt_sent_at")
    .eq("checkin_date", today)
    .eq("status", "pending")
    .not("prompt_sent_at", "is", null);

  if (!pending) return 0;

  let reminded = 0;

  for (const checkin of pending) {
    const { data: child } = await sb
      .from("sq_children")
      .select("name, level, whatsapp_number, parent_id")
      .eq("id", checkin.child_id)
      .single();

    if (!child || getLevelGroup(child.level) !== levelGroup) continue;
    if (!child.whatsapp_number) continue;

    // Send a gentle nudge to the kid
    await sendWhatsApp(
      child.whatsapp_number,
      undefined,
      undefined,
      `Hey ${child.name}, just a friendly reminder! 😊 Quick check-in — did you study today?`,
    );

    // Also nudge parent
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, parent_name")
      .eq("user_id", child.parent_id)
      .single();

    if (membership?.parent_phone) {
      await sendWhatsApp(membership.parent_phone, "sp_reminder_checkin", {
        parent_name: membership.parent_name || "Parent",
        child_name: child.name,
      });
    }

    reminded++;
  }

  return reminded;
}

async function sendParentReports(
  sb: ReturnType<typeof createClient>,
  levelGroup: string,
  today: string,
) {
  // Get today's completed check-ins for this level group
  const { data: checkins } = await sb
    .from("sq_checkins")
    .select("child_id, status, subject_reported")
    .eq("checkin_date", today)
    .neq("status", "pending");

  if (!checkins) return;

  // Group by parent
  const parentMap = new Map<string, { child_name: string; status: string }[]>();

  for (const ci of checkins) {
    const { data: child } = await sb
      .from("sq_children")
      .select("name, level, parent_id")
      .eq("id", ci.child_id)
      .single();

    if (!child || getLevelGroup(child.level) !== levelGroup) continue;

    const existing = parentMap.get(child.parent_id) || [];
    existing.push({ child_name: child.name, status: ci.status });
    parentMap.set(child.parent_id, existing);
  }

  // Send parent confirmation messages (for premium parents)
  for (const [parentId, results] of parentMap) {
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, plan_type")
      .eq("user_id", parentId)
      .single();

    if (!membership?.parent_phone || membership.plan_type === "free") continue;

    for (const r of results) {
      await sendWhatsApp(membership.parent_phone, "sp_parent_confirm", {
        child_name: r.child_name,
        status: r.status,
      });
    }
  }
}

async function checkExamProximity(
  sb: ReturnType<typeof createClient>,
  today: string,
) {
  const todayDate = new Date(today);

  // Check for exams in 7, 3, or 1 day
  for (const daysOut of [7, 3, 1]) {
    const targetDate = new Date(todayDate);
    targetDate.setDate(targetDate.getDate() + daysOut);
    const targetStr = targetDate.toISOString().split("T")[0];

    const { data: exams } = await sb
      .from("sq_exam_targets")
      .select("id, child_id, exam_date, exam_type")
      .eq("exam_date", targetStr)
      .eq("cycle_status", "active");

    if (!exams) continue;

    for (const exam of exams) {
      const { data: child } = await sb
        .from("sq_children")
        .select("name, parent_id")
        .eq("id", exam.child_id)
        .single();

      if (!child) continue;

      const { data: membership } = await sb
        .from("sq_memberships")
        .select("parent_phone")
        .eq("user_id", child.parent_id)
        .single();

      if (!membership?.parent_phone) continue;

      const { data: subject } = await sb
        .from("sq_monitored_subjects")
        .select("subject_name")
        .eq("child_id", exam.child_id)
        .limit(1)
        .single();

      const templateMap: Record<number, string> = {
        7: "sp_exam_7days",
        3: "sp_exam_3days",
        1: "sp_exam_tomorrow",
      };

      await sendWhatsApp(membership.parent_phone, templateMap[daysOut], {
        child_name: child.name,
        exam_name: subject?.subject_name
          ? `${subject.subject_name} ${exam.exam_type}`
          : exam.exam_type,
        streak: "0",
        checkin_count: "0",
      });
    }
  }
}

async function sendWeeklySummaries(
  sb: ReturnType<typeof createClient>,
  today: string,
) {
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  // Get all active children
  const { data: children } = await sb
    .from("sq_children")
    .select("id, name, parent_id")
    .not("whatsapp_number", "is", null);

  if (!children) return;

  for (const child of children) {
    // Count this week's check-ins
    const { data: checkins } = await sb
      .from("sq_checkins")
      .select("status")
      .eq("child_id", child.id)
      .gte("checkin_date", weekStartStr)
      .lte("checkin_date", today)
      .neq("status", "pending");

    const count = checkins?.length || 0;

    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, plan_type")
      .eq("user_id", child.parent_id)
      .single();

    if (!membership?.parent_phone) continue;

    const totalDays = membership.plan_type === "free" ? 3 : 7;

    await sendWhatsApp(membership.parent_phone, "sp_weekly_summary", {
      child_name: child.name,
      checkin_count: String(count),
      total_days: String(totalDays),
      streak: String(count),
      top_subject: "—",
      consistency_msg:
        count >= totalDays
          ? "Perfect week! 🎉"
          : count > 0
            ? "Good effort — keep building the habit!"
            : "Let's aim for more check-ins next week 💪",
    });

    // Save summary record
    await sb.from("sq_weekly_summaries").insert({
      child_id: child.id,
      week_start: weekStartStr,
      checkins_completed: count,
      checkins_total: totalDays,
      completion_state:
        count >= totalDays ? "complete" : count > 0 ? "partial" : "none",
    });
  }
}

// ── TIME HELPERS ──

function isWithinWindow(
  current: string,
  target: string,
  marginMinutes: number,
): boolean {
  const [ch, cm] = current.split(":").map(Number);
  const [th, tm] = target.split(":").map(Number);
  const currentMins = ch * 60 + cm;
  const targetMins = th * 60 + tm;
  return Math.abs(currentMins - targetMins) <= marginMinutes;
}
