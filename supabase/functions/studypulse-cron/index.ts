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

    // ── MONDAY TARGET PROMPT (premium kids with no targets this week) ──
    if (dayOfWeek === 1 && isWithinWindow(currentTime, "16:00", 7)) {
      await sendWeeklyTargetPrompts(sb, today);
    }

    // ── WEDNESDAY MID-WEEK PARENT CHECK ──
    if (dayOfWeek === 3 && isWithinWindow(currentTime, "20:00", 7)) {
      await sendMidWeekParentNudge(sb, today);
    }

    // ── CHECK EXAM PROXIMITY + POST-EXAM ──
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
    .select("id, name, level, whatsapp_number, parent_id, study_days")
    .not("whatsapp_number", "is", null);

  if (!children) return 0;

  let sent = 0;

  for (const child of children) {
    if (getLevelGroup(child.level) !== levelGroup) continue;
    if (!child.whatsapp_number) continue;

    // Check plan
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("plan_type")
      .eq("user_id", child.parent_id)
      .single();

    // Check study days: parent-set days take priority, else free=Tue/Thu/Sat, premium=Mon-Fri
    const childStudyDays: number[] = child.study_days && child.study_days.length > 0
      ? child.study_days
      : membership?.plan_type === "free"
        ? FREE_DAYS
        : [1, 2, 3, 4, 5]; // Mon-Fri default

    if (!childStudyDays.includes(dayOfWeek)) {
      continue; // Not a study day for this child
    }

    // Check if already prompted today
    const { data: existing } = await sb
      .from("sq_checkins")
      .select("id")
      .eq("child_id", child.id)
      .eq("checkin_date", today)
      .limit(1);

    if (existing && existing.length > 0) continue; // Already sent

    // Get today's target (if any)
    const weekStart = getWeekStart(today);
    const { data: targets } = await sb
      .from("sq_weekly_targets")
      .select("subject_name, daily_quantity, target_unit, remaining_quantity")
      .eq("child_id", child.id)
      .eq("week_start", weekStart);

    const hasTargets = targets && targets.length > 0;
    const todayTarget = hasTargets ? targets[0] : null;

    // Create pending checkin record
    await sb.from("sq_checkins").insert({
      child_id: child.id,
      checkin_date: today,
      status: "pending",
      prompt_sent_at: new Date().toISOString(),
      ...(todayTarget && {
        target_quantity: todayTarget.daily_quantity,
        target_unit: todayTarget.target_unit,
        subject_reported: todayTarget.subject_name,
      }),
    });

    // Get nearest active exam for this child
    const { data: activeExams } = await sb
      .from("sq_exam_targets")
      .select("id, exam_date, exam_type, subject_id")
      .eq("child_id", child.id)
      .eq("cycle_status", "active")
      .gte("exam_date", today)
      .order("exam_date", { ascending: true })
      .limit(1);

    let examLine = "";
    if (activeExams && activeExams.length > 0) {
      const exam = activeExams[0];
      const daysLeft = Math.ceil((new Date(exam.exam_date).getTime() - new Date(today).getTime()) / 86400000);
      // Get subject name
      let examSubject = exam.exam_type;
      if (exam.subject_id) {
        const { data: subj } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (subj) examSubject = subj.subject_name;
      }
      if (daysLeft <= 30) {
        examLine = `\n⏰ *${examSubject} exam in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!*`;
      }
    }

    // Send WhatsApp prompt — target-based or generic
    const isPremium = membership?.plan_type !== "free";
    let message: string;

    if (hasTargets && isPremium) {
      const targetLine = targets!.map(t =>
        `• ${t.subject_name}: *${t.daily_quantity} ${t.target_unit}s*`
      ).join("\n");
      message = `Hey ${child.name}! 📚 Today's target:\n${targetLine}${examLine}\n\nHave you finished? Reply:\n✅ *done* / 📝 *partially* / ❌ *no*`;
    } else if (isPremium) {
      message = `Hey ${child.name}! 📚 Time for your study check-in.${examLine}\n\nReply with:\n✅ *done* — finished all tasks\n⚡ *did extra* — went beyond the plan\n📝 *partially* — did some\n❌ *no* — didn't study today`;
    } else {
      message = `Hey ${child.name}! 📚 Study check-in time!${examLine}\n\nDid you study today?\nReply: *yes* or *no*`;
    }

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

  // ── UPCOMING EXAMS: 7, 3, 1 day warnings ──
  for (const daysOut of [7, 3, 1]) {
    const targetDate = new Date(todayDate);
    targetDate.setDate(targetDate.getDate() + daysOut);
    const targetStr = targetDate.toISOString().split("T")[0];

    const { data: exams } = await sb
      .from("sq_exam_targets")
      .select("id, child_id, exam_date, exam_type, subject_id")
      .eq("exam_date", targetStr)
      .eq("cycle_status", "active");

    if (!exams) continue;

    for (const exam of exams) {
      const { data: child } = await sb
        .from("sq_children")
        .select("name, parent_id, whatsapp_number")
        .eq("id", exam.child_id)
        .single();

      if (!child) continue;

      const { data: membership } = await sb
        .from("sq_memberships")
        .select("parent_phone, plan_type")
        .eq("user_id", child.parent_id)
        .single();

      if (!membership?.parent_phone) continue;

      let subjectName = exam.exam_type;
      if (exam.subject_id) {
        const { data: subject } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (subject) subjectName = subject.subject_name;
      }

      const examLabel = `${subjectName} ${exam.exam_type === 'major' ? '(Major)' : ''}`;

      // Parent message
      const parentMsg = daysOut === 1
        ? `🚨 ${child.name}'s ${examLabel} exam is *TOMORROW*! Make sure revision is done tonight.`
        : daysOut === 3
        ? `⚠️ ${child.name}'s ${examLabel} exam in *3 days*. Final stretch — focus on weak areas.`
        : `📅 ${child.name}'s ${examLabel} exam in *7 days*. Good time to review and consolidate.`;

      await sendWhatsApp(membership.parent_phone, undefined, undefined, parentMsg);

      // Kid message (if has WhatsApp)
      if (child.whatsapp_number) {
        const kidMsg = daysOut === 1
          ? `💪 ${child.name}, your ${subjectName} exam is *TOMORROW*! You've been preparing — trust yourself and rest well tonight!`
          : daysOut === 3
          ? `📝 3 days to ${subjectName} exam! Focus on your toughest topics today.`
          : `📚 1 week to ${subjectName} exam! Stay consistent — you've got this.`;

        await sendWhatsApp(child.whatsapp_number, undefined, undefined, kidMsg);
      }

      // ── FUNNEL: exam < 30 days → suggest tutor ──
      if (daysOut <= 7 && membership.plan_type !== 'free') {
        // Check if they already have a tutor request
        const { data: existingReq } = await sb.from("sq_tutor_requests")
          .select("id").eq("user_id", child.parent_id).limit(1);
        if (!existingReq || existingReq.length === 0) {
          await sendWhatsApp(membership.parent_phone, undefined, undefined,
            `💡 With ${child.name}'s exam ${daysOut} day${daysOut === 1 ? '' : 's'} away — need a tutor for focused revision? Reply *tutor* and we'll match one for you.`
          );
        }
      }
    }
  }

  // ── POST-EXAM: exams that just passed (yesterday) → prompt for next ──
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const { data: pastExams } = await sb
    .from("sq_exam_targets")
    .select("id, child_id, exam_type, subject_id")
    .eq("exam_date", yesterdayStr)
    .eq("cycle_status", "active");

  if (pastExams) {
    for (const exam of pastExams) {
      // Mark exam as ended
      await sb.from("sq_exam_targets").update({ cycle_status: "ended" }).eq("id", exam.id);

      const { data: child } = await sb.from("sq_children")
        .select("name, parent_id, whatsapp_number").eq("id", exam.child_id).single();
      if (!child) continue;

      const { data: membership } = await sb.from("sq_memberships")
        .select("parent_phone, plan_type").eq("user_id", child.parent_id).single();

      let subjectName = "the";
      if (exam.subject_id) {
        const { data: s } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (s) subjectName = s.subject_name;
      }

      // Ask parent about next exam
      if (membership?.parent_phone) {
        await sendWhatsApp(membership.parent_phone, undefined, undefined,
          `${child.name}'s ${subjectName} exam is done! 🎉\n\n` +
          `How did it go? When is the next exam?\n` +
          `You can update exam dates in the StudyPulse dashboard.`
        );

        // Funnel: suggest diagnostic after exam
        await sendWhatsApp(membership.parent_phone, undefined, undefined,
          `💡 Want to know exactly where ${child.name} stands? A *diagnostic assessment* can pinpoint gaps before the next exam cycle.\n` +
          `Book one at studypulse.co → Actions → Book Diagnostic`
        );
      }

      // Tell kid well done
      if (child.whatsapp_number) {
        await sendWhatsApp(child.whatsapp_number, undefined, undefined,
          `${subjectName} exam done! 🎉 Great job finishing it. Take a well-deserved break today! 😊`
        );
      }
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
    .select("id, name, parent_id, study_days, whatsapp_number")
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
    const doneCount = checkins?.filter(c => c.status === 'yes' || c.status === 'done' || c.status === 'did_extra').length || 0;
    const missedCount = checkins?.filter(c => c.status === 'no').length || 0;

    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, plan_type")
      .eq("user_id", child.parent_id)
      .single();

    if (!membership?.parent_phone) continue;

    const studyDays = child.study_days && child.study_days.length > 0 ? child.study_days.length : (membership.plan_type === 'free' ? 3 : 5);

    // Build summary message (raw, not template — more flexible)
    let summaryMsg = `📊 *Weekly Summary for ${child.name}*\n`;
    summaryMsg += `Week of ${weekStartStr}\n\n`;
    summaryMsg += `✅ Completed: ${doneCount}/${studyDays} days\n`;
    if (missedCount > 0) summaryMsg += `❌ Missed: ${missedCount} days\n`;
    summaryMsg += `\n`;

    if (doneCount >= studyDays) {
      summaryMsg += `🎉 Perfect week! ${child.name} checked in every study day.`;
    } else if (doneCount > 0) {
      summaryMsg += `Good effort — keep building the habit!`;
    } else {
      summaryMsg += `Let's aim for more check-ins next week 💪`;
    }

    // ── PARENT VERIFICATION ──
    summaryMsg += `\n\n📋 *Have you seen ${child.name}'s work this week?*\nReply *confirm* if yes, or *adjust* if not accurate.`;

    // ── FUNNEL: 3+ missed days → suggest tutor ──
    if (missedCount >= 3) {
      summaryMsg += `\n\n💡 ${child.name} missed ${missedCount} days this week. A tutor can help build a structured routine. Visit studypulse.co → Actions → Find a Tutor.`;
    }

    await sendWhatsApp(membership.parent_phone, undefined, undefined, summaryMsg);

    // Save summary record
    await sb.from("sq_weekly_summaries").insert({
      child_id: child.id,
      week_start: weekStartStr,
      checkins_completed: doneCount,
      checkins_total: studyDays,
      completion_state:
        doneCount >= studyDays ? "complete" : doneCount > 0 ? "partial" : "none",
    });
  }
}

// ── MID-WEEK PARENT NUDGE (Wednesday 8pm) ──

async function sendMidWeekParentNudge(
  sb: ReturnType<typeof createClient>,
  today: string,
) {
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const { data: children } = await sb
    .from("sq_children")
    .select("id, name, parent_id")
    .not("whatsapp_number", "is", null);

  if (!children) return;

  // Group by parent
  const parentMap = new Map<string, string[]>();
  for (const child of children) {
    const names = parentMap.get(child.parent_id) || [];
    names.push(child.name);
    parentMap.set(child.parent_id, names);
  }

  for (const [parentId, childNames] of parentMap) {
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, plan_type")
      .eq("user_id", parentId)
      .single();

    if (!membership?.parent_phone || membership.plan_type === "free") continue;

    // Count check-ins so far this week
    const { data: kids } = await sb
      .from("sq_children")
      .select("id, name")
      .eq("parent_id", parentId);

    if (!kids) continue;

    let msg = `📋 *Mid-week check* — how's the studying going?\n\n`;
    for (const kid of kids) {
      const { count } = await sb
        .from("sq_checkins")
        .select("id", { count: "exact", head: true })
        .eq("child_id", kid.id)
        .gte("checkin_date", weekStartStr)
        .lte("checkin_date", today)
        .in("status", ["yes", "done", "did_extra"]);

      msg += `${kid.name}: ${count || 0} check-ins so far\n`;
    }
    msg += `\nHave you checked their work? A quick look keeps things honest! 👀`;

    await sendWhatsApp(membership.parent_phone, undefined, undefined, msg);
  }
}

// ── WEEKLY TARGET PROMPT (Monday 4pm) ──

async function sendWeeklyTargetPrompts(
  sb: ReturnType<typeof createClient>,
  today: string,
) {
  const weekStart = getWeekStart(today);

  // Get all premium children with WhatsApp
  const { data: children } = await sb
    .from("sq_children")
    .select("id, name, whatsapp_number, parent_id")
    .not("whatsapp_number", "is", null);

  if (!children) return;

  for (const child of children) {
    if (!child.whatsapp_number) continue;

    // Check if premium
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("plan_type")
      .eq("user_id", child.parent_id)
      .single();

    if (membership?.plan_type === "free") continue;

    // Check if targets already set this week
    const { data: existing } = await sb
      .from("sq_weekly_targets")
      .select("id")
      .eq("child_id", child.id)
      .eq("week_start", weekStart)
      .limit(1);

    if (existing && existing.length > 0) continue; // Already set

    await sendWhatsApp(
      child.whatsapp_number,
      undefined,
      undefined,
      `Hey ${child.name}! 🎯 New week — time to set your study targets!\n\n` +
      `Reply *set target* to get started.`,
    );
  }
}

// ── TIME HELPERS ──

function getWeekStart(todayStr: string): string {
  const d = new Date(todayStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

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
