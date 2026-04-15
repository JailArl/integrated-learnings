import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * WhatsApp Webhook v2 — Target-based check-in system
 *
 * Conversation states:
 *   idle              → normal check-in mode
 *   setting_target    → kid is setting weekly targets per subject
 *   partial_count     → kid said "partially", asking how many they did
 *
 * Notes:
 *   after a child replies "no", they can still send a follow-up reason
 *   like "tired" or "sick" and the system will record it.
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── PARENT MESSAGE TRANSLATIONS (en → zh) ──
// Kids always get English. Parents get their preferred_language.
const ZH: Record<string, (...args: string[]) => string> = {
  checkin_done: (name, subj, qty, unit) => `✅ ${name} 完成了今天的目标：${qty} ${unit} 的 ${subj}！`,
  checkin_done_generic: (name) => `✅ ${name} 打卡了 — 今天有温习！`,
  checkin_extra: () => ` ⚡ 做了额外练习！`,
  checkin_partial: (name, done, total, unit, subj) =>
    `📝 ${name}：今天完成了 ${done}/${total} ${unit}${subj ? `（${subj}）` : ""}。` +
    (Number(total) - Number(done) > 0 ? ` 还剩 ${Number(total) - Number(done)} 个，鼓励明天完成。` : " 全部完成了！"),
  checkin_partial_generic: (name) => `📝 ${name} 打卡了 — 部分完成。鼓励明天完成。`,
  checkin_no: (name) => `📋 ${name} 打卡了 — 今天没有温习。打卡本身也算有出现。`,
  rest_normal: (name, reason) => `${name} 今天休息（${reason}）。还是有打卡！`,
  rest_distress: (name, reason) => `💛 注意 — ${name} 说${reason}。今晚可以聊聊。`,
  targets_set: (name) => `${name} 已设置本周学习目标！📊 打卡将从下一个预定时间开始。`,
  parent_confirm_yes: () => `已确认！谢谢 ✅`,
  parent_confirm_adjust: (names) => `好的 — 已更新 ${names} 的记录。谢谢！`,
};

// Translate reason keywords to Chinese
const REASON_ZH: Record<string, string> = {
  "feeling tired": "感觉累了",
  "not feeling well": "身体不舒服",
  "school ended late": "放学晚了",
  "family commitment": "家庭活动",
  "busy schedule": "行程太忙",
  "exam prep (different subject)": "准备其他科目的考试",
  "feeling overwhelmed": "感到压力大",
};

// Helper: get parent's language preference
async function getParentLang(sb: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data } = await sb.from("sq_memberships").select("preferred_language").eq("user_id", userId).single();
  return data?.preferred_language || "en";
}

// ── SEND HELPERS ──

async function sendRaw(to: string, message: string) {
  await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ to, raw_message: message }),
  });
}

async function sendTemplate(to: string, templateName: string, variables?: Record<string, string>) {
  await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ to, template_name: templateName, variables }),
  });
}

// ── PARSERS ──

function parseTargetReply(body: string): { quantity: number; unit: string } | null {
  const lower = body.trim().toLowerCase();
  // Match: "20 questions", "3 chapters", "10 pages", "5 worksheets"
  const match = lower.match(/^(\d+)\s*(questions?|chapters?|pages?|worksheets?|topics?|exercises?|problems?|sums?|passages?|compositions?|practices?)/);
  if (match) {
    return { quantity: parseInt(match[1]), unit: match[2].replace(/s$/, "") };
  }
  // Just a number — default to "question"
  const numMatch = lower.match(/^(\d+)$/);
  if (numMatch) {
    return { quantity: parseInt(numMatch[1]), unit: "question" };
  }
  return null;
}

// ── SKIP / REST DAY REASONS ──

