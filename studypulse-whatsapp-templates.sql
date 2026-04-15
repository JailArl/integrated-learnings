-- ═══════════════════════════════════════════════════════════════
-- STUDYPULSE WHATSAPP NOTIFICATION TEMPLATES
-- Run in Supabase SQL Editor to insert templates
-- ═══════════════════════════════════════════════════════════════

-- ─── DAILY CHECK-IN NOTIFICATIONS ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  (
    'sp_checkin_done',
    'studypulse_notification',
    'active',
    '✅ {child_name} checked in today — Done! {streak_msg}',
    true,
    'child_name, streak_msg'
  ),
  (
    'sp_checkin_did_extra',
    'studypulse_notification',
    'active',
    '⚡ {child_name} did extra study today! {streak_msg}',
    true,
    'child_name, streak_msg'
  ),
  (
    'sp_checkin_partially',
    'studypulse_notification',
    'active',
    '📝 {child_name} checked in — partially done today. Progress is progress!',
    true,
    'child_name'
  ),
  (
    'sp_checkin_incomplete',
    'studypulse_notification',
    'active',
    '📋 {child_name} checked in — incomplete today. Tomorrow is a fresh start.',
    true,
    'child_name'
  ),
  (
    'sp_checkin_no',
    'studypulse_notification',
    'active',
    '📋 {child_name} checked in — didn''t study today. A small check-in still counts as showing up.',
    true,
    'child_name'
  ),
  (
    'sp_checkin_yes_free',
    'studypulse_notification',
    'active',
    '✅ {child_name} checked in — yes, studied today! {streak_msg}',
    true,
    'child_name, streak_msg'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ─── REMINDER / NUDGE NOTIFICATIONS ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  (
    'sp_reminder_checkin',
    'studypulse_reminder',
    'active',
    'Hi {parent_name} 👋 {child_name} hasn''t checked in yet today. A quick reminder can help keep the streak going!',
    true,
    'parent_name, child_name'
  ),
  (
    'sp_reminder_no_checkin_day',
    'studypulse_reminder',
    'active',
    'Hi {parent_name}, today isn''t a check-in day for {child_name} (Free plan: Tue/Thu/Sun). Next check-in: {next_day}.',
    true,
    'parent_name, child_name, next_day'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ─── STREAK MILESTONE NOTIFICATIONS ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  (
    'sp_streak_3',
    'studypulse_milestone',
    'active',
    '🔥 {child_name} just hit a 3-day streak! The habit is forming. Keep it up!',
    true,
    'child_name'
  ),
  (
    'sp_streak_7',
    'studypulse_milestone',
    'active',
    '🔥🔥 Amazing! {child_name} has a 7-day streak! One full week of consistent study.',
    true,
    'child_name'
  ),
  (
    'sp_streak_14',
    'studypulse_milestone',
    'active',
    '🏆 {child_name} hit 14 days in a row! This kind of consistency builds real results. Well done!',
    true,
    'child_name'
  ),
  (
    'sp_streak_30',
    'studypulse_milestone',
    'active',
    '🌟 Incredible — {child_name} has checked in for 30 days straight! That''s a study habit locked in.',
    true,
    'child_name'
  ),
  (
    'sp_streak_broken',
    'studypulse_milestone',
    'active',
    '{child_name}''s streak ended at {streak_count} days. No worries — every new check-in starts a fresh streak!',
    true,
    'child_name, streak_count'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ─── WEEKLY SUMMARY ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  (
    'sp_weekly_summary',
    'studypulse_report',
    'active',
    '📊 Weekly Summary for {child_name}:' || E'\n'
    || '• Check-ins: {checkin_count}/{total_days}' || E'\n'
    || '• Current streak: {streak} days' || E'\n'
    || '• Top subject: {top_subject}' || E'\n'
    || '{consistency_msg}',
    true,
    'child_name, checkin_count, total_days, streak, top_subject, consistency_msg'
  ),
  (
    'sp_weekly_summary_improving',
    'studypulse_report',
    'active',
    '📈 {child_name}''s consistency improved this week! {checkin_count}/{total_days} check-ins (up from {last_week_count} last week). Keep it going!',
    true,
    'child_name, checkin_count, total_days, last_week_count'
  ),
  (
    'sp_weekly_summary_declining',
    'studypulse_report',
    'active',
    '📊 {child_name} had {checkin_count}/{total_days} check-ins this week (down from {last_week_count}). A gentle nudge could help get back on track.',
    true,
    'child_name, checkin_count, total_days, last_week_count'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ─── EXAM PROXIMITY ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  (
    'sp_exam_7days',
    'studypulse_exam',
    'active',
    '📅 Heads up — {child_name}''s {exam_name} is in 7 days. Daily check-ins this week will build momentum!',
    true,
    'child_name, exam_name'
  ),
  (
    'sp_exam_3days',
    'studypulse_exam',
    'active',
    '📅 {child_name}''s {exam_name} is in 3 days. Current streak: {streak} days. Almost there!',
    true,
    'child_name, exam_name, streak'
  ),
  (
    'sp_exam_tomorrow',
    'studypulse_exam',
    'active',
    '📅 {child_name}''s {exam_name} is tomorrow. They''ve checked in {checkin_count} times this month. Encourage a good rest tonight! 💪',
    true,
    'child_name, exam_name, checkin_count'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ─── ONBOARDING ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  (
    'sp_welcome',
    'studypulse_onboard',
    'new',
    'Welcome to StudyPulse! 🎉 {child_name} is all set up. Check-ins start tomorrow — they''ll get a WhatsApp prompt at {checkin_time}. You''ll see results on your dashboard.',
    true,
    'child_name, checkin_time'
  ),
  (
    'sp_first_checkin',
    'studypulse_onboard',
    'active',
    '🎉 {child_name} just completed their first check-in! The study habit journey begins.',
    true,
    'child_name'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ─── UPGRADE NUDGE (for free plan parents) ───

INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields)
VALUES
  (
    'sp_upgrade_streak',
    'studypulse_upgrade',
    'active',
    '{child_name} has been consistent on bundled Tue/Thu/Sun check-ins! Daily check-ins could build even stronger habits. Upgrade for $9.90/mo: {upgrade_link}',
    true,
    'child_name, upgrade_link'
  )
ON CONFLICT (template_name) DO UPDATE SET
  message_text = EXCLUDED.message_text,
  updated_at = NOW();


-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════
-- SELECT template_name, template_type, message_text FROM whatsapp_message_templates
--   WHERE template_name LIKE 'sp_%'
--   ORDER BY template_type, template_name;
