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

// ── Parent message translations (Chinese) ──
const ZH_CRON: Record<string, (...args: string[]) => string> = {
  followup_reminder: (name) => `${name} 今天还没有打卡哦。`,
  parent_confirm: (name, status) => `📊 ${name} 今天说：${status}。回复 *CONFIRM* 确认或 *ADJUST* 调整。`,
  exam_7d: (name, exam) => `📅 ${name} 的 ${exam} 考试还有 *7 天*。是时候巩固复习了。`,
  exam_3d: (name, exam) => `⚠️ ${name} 的 ${exam} 考试还有 *3 天*。冲刺阶段 — 集中攻弱项。`,
  exam_1d: (name, exam) => `🚨 ${name} 的 ${exam} 考试 *明天*！确保今晚复习完毕。`,
  exam_tutor: (name, days) => `💡 ${name} 的考试还有 ${days} 天 — 需要补习老师针对性复习吗？回复 *tutor*，我们帮您匹配。`,
  post_exam: (name, subj) => `${name} 的 ${subj} 考试结束了！🎉\n\n考得怎么样？下一场考试是什么时候？\n您可以在 StudyPulse 仪表板更新考试日期。`,
  post_exam_diagnostic: (name) => `💡 想了解 ${name} 目前的掌握情况？*诊断评估*可以在下个考试周期前找出薄弱点。\n在 studypulse.co → 操作 → 预约诊断`,
  weekly_summary_header: (name, weekStart) => `📊 *${name} 的周报*\n${weekStart} 这一周\n\n`,
  weekly_done: (done, total) => `✅ 完成：${done}/${total} 天\n`,
  weekly_missed: (missed) => `❌ 缺席：${missed} 天\n`,
  weekly_perfect: (name) => `🎉 完美的一周！${name} 每个学习日都打卡了。`,
  weekly_good: () => `不错 — 继续保持！`,
  weekly_low: () => `下周争取更多打卡 💪`,
  weekly_verify: (name) => `\n\n📋 *您这周检查过 ${name} 的作业吗？*\n回复 *confirm* 确认，或 *adjust* 调整。`,
  weekly_tutor_nudge: (name, missed) => `\n\n💡 ${name} 这周缺席了 ${missed} 天。补习老师可以帮助建立规律。访问 studypulse.co → 操作 → 找补习老师。`,
  midweek_header: () => `📋 *周中检查* — 温习进行得怎样？\n\n`,
  midweek_child: (name, count) => `${name}：到目前为止 ${count} 次打卡\n`,
  midweek_footer: () => `\n您检查过他们的作业吗？看一看能保持诚实！👀`,
};

// Status translations for parent reports
const STATUS_ZH: Record<string, string> = {
  yes: "已完成", done: "已完成", did_extra: "做了额外练习",
  partially: "部分完成", no: "没有温习", pending: "待打卡",
};