const SKIP_REASONS: { keywords: RegExp; reason: string; emoji: string; kidMsg: string }[] = [
  { keywords: /tired|exhausted|shag|sian|sleepy|drained|no energy|so tired/,
    reason: "feeling tired", emoji: "😴",
    kidMsg: "Noted — rest well." },
  { keywords: /sick|unwell|fever|headache|stomach|not feeling well|mc|medical|doctor|flu|cold|cough/,
    reason: "not feeling well", emoji: "🤒",
    kidMsg: "Noted — get well soon." },
  { keywords: /late|end late|school late|reach home late|came back late|reached late/,
    reason: "school ended late", emoji: "🕐",
    kidMsg: "Noted — rest well." },
  { keywords: /family|event|outing|dinner|gathering|relative|visitor|celebration|wedding|birthday/,
    reason: "family commitment", emoji: "👨‍👩‍👧‍👦",
    kidMsg: "Noted — see you tomorrow." },
  { keywords: /busy|occupied|no time|packed|tuition|class|lesson|extra class|cca|training/,
    reason: "busy schedule", emoji: "📅",
    kidMsg: "Noted — see you tomorrow." },
  { keywords: /exam|test tomorrow|revision|preparing|studying for|mugging/,
    reason: "exam prep (different subject)", emoji: "📝",
    kidMsg: "Noted — good luck." },
  { keywords: /stressed|cannot|overwhelm|too much|pressure|anxious|anxiety|scared|worried|hate study|hate school|don.t want/,
    reason: "feeling overwhelmed", emoji: "💛",
    kidMsg: "Noted 💛 Rest well." },
];

function parseSkipReason(body: string): { reason: string; emoji: string; kidMsg: string } | null {
  const lower = body.trim().toLowerCase();
  for (const sr of SKIP_REASONS) {
    if (sr.keywords.test(lower)) {
      return { reason: sr.reason, emoji: sr.emoji, kidMsg: sr.kidMsg };
    }
  }
  return null;
}

