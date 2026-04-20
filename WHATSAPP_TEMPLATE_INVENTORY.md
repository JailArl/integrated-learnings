# WhatsApp Template Inventory — StudyPulse

This document is the **canonical reference** for all WhatsApp message types
used by StudyPulse and must be reviewed before any template-sending code is
written.

---

## Classification rules

| Class | Definition | Allowed content |
|-------|-----------|----------------|
| **Session reply** | The bot replies to the **same phone** that sent the last inbound within the 24-hour window. | Freeform text. No Meta template required. |
| **Business-initiated** | The bot sends to a phone that has **not** messaged within the last 24 h. | Requires a Meta-approved WhatsApp template registered via Twilio Content API (`ContentSid` parameter). Sending freeform here returns Twilio error 63016 and the message is silently dropped. |

---

## Phase 1 status

In Phase 1 the outbound queue infrastructure is in place (`sq_outbound_queue`,
`message_type` column, `content_sid` column) but **no ContentSids are written
in code**. Until Phase 2 registers and populates the `twilio_content_sid`
column in `whatsapp_message_templates`, all queued messages send freeform
bodies (acceptable for testing against numbers that have recently messaged the
bot).

Phase 2 action: for each `sp_*` template below, register it in the Twilio
Console → Messaging → Content API, then populate
`whatsapp_message_templates.twilio_content_sid`.

---

## Session replies (no template required)

These send to the **same phone** that triggered the inbound — the active
24-hour window is guaranteed.

| Code path | Trigger | Recipient | Notes |
|-----------|---------|-----------|-------|
| `sp_verify_quick_reply` (already registered ✓) | Anti-cheat fast reply | Child | Twilio pre-built quick-reply template |
| Parent activation acknowledgment | Parent sends activation intent | Parent | Freeform ✓ |
| Parent CONFIRM / ADJUST acknowledgment | Parent replies CONFIRM or ADJUST | Parent | Freeform ✓ |
| All child state-machine replies | Child sends yes / partially / no / skip reason / count | Child | Freeform ✓ |

---

## Business-initiated templates (require Meta approval)

### Cron-triggered — child recipients

| # | Template name | Trigger function | When sent | Variables |
|---|--------------|-----------------|-----------|-----------|
| T-01 | `sp_checkin_prompt_free` | `sendCheckinPrompts` | Free-tier check-in days (Tue/Thu/Sat) | `child_name`, `covered_days`, `target_line` |
| T-02 | `sp_checkin_prompt_premium` | `sendCheckinPrompts` | Premium daily study days | `child_name`, `target_line` |
| T-03 | `sp_followup_child` | `sendFollowupReminders` | 45 min after prompt, no reply | `child_name`, `target_line` |
| T-17 | `sp_exam_child_warning` | `checkExamProximity` | 7 / 3 / 1 days before exam | `child_name`, `subject_name`, `days_out` |
| T-18 | `sp_post_exam_child` | `checkExamProximity` | Day after exam date | `child_name`, `subject_name` |
| T-24 | `sp_autoclose_child` | `autoCloseStaleCheckins` | 2 h after prompt, still pending | `child_name` |

### Cron-triggered — parent recipients

