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
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    kidMsg: "Rest well tonight — a fresh mind learns better. See you tomorrow!" },
  { keywords: /sick|unwell|fever|headache|stomach|not feeling well|mc|medical|doctor|flu|cold|cough/,
    reason: "not feeling well", emoji: "🤒",
    kidMsg: "Health comes first! Get well soon — studying can wait." },
  { keywords: /late|end late|school late|reach home late|came back late|reached late/,
    reason: "school ended late", emoji: "🕐",
    kidMsg: "Long day! Rest up — tomorrow's a new day." },
  { keywords: /family|event|outing|dinner|gathering|relative|visitor|celebration|wedding|birthday/,
    reason: "family commitment", emoji: "👨‍👩‍👧‍👦",
    kidMsg: "Family time is important too! Enjoy — study resumes tomorrow." },
  { keywords: /busy|occupied|no time|packed|tuition|class|lesson|extra class|cca|training/,
    reason: "busy schedule", emoji: "📅",
    kidMsg: "Packed day! It's okay to skip — consistency over intensity." },
  { keywords: /exam|test tomorrow|revision|preparing|studying for|mugging/,
    reason: "exam prep (different subject)", emoji: "📝",
    kidMsg: "Focused on exams — that totally counts! Good luck!" },
  { keywords: /stressed|cannot|overwhelm|too much|pressure|anxious|anxiety|scared|worried|hate study|hate school|don.t want/,
    reason: "feeling overwhelmed", emoji: "💛",
    kidMsg: "It's okay to feel that way. Take a break — you're doing your best. 💛" },
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
      .select("id, name, parent_id, level, conversation_state, conversation_context")
      .eq("whatsapp_number", phone)
      .single();

    if (!child) {
      // Check if parent (for CONFIRM/ADJUST)
      const { data: membership } = await sb
        .from("sq_memberships")
        .select("user_id, parent_name")
        .eq("parent_phone", phone)
        .single();

      if (membership) {
        const parsed = parseCheckinStatus(body);
        if (parsed?.status === "parent_confirm" || parsed?.status === "parent_adjust") {
          await handleParentReply(sb, membership, parsed.status, phone);
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
    // ANTI-SPAM: Daily message cap (5 inbound per phone per day)
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
      .select("parent_phone, parent_name, plan_type")
      .eq("user_id", child.parent_id)
      .single();

    const isPremium = membership?.plan_type !== "free";

    // ══════════════════════════════════════
    // STATE: SETTING TARGETS
    // ══════════════════════════════════════
    if (state === "setting_target") {
      const currentSubject = context.current_subject as string;
      const remainingSubjects = (context.remaining_subjects as string[]) || [];
      const studyDays = (context.study_days as number) || 5;

      const targetParsed = parseTargetReply(body);

      if (!targetParsed) {
        // Anti-spam: limit "didn't understand" in target-setting too
        const { count: outboundToday } = await sb
          .from("whatsapp_conversations")
          .select("id", { count: "exact", head: true })
          .eq("contact_phone", phone)
          .eq("direction", "outbound")
          .gte("created_at", todayStart);

        if ((outboundToday ?? 0) >= 6) return ok(); // silent after too many

        await sendRaw(phone,
          `Hmm, I didn't get that. Reply with a number and unit like:\n` +
          `• *20 questions*\n• *3 chapters*\n• *10 pages*\n• *5 worksheets*`
        );
        return ok();
      }

      const daily = Math.max(1, Math.ceil(targetParsed.quantity / studyDays));

      // Save weekly target
      await sb.from("sq_weekly_targets").upsert({
        child_id: child.id,
        subject_name: currentSubject,
        week_start: weekStart,
        target_text: body.trim(),
        target_quantity: targetParsed.quantity,
        target_unit: targetParsed.unit,
        daily_quantity: daily,
        remaining_quantity: targetParsed.quantity,
      }, { onConflict: "child_id,subject_name,week_start" });

      if (remainingSubjects.length > 0) {
        const nextSubject = remainingSubjects[0];
        const rest = remainingSubjects.slice(1);

        await sb.from("sq_children").update({
          conversation_state: "setting_target",
          conversation_context: { current_subject: nextSubject, remaining_subjects: rest, study_days: studyDays },
        }).eq("id", child.id);

        await sendRaw(phone,
          `Got it! ${currentSubject}: ${targetParsed.quantity} ${targetParsed.unit}s → *${daily}/day* 📊\n\n` +
          `Now, what's your *${nextSubject}* target this week?\n` +
          `(e.g. "3 chapters", "10 pages", "5 worksheets")`
        );
      } else {
        // All subjects done
        await sb.from("sq_children").update({
          conversation_state: "idle",
          conversation_context: {},
        }).eq("id", child.id);

        await sendRaw(phone,
          `Got it! ${currentSubject}: ${targetParsed.quantity} ${targetParsed.unit}s → *${daily}/day* 📊\n\n` +
          `All targets set! ✅ You'll get your daily check-in at the usual time. Let's go! 💪`
        );

        if (membership?.parent_phone && membership.parent_phone !== phone) {
          await sendRaw(membership.parent_phone,
            `${child.name} has set their weekly targets! 📊 Check-ins start from the next scheduled time.`
          );
        }
      }

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
        await sendRaw(membership.parent_phone,
          `📝 ${child.name}: ${completedCount}/${targetQ} ${targetUnit}s done today${subject ? ` (${subject})` : ""}. ` +
          (remaining > 0 ? `${remaining} left — encouraged to finish tomorrow.` : `Completed the full target!`)
        );
      }

      return ok();
    }

    // ══════════════════════════════════════
    // STATE: IDLE (normal check-in)
    // ══════════════════════════════════════

    // ── "SET TARGET" — start target-setting flow ──
    const preCheck = parseCheckinStatus(body);
    if (preCheck?.status === "set_target" && isPremium) {
      // Get child's monitored subjects
      const { data: subjects } = await sb
        .from("sq_monitored_subjects")
        .select("subject_name")
        .eq("child_id", child.id);

      const subjectList = subjects && subjects.length > 0
        ? subjects.map(s => s.subject_name)
        : ["Math", "English", "Science"]; // default

      const firstSubject = subjectList[0];
      const rest = subjectList.slice(1);

      await sb.from("sq_children").update({
        conversation_state: "setting_target",
        conversation_context: {
          current_subject: firstSubject,
          remaining_subjects: rest,
          study_days: 5,
        },
      }).eq("id", child.id);

      await sendRaw(phone,
        `Let's set your weekly targets! 🎯\n\n` +
        `How much *${firstSubject}* do you want to do this week?\n` +
        `Reply like: *20 questions*, *3 chapters*, *10 pages*`
      );
      return ok();
    }

    if (preCheck?.status === "set_target" && !isPremium) {
      await sendRaw(phone,
        `Target-setting is a Premium feature! Ask your parents to upgrade at studypulse.co 😊`
      );
      return ok();
    }

    // ── ALREADY CHECKED IN? Block re-replies ──
    const { data: existingCheckin } = await sb.from("sq_checkins")
      .select("id, status, prompt_sent_at")
      .eq("child_id", child.id)
      .eq("checkin_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingCheckin && existingCheckin.status !== "pending") {
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

      await sendRaw(phone,
        isPremium
          ? "Hey! Reply with: *done* / *partially* / *no* / *did extra* 😊"
          : "Hey! Reply with: *yes* or *no* 😊"
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

    // ── GET TODAY'S TARGET ──
    const { data: todayTargets } = await sb.from("sq_weekly_targets")
      .select("subject_name, daily_quantity, target_unit, remaining_quantity")
      .eq("child_id", child.id)
      .eq("week_start", weekStart);

    const hasTargets = todayTargets && todayTargets.length > 0;
    const todayTarget = hasTargets ? todayTargets[0] : null;

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
            .update({ remaining_quantity: Math.max(0, wt.remaining_quantity - todayTarget.daily_quantity) })
            .eq("child_id", child.id)
            .eq("subject_name", todayTarget.subject_name)
            .eq("week_start", weekStart);
        }

        await sb.from("sq_checkins").update({ completed_quantity: todayTarget.daily_quantity })
          .eq("child_id", child.id).eq("checkin_date", today);
      }

      const doneMsg = hasTargets
        ? `✅ ${todayTarget!.daily_quantity} ${todayTarget!.target_unit}s of ${todayTarget!.subject_name} — done! Great work, ${child.name}! 💪`
        : `✅ Nice work, ${child.name}! Keep it up 💪`;

      const extraMsg = parsed.status === "did_extra" ? `\n⚡ Extra effort today — respect!` : "";

      await sendRaw(phone, doneMsg + extraMsg);

      if (membership?.parent_phone && membership.parent_phone !== phone) {
        const parentMsg = hasTargets
          ? `✅ ${child.name} completed today's target: ${todayTarget!.daily_quantity} ${todayTarget!.target_unit}s of ${todayTarget!.subject_name}!`
          : `✅ ${child.name} checked in — studied today!`;
        await sendRaw(membership.parent_phone, parentMsg + (parsed.status === "did_extra" ? " ⚡ Did extra!" : ""));
      }

    // ── PARTIALLY ──
    } else if (parsed.status === "partially") {
      if (hasTargets) {
        await sb.from("sq_children").update({
          conversation_state: "partial_count",
          conversation_context: {
            target_quantity: todayTarget!.daily_quantity,
            target_unit: todayTarget!.target_unit,
            subject: todayTarget!.subject_name,
          },
        }).eq("id", child.id);

        await sendRaw(phone,
          `No problem! How many ${todayTarget!.target_unit}s did you finish out of ${todayTarget!.daily_quantity}?`
        );
      } else {
        await sendRaw(phone,
          `Good effort, ${child.name}! 📝 Try to finish the rest by tomorrow — small steps add up.`
        );
        if (membership?.parent_phone && membership.parent_phone !== phone) {
          await sendRaw(membership.parent_phone,
            `📝 ${child.name} checked in — partially done today. Encouraged to finish tomorrow.`
          );
        }
      }

    // ── NO ──
    } else if (parsed.status === "no") {
      await sendRaw(phone,
        `Thanks for being honest, ${child.name}. Not every day is a study day — checking in still counts. 💪\n\nTomorrow is a fresh start!`
      );

      if (membership?.parent_phone && membership.parent_phone !== phone) {
        await sendRaw(membership.parent_phone,
          `📋 ${child.name} checked in — didn't study today. Checking in still counts as showing up.`
        );
      }

    // ── REST DAY (tired / sick / busy / family / stressed) ──
    } else if (parsed.status === "rest_day") {
      const skipInfo = parseSkipReason(body)!;

      await sendRaw(phone,
        `${skipInfo.emoji} ${skipInfo.kidMsg}`
      );

      if (membership?.parent_phone && membership.parent_phone !== phone) {
        const isDistress = /overwhelm|stressed|anxious|hate|scared|worried|pressure/.test(body.toLowerCase());
        const parentMsg = isDistress
          ? `💛 Heads up — ${child.name} said they're ${skipInfo.reason}. Might be worth a chat tonight.`
          : `${skipInfo.emoji} ${child.name} is taking a rest day (${skipInfo.reason}). They still checked in!`;
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
        .select("parent_phone").eq("user_id", child.parent_id).single();
      if (m?.parent_phone) {
        await sendTemplate(m.parent_phone, milestones[streak], { child_name: child.name });
      }
    }
  }
}

// ── PARENT REPLY HANDLER ──

async function handleParentReply(
  sb: ReturnType<typeof createClient>,
  membership: { user_id: string; parent_name: string | null },
  action: string,
  phone: string,
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
    await sendRaw(phone, "Thanks for confirming! ✅");
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
    await sendRaw(phone, `Got it — we've updated ${children.map(c => c.name).join(" & ")}'s record. Thanks!`);
  }
}