function parseCheckinStatus(body: string): { status: string; count?: number } | null {
  const lower = body.trim().toLowerCase();

  if (["yes", "done", "finished", "completed", "did extra", "extra"].includes(lower)) {
    return { status: lower === "did extra" || lower === "extra" ? "did_extra" : "done" };
  }
  if (["partially", "half", "a bit", "some", "not yet", "not done"].includes(lower)) {
    return { status: "partially" };
  }
  if (["no", "nope", "didn't", "didnt", "skip", "skipped"].includes(lower)) {
    return { status: "no" };
  }
  if (/^(set target|target|set targets|my target|change target|update target|new target)$/.test(lower)) {
    return { status: "set_target" };
  }
  if (lower === "confirm") return { status: "parent_confirm" };
  if (lower === "adjust") return { status: "parent_adjust" };

  // Check for skip reasons (tired, sick, busy, etc.)
  if (parseSkipReason(body)) {
    return { status: "rest_day" };
  }

  // Number reply (for partial count: "2", "3")
  const numMatch = lower.match(/^(\d+)$/);
  if (numMatch) {
    return { status: "number_reply", count: parseInt(numMatch[1]) };
  }

  return null;
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

// ── MAIN HANDLER ──

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const from = formData.get("From")?.toString() || "";
    const body = formData.get("Body")?.toString() || "";
    const messageSid = formData.get("MessageSid")?.toString() || "";
    const messageStatus = formData.get("MessageStatus")?.toString();

    const phone = from.replace("whatsapp:", "");
    const sb = createClient(supabaseUrl, supabaseKey);

    // ── STATUS CALLBACK ──
    if (messageStatus && !body) {
      if (messageSid) {
        await sb.from("whatsapp_conversations")
          .update({ message_type: messageStatus })
          .eq("twilio_sid", messageSid);
      }
      return ok();
    }

    // ── LOG INBOUND ──
    const { error: logError } = await sb.from("whatsapp_conversations").insert({
      contact_phone: phone,
      direction: "inbound",
      message_text: body,
      content: body,
      message_type: "reply",
      twilio_sid: messageSid,
    });
    if (logError) console.error("Log error:", JSON.stringify(logError));

    // ── FIND CHILD ──
    const { data: child } = await sb
      .from("sq_children")
      .select("id, name, parent_id, level, conversation_state, conversation_context, study_days")
      .eq("whatsapp_number", phone)
      .single();

    if (!child) {
      // Check if parent (for CONFIRM/ADJUST)
      const { data: membership } = await sb
        .from("sq_memberships")
        .select("user_id, parent_name, preferred_language")
        .eq("parent_phone", phone)
        .single();

      if (membership) {
        const parsed = parseCheckinStatus(body);
        if (parsed?.status === "parent_confirm" || parsed?.status === "parent_adjust") {
          const pLang = membership.preferred_language || "en";
          await handleParentReply(sb, membership, parsed.status, phone, pLang);
        }
      }
      return ok();
    }

    const state = child.conversation_state || "idle";
    const context = (child.conversation_context as Record<string, unknown>) || {};
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekStart = getWeekStart();

    // ══════════════════════════════════════
    // ANTI-SPAM: Daily message cap (8 inbound per phone per day)
    // Saves cost — system goes silent after limit, no reply sent.
    // ══════════════════════════════════════
    const todayStart = `${today}T00:00:00.000Z`;
    const { count: msgCount } = await sb
      .from("whatsapp_conversations")
      .select("id", { count: "exact", head: true })
      .eq("contact_phone", phone)
      .eq("direction", "inbound")
      .gte("created_at", todayStart);

    const MAX_DAILY_MESSAGES = 8;
    if ((msgCount ?? 0) > MAX_DAILY_MESSAGES) {
      // Silent — don't even reply, save money
      console.log(`Anti-spam: ${phone} hit daily cap (${msgCount} msgs)`);
      return ok();
    }

    // Get membership
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, parent_name, plan_type, preferred_language")
      .eq("user_id", child.parent_id)
      .single();

    const isPremium = membership?.plan_type !== "free";
    const parentLang = membership?.preferred_language || "en";

    // ══════════════════════════════════════
    // STATE: SETTING TARGETS
    // ══════════════════════════════════════
    if (state === "setting_target") {
      await sb.from("sq_children").update({
        conversation_state: "idle",
        conversation_context: {},
      }).eq("id", child.id);

      await sendRaw(phone,
        `Your parent now manages the weekly study target in the StudyPulse dashboard. You'll still receive your daily target automatically on study days. 📚`
      );
      return ok();
    }

    // ══════════════════════════════════════
    // STATE: PARTIAL COUNT
    // ══════════════════════════════════════
    if (state === "partial_count") {
      const parsed = parseCheckinStatus(body);
      const targetQ = (context.target_quantity as number) || 0;
      const targetUnit = (context.target_unit as string) || "question";
      const subject = (context.subject as string) || "";

      let completedCount = 0;
      if (parsed?.status === "number_reply" && parsed.count !== undefined) {
        completedCount = parsed.count;
      } else {
        // Also accept target parse ("3 questions")
        const tp = parseTargetReply(body);
        if (tp) {
          completedCount = tp.quantity;
        } else {
          await sendRaw(phone, `How many ${targetUnit}s did you finish? Just reply with a number.`);
          return ok();
        }
      }

      const remaining = Math.max(0, targetQ - completedCount);

      // Update checkin
      await sb.from("sq_checkins")
        .update({ status: "partially", completed_quantity: completedCount, reply_received_at: now.toISOString() })
        .eq("child_id", child.id)
        .eq("checkin_date", today);

      // Update weekly target remaining
      if (subject) {
        const { data: wt } = await sb.from("sq_weekly_targets")
          .select("remaining_quantity")
          .eq("child_id", child.id)
          .eq("subject_name", subject)
          .eq("week_start", weekStart)
          .single();

        if (wt) {
          await sb.from("sq_weekly_targets")
            .update({ remaining_quantity: Math.max(0, wt.remaining_quantity - completedCount) })
            .eq("child_id", child.id)
            .eq("subject_name", subject)
            .eq("week_start", weekStart);
        }
      }

      // Reset state
      await sb.from("sq_children").update({
        conversation_state: "idle",
        conversation_context: {},
      }).eq("id", child.id);

      if (remaining > 0) {
        await sendRaw(phone,
          `Nice — ${completedCount} ${targetUnit}s done! 📝\n` +
          `You have *${remaining} ${targetUnit}s* left. Try to finish them by tomorrow! 💪`
        );
      } else {
        await sendRaw(phone,
          `Wait, you actually finished all ${targetQ}! 🎉 That counts as *done*. Updated!`
        );
        await sb.from("sq_checkins").update({ status: "yes" })
          .eq("child_id", child.id).eq("checkin_date", today);
      }

      if (membership?.parent_phone && membership.parent_phone !== phone) {
        const pMsg = parentLang === "zh"
          ? ZH.checkin_partial(child.name, String(completedCount), String(targetQ), targetUnit, subject)
          : `📝 ${child.name}: ${completedCount}/${targetQ} ${targetUnit}s done today${subject ? ` (${subject})` : ""}. ` +
            (remaining > 0 ? `${remaining} left — encouraged to finish tomorrow.` : `Completed the full target!`);
        await sendRaw(membership.parent_phone, pMsg);
      }

      return ok();
    }

    // ══════════════════════════════════════
    // STATE: IDLE (normal check-in)
    // ══════════════════════════════════════

    // ── "TARGET" — remind the child that the parent controls the weekly target ──
    const preCheck = parseCheckinStatus(body);
    if (preCheck?.status === "set_target" && isPremium) {
      const { data: targets } = await sb.from("sq_weekly_targets")
        .select("subject_name, daily_quantity, target_unit")
        .eq("child_id", child.id)
        .eq("week_start", weekStart);

      if (targets && targets.length > 0) {
        const summary = targets.map(t => `• ${t.subject_name}: ${t.daily_quantity} ${t.target_unit}s today`).join("\n");
        await sendRaw(phone,
          `Here is your current daily target from your parent:\n${summary}\n\nIf it needs changing, please ask your parent to update it in the StudyPulse dashboard.`
        );
      } else {
        await sendRaw(phone,
          `Your parent has not set this week's target yet. Please ask them to update it in the StudyPulse dashboard. 📚`
        );
      }
      return ok();
    }

    if (preCheck?.status === "set_target" && !isPremium) {
      await sendRaw(phone,
        `Your parent can manage targets from the StudyPulse dashboard. For now, just reply *yes* or *no* on check-in days 😊`
      );
      return ok();
    }

    // ── ALREADY CHECKED IN? Block re-replies ──
    const { data: existingCheckin } = await sb.from("sq_checkins")
      .select("id, status, prompt_sent_at, note, target_quantity")
      .eq("child_id", child.id)
      .eq("checkin_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingCheckin && existingCheckin.status !== "pending") {
      if (existingCheckin.status === "no" && preCheck?.status === "rest_day") {
        if (existingCheckin.note) {
          return ok();
        }

        const skipInfo = parseSkipReason(body)!;
        await sb.from("sq_checkins")
          .update({ note: skipInfo.reason, reply_received_at: now.toISOString() })
          .eq("id", existingCheckin.id);

        await sendRaw(phone, `${skipInfo.emoji} ${skipInfo.kidMsg}`);

        if (membership?.parent_phone && membership.parent_phone !== phone) {
          const isDistress = /overwhelm|stressed|anxious|hate|scared|worried|pressure/.test(body.toLowerCase());
          let parentMsg: string;
          if (parentLang === "zh") {
            const reasonZh = REASON_ZH[skipInfo.reason] || skipInfo.reason;
            parentMsg = isDistress
              ? ZH.rest_distress(child.name, reasonZh)
              : `${skipInfo.emoji} ${ZH.rest_normal(child.name, reasonZh)}`;
          } else {
            parentMsg = isDistress
              ? `💛 Heads up — ${child.name} said they're ${skipInfo.reason}. Might be worth a chat tonight.`
              : `${skipInfo.emoji} ${child.name} is taking a rest day (${skipInfo.reason}). They still checked in!`;
          }
          await sendRaw(membership.parent_phone, parentMsg);
        }

        return ok();
      }

      // Already answered today — send ONE reminder then go silent
      const { count: outboundToday } = await sb
        .from("whatsapp_conversations")
        .select("id", { count: "exact", head: true })
        .eq("contact_phone", phone)
        .eq("direction", "outbound")
        .gte("created_at", todayStart);

      // Allow max 3 outbound replies per day (prompt + 1 valid reply + 1 "already done")
      if ((outboundToday ?? 0) < 4) {
        await sendRaw(phone, `You've already checked in today, ${child.name}! ✅ See you tomorrow.`);
      }
      // Otherwise: silent
      return ok();
    }

    // ── GET TODAY'S TARGET ──
    const { data: todayTargets } = await sb.from("sq_weekly_targets")
      .select("subject_name, daily_quantity, target_unit, remaining_quantity")
      .eq("child_id", child.id)
      .eq("week_start", weekStart);

    const hasTargets = todayTargets && todayTargets.length > 0;
    const todayTarget = hasTargets ? todayTargets[0] : null;

    const parsed = parseCheckinStatus(body);

    if (!parsed) {
      // ── ANTI-SPAM: Only send "didn't understand" ONCE per day ──
      const { count: outboundToday } = await sb
        .from("whatsapp_conversations")
        .select("id", { count: "exact", head: true })
        .eq("contact_phone", phone)
        .eq("direction", "outbound")
        .gte("created_at", todayStart);

      // If we've already replied with a "didn't understand" hint, stay silent
      if ((outboundToday ?? 0) >= 3) {
        return ok();
      }

      const isGreeting = /^(hi|hello|hey|yo|hii+)$/i.test(body.trim());
      const welcomeTargetLine = hasTargets
        ? todayTargets!.map(t => `• ${t.subject_name}: ${t.daily_quantity} ${t.target_unit}${t.daily_quantity > 1 ? "s" : ""}`).join("\n")
        : null;

      await sendRaw(phone,
        isPremium
          ? isGreeting
            ? welcomeTargetLine
              ? `Hi ${child.name}! 👋 Welcome to StudyPulse.\n\nYour target for today is:\n${welcomeTargetLine}\n\nWhen you're done tonight, just reply *done*, *partially*, or *no*.`
              : `Hi ${child.name}! 👋 Welcome to StudyPulse.\n\nYour parent will set your study target in the dashboard, and I'll check in with you each study day.`
            : `Hi ${child.name}! 👋 Welcome to StudyPulse check-ins!\n\nWhen the prompt arrives, reply with:\n✅ *done* — completed today's tasks\n📝 *partially* — did some\n❌ *no* — skipped today\n⚡ *did extra* — went beyond the plan`
          : isGreeting
            ? `Hi ${child.name}! 👋 Welcome to StudyPulse.\n\nI'll check in with you every Tue, Thu, and Sun covering all your study days. When I do, just reply *done*, *partially*, or *no*.`
            : `Hi ${child.name}! 👋 Welcome to StudyPulse check-ins!\n\nI'll message you every Tue, Thu, and Sun. Just reply:\n✅ *done* — finished the target\n📝 *partially* — did some\n❌ *no* — skipped`
      );
      return ok();
    }

    if (parsed.status === "number_reply") {
      // Random number when not in partial_count state — one hint then silence
      const { count: outboundToday } = await sb
        .from("whatsapp_conversations")
        .select("id", { count: "exact", head: true })
        .eq("contact_phone", phone)
        .eq("direction", "outbound")
        .gte("created_at", todayStart);

      if ((outboundToday ?? 0) >= 3) return ok();
      await sendRaw(phone, "Hey! Reply with: *done* / *partially* / *no* 😊");
      return ok();
    }

    // ── FIND OR CREATE CHECKIN ──
    // existingCheckin already fetched above (for the re-reply guard)

    let responseSeconds: number | null = null;
    if (existingCheckin?.prompt_sent_at) {
      responseSeconds = Math.round((now.getTime() - new Date(existingCheckin.prompt_sent_at).getTime()) / 1000);
    }

    const checkinStatus = parsed.status === "did_extra" || parsed.status === "done" ? "yes" : parsed.status;

    const checkinData: Record<string, unknown> = {
      child_id: child.id,
      checkin_date: today,
      status: checkinStatus,
      reply_received_at: now.toISOString(),
      response_seconds: responseSeconds,
      ...(todayTarget && {
        target_quantity: todayTarget.daily_quantity,
        target_unit: todayTarget.target_unit,
        subject_reported: todayTarget.subject_name,
      }),
    };

    if (existingCheckin) {
      await sb.from("sq_checkins").update(checkinData).eq("id", existingCheckin.id);
    } else {
      checkinData.prompt_sent_at = null;
      await sb.from("sq_checkins").insert(checkinData);
    }

    // ── ANTI-CHEAT: fast reply ──
    if (responseSeconds !== null && responseSeconds < 10) {
      await sendTemplate(phone, "sp_verify_quick_reply");
      return ok();
    }

    // ── DONE / DID EXTRA ──
    if (parsed.status === "done" || parsed.status === "did_extra") {
      // Use bundled target_quantity from checkin (set by cron for free bundled check-ins)
      const checkinTargetQty = existingCheckin?.target_quantity || todayTarget?.daily_quantity || 0;

      if (todayTarget) {
        // Update remaining
        const { data: wt } = await sb.from("sq_weekly_targets")
          .select("remaining_quantity")
          .eq("child_id", child.id)
          .eq("subject_name", todayTarget.subject_name)
          .eq("week_start", weekStart)
          .single();

        if (wt) {
          await sb.from("sq_weekly_targets")
            .update({ remaining_quantity: Math.max(0, wt.remaining_quantity - checkinTargetQty) })
            .eq("child_id", child.id)
            .eq("subject_name", todayTarget.subject_name)
            .eq("week_start", weekStart);
        }

        await sb.from("sq_checkins").update({ completed_quantity: checkinTargetQty })
          .eq("child_id", child.id).eq("checkin_date", today);
      }

      const doneMsg = hasTargets
        ? `✅ ${checkinTargetQty} ${todayTarget!.target_unit}s of ${todayTarget!.subject_name} — done! Great work, ${child.name}! 💪`
        : `✅ Nice work, ${child.name}! Keep it up 💪`;

      const extraMsg = parsed.status === "did_extra" ? `\n⚡ Extra effort today — respect!` : "";

      await sendRaw(phone, doneMsg + extraMsg);

      if (membership?.parent_phone && membership.parent_phone !== phone) {
        let parentMsg: string;
        if (parentLang === "zh") {
          parentMsg = hasTargets
            ? ZH.checkin_done(child.name, todayTarget!.subject_name, String(checkinTargetQty), todayTarget!.target_unit)
            : ZH.checkin_done_generic(child.name);
          if (parsed.status === "did_extra") parentMsg += ZH.checkin_extra();
        } else {
          parentMsg = hasTargets
            ? `✅ ${child.name} completed the target: ${checkinTargetQty} ${todayTarget!.target_unit}s of ${todayTarget!.subject_name}!`
            : `✅ ${child.name} checked in — studied!`;
          if (parsed.status === "did_extra") parentMsg += " ⚡ Did extra!";
        }
        await sendRaw(membership.parent_phone, parentMsg);
      }

    // ── PARTIALLY ──
    } else if (parsed.status === "partially") {
      if (hasTargets) {
        const targetQ = existingCheckin?.target_quantity || todayTarget!.daily_quantity;

        await sb.from("sq_children").update({
          conversation_state: "partial_count",
          conversation_context: {
            target_quantity: targetQ,
            target_unit: todayTarget!.target_unit,
            subject: todayTarget!.subject_name,
          },
        }).eq("id", child.id);

        await sendRaw(phone,
          `No problem! How many ${todayTarget!.target_unit}s did you finish out of ${targetQ}?`
        );
      } else {
        await sendRaw(phone,
          `Good effort, ${child.name}! 📝 Try to finish the rest by tomorrow — small steps add up.`
        );
        if (membership?.parent_phone && membership.parent_phone !== phone) {
          const pMsg = parentLang === "zh"
            ? ZH.checkin_partial_generic(child.name)
            : `📝 ${child.name} checked in — partially done. Encouraged to finish the rest.`;
          await sendRaw(membership.parent_phone, pMsg);
        }
      }

    // ── NO ──
    } else if (parsed.status === "no") {
      await sendRaw(phone,
        `Thanks for being honest, ${child.name}. Not every day is a study day. 💪\n\nIf you'd like, can you tell me the reason? You can just reply *tired*, *sick*, or *busy*.`
      );

      if (membership?.parent_phone && membership.parent_phone !== phone) {
        const pMsg = parentLang === "zh"
          ? ZH.checkin_no(child.name)
          : `📋 ${child.name} checked in — didn't study today. Checking in still counts as showing up.`;
        await sendRaw(membership.parent_phone, pMsg);
      }

    // ── REST DAY (tired / sick / busy / family / stressed) ──
    } else if (parsed.status === "rest_day") {
      const skipInfo = parseSkipReason(body)!;

      await sendRaw(phone,
        `${skipInfo.emoji} ${skipInfo.kidMsg}`
      );

      if (membership?.parent_phone && membership.parent_phone !== phone) {
        const isDistress = /overwhelm|stressed|anxious|hate|scared|worried|pressure/.test(body.toLowerCase());
        let parentMsg: string;
        if (parentLang === "zh") {
          const reasonZh = REASON_ZH[skipInfo.reason] || skipInfo.reason;
          parentMsg = isDistress
            ? ZH.rest_distress(child.name, reasonZh)
            : `${skipInfo.emoji} ${ZH.rest_normal(child.name, reasonZh)}`;
        } else {
          parentMsg = isDistress
            ? `💛 Heads up — ${child.name} said they're ${skipInfo.reason}. Might be worth a chat tonight.`
            : `${skipInfo.emoji} ${child.name} is taking a rest day (${skipInfo.reason}). They still checked in!`;
        }
        await sendRaw(membership.parent_phone, parentMsg);
      }
    }

    // ── STREAK ──
    await updateStreak(sb, child.id);

    return ok();
  } catch (error) {
    console.error("Webhook error:", error);
    return ok();
  }
});