| # | Template name | Trigger function | When sent | Variables |
|---|--------------|-----------------|-----------|-----------|
| T-04 | `sp_followup_parent` | `sendFollowupReminders` | 45 min after prompt, no reply | `parent_name`, `child_name` |
| T-11 | `sp_exam_7days` | `checkExamProximity` | 7 days before exam | `child_name`, `subject_name` |
| T-12 | `sp_exam_3days` | `checkExamProximity` | 3 days before exam | `child_name`, `subject_name` |
| T-13 | `sp_exam_tomorrow` | `checkExamProximity` | 1 day before exam | `child_name`, `subject_name` |
| T-14 | `sp_exam_tutor_nudge` | `checkExamProximity` | ≤7 days before exam, no tutor request | `child_name`, `days_out` |
| T-15 | `sp_post_exam_parent` | `checkExamProximity` | Day after exam date | `child_name`, `subject_name` |
| T-16 | `sp_post_exam_diagnostic` | `checkExamProximity` | Day after exam date (funnel) | `child_name` |
| T-19 | `sp_weekly_summary` | `sendWeeklySummaries` | Sunday 22:00 SGT | `child_name`, `week_start`, `done_count`, `total_days` |
| T-20 | `sp_weekly_tutor_nudge` | `sendWeeklySummaries` | Sunday 22:00 SGT (3+ missed days, 2+ wks enrolled) | `child_name`, `missed_count` |
| T-21 | `sp_midweek_parent` | `sendMidWeekParentNudge` | Wednesday 20:00 SGT | `child_summary` |
| T-22 | `sp_weekly_target_prompt` | `sendWeeklyTargetPrompts` | Monday 16:00 SGT (no targets set) | `child_name` |
| T-23 | `sp_autoclose_parent` | `autoCloseStaleCheckins` | 2 h after prompt, still pending | `child_name` |
| T-25 | `sp_billing_renewal` | `sendBillingRenewalReminders` | 3 and 1 days before recurring renewal | `days_left` |
| T-26 | `sp_billing_expiry_warning` | `sendBillingRenewalReminders` | 7, 3, and 1 days before one-time pass ends | `days_left` |
| T-27 | `sp_billing_expired` | `sendBillingRenewalReminders` | Day after pass expiry | _(none)_ |

### Webhook-queued — parent recipients

These originate in the webhook when a child checks in, but are NOT sent
directly by the webhook. Instead the webhook inserts into `sq_outbound_queue`
and the cron drains the queue.

| # | Template name | Webhook trigger | Variables |
|---|--------------|----------------|-----------|
| T-05 | `sp_parent_notify_done` | Child replies done / did_extra | `child_name`, `target_summary` |
| T-06 | `sp_parent_notify_partial` | Child replies partially | `child_name`, `completed`, `total`, `unit` |
| T-07 | `sp_parent_notify_no` | Child replies no | `child_name` |
| T-08 | `sp_parent_notify_rest` | Child gives skip reason (non-distress) | `child_name`, `reason` |
| T-09 | `sp_parent_notify_distress` | Child gives distress-flagged skip reason | `child_name`, `reason` |
| T-10 | `sp_streak_3` / `sp_streak_7` / `sp_streak_14` / `sp_streak_30` | Streak milestone reached | `child_name` |

> `sp_streak_*` templates are already inserted in `whatsapp_message_templates` (see `studypulse-whatsapp-templates.sql`). They need a `twilio_content_sid` to be registered before they can send to out-of-session parents.

---

## Registration checklist (Phase 2)

For each template:

1. Log in to Twilio Console → Messaging → Content API → Create Template.
2. Choose **WhatsApp** content type, add the body text with `{{1}}` variables.
3. Submit for Meta approval (typically 1–3 business days).
4. Once approved, copy the `ContentSid` (starts with `HX…`).
5. Run:
   ```sql
   UPDATE whatsapp_message_templates
   SET twilio_content_sid = 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
   WHERE template_name = 'sp_checkin_prompt_free';
   ```
6. Update the corresponding `enqueueOutbound` call to use `message_type: 'content_sid'`
   and pass the `content_sid` field instead of `raw_body`.

---

## Notes

- **Chinese variants**: All `sp_*` templates will need bilingual variants (EN + ZH)
  or Twilio Content API language parameters. Register `sp_checkin_prompt_free_zh`,
  `sp_checkin_prompt_premium_zh`, etc. in Phase 2.
- **`sp_reminder_checkin`**: already used in `sendFollowupReminders` for English
  parent followup (Twilio pre-built or custom). Needs ContentSid.
- Do **not** register templates with wording that contains conditional blocks
  (`{{if}}`). Twilio WA templates must be static with numbered variables only.