function formatTime(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

function getLevelGroup(level: string): string {
  const l = level.trim().toUpperCase();
  // Short form: P1-P3  | Full form: Primary 1-3
  if (/^(P[1-3]|PRIMARY [1-3])$/.test(l)) return "primary_lower";
  // Short form: P4-P6  | Full form: Primary 4-6
  if (/^(P[4-6]|PRIMARY [4-6])$/.test(l)) return "primary_upper";
  // Short form: SEC1-3 | Full form: Secondary 1-3
  if (/^(SEC[1-3]|SECONDARY [1-3])$/.test(l)) return "secondary_lower";
  // Sec4, Sec5, Secondary 4-5, JC 1, JC 2 — all upper/JC group
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
        ? addMinutes(schedule.weekend_kid_checkin, 45)
        : schedule.weekday_followup;
      const autoCloseTime = isWeekend
        ? addMinutes(schedule.weekend_kid_checkin, 120)
        : addMinutes(schedule.weekday_kid_checkin, 120);
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

      // ── SEND FOLLOW-UP REMINDERS (no reply after ~45 min) ──
      // Runs on weekdays AND weekends
      if (isWithinWindow(currentTime, followupTime, 7)) {
        const reminded = await sendFollowupReminders(
          sb,
          schedule.level_group,
          today,
        );
        totalReminders += reminded;
      }

      // ── AUTO-CLOSE STALE CHECK-INS (still pending 2h after prompt) ──
      if (isWithinWindow(currentTime, autoCloseTime, 7)) {
        await autoCloseStaleCheckins(sb, schedule.level_group, today);
      }

      // ── SEND PARENT REPORTS ──
      if (isWithinWindow(currentTime, parentReportTime, 7)) {
        await sendParentReports(sb, schedule.level_group, today, dayOfWeek);
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
      .select("parent_phone, parent_name, preferred_language")
      .eq("user_id", child.parent_id)
      .single();

    if (membership?.parent_phone) {
      const lang = membership.preferred_language || "en";
      if (lang === "zh") {
        await sendWhatsApp(membership.parent_phone, undefined, undefined, ZH_CRON.followup_reminder(child.name));
      } else {
        await sendWhatsApp(membership.parent_phone, "sp_reminder_checkin", {
          parent_name: membership.parent_name || "Parent",
          child_name: child.name,
        });
      }
    }

    reminded++;
  }

  return reminded;
}

// Free plan parents receive reports only on Tue (2), Fri (5), Sat (6)
const FREE_REPORT_DAYS = [2, 5, 6];

async function sendParentReports(
  sb: ReturnType<typeof createClient>,
  levelGroup: string,
  today: string,
  dayOfWeek: number,
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
      .select("parent_phone, plan_type, preferred_language")
      .eq("user_id", parentId)
      .single();

    if (!membership?.parent_phone || membership.plan_type === "free") continue;

    const lang = membership.preferred_language || "en";
    for (const r of results) {
      if (lang === "zh") {
        const statusZh = STATUS_ZH[r.status] || r.status;
        await sendWhatsApp(membership.parent_phone, undefined, undefined,
          ZH_CRON.parent_confirm(r.child_name, statusZh));
      } else {
        await sendWhatsApp(membership.parent_phone, "sp_parent_confirm", {
          child_name: r.child_name,
          status: r.status,
        });
      }
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
        .select("parent_phone, plan_type, preferred_language")
        .eq("user_id", child.parent_id)
        .single();

      if (!membership?.parent_phone) continue;

      let subjectName = exam.exam_type;
      if (exam.subject_id) {
        const { data: subject } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (subject) subjectName = subject.subject_name;
      }

      const examLabel = `${subjectName} ${exam.exam_type === 'major' ? '(Major)' : ''}`;
      const lang = membership.preferred_language || "en";

      // Parent message
      let parentMsg: string;
      if (lang === "zh") {
        parentMsg = daysOut === 1
          ? ZH_CRON.exam_1d(child.name, examLabel)
          : daysOut === 3
          ? ZH_CRON.exam_3d(child.name, examLabel)
          : ZH_CRON.exam_7d(child.name, examLabel);
      } else {
        parentMsg = daysOut === 1
          ? `🚨 ${child.name}'s ${examLabel} exam is *TOMORROW*! Make sure revision is done tonight.`
          : daysOut === 3
          ? `⚠️ ${child.name}'s ${examLabel} exam in *3 days*. Final stretch — focus on weak areas.`
          : `📅 ${child.name}'s ${examLabel} exam in *7 days*. Good time to review and consolidate.`;
      }

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
          const tutorMsg = lang === "zh"
            ? ZH_CRON.exam_tutor(child.name, String(daysOut))
            : `💡 With ${child.name}'s exam ${daysOut} day${daysOut === 1 ? '' : 's'} away — need a tutor for focused revision? Reply *tutor* and we'll match one for you.`;
          await sendWhatsApp(membership.parent_phone, undefined, undefined, tutorMsg);
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
        .select("parent_phone, plan_type, preferred_language").eq("user_id", child.parent_id).single();

      let subjectName = "the";
      if (exam.subject_id) {
        const { data: s } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (s) subjectName = s.subject_name;
      }

      const pLang = membership?.preferred_language || "en";

      // Ask parent about next exam
      if (membership?.parent_phone) {
        const postMsg = pLang === "zh"
          ? ZH_CRON.post_exam(child.name, subjectName)
          : `${child.name}'s ${subjectName} exam is done! 🎉\n\nHow did it go? When is the next exam?\nYou can update exam dates in the StudyPulse dashboard.`;
        await sendWhatsApp(membership.parent_phone, undefined, undefined, postMsg);

        // Funnel: suggest diagnostic after exam
        const diagMsg = pLang === "zh"
          ? ZH_CRON.post_exam_diagnostic(child.name)
          : `💡 Want to know exactly where ${child.name} stands? A *diagnostic assessment* can pinpoint gaps before the next exam cycle.\nBook one at studypulse.co → Actions → Book Diagnostic`;
        await sendWhatsApp(membership.parent_phone, undefined, undefined, diagMsg);
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
      .select("parent_phone, plan_type, preferred_language, created_at")
      .eq("user_id", child.parent_id)
      .single();

    if (!membership?.parent_phone) continue;

    const studyDays = child.study_days && child.study_days.length > 0 ? child.study_days.length : (membership.plan_type === 'free' ? 3 : 5);
    const lang = membership.preferred_language || "en";

    // Build summary message
    let summaryMsg: string;
    if (lang === "zh") {
      summaryMsg = ZH_CRON.weekly_summary_header(child.name, weekStartStr);
      summaryMsg += ZH_CRON.weekly_done(String(doneCount), String(studyDays));
      if (missedCount > 0) summaryMsg += ZH_CRON.weekly_missed(String(missedCount));
      summaryMsg += `\n`;
      if (doneCount >= studyDays) {
        summaryMsg += ZH_CRON.weekly_perfect(child.name);
      } else if (doneCount > 0) {
        summaryMsg += ZH_CRON.weekly_good();
      } else {
        summaryMsg += ZH_CRON.weekly_low();
      }
      summaryMsg += ZH_CRON.weekly_verify(child.name);
    } else {
      summaryMsg = `📊 *Weekly Summary for ${child.name}*\n`;
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
      summaryMsg += `\n\n📋 *Have you seen ${child.name}'s work this week?*\nReply *confirm* if yes, or *adjust* if not accurate.`;
    }

    // ── FUNNEL: 3+ missed days AND 2+ weeks enrolled → suggest tutor ──
    const enrolledAt = membership?.created_at ? new Date(membership.created_at) : null;
    const weeksEnrolled = enrolledAt
      ? Math.floor((new Date(today).getTime() - enrolledAt.getTime()) / (7 * 86400000))
      : 0;
    if (missedCount >= 3 && weeksEnrolled >= 2) {
      summaryMsg += lang === "zh"
        ? ZH_CRON.weekly_tutor_nudge(child.name, String(missedCount))
        : `\n\n💡 ${child.name} missed ${missedCount} days this week. A tutor can help build a structured routine. Visit studypulse.co → Actions → Find a Tutor.`;
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
      .select("parent_phone, plan_type, preferred_language")
      .eq("user_id", parentId)
      .single();

    if (!membership?.parent_phone || membership.plan_type === "free") continue;

    // Count check-ins so far this week
    const { data: kids } = await sb
      .from("sq_children")
      .select("id, name")
      .eq("parent_id", parentId);

    if (!kids) continue;

    const lang = membership.preferred_language || "en";
    let msg = lang === "zh" ? ZH_CRON.midweek_header() : `📋 *Mid-week check* — how's the studying going?\n\n`;

    for (const kid of kids) {
      const { count } = await sb
        .from("sq_checkins")
        .select("id", { count: "exact", head: true })
        .eq("child_id", kid.id)
        .gte("checkin_date", weekStartStr)
        .lte("checkin_date", today)
        .in("status", ["yes", "done", "did_extra"]);

      msg += lang === "zh"
        ? ZH_CRON.midweek_child(kid.name, String(count || 0))
        : `${kid.name}: ${count || 0} check-ins so far\n`;
    }
    msg += lang === "zh" ? ZH_CRON.midweek_footer() : `\nHave you checked their work? A quick look keeps things honest! 👀`;

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

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ── AUTO-CLOSE: mark check-ins still pending 2h after prompt as 'forgot' ──
async function autoCloseStaleCheckins(
  sb: ReturnType<typeof createClient>,
  levelGroup: string,
  today: string,
) {
  const { data: stale } = await sb
    .from("sq_checkins")
    .select("id, child_id")
    .eq("checkin_date", today)
    .eq("status", "pending");

  if (!stale) return;

  for (const checkin of stale) {
    const { data: child } = await sb
      .from("sq_children")
      .select("name, level, whatsapp_number, parent_id")
      .eq("id", checkin.child_id)
      .single();

    if (!child || getLevelGroup(child.level) !== levelGroup) continue;

    // Mark as 'forgot'
    await sb.from("sq_checkins")
      .update({ status: "forgot", reply_received_at: new Date().toISOString() })
      .eq("id", checkin.id);

    // Soft notify child (no scolding — gentle)
    if (child.whatsapp_number) {
      await sendWhatsApp(
        child.whatsapp_number,
        undefined,
        undefined,
        `No worries, ${child.name}! 😴 Looks like you forgot to check in today — that's okay. Tomorrow is a fresh start! 💪`,
      );
    }

    // Notify parent
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, parent_name, preferred_language")
      .eq("user_id", child.parent_id)
      .single();

    if (membership?.parent_phone) {
      const lang = membership.preferred_language || "en";
      const msg = lang === "zh"
        ? `📋 ${child.name} 今天没有打卡（已超时）。明天继续加油！`
        : `📋 ${child.name} didn't check in today — logged as *forgot*. Gentle nudge for tomorrow! 🙂`;
      await sendWhatsApp(membership.parent_phone, undefined, undefined, msg);
    }
  }
}