function ok() {
  return new Response("<Response></Response>", { headers: { "Content-Type": "text/xml" } });
}

// ── STREAK HELPER ──

async function updateStreak(sb: ReturnType<typeof createClient>, childId: string) {
  const { data: checkins } = await sb.from("sq_checkins")
    .select("checkin_date, status")
    .eq("child_id", childId)
    .neq("status", "pending")
    .order("checkin_date", { ascending: false })
    .limit(60);

  if (!checkins || checkins.length === 0) return;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < checkins.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (checkins[i].checkin_date === expected.toISOString().split("T")[0]) {
      streak++;
    } else {
      break;
    }
  }

  const milestones: Record<number, string> = {
    3: "sp_streak_3", 7: "sp_streak_7", 14: "sp_streak_14", 30: "sp_streak_30",
  };

  if (milestones[streak]) {
    const { data: child } = await sb.from("sq_children")
      .select("name, parent_id").eq("id", childId).single();
    if (child) {
      const { data: m } = await sb.from("sq_memberships")
        .select("parent_phone, preferred_language").eq("user_id", child.parent_id).single();
      if (m?.parent_phone) {
        const tpl = m.preferred_language === "zh" ? `${milestones[streak]}_zh` : milestones[streak];
        await sendTemplate(m.parent_phone, tpl, { child_name: child.name });
      }
    }
  }
}

