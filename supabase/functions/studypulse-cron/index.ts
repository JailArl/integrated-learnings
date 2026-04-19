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
 */ const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// Singapore timezone offset (+8h)
function getSGTime() {
  const now = new Date();
  return new Date(now.getTime() + 8 * 60 * 60 * 1000);
}

function normalizePhone(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  // SG numbers are typically 8 digits; keep last 8 for robust matching.
  return digits.length > 8 ? digits.slice(-8) : digits;
}
// ── Parent message translations (Chinese) ──
const ZH_CRON = {
  followup_reminder: (name)=>`${name} 今天还没有打卡哦。`,
  parent_confirm: (name, status)=>`📊 ${name} 今天说：${status}。回复 *CONFIRM* 确认或 *ADJUST* 调整。`,
  exam_7d: (name, exam)=>`📅 ${name} 的 ${exam} 考试还有 *7 天*。是时候巩固复习了。`,
  exam_3d: (name, exam)=>`⚠️ ${name} 的 ${exam} 考试还有 *3 天*。冲刺阶段 — 集中攻弱项。`,
  exam_1d: (name, exam)=>`🚨 ${name} 的 ${exam} 考试 *明天*！确保今晚复习完毕。`,
  exam_tutor: (name, days)=>`💡 ${name} 的考试还有 ${days} 天 — 需要补习老师针对性复习吗？回复 *tutor*，我们帮您匹配。`,
  post_exam: (name, subj)=>`${name} 的 ${subj} 考试结束了！🎉\n\n考得怎么样？下一场考试是什么时候？\n您可以在 StudyPulse 仪表板更新考试日期。`,
  post_exam_diagnostic: (name)=>`💡 想了解 ${name} 目前的掌握情况？*诊断评估*可以在下个考试周期前找出薄弱点。\n在 studypulse.co → 操作 → 预约诊断`,
  weekly_summary_header: (name, weekStart)=>`📊 *${name} 的周报*\n${weekStart} 这一周\n\n`,
  weekly_done: (done, total)=>`✅ 完成：${done}/${total} 天\n`,
  weekly_missed: (missed)=>`❌ 缺席：${missed} 天\n`,
  weekly_perfect: (name)=>`🎉 完美的一周！${name} 每个学习日都打卡了。`,
  weekly_good: ()=>`不错 — 继续保持！`,
  weekly_low: ()=>`下周争取更多打卡 💪`,
  weekly_verify: (name)=>`\n\n📋 *您这周检查过 ${name} 的作业吗？*\n回复 *confirm* 确认，或 *adjust* 调整。`,
  weekly_tutor_nudge: (name, missed)=>`\n\n💡 ${name} 这周缺席了 ${missed} 天。补习老师可以帮助建立规律。访问 studypulse.co → 操作 → 找补习老师。`,
  midweek_header: ()=>`📋 *周中检查* — 温习进行得怎样？\n\n`,
  midweek_child: (name, count)=>`${name}：到目前为止 ${count} 次打卡\n`,
  midweek_footer: ()=>`\n您检查过他们的作业吗？看一看能保持诚实！👀`
};
// Status translations for parent reports
const STATUS_ZH = {
  yes: "已完成",
  done: "已完成",
  did_extra: "做了额外练习",
  partially: "部分完成",
  no: "没有温习",
  pending: "待打卡"
};
function formatTime(d) {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
function getLevelGroup(level) {
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
// FREE plan: check-in on Tue/Thu/Sun (bundled — covers neighbouring study days)
const FREE_CHECKIN_DAYS = [
  0,
  2,
  4
]; // 0=Sun, 2=Tue, 4=Thu
const FREE_CHECKIN_WINDOWS = {
  2: [
    1,
    2
  ],
  4: [
    3,
    4
  ],
  0: [
    5,
    6,
    0
  ]
};
const DAY_NAMES = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
];
// Premium parent report days (cost-saving mode): no Tue/Thu mini-reports.
// Parents still receive immediate daily updates from webhook and Sunday weekly summary.
const PREMIUM_PARENT_REPORT_DAYS = [];
const PREMIUM_REPORT_WINDOWS = {
  2: [
    1,
    2
  ],
  4: [
    3,
    4
  ]
};
async function sendWhatsApp(to, templateName, variables, rawMessage) {
  const url = `${supabaseUrl}/functions/v1/send-whatsapp`;
  const payload = rawMessage ? {
    to,
    raw_message: rawMessage
  } : {
    to,
    template_name: templateName,
    variables
  };
  let lastError = "Unknown WhatsApp send failure";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) return;
      let errorText = `HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        errorText = errorJson?.error || errorJson?.message || errorText;
      } catch {
        const rawError = await response.text();
        if (rawError) errorText = rawError;
      }
      lastError = errorText;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw new Error(`WhatsApp send failed for ${to}: ${lastError}`);
}

async function safeSendWhatsApp(to, templateName, variables, rawMessage, contextLabel = "send") {
  try {
    await sendWhatsApp(to, templateName, variables, rawMessage);
    return true;
  } catch (error) {
    console.error("WhatsApp send failed", {
      context: contextLabel,
      to,
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

function isServiceRoleRequest(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  return !!token && token === supabaseKey;
}

async function triggerManualCheckinNow(sb, childId, today) {
  if (!childId || typeof childId !== "string") {
    return {
      ok: false,
      error: "child_id is required"
    };
  }
  const { data: child } = await sb.from("sq_children").select("id, name, level, whatsapp_number, parent_id").eq("id", childId).single();
  if (!child) {
    return {
      ok: false,
      error: "Child not found"
    };
  }
  if (!child.whatsapp_number) {
    return {
      ok: false,
      error: "Child has no WhatsApp number"
    };
  }

  const { data: parentPhones } = await sb.from("sq_memberships").select("parent_phone").not("parent_phone", "is", null);
  const parentPhoneSet = new Set((parentPhones || []).map((p)=>normalizePhone(p.parent_phone)).filter(Boolean));
  if (parentPhoneSet.has(normalizePhone(child.whatsapp_number))) {
    return {
      ok: false,
      error: "Child phone matches parent phone; blocked by guardrail"
    };
  }

  const weekStart = getWeekStart(today);
  const { data: targets } = await sb.from("sq_weekly_targets").select("subject_name, daily_quantity, target_unit").eq("child_id", child.id).eq("week_start", weekStart);
  const hasTargets = targets && targets.length > 0;
  const todayTarget = hasTargets ? targets[0] : null;

  const { data: existing } = await sb.from("sq_checkins").select("id, prompt_sent_at").eq("child_id", child.id).eq("checkin_date", today).limit(1);
  let checkinId = null;
  if (existing && existing.length > 0) {
    checkinId = existing[0].id;
  } else {
    const { data: inserted, error: insertError } = await sb.from("sq_checkins").insert({
      child_id: child.id,
      checkin_date: today,
      status: "pending",
      prompt_sent_at: null,
      ...todayTarget && {
        target_quantity: todayTarget.daily_quantity,
        target_unit: todayTarget.target_unit,
        subject_reported: todayTarget.subject_name
      }
    }).select("id").single();
    if (insertError || !inserted) {
      return {
        ok: false,
        error: insertError?.message || "Could not create check-in row"
      };
    }
    checkinId = inserted.id;
  }

  let message;
  if (hasTargets) {
    const targetLine = targets.map((t)=>`• ${t.subject_name}: *${t.daily_quantity} ${formatUnitLabel(t.daily_quantity, t.target_unit)}*`).join("\n");
    message = `Hey ${child.name}! 📚 Study check-in time!\n\nToday's targets:\n${targetLine}\n\nHave you finished them?\n\nReply: *yes* / *partial* / *no*`;
  } else {
    message = `Hey ${child.name}! 📚 Study check-in time!\n\nHave you finished your study target for today?\n\nReply: *yes* / *partial* / *no*`;
  }

  await sendWhatsApp(child.whatsapp_number, undefined, undefined, message);
  await sb.from("sq_checkins").update({
    status: "pending",
    prompt_sent_at: new Date().toISOString()
  }).eq("id", checkinId);

  return {
    ok: true,
    child_id: child.id,
    child_name: child.name,
    sent_to: child.whatsapp_number,
    checkin_id: checkinId
  };
}

serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    let body = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }
    const sgNow = getSGTime();
    const currentTime = formatTime(sgNow);
    const today = sgNow.toISOString().split("T")[0];
    const dayOfWeek = sgNow.getUTCDay(); // 0=Sun
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let failureCount = 0;
    const runGuarded = async (label, fn)=>{
      try {
        return await fn();
      } catch (error) {
        failureCount++;
        console.error("Cron phase failed", {
          phase: label,
          error: error instanceof Error ? error.message : String(error)
        });
        return null;
      }
    };

    if (body?.action === "manual_send_checkin") {
      if (!isServiceRoleRequest(req)) {
        return new Response(JSON.stringify({
          success: false,
          error: "Unauthorized manual trigger"
        }), {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
      const result = await triggerManualCheckinNow(sb, body?.child_id, today);
      return new Response(JSON.stringify({
        success: !!result?.ok,
        manual: true,
        ...result
      }), {
        status: result?.ok ? 200 : 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Get all schedule windows
    const { data: schedules } = await sb.from("sq_checkin_schedule").select("*");
    if (!schedules || schedules.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No schedules configured",
        sent: 0
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    let totalSent = 0;
    let totalReminders = 0;
    for (const schedule of schedules){
      const checkinTime = isWeekend ? schedule.weekend_kid_checkin : schedule.weekday_kid_checkin;
      const followupTime = isWeekend ? addMinutes(schedule.weekend_kid_checkin, 45) : schedule.weekday_followup;
      const autoCloseTime = isWeekend ? addMinutes(schedule.weekend_kid_checkin, 120) : addMinutes(schedule.weekday_kid_checkin, 120);
      const parentReportTime = isWeekend ? schedule.weekend_parent_report : schedule.weekday_parent_report;
      // ── SEND CHECK-IN PROMPTS ──
      // Always evaluate each run; sendCheckinPrompts enforces per-child timing window.
      const sent = await runGuarded(`checkins:${schedule.level_group}`, ()=>sendCheckinPrompts(sb, schedule.level_group, today, dayOfWeek, currentTime, checkinTime));
      totalSent += Number(sent || 0);
      // ── SEND FOLLOW-UP REMINDERS (no reply after ~45 min) ──
      // Runs on weekdays AND weekends
      if (isWithinWindow(currentTime, followupTime, 7)) {
        const reminded = await runGuarded(`followups:${schedule.level_group}`, ()=>sendFollowupReminders(sb, schedule.level_group, today));
        totalReminders += Number(reminded || 0);
      }
      // ── AUTO-CLOSE STALE CHECK-INS (still pending 2h after prompt) ──
      if (isWithinWindow(currentTime, autoCloseTime, 7)) {
        await runGuarded(`autoclose:${schedule.level_group}`, ()=>autoCloseStaleCheckins(sb, schedule.level_group, today));
      }
      // ── SEND PARENT REPORTS ──
      if (isWithinWindow(currentTime, parentReportTime, 7)) {
        await runGuarded(`parent-reports:${schedule.level_group}`, ()=>sendParentReports(sb, schedule.level_group, today, dayOfWeek));
      }
    }
    // ── MONDAY TARGET PROMPT (premium kids with no targets this week) ──
    if (dayOfWeek === 1 && isWithinWindow(currentTime, "16:00", 7)) {
      await runGuarded("weekly-target-prompts", ()=>sendWeeklyTargetPrompts(sb, today));
    }
    // ── WEDNESDAY MID-WEEK PARENT CHECK ──
    if (dayOfWeek === 3 && isWithinWindow(currentTime, "20:00", 7)) {
      await runGuarded("midweek-parent-nudge", ()=>sendMidWeekParentNudge(sb, today));
    }
    // ── CHECK EXAM PROXIMITY + POST-EXAM ──
    await runGuarded("exam-proximity", ()=>checkExamProximity(sb, today));
    // ── WEEKLY SUMMARIES (Sunday 10pm SGT) ──
    if (dayOfWeek === 0 && isWithinWindow(currentTime, "22:00", 7)) {
      await runGuarded("weekly-summaries", ()=>sendWeeklySummaries(sb, today));
    }
    // ── BILLING REMINDERS (daily 10am SGT) ──
    if (isWithinWindow(currentTime, "10:00", 7)) {
      await runGuarded("billing-reminders", ()=>sendBillingRenewalReminders(sb, today));
    }
    return new Response(JSON.stringify({
      success: true,
      time_sg: currentTime,
      sent: totalSent,
      reminders: totalReminders,
      failures: failureCount
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Cron error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Cron error"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
// ── CORE FUNCTIONS ──
async function sendCheckinPrompts(sb, levelGroup, today, dayOfWeek, currentTime, levelDefaultCheckinTime) {
  // Get all children in this level group
  const { data: children } = await sb.from("sq_children").select("id, name, level, whatsapp_number, parent_id, study_days, cca_days").not("whatsapp_number", "is", null);
  if (!children) return 0;

  // Guardrail: never send child check-ins to numbers already registered as parent numbers.
  const { data: parentPhones } = await sb.from("sq_memberships").select("parent_phone").not("parent_phone", "is", null);
  const parentPhoneSet = new Set((parentPhones || []).map((p)=>normalizePhone(p.parent_phone)).filter(Boolean));

  let sent = 0;
  for (const child of children){
    if (getLevelGroup(child.level) !== levelGroup) continue;
    if (!child.whatsapp_number) continue;
    if (parentPhoneSet.has(normalizePhone(child.whatsapp_number))) continue;
    // Check plan
    const { data: membership } = await sb.from("sq_memberships").select("plan_type").eq("user_id", child.parent_id).single();
    const { data: settings } = await sb.from("sq_study_settings").select("commence_date, check_completion_time").eq("child_id", child.id).single();
    if (settings?.commence_date && today < settings.commence_date) {
      continue; // Programme hasn't started yet for this child
    }
    // Parent-selected check-in time takes priority over level defaults.
    const preferredCheckinTime = settings?.check_completion_time || levelDefaultCheckinTime;
    if (!isWithinWindow(currentTime, preferredCheckinTime, 12)) continue;
    // Study days: parent-set days take priority, default Mon-Fri
    const savedStudyDays = Array.isArray(child.study_days) ? child.study_days.map((d)=>Number(d)).filter((d)=>Number.isInteger(d) && d >= 0 && d <= 6) : [];
    const isFreePlan = !membership || membership.plan_type === "free";
    const childStudyDays = savedStudyDays.length > 0 ? savedStudyDays : [
      1,
      2,
      3,
      4,
      5
    ]; // Mon-Fri default for both plans
    // Skip CCA days
    const ccaDays = child.cca_days && child.cca_days.length > 0 ? child.cca_days : [];
    // Get today's target (if any)
    const weekStart = getWeekStart(today);
    const { data: targets } = await sb.from("sq_weekly_targets").select("subject_name, daily_quantity, target_unit, remaining_quantity").eq("child_id", child.id).eq("week_start", weekStart);
    const hasTargets = targets && targets.length > 0;
    const todayTarget = hasTargets ? targets[0] : null;
    // Get nearest active exam for this child
    const { data: activeExams } = await sb.from("sq_exam_targets").select("id, exam_date, exam_type, subject_id").eq("child_id", child.id).eq("cycle_status", "active").gte("exam_date", today).order("exam_date", {
      ascending: true
    }).limit(1);
    let examLine = "";
    if (activeExams && activeExams.length > 0) {
      const exam = activeExams[0];
      const daysLeft = Math.ceil((new Date(exam.exam_date).getTime() - new Date(today).getTime()) / 86400000);
      let examSubject = exam.exam_type;
      if (exam.subject_id) {
        const { data: subj } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (subj) examSubject = subj.subject_name;
      }
      if (daysLeft <= 30) {
        examLine = `\n⏰ *${examSubject} exam in ${daysLeft} day${daysLeft === 1 ? '' : 's'}!*`;
      }
    }
    if (isFreePlan) {
      // ═══ FREE TIER: bundled check-in on Tue/Thu/Sun ═══
      if (!FREE_CHECKIN_DAYS.includes(dayOfWeek)) continue;
      const windowDays = FREE_CHECKIN_WINDOWS[dayOfWeek] || [];
      // Only study days in this window (excluding CCA days)
      const coveredStudyDays = windowDays.filter((d)=>childStudyDays.includes(d) && !ccaDays.includes(d));
      if (coveredStudyDays.length === 0) continue;
      // Retry behavior:
      // - If today's row exists with prompt_sent_at set, skip (already sent).
      // - If today's row exists but prompt_sent_at is null, retry send on this cron run.
      // - If no row exists, create one and attempt send.
      const { data: existing } = await sb.from("sq_checkins").select("id, prompt_sent_at").eq("child_id", child.id).eq("checkin_date", today).limit(1);
      let checkinId = null;
      if (existing && existing.length > 0) {
        if (existing[0].prompt_sent_at) continue;
        checkinId = existing[0].id;
      }
      const coveredDayNames = coveredStudyDays.map((d)=>DAY_NAMES[d]).join(' & ');
      // Bundled target = daily × covered days
      const bundledQty = todayTarget ? todayTarget.daily_quantity * coveredStudyDays.length : 0;
      if (!checkinId) {
        const { data: inserted, error: insertError } = await sb.from("sq_checkins").insert({
          child_id: child.id,
          checkin_date: today,
          status: "pending",
          prompt_sent_at: null,
          ...todayTarget && {
            target_quantity: bundledQty,
            target_unit: todayTarget.target_unit,
            subject_reported: todayTarget.subject_name
          }
        }).select("id").single();
        if (insertError || !inserted) {
          console.error("Failed to create free-tier check-in row", {
            childId: child.id,
            date: today,
            error: insertError?.message
          });
          continue;
        }
        checkinId = inserted.id;
      }
      let message;
      if (hasTargets) {
        const targetLine = targets.map((t)=>{
          const qty = t.daily_quantity * coveredStudyDays.length;
          return `• ${t.subject_name}: *${qty} ${formatUnitLabel(qty, t.target_unit)}*`;
        }).join("\n");
        const firstTarget = targets[0];
        const firstQty = firstTarget.daily_quantity * coveredStudyDays.length;
        const unitLabel = formatUnitLabel(firstQty, firstTarget.target_unit);
        message = `Hey ${child.name}! 📚 Study check-in time!\n\nYour target for ${coveredDayNames}:\n${targetLine}${examLine}\n\nHave you finished it?\n\nReply: *yes* / *partial* / *no*`;
      } else {
        message = `Hey ${child.name}! 📚 Study check-in time!\n\nHave you finished your study target for ${coveredDayNames}?${examLine}\n\nReply: *yes* / *partial* / *no*`;
      }
      try {
        await sendWhatsApp(child.whatsapp_number, undefined, undefined, message);
        await sb.from("sq_checkins").update({
          prompt_sent_at: new Date().toISOString()
        }).eq("id", checkinId);
        sent++;
      } catch (err) {
        // Keep prompt_sent_at null so subsequent cron runs can retry automatically.
        console.error("Free-tier check-in send failed; will retry next run", {
          childId: child.id,
          date: today,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    } else {
      // ═══ PREMIUM TIER: daily check-in on each study day ═══
      if (!childStudyDays.includes(dayOfWeek)) continue;
      if (ccaDays.includes(dayOfWeek)) continue;
      const { data: existing } = await sb.from("sq_checkins").select("id, prompt_sent_at").eq("child_id", child.id).eq("checkin_date", today).limit(1);
      let checkinId = null;
      if (existing && existing.length > 0) {
        if (existing[0].prompt_sent_at) continue;
        checkinId = existing[0].id;
      }
      if (!checkinId) {
        const { data: inserted, error: insertError } = await sb.from("sq_checkins").insert({
          child_id: child.id,
          checkin_date: today,
          status: "pending",
          prompt_sent_at: null,
          ...todayTarget && {
            target_quantity: todayTarget.daily_quantity,
            target_unit: todayTarget.target_unit,
            subject_reported: todayTarget.subject_name
          }
        }).select("id").single();
        if (insertError || !inserted) {
          console.error("Failed to create premium check-in row", {
            childId: child.id,
            date: today,
            error: insertError?.message
          });
          continue;
        }
        checkinId = inserted.id;
      }
      let message;
      if (hasTargets) {
        const targetLine = targets.map((t)=>`• ${t.subject_name}: *${t.daily_quantity} ${formatUnitLabel(t.daily_quantity, t.target_unit)}*`).join("\n");
        const firstTarget = targets[0];
        const firstQty = firstTarget.daily_quantity;
        const unitLabel = formatUnitLabel(firstQty, firstTarget.target_unit);
        message = targets.length === 1 ? `Hey ${child.name}! 📚 Study check-in time!\n\nToday's target:\n• ${firstTarget.subject_name}: *${firstQty} ${unitLabel}*${examLine}\n\nHave you finished it?\n\nReply: *yes* / *partial* / *no*` : `Hey ${child.name}! 📚 Study check-in time!\n\nToday's targets:${examLine}\n${targetLine}\n\nHave you finished them?\n\nReply: *yes* / *partial* / *no*`;
      } else {
        message = `Hey ${child.name}! 📚 Study check-in time!\n\nHave you finished your study target for today?${examLine}\n\nReply: *yes* / *partial* / *no*`;
      }
      try {
        await sendWhatsApp(child.whatsapp_number, undefined, undefined, message);
        await sb.from("sq_checkins").update({
          prompt_sent_at: new Date().toISOString()
        }).eq("id", checkinId);
        sent++;
      } catch (err) {
        // Keep prompt_sent_at null so subsequent cron runs can retry automatically.
        console.error("Premium check-in send failed; will retry next run", {
          childId: child.id,
          date: today,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
  }
  return sent;
}
async function sendFollowupReminders(sb, levelGroup, today) {
  // Find children who were prompted but haven't replied
  const { data: pending } = await sb.from("sq_checkins").select("id, child_id, prompt_sent_at, target_quantity, target_unit, subject_reported").eq("checkin_date", today).eq("status", "pending").not("prompt_sent_at", "is", null);
  if (!pending) return 0;

  const { data: parentPhones } = await sb.from("sq_memberships").select("parent_phone").not("parent_phone", "is", null);
  const parentPhoneSet = new Set((parentPhones || []).map((p)=>normalizePhone(p.parent_phone)).filter(Boolean));

  let reminded = 0;
  for (const checkin of pending){
    const { data: child } = await sb.from("sq_children").select("name, level, whatsapp_number, parent_id, cca_days").eq("id", checkin.child_id).single();
    if (!child || getLevelGroup(child.level) !== levelGroup) continue;
    if (!child.whatsapp_number) continue;
    if (parentPhoneSet.has(normalizePhone(child.whatsapp_number))) continue;
    // Send a gentle nudge to the kid
    const qty = Number(checkin.target_quantity || 0);
    const unit = checkin.target_unit || "";
    const subject = checkin.subject_reported || "";
    const reminderMsg = qty > 0 && unit && subject ? `Hey ${child.name}, quick reminder 😊\n\nYour target:\n• ${subject}: *${qty} ${formatUnitLabel(qty, unit)}*\n\nHave you finished it?\n\nReply: *yes* / *partial* / *no*.` : `Hey ${child.name}, just a friendly reminder! 😊\n\nHave you finished your study target for today?\n\nReply: *yes* / *partial* / *no*.`;
    const childSent = await safeSendWhatsApp(child.whatsapp_number, undefined, undefined, reminderMsg, "followup-child");
    // Also nudge parent
    const { data: membership } = await sb.from("sq_memberships").select("parent_phone, parent_name, preferred_language").eq("user_id", child.parent_id).single();
    let parentSent = false;
    if (membership?.parent_phone) {
      const lang = membership.preferred_language || "en";
      if (lang === "zh") {
        parentSent = await safeSendWhatsApp(membership.parent_phone, undefined, undefined, ZH_CRON.followup_reminder(child.name), "followup-parent-zh");
      } else {
        parentSent = await safeSendWhatsApp(membership.parent_phone, "sp_reminder_checkin", {
          parent_name: membership.parent_name || "Parent",
          child_name: child.name
        }, undefined, "followup-parent-en");
      }
    }
    if (childSent || parentSent) reminded++;
  }
  return reminded;
}
// Free plan parents receive reports only on Tue (2), Fri (5), Sat (6)
// (Now: premium parents get mini-reports on Tue/Thu; free parents get Sunday weekly only)
const FREE_REPORT_DAYS = []; // Free parents: weekly report on Sunday only
async function sendParentReports(sb, levelGroup, today, dayOfWeek) {
  // Premium parents get no Tue/Thu mini-reports in cost-saving mode.
  // They still receive immediate daily updates via webhook + Sunday weekly summary.
  if (!PREMIUM_PARENT_REPORT_DAYS.includes(dayOfWeek)) return;
  const windowDays = PREMIUM_REPORT_WINDOWS[dayOfWeek] || [];
  // Build date range from window days
  const dates = [];
  for (const wd of windowDays){
    const diff = dayOfWeek - wd; // how many days ago
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (diff >= 0 ? diff : diff + 7));
    dates.push(d.toISOString().split("T")[0]);
  }
  // Get check-ins for the window
  const { data: checkins } = await sb.from("sq_checkins").select("child_id, status, subject_reported, checkin_date").in("checkin_date", dates).neq("status", "pending");
  if (!checkins || checkins.length === 0) return;
  // Group by parent
  const parentMap = new Map();
  for (const ci of checkins){
    const { data: child } = await sb.from("sq_children").select("name, level, parent_id").eq("id", ci.child_id).single();
    if (!child || getLevelGroup(child.level) !== levelGroup) continue;
    const existing = parentMap.get(child.parent_id) || [];
    existing.push({
      child_name: child.name,
      status: ci.status,
      date: ci.checkin_date
    });
    parentMap.set(child.parent_id, existing);
  }
  const windowLabel = windowDays.map((d)=>DAY_NAMES[d]).join(' & ');
  for (const [parentId, results] of parentMap){
    const { data: membership } = await sb.from("sq_memberships").select("parent_phone, plan_type, preferred_language").eq("user_id", parentId).single();
    if (!membership?.parent_phone || membership.plan_type === "free") continue;
    const lang = membership.preferred_language || "en";
    // Group results by child
    const byChild = new Map();
    for (const r of results){
      const list = byChild.get(r.child_name) || [];
      list.push({
        status: r.status,
        date: r.date
      });
      byChild.set(r.child_name, list);
    }
    let msg;
    if (lang === "zh") {
      msg = `📊 *${windowLabel} 学习汇报*\n\n`;
      for (const [name, entries] of byChild){
        for (const e of entries){
          const statusZh = STATUS_ZH[e.status] || e.status;
          msg += `${name}（${DAY_NAMES[new Date(e.date + "T12:00:00Z").getUTCDay()]}）：${statusZh}\n`;
        }
      }
      msg += `\n回复 *confirm* 确认，或 *adjust* 调整。`;
    } else {
      msg = `📊 *${windowLabel} check-in report*\n\n`;
      for (const [name, entries] of byChild){
        for (const e of entries){
          const dayLabel = DAY_NAMES[new Date(e.date + "T12:00:00Z").getUTCDay()];
          msg += `${name} (${dayLabel}): ${e.status}\n`;
        }
      }
      msg += `\nReply *confirm* if accurate, or *adjust* if not.`;
    }
    await safeSendWhatsApp(membership.parent_phone, undefined, undefined, msg, "parent-report");
  }
}
async function checkExamProximity(sb, today) {
  const todayDate = new Date(today);
  // ── UPCOMING EXAMS: 7, 3, 1 day warnings ──
  for (const daysOut of [
    7,
    3,
    1
  ]){
    const targetDate = new Date(todayDate);
    targetDate.setDate(targetDate.getDate() + daysOut);
    const targetStr = targetDate.toISOString().split("T")[0];
    const { data: exams } = await sb.from("sq_exam_targets").select("id, child_id, exam_date, exam_type, subject_id").eq("exam_date", targetStr).eq("cycle_status", "active");
    if (!exams) continue;
    for (const exam of exams){
      const { data: child } = await sb.from("sq_children").select("name, parent_id, whatsapp_number").eq("id", exam.child_id).single();
      if (!child) continue;
      const { data: membership } = await sb.from("sq_memberships").select("parent_phone, plan_type, preferred_language").eq("user_id", child.parent_id).single();
      if (!membership?.parent_phone) continue;
      let subjectName = exam.exam_type;
      if (exam.subject_id) {
        const { data: subject } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (subject) subjectName = subject.subject_name;
      }
      const examLabel = `${subjectName} ${exam.exam_type === 'major' ? '(Major)' : ''}`;
      const lang = membership.preferred_language || "en";
      // Parent message
      let parentMsg;
      if (lang === "zh") {
        parentMsg = daysOut === 1 ? ZH_CRON.exam_1d(child.name, examLabel) : daysOut === 3 ? ZH_CRON.exam_3d(child.name, examLabel) : ZH_CRON.exam_7d(child.name, examLabel);
      } else {
        parentMsg = daysOut === 1 ? `🚨 ${child.name}'s ${examLabel} exam is *TOMORROW*! Make sure revision is done tonight.` : daysOut === 3 ? `⚠️ ${child.name}'s ${examLabel} exam in *3 days*. Final stretch — focus on weak areas.` : `📅 ${child.name}'s ${examLabel} exam in *7 days*. Good time to review and consolidate.`;
      }
      await safeSendWhatsApp(membership.parent_phone, undefined, undefined, parentMsg, "exam-parent");
      // Kid message (if has WhatsApp)
      if (child.whatsapp_number && normalizePhone(child.whatsapp_number) !== normalizePhone(membership.parent_phone)) {
        const kidMsg = daysOut === 1 ? `💪 ${child.name}, your ${subjectName} exam is *TOMORROW*! You've been preparing — trust yourself and rest well tonight!` : daysOut === 3 ? `📝 3 days to ${subjectName} exam! Focus on your toughest topics today.` : `📚 1 week to ${subjectName} exam! Stay consistent — you've got this.`;
        await safeSendWhatsApp(child.whatsapp_number, undefined, undefined, kidMsg, "exam-child");
      }
      // ── FUNNEL: exam < 30 days → suggest tutor ──
      if (daysOut <= 7 && membership.plan_type !== 'free') {
        // Check if they already have a tutor request
        const { data: existingReq } = await sb.from("sq_tutor_requests").select("id").eq("user_id", child.parent_id).limit(1);
        if (!existingReq || existingReq.length === 0) {
          const tutorMsg = lang === "zh" ? ZH_CRON.exam_tutor(child.name, String(daysOut)) : `💡 With ${child.name}'s exam ${daysOut} day${daysOut === 1 ? '' : 's'} away — need a tutor for focused revision? Reply *tutor* and we'll match one for you.`;
          await safeSendWhatsApp(membership.parent_phone, undefined, undefined, tutorMsg, "exam-tutor-nudge");
        }
      }
    }
  }
  // ── POST-EXAM: exams that just passed (yesterday) → prompt for next ──
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const { data: pastExams } = await sb.from("sq_exam_targets").select("id, child_id, exam_type, subject_id").eq("exam_date", yesterdayStr).eq("cycle_status", "active");
  if (pastExams) {
    for (const exam of pastExams){
      // Mark exam as ended
      await sb.from("sq_exam_targets").update({
        cycle_status: "ended"
      }).eq("id", exam.id);
      const { data: child } = await sb.from("sq_children").select("name, parent_id, whatsapp_number").eq("id", exam.child_id).single();
      if (!child) continue;
      const { data: membership } = await sb.from("sq_memberships").select("parent_phone, plan_type, preferred_language").eq("user_id", child.parent_id).single();
      let subjectName = "the";
      if (exam.subject_id) {
        const { data: s } = await sb.from("sq_monitored_subjects").select("subject_name").eq("id", exam.subject_id).single();
        if (s) subjectName = s.subject_name;
      }
      const pLang = membership?.preferred_language || "en";
      // Ask parent about next exam
      if (membership?.parent_phone) {
        const postMsg = pLang === "zh" ? ZH_CRON.post_exam(child.name, subjectName) : `${child.name}'s ${subjectName} exam is done! 🎉\n\nHow did it go? When is the next exam?\nYou can update exam dates in the StudyPulse dashboard.`;
        await safeSendWhatsApp(membership.parent_phone, undefined, undefined, postMsg, "post-exam-parent");
        // Funnel: suggest diagnostic after exam
        const diagMsg = pLang === "zh" ? ZH_CRON.post_exam_diagnostic(child.name) : `💡 Want to know exactly where ${child.name} stands? A *diagnostic assessment* can pinpoint gaps before the next exam cycle.\nBook one at studypulse.co → Actions → Book Diagnostic`;
        await safeSendWhatsApp(membership.parent_phone, undefined, undefined, diagMsg, "post-exam-diagnostic");
      }
      // Tell kid well done
      if (child.whatsapp_number && normalizePhone(child.whatsapp_number) !== normalizePhone(membership?.parent_phone)) {
        await safeSendWhatsApp(child.whatsapp_number, undefined, undefined, `${subjectName} exam done! 🎉 Great job finishing it. Take a well-deserved break today! 😊`, "post-exam-child");
      }
    }
  }
}
async function sendWeeklySummaries(sb, today) {
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  // Get all active children
  const { data: children } = await sb.from("sq_children").select("id, name, parent_id, study_days, cca_days, whatsapp_number").not("whatsapp_number", "is", null);
  if (!children) return;
  for (const child of children){
    // Count this week's check-ins
    const { data: checkins } = await sb.from("sq_checkins").select("status").eq("child_id", child.id).gte("checkin_date", weekStartStr).lte("checkin_date", today).neq("status", "pending");
    const count = checkins?.length || 0;
    const doneCount = checkins?.filter((c)=>c.status === 'yes' || c.status === 'done' || c.status === 'did_extra').length || 0;
    const missedCount = checkins?.filter((c)=>c.status === 'no').length || 0;
    const { data: membership } = await sb.from("sq_memberships").select("parent_phone, plan_type, preferred_language, created_at").eq("user_id", child.parent_id).single();
    if (!membership?.parent_phone) continue;
    const { data: settings } = await sb.from("sq_study_settings").select("commence_date").eq("child_id", child.id).single();
    const rawStudyDays = child.study_days && child.study_days.length > 0 ? child.study_days : [
      1,
      2,
      3,
      4,
      5
    ]; // Mon-Fri default for both plans
    const effectiveStudyDays = rawStudyDays.filter((d)=>!(child.cca_days || []).includes(d));
    const summaryStart = settings?.commence_date && settings.commence_date > weekStartStr ? settings.commence_date : weekStartStr;
    const studyDays = countScheduledDaysInRange(summaryStart, today, effectiveStudyDays);
    if (studyDays <= 0) continue;
    const lang = membership.preferred_language || "en";
    // Build summary message
    let summaryMsg;
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
    const weeksEnrolled = enrolledAt ? Math.floor((new Date(today).getTime() - enrolledAt.getTime()) / (7 * 86400000)) : 0;
    if (missedCount >= 3 && weeksEnrolled >= 2) {
      summaryMsg += lang === "zh" ? ZH_CRON.weekly_tutor_nudge(child.name, String(missedCount)) : `\n\n💡 ${child.name} missed ${missedCount} days this week. A tutor can help build a structured routine. Visit studypulse.co → Actions → Find a Tutor.`;
    }
    await safeSendWhatsApp(membership.parent_phone, undefined, undefined, summaryMsg, "weekly-summary");
    // Save summary record
    await sb.from("sq_weekly_summaries").insert({
      child_id: child.id,
      week_start: weekStartStr,
      checkins_completed: doneCount,
      checkins_total: studyDays,
      completion_state: doneCount >= studyDays ? "complete" : doneCount > 0 ? "partial" : "none"
    });
  }
}
// ── MID-WEEK PARENT NUDGE (Wednesday 8pm) ──
async function sendMidWeekParentNudge(sb, today) {
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7); // Monday
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const { data: children } = await sb.from("sq_children").select("id, name, parent_id").not("whatsapp_number", "is", null);
  if (!children) return;
  // Group by parent
  const parentMap = new Map();
  for (const child of children){
    const names = parentMap.get(child.parent_id) || [];
    names.push(child.name);
    parentMap.set(child.parent_id, names);
  }
  for (const [parentId, childNames] of parentMap){
    const { data: membership } = await sb.from("sq_memberships").select("parent_phone, plan_type, preferred_language").eq("user_id", parentId).single();
    if (!membership?.parent_phone) continue;
    // Count check-ins so far this week
    const { data: kids } = await sb.from("sq_children").select("id, name").eq("parent_id", parentId);
    if (!kids) continue;
    const lang = membership.preferred_language || "en";
    let msg = lang === "zh" ? ZH_CRON.midweek_header() : `📋 *Mid-week check* — how's the studying going?\n\n`;
    for (const kid of kids){
      const { count } = await sb.from("sq_checkins").select("id", {
        count: "exact",
        head: true
      }).eq("child_id", kid.id).gte("checkin_date", weekStartStr).lte("checkin_date", today).in("status", [
        "yes",
        "done",
        "did_extra"
      ]);
      msg += lang === "zh" ? ZH_CRON.midweek_child(kid.name, String(count || 0)) : `${kid.name}: ${count || 0} check-ins so far\n`;
    }
    msg += lang === "zh" ? ZH_CRON.midweek_footer() : `\nHave you checked their work? A quick look keeps things honest! 👀`;
    await safeSendWhatsApp(membership.parent_phone, undefined, undefined, msg, "midweek-parent-nudge");
  }
}
// ── BILLING / RENEWAL REMINDERS ──
async function sendBillingRenewalReminders(sb, today) {
  const todayDate = new Date(`${today}T00:00:00Z`);
  const { data: memberships } = await sb.from("sq_memberships").select("user_id, parent_name, parent_phone, preferred_language, plan_type, status, stripe_subscription_id, current_period_end").eq("plan_type", "premium").not("parent_phone", "is", null).not("current_period_end", "is", null);
  if (!memberships) return;
  for (const membership of memberships){
    if (!membership.parent_phone || !membership.current_period_end) continue;
    const endDate = new Date(membership.current_period_end);
    if (Number.isNaN(endDate.getTime())) continue;
    const endDay = new Date(endDate.toISOString().split("T")[0] + "T00:00:00Z");
    const daysLeft = Math.round((endDay.getTime() - todayDate.getTime()) / 86400000);
    const isRecurring = !!membership.stripe_subscription_id;
    const lang = membership.preferred_language || "en";
    const name = membership.parent_name || "Parent";
    if (!isRecurring && daysLeft < 0 && membership.status === "premium_active") {
      await sb.from("sq_memberships").update({
        plan_type: "free",
        status: "premium_cancelled",
        updated_at: new Date().toISOString()
      }).eq("user_id", membership.user_id);
      const expiredMsg = lang === "zh" ? `📌 您的 StudyPulse Premium 通行证已经结束。如需继续每日打卡和家长摘要，请重新续费。` : `📌 Your StudyPulse Premium pass has ended. Renew anytime to continue daily check-ins and parent summaries.`;
      await safeSendWhatsApp(membership.parent_phone, undefined, undefined, expiredMsg, "billing-expired");
      continue;
    }
    let reminderMsg = null;
    if (isRecurring && [
      3,
      1
    ].includes(daysLeft)) {
      reminderMsg = lang === "zh" ? `🔔 您的 StudyPulse Premium 将在 ${daysLeft} 天后自动续费。您可随时在账户里管理账单。` : `🔔 Your StudyPulse Premium will renew automatically in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. You can manage billing anytime from your account.`;
    }
    if (!isRecurring && [
      7,
      3,
      1
    ].includes(daysLeft)) {
      reminderMsg = lang === "zh" ? `⏳ 您的 StudyPulse Premium 通行证将在 ${daysLeft} 天后结束。若要继续每日跟进，请及时续费。` : `⏳ Your StudyPulse Premium pass ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Renew before it ends to keep daily follow-ups active.`;
    }
    if (reminderMsg) {
      await safeSendWhatsApp(membership.parent_phone, undefined, undefined, reminderMsg, "billing-reminder");
    }
  }
}
// ── WEEKLY TARGET PROMPT (Monday 4pm) ──
async function sendWeeklyTargetPrompts(sb, today) {
  const weekStart = getWeekStart(today);
  // Get all children; parent can set the target even before the child activates WhatsApp
  const { data: children } = await sb.from("sq_children").select("id, name, whatsapp_number, parent_id");
  if (!children) return;
  for (const child of children){
    // Check if premium
    const { data: membership } = await sb.from("sq_memberships").select("plan_type, parent_phone, preferred_language").eq("user_id", child.parent_id).single();
    if (membership?.plan_type === "free") continue;
    // Check if targets already set this week
    const { data: existing } = await sb.from("sq_weekly_targets").select("id").eq("child_id", child.id).eq("week_start", weekStart).limit(1);
    if (existing && existing.length > 0) continue; // Already set
    if (membership?.parent_phone) {
      const msg = membership.preferred_language === 'zh' ? `📋 ${child.name} 这周还没有设置学习目标。请打开 StudyPulse 家长面板，设置每周目标，系统会自动拆分成每天的任务。` : `📋 ${child.name} does not have a weekly target yet. Please open the StudyPulse parent dashboard and set this week's target so the system can send the daily goal automatically.`;
      await safeSendWhatsApp(membership.parent_phone, undefined, undefined, msg, "weekly-target-prompt");
    }
  }
}
// ── TIME HELPERS ──
function getWeekStart(todayStr) {
  const d = new Date(todayStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}
function countScheduledDaysInRange(startStr, endStr, allowedDays) {
  const start = new Date(`${startStr}T12:00:00Z`);
  const end = new Date(`${endStr}T12:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return 0;
  let count = 0;
  const cursor = new Date(start);
  while(cursor <= end){
    if (allowedDays.includes(cursor.getUTCDay())) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}
function isWithinWindow(current, target, marginMinutes) {
  const [ch, cm] = current.split(":").map(Number);
  const [th, tm] = target.split(":").map(Number);
  const currentMins = ch * 60 + cm;
  const targetMins = th * 60 + tm;
  return Math.abs(currentMins - targetMins) <= marginMinutes;
}
function addMinutes(time, mins) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
function formatUnitLabel(quantity, rawUnit) {
  const unit = (rawUnit || "task").trim().toLowerCase();
  const singularMap = {
    questions: "question",
    chapters: "chapter",
    pages: "page",
    worksheets: "worksheet",
    minutes: "minute",
    papers: "paper",
    topics: "topic",
    exercises: "exercise",
    sums: "sum",
    passages: "passage",
    compositions: "composition",
    practices: "practice"
  };
  if (quantity === 1) {
    if (singularMap[unit]) return singularMap[unit];
    return unit.endsWith("s") ? unit.slice(0, -1) : unit;
  }
  if (singularMap[unit]) return unit;
  return unit.endsWith("s") ? unit : `${unit}s`;
}
// ── AUTO-CLOSE: mark check-ins still pending 2h after prompt as 'forgot' ──
async function autoCloseStaleCheckins(sb, levelGroup, today) {
  const { data: stale } = await sb.from("sq_checkins").select("id, child_id").eq("checkin_date", today).eq("status", "pending");
  if (!stale) return;
  for (const checkin of stale){
    // If the child already has any non-pending check-in today, this pending row is stale.
    // Clean it up silently and never send a false "forgot" message.
    const { data: answered } = await sb
      .from("sq_checkins")
      .select("id")
      .eq("child_id", checkin.child_id)
      .eq("checkin_date", today)
      .neq("status", "pending")
      .limit(1);
    if (answered && answered.length > 0) {
      await sb.from("sq_checkins").delete().eq("id", checkin.id);
      continue;
    }

    const { data: child } = await sb.from("sq_children").select("name, level, whatsapp_number, parent_id, study_days, cca_days").eq("id", checkin.child_id).single();
    if (!child || getLevelGroup(child.level) !== levelGroup) continue;
    const sgNow = getSGTime();
    const todayDow = sgNow.getUTCDay();
    // Don't auto-close on CCA days
    const ccaDays = child.cca_days || [];
    if (ccaDays.includes(todayDow)) {
      await sb.from("sq_checkins").delete().eq("id", checkin.id);
      continue;
    }
    // Determine plan so we only close on actual study days
    const { data: membership } = await sb.from("sq_memberships").select("plan_type, parent_phone, parent_name, preferred_language").eq("user_id", child.parent_id).single();
    const isFreePlan = !membership || membership.plan_type === "free";
    // Free tier: only close on scheduled check-in days (Tue/Thu/Sun)
    if (isFreePlan && !FREE_CHECKIN_DAYS.includes(todayDow)) {
      await sb.from("sq_checkins").delete().eq("id", checkin.id);
      continue;
    }
    // Premium tier: only close if today is actually in their study_days
    if (!isFreePlan) {
      const savedStudyDays = Array.isArray(child.study_days)
        ? child.study_days.map((d) => Number(d)).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
        : [1, 2, 3, 4, 5]; // default Mon-Fri
      if (!savedStudyDays.includes(todayDow)) {
        await sb.from("sq_checkins").delete().eq("id", checkin.id);
        continue;
      }
    }
    // Mark as 'forgot'
    await sb.from("sq_checkins").update({
      status: "forgot",
      reply_received_at: new Date().toISOString()
    }).eq("id", checkin.id);
    // Soft notify child (no scolding — gentle)
    // membership already fetched above for plan check
    if (child.whatsapp_number && normalizePhone(child.whatsapp_number) !== normalizePhone(membership?.parent_phone)) {
      await safeSendWhatsApp(child.whatsapp_number, undefined, undefined, `No worries, ${child.name}! 😴 Looks like you forgot to check in today — that's okay. Tomorrow is a fresh start! 💪`, "autoclose-child");
    }
    // Notify parent
    if (membership?.parent_phone) {
      const lang = membership.preferred_language || "en";
      const msg = lang === "zh" ? `📋 ${child.name} 今天没有打卡（已超时）。明天继续加油！` : `📋 ${child.name} didn't check in today — logged as *forgot*. Gentle nudge for tomorrow! 🙂`;
      await safeSendWhatsApp(membership.parent_phone, undefined, undefined, msg, "autoclose-parent");
    }
  }
}
