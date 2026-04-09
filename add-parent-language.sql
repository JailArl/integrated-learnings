-- Add preferred_language to sq_memberships
-- Run in Supabase SQL editor

ALTER TABLE sq_memberships
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
CHECK (preferred_language IN ('en','zh'));

-- Add Chinese versions of parent-facing templates
INSERT INTO whatsapp_message_templates (template_name, template_type, contact_stage, message_text, requires_personalization, personalization_fields, ai_generated)
VALUES
  ('sp_checkin_done_zh', 'notification', 'active', '✅ {child_name} 今天完成了！{streak_msg}', true, 'child_name,streak_msg', false),
  ('sp_checkin_did_extra_zh', 'notification', 'active', '⚡ {child_name} 今天做了额外练习！{streak_msg}', true, 'child_name,streak_msg', false),
  ('sp_checkin_partially_zh', 'notification', 'active', '📝 {child_name} 今天部分完成。', true, 'child_name', false),
  ('sp_checkin_incomplete_zh', 'notification', 'active', '📋 {child_name} 今天的任务未完成。', true, 'child_name', false),
  ('sp_checkin_no_zh', 'notification', 'active', '📋 {child_name} 打卡了 — 今天没有温习。', true, 'child_name', false),
  ('sp_checkin_yes_free_zh', 'notification', 'active', '✅ {child_name} 打卡了 — 今天有温习！{streak_msg}', true, 'child_name,streak_msg', false),
  ('sp_reminder_checkin_zh', 'reminder', 'active', '{parent_name}，{child_name} 今天还没打卡哦。', true, 'parent_name,child_name', false),
  ('sp_streak_3_zh', 'milestone', 'active', '🔥 {child_name} 连续打卡 3 天了！好习惯正在养成！', true, 'child_name', false),
  ('sp_streak_7_zh', 'milestone', 'active', '🔥🔥 {child_name} 连续打卡 7 天！太棒了！', true, 'child_name', false),
  ('sp_streak_14_zh', 'milestone', 'active', '🔥🔥🔥 {child_name} 连续打卡 14 天！习惯已经养成！', true, 'child_name', false),
  ('sp_streak_30_zh', 'milestone', 'active', '🏆 {child_name} 连续打卡 30 天！真正的冠军！', true, 'child_name', false),
  ('sp_parent_confirm_zh', 'verify', 'active', '📊 {child_name} 今天说：{status}。回复 *CONFIRM* 确认或 *ADJUST* 调整。', true, 'child_name,status', false),
  ('sp_welcome_zh', 'onboard', 'active', '欢迎使用 StudyPulse！{child_name} 将在 {checkin_time} 收到每日打卡提醒。', true, 'child_name,checkin_time', false),
  ('sp_parent_adjusted_zh', 'verify', 'active', '已更新 {child_name} 的记录。谢谢！', true, 'child_name', false)
ON CONFLICT (template_name) DO NOTHING;