// ── PARENT REPLY HANDLER ──

async function handleParentReply(
  sb: ReturnType<typeof createClient>,
  membership: { user_id: string; parent_name: string | null; preferred_language?: string },
  action: string,
  phone: string,
  lang: string = "en",
) {
  const { data: children } = await sb.from("sq_children")
    .select("id, name").eq("parent_id", membership.user_id);
  if (!children || children.length === 0) return;

  const today = new Date().toISOString().split("T")[0];

  if (action === "parent_confirm") {
    for (const c of children) {
      await sb.from("sq_checkins").update({ parent_confirmed: true })
        .eq("child_id", c.id).eq("checkin_date", today);
    }
    const msg = lang === "zh" ? ZH.parent_confirm_yes() : "Thanks for confirming! ✅";
    await sendRaw(phone, msg);
  } else if (action === "parent_adjust") {
    for (const c of children) {
      await sb.from("sq_checkins").update({ parent_adjusted: true })
        .eq("child_id", c.id).eq("checkin_date", today);
      await sb.from("sq_parent_adjustments").insert({
        child_id: c.id, checkin_date: today,
        original_status: "unknown", adjusted_status: "pending_adjustment",
        parent_id: membership.user_id,
      });
    }
    const names = children.map(c => c.name).join(" & ");
    const msg = lang === "zh"
      ? ZH.parent_confirm_adjust(names)
      : `Got it — we've updated ${names}'s record. Thanks!`;
    await sendRaw(phone, msg);
  }
}
