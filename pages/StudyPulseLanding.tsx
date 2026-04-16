import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Crown,
  Globe,
  MessageSquare,
  Minus,
  PhoneCall,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Timer,
  X,
  Zap,
} from 'lucide-react';

/* ═══════════ BILINGUAL CONTENT ═══════════ */
type Lang = 'en' | 'zh';

const T = {
  badge: { en: 'For PSLE · O-Level · A-Level Parents', zh: '专为 PSLE · O水准 · A水准 家长设计' },
  heroH1a: { en: 'Your child\u2019s major exam is coming.', zh: '孩子的大考快到了。' },
  heroH1b: { en: 'Are they actually studying?', zh: '他们真的在温习吗？' },
  heroSub: {
    en: 'StudyPulse sends your child a daily WhatsApp check-in. You see their consistency on a dashboard. No app to install \u2014 just real visibility into their study habits before the big exam.',
    zh: 'StudyPulse 每天通过 WhatsApp 让孩子打卡。您在仪表板上看到他们的学习进度。无需安装任何应用 \u2014 大考前真正了解孩子的温习状况。',
  },
  startFree: { en: 'Start Free \u2014 No Credit Card', zh: '免费开始 \u2014 无需信用卡' },
  seePricing: { en: 'See Plans & Pricing', zh: '查看方案与价格' },
  signIn: { en: 'Sign in', zh: '登录' },
  alreadyAcct: { en: 'Already have an account?', zh: '已有账号？' },
  stat1: { en: 'PSLE · O · A', zh: 'PSLE · O · A' },
  stat1sub: { en: 'Major Exam Support', zh: '大考支持' },
  stat2: { en: '< 5 min', zh: '< 5 分钟' },
  stat2sub: { en: 'Setup Time', zh: '设置时间' },
  stat3: { en: 'WhatsApp', zh: 'WhatsApp' },
  stat3sub: { en: 'No App to Install', zh: '无需安装应用' },

  // Problem section
  problemH2: { en: 'PSLE, O-Level, A-Level \u2014 the stakes are real.', zh: 'PSLE、O水准、A水准 \u2014 大考不容有失。' },
  problemSub: { en: 'These are real challenges parents face in the months before a major exam.', zh: '这些是大考前几个月家长面对的真实挑战。' },
  prob1t: { en: '\u201CThey say they studied\u201D', zh: '\u201C他们说温习了\u201D' },
  prob1d: { en: 'But you\u2019re not sure. PSLE and O-Level revision needs daily consistency \u2014 a check-in removes the guesswork.', zh: '但您不确定。PSLE 和 O水准需要每天坚持温习 \u2014 打卡让一切一目了然。' },
  prob2t: { en: '\u201CI only find out during results\u201D', zh: '\u201C成绩出来才知道\u201D' },
  prob2d: { en: 'By exam day, it\u2019s too late. StudyPulse shows patterns week by week, so you can act months before the paper.', zh: '等到考试那天就太迟了。StudyPulse 每周显示学习趋势，让您提前几个月发现问题。' },
  prob3t: { en: '\u201CRevision only happens last minute\u201D', zh: '\u201C只有临考才温习\u201D' },
  prob3d: { en: 'National exams can\u2019t be crammed. When your child checks in daily, revision becomes a habit \u2014 not a panic.', zh: '全国性考试不能临时抱佛脚。每天打卡让温习变成习惯，而不是慌张。' },
  prob4t: { en: '\u201CI want to help but I\u2019m working\u201D', zh: '\u201C我想帮忙但在上班\u201D' },
  prob4d: { en: 'Work, household, other kids. StudyPulse keeps you in the loop with a 30-second daily glance \u2014 no hovering needed.', zh: '工作、家务、其他孩子。StudyPulse 每天只需30秒就能掌握情况 \u2014 不必时刻盯着。' },

  // How it works
  howH2: { en: 'How it works', zh: '如何运作' },
  howSub: { en: 'No app to install. Your child just uses WhatsApp.', zh: '无需安装应用。孩子只需用 WhatsApp。' },
  how1t: { en: 'Set subjects & schedule', zh: '设置科目和时间表' },
  how1d: { en: 'You choose what to track \u2014 Math, Science, Chinese \u2014 and how often. Takes under 5 minutes.', zh: '您选择要跟踪的科目 \u2014 数学、科学、华文 \u2014 以及频率。只需5分钟。' },
  how2t: { en: 'Child checks in via WhatsApp', zh: '孩子通过 WhatsApp 打卡' },
  how2d: { en: 'On check-in days, your child reports what they studied. No app needed \u2014 just a WhatsApp message.', zh: '在打卡日，孩子汇报温习了什么。无需应用 \u2014 只需一条 WhatsApp 消息。' },
  how3t: { en: 'You get clear reports', zh: '您收到清晰的报告' },
  how3d: { en: '\u201CMath: completed. Science: skipped. Chinese: partial.\u201D \u2014 Sent to your dashboard and WhatsApp.', zh: '\u201C数学：完成。科学：跳过。华文：部分完成。\u201D \u2014 发送到仪表板和 WhatsApp。' },
  how4t: { en: 'Celebrate progress together', zh: '一起庆祝进步' },
  how4d: { en: 'See streaks build, habits form, and consistency grow. If your child needs extra help, request a tutor or diagnostic from the dashboard.', zh: '看到连续打卡天数增长，习惯养成。如果孩子需要额外帮助，可以从仪表板申请补习或评估。' },

  // Free plan section
  freeH2: { en: 'What you get on the Free plan', zh: '免费版包含什么' },
  freeSub: { en: 'Enough to build the habit and see if it works for your family.', zh: '足以养成习惯，看看是否适合您的家庭。' },
  freeYouGet: { en: 'You get', zh: '包含功能' },
  freeDontGet: { en: 'You don\u2019t get', zh: '不包含' },
  freeDiff: { en: 'The difference', zh: '区别在哪里' },
  freeGet: {
    en: ['Track 1 child, 1 subject', 'Bundled check-ins 3x/week (Tue, Thu, Sun)', 'Sunday weekly report', 'Exam countdown visible', 'Request tutor / diagnostic anytime'],
    zh: ['跟踪 1 个孩子、1 个科目', '每周打卡 3 次（二、四、日）', '周日周报', '考试倒计时可见', '随时申请补习/评估'],
  },
  freeMiss: {
    en: ['No daily check-ins (bundled into Tue, Thu, Sun)', 'No daily summary to parent', 'No auto pause / restart after exams', 'No exam follow-up reminders', 'No smart tutor triggers'],
    zh: ['无每日打卡（合并为二、四、日）', '无每日家长摘要', '考后无自动暂停/重启', '无考试跟进提醒', '无智能补习推荐'],
  },
  freeDiffP1: {
    en: 'Free check-ins happen 3 times a week, bundled to cover every study day. But daily check-ins are harder to fake and build stronger habits.',
    zh: '免费版每周打卡3次，合并覆盖所有学习日。但每天打卡更难造假，习惯也更牢固。',
  },
  freeDiffP2: {
    en: 'On Premium, your child checks in every day. You see full weekly summaries with insights \u2014 not just snapshots.',
    zh: '升级版让孩子每天打卡。您能看到完整的周总结和深度分析 \u2014 不只是快照。',
  },
  seePremium: { en: 'See Premium plans', zh: '查看升级版' },

  // First in SG
  firstBadge: { en: 'First in Singapore', zh: '新加坡首创' },
  firstH2: { en: 'Nothing like this exists yet.', zh: '市场上还没有类似产品。' },
  firstDesc: {
    en: 'There are tuition agencies. There are assessment books. But no one has built a system that tells PSLE, O-Level, and A-Level parents whether their child actually studied today \u2014 without the parent having to be physically there.',
    zh: '市面上有补习中介，有练习册。但没有人建立一个系统，让 PSLE、O水准、A水准家长知道孩子今天是否真的温习了 \u2014 而且不需要家长在场。',
  },
  notTuition: { en: 'Not a tuition app', zh: '不是补习应用' },
  notTuitionD: { en: 'We don\u2019t teach. We help you see what\u2019s really happening at home.', zh: '我们不教学。我们帮您了解孩子在家的真实学习情况。' },
  notHomework: { en: 'Not a homework app', zh: '不是功课应用' },
  notHomeworkD: { en: 'Your child\u2019s school sets the work. We track whether it gets done.', zh: '学校布置作业。我们跟踪孩子是否完成。' },
  notScreen: { en: 'Not a screen-time tool', zh: '不是屏幕时间工具' },
  notScreenD: { en: 'We don\u2019t block phones. We build study accountability through check-ins.', zh: '我们不限制手机使用。我们通过打卡建立学习责任感。' },

  // Pricing
  priceH2: { en: 'Simple pricing. No hidden fees.', zh: '简单透明的价格。没有隐藏费用。' },
  priceSub: { en: 'Start free. Choose between recurring monthly or one-time exam passes.', zh: '免费开始。可选择按月续费或一次性考季通行证。' },
  priceFree: { en: 'Free', zh: '免费版' },
  priceForever: { en: 'forever', zh: '永久免费' },
  priceFreeTry: { en: 'Try it with 1 child, 1 subject', zh: '可跟踪 1 个孩子、1 个科目' },
  pricePrem: { en: 'Premium · Core Monthly', zh: '升级版 · 月度核心计划' },
  priceMonth: { en: '/month', zh: '/月' },
  priceBubble: { en: 'Best value for ongoing daily accountability', zh: '最适合持续每日监督，月均最划算' },
  priceStartFree: { en: 'Start Free', zh: '免费开始' },
  priceGetPrem: { en: 'Get Premium', zh: '立即升级' },
  pricePaynow: { en: 'Core Monthly (S$9.90) is recurring and cancellable anytime via Billing. Exam Pass / Sprint / Season are one-time payments with no auto-renew.', zh: 'Core Monthly（S$9.90）为自动续费，可随时在账单页面取消。Exam Pass / Sprint / Season 为一次性付款，不会自动续费。' },
  priceCompare: { en: 'View full plan comparison', zh: '查看完整方案对比' },
  priceFeature: { en: 'Feature', zh: '功能' },
  priceLabel: { en: 'Price', zh: '价格' },
  recommended: { en: 'RECOMMENDED', zh: '推荐' },
  r1child: { en: '1 child', zh: '1 个孩子' },
  r1subj: { en: '1 subject', zh: '1 个科目' },
  r3wk: { en: 'Bundled check-ins (Tue/Thu/Sun)', zh: '合并打卡（二/四/日）' },
  rWeekly: { en: 'Weekly report', zh: '周报' },
  rDaily: { en: 'Daily summary', zh: '每日摘要' },
  rPause: { en: 'Auto pause / restart', zh: '自动暂停/重启' },
  rTrigger: { en: 'Smart triggers', zh: '智能提醒' },
  rUnlimKids: { en: 'Unlimited children', zh: '不限孩子人数' },
  rAllSubj: { en: 'All subjects', zh: '所有科目' },
  rDailyCI: { en: 'Daily check-ins', zh: '每天打卡' },
  rDailySum: { en: 'Daily parent summary', zh: '每日家长摘要' },
  rExamRemind: { en: 'Exam follow-up reminders', zh: '考试跟进提醒' },
  rSmartTutor: { en: 'Smart tutor/diagnostic triggers', zh: '智能补习/评估建议' },

  // Real question
  realQ: { en: 'Your child has PSLE, O-Levels, or A-Levels coming.', zh: '孩子即将面对 PSLE、O水准或A水准。' },
  realQhl: { en: 'Are they revising consistently?', zh: '他们在坚持温习吗？' },
  realQsub: { en: 'StudyPulse helps you find out \u2014 in under 30 seconds a day.', zh: 'StudyPulse 帮您了解 \u2014 每天只需30秒。' },
  tryFree: { en: 'Try It Free', zh: '免费试用' },

  // FAQ
  faqH2: { en: 'Common questions', zh: '常见问题' },
  faqs: {
    en: [
      { q: 'Does my child need to install any app?', a: 'No. Your child interacts via WhatsApp only \u2014 no app download, no login. You manage everything from your parent dashboard.' },
      { q: 'What if my child lies about studying?', a: 'The system tracks patterns over time. If your child says \u201Cdone\u201D but results don\u2019t improve, the data will show it. Weekly reports make gaps visible fast.' },
      { q: 'Is this only for PSLE / O-Level / A-Level students?', a: 'We designed it for major exam years, but it works for any level. Study habits built in P4\u2013P5 carry into PSLE year. Same for Sec 1\u20133 leading to O-Levels.' },
      { q: 'Can I track multiple children on the free plan?', a: 'Free is limited to 1 child, 1 subject. Upgrade to Premium to track all your children and all their subjects \u2014 no limits.' },
      { q: 'What subjects can I track?', a: 'Any subject your child is studying \u2014 Math, Science, Chinese, English, Malay, Tamil, and more. Premium users can track all subjects.' },
      { q: 'How long does setup take?', a: 'Under 5 minutes. Enter your details, add your child\u2019s subjects, and you\u2019re done. Your child gets a WhatsApp prompt to start checking in.' },
      { q: 'Can I cancel or downgrade anytime?', a: 'Yes. There is no lock-in or long contract. You can manage or cancel your subscription from your account billing page.' },
      { q: 'My child already has tuition. Is this useful?', a: 'Especially useful. Tuition covers 1\u20132 hours a week per subject. But PSLE and O-Level results depend on what happens the other 5 days. StudyPulse tracks whether your child is actually revising consistently between sessions.' },
      { q: 'When should I start using this?', a: 'The earlier the better. Parents who start 6\u201312 months before the exam give their child time to build the daily habit. Starting in the last month before PSLE or O-Levels is too late for habit formation.' },
    ],
    zh: [
      { q: '孩子需要安装任何应用吗？', a: '不需要。孩子只通过 WhatsApp 互动 \u2014 无需下载应用、无需登录。您在家长仪表板上管理一切。' },
      { q: '如果孩子说谎说温习了怎么办？', a: '系统会长期跟踪模式。如果孩子说"完成了"但成绩没进步，数据会显示出来。周报能快速暴露差距。' },
      { q: '这只适用于 PSLE / O水准 / A水准学生吗？', a: '我们针对大考年级设计，但适用于所有年级。P4\u2013P5 培养的学习习惯会延续到 PSLE 年。中一至中三同样为 O水准打下基础。' },
      { q: '免费版能跟踪多个孩子吗？', a: '免费版限 1 个孩子、1 个科目。升级到 Premium 可跟踪所有孩子和所有科目 \u2014 没有限制。' },
      { q: '可以跟踪哪些科目？', a: '孩子在学的任何科目 \u2014 数学、科学、华文、英文、马来文、淡米尔文等。升级用户可跟踪所有科目。' },
      { q: '设置需要多长时间？', a: '不到5分钟。输入您的信息，添加孩子的科目，就完成了。孩子会收到 WhatsApp 打卡提示。' },
      { q: '可以随时取消或降级吗？', a: '可以。没有锁定期、没有长期合约。您可在账户里的账单页面自行管理或取消订阅。' },
      { q: '孩子已经有补习了，这还有用吗？', a: '特别有用。补习每周每科只涵盖1\u20132小时。但 PSLE 和 O水准成绩取决于其他5天发生了什么。StudyPulse 跟踪孩子是否真的在补习之外坚持温习。' },
      { q: '什么时候开始使用最好？', a: '越早越好。在考试前6\u201312个月开始的家长，能给孩子足够时间养成每日学习习惯。考前一个月才开始已经来不及了。' },
    ],
  },

  // Crash Course section
  // Crash courses header
  ccSectionBadge: { en: 'June School Holidays 2026 · Limited Spots', zh: '2026年六月学校假期 · 名额有限' },
  ccSectionH2: { en: 'Holiday Crash Courses', zh: '假期强化班' },
  ccSectionSub: { en: 'Two weeks before school reopens — the perfect time to consolidate, sharpen, and walk into the new term with confidence.', zh: '开学前两周 — 巩固知识、提升技巧、自信迎接新学期的最佳时机。' },
  ccDeadlineLabel: { en: 'Early bird registration closes in', zh: '早鸟报名截止倒计时' },
  ccContactSchedule: { en: 'Contact us for full schedule', zh: '联系我们获取完整时间表' },
  ccSpotsLeft: { en: 'Only 6 spots per class — first come, first served.', zh: '每班仅6个名额 — 先到先得。' },
  ccCTA: { en: 'Reserve a Spot Now', zh: '立即预留名额' },
  ccScheduleNote: { en: 'Detailed schedule upon enquiry', zh: '详细时间表请查询' },
  ccEarlyBird: { en: 'Early Bird — before 20 May', zh: '早鸟价 — 5月20日前' },
  ccRegularLabel: { en: 'Regular price', zh: '正常价格' },

  // PSLE crash course
  psleBadge: { en: 'PSLE · P6', zh: 'PSLE · 小六' },
  psleH3: { en: 'PSLE Crash Course', zh: 'PSLE 强化班' },
  psleSub: { en: '10-session morning track covering Mathematics & Science. We alternate subjects daily so momentum stays high through the final holiday stretch.', zh: '10节上午强化课程，专攻数学和科学。每天交替科目，帮助学生在假期最后阶段持续保持学习节奏。' },
  psleDates: { en: '16 – 25 June 2026  ·  Last 2 weeks of school holidays', zh: '2026年6月16–25日  ·  学校假期最后两周' },
  psleStructure: { en: 'Math: 16/18/20/22/24  ·  Science: 17/19/21/23/25', zh: '数学：16/18/20/22/24日  ·  科学：17/19/21/23/25日' },
  psleSession: { en: 'Morning 10 am – 1 pm (PSLE track)', zh: '上午 10时–1时（PSLE时段）' },
  psleF1t: { en: 'All Materials Provided', zh: '全套学习材料提供' },
  psleF1d: { en: 'Workbooks, past-year papers, and summary sheets included — zero prep needed from parents.', zh: '练习册、历年试卷及归纳表全包 — 家长无需额外准备。' },
  psleF2t: { en: 'Small Group · Max 6', zh: '小班制 · 最多6人' },
  psleF2d: { en: 'Every student gets personal attention. Tutors spot weak areas and address them directly.', zh: '每位学生获得个人关注，导师识别薄弱点并直接解决。' },
  psleF3t: { en: 'Exam Technique Drills', zh: '考试技巧训练' },
  psleF3d: { en: 'Structured answering, question analysis, and time management practised under exam conditions each afternoon.', zh: '每天下午在模拟考试条件下练习结构化作答、题目分析和时间管理。' },
  psleF4t: { en: 'Experienced PSLE Coaches', zh: '经验丰富的PSLE导师' },
  psleF4d: { en: 'Our tutors have coached PSLE students for years and know exactly where marks are lost — and how to recover them.', zh: '导师拥有多年PSLE指导经验，深知失分原因及如何补救。' },
  psleEarlyPrice: { en: '$320 / subject (5 half-days)', zh: '每科 $320（5个半天）' },
  psleRegularPrice: { en: '$380 / subject', zh: '每科 $380' },

  // O-Level crash course
  olevBadge: { en: 'O-Level · Sec 4 / 5', zh: 'O水准 · 中四/五' },
  olevH3: { en: 'O-Level Crash Course', zh: 'O水准强化班' },
  olevSub: { en: 'Tell us your weak topics — we prepare targeted materials just for your child. 2 half-days per subject in the afternoon track. No cookie-cutter notes.', zh: '告诉我们薄弱主题 — 我们专门为孩子准备针对性材料。每科下午时段2个半天。没有千篇一律的笔记。' },
  olevTopicLabel: { en: 'Select your weak topics', zh: '选择薄弱主题' },
  olevTopicSub: { en: 'Tick what your child struggles with. We’ll prepare materials specifically for those areas.', zh: '勾选孩子的薄弱环节，我们将专门准备针对性学习材料。' },
  olevTopicCTAnone: { en: 'Select topics above to personalise your enquiry', zh: '请先选择上方主题以个性化查询' },
  olevTopicCTAsome: { en: 'Send Weak Topics via WhatsApp', zh: '通过WhatsApp发送薄弱主题' },
  olevTopicSelected: { en: 'topics selected', zh: '个主题已选' },
  olevTopicNone: { en: 'None selected', zh: '未选择' },
  olevDates: { en: '16 – 25 June 2026  ·  Last 2 weeks of school holidays', zh: '2026年6月16–25日  ·  学校假期最后两周' },
  olevSession: { en: 'Afternoon 2 pm – 5 pm (O-Level track)', zh: '下午 2时–5时（O水准时段）' },
  olevSubjects: {
    en: [
      { subj: 'Physics', days: '2 half-days', note: 'Waves, Electricity, Forces & Motion — common exam traps covered.' },
      { subj: 'Chemistry', days: '2 half-days', note: 'Organic & Inorganic concepts, structured answering mastered.' },
      { subj: 'A. Mathematics', days: '2 half-days', note: 'Calculus, trigo, algebra — difficult topics broken down step by step.' },
      { subj: 'E. Mathematics', days: '2 half-days', note: 'Statistics, geometry, problem sums — marks maximised efficiently.' },
    ],
    zh: [
      { subj: '物理', days: '2个半天', note: '波动、电学、力学 — 涵盖常见考试陷阱。' },
      { subj: '化学', days: '2个半天', note: '有机与无机概念，掌握结构化作答。' },
      { subj: '高级数学', days: '2个半天', note: '微积分、三角函数、代数 — 难题逐步拆解。' },
      { subj: '普通数学', days: '2个半天', note: '统计、几何、应用题 — 高效拿分。' },
    ],
  },
  olevF1t: { en: 'All Materials Provided', zh: '全套学习材料提供' },
  olevF1d: { en: 'Topical notes, past-year TYS questions, and formula sheets — everything in one folder.', zh: '主题笔记、历年TYS题目、公式表 — 全部一文件夹搞定。' },
  olevF2t: { en: 'Small Group · Max 6', zh: '小班制 · 最多6人' },
  olevF2d: { en: 'Not a lecture hall. Weak spots are caught and fixed in real time.', zh: '非大堂讲课，薄弱点实时发现并修正。' },
  olevF3t: { en: 'TYS-Style Practice', zh: 'TYS题型真实练习' },
  olevF3d: { en: 'Afternoons are dedicated to exam-condition practice using actual past-year paper formats.', zh: '下午全程模拟真实历年试题格式进行考试练习。' },
  olevF4t: { en: 'Subject Specialist Tutors', zh: '专科导师' },
  olevF4d: { en: 'Each subject taught by a specialist — no generalists. Students get expert-level coaching for every paper.', zh: '每科由专科导师执教，无通才讲师。学生获得每份试卷的专家级指导。' },
  olevEarlyPrice: { en: '$280 / subject (2 half-days)', zh: '每科 $280（2个半天）' },
  olevRegularPrice: { en: '$340 / subject', zh: '每科 $340' },

  // Bottom CTA
  bottomH2a: { en: 'PSLE. O-Level. A-Level.', zh: 'PSLE。O水准。A水准。' },
  bottomH2b: { en: 'Small daily habits \u2192 big exam results.', zh: '每天一点小习惯 \u2192 考试大突破。' },
  bottomSub: { en: 'Set up in under 5 minutes. Start free \u2014 upgrade when your child\u2019s exam season begins.', zh: '5分钟内完成设置。免费开始 \u2014 孩子考季来临时再升级。' },
  bottomBtn: { en: 'Start Free', zh: '免费开始' },
  bottomNote: { en: 'No credit card required. No lock-in.', zh: '无需信用卡。无锁定期。' },

  // Comparison table
  cmpRows: {
    en: [
      { label: 'Children tracked', free: '1', premium: 'Unlimited' },
      { label: 'Subjects per child', free: '1', premium: 'All subjects' },
      { label: 'Check-in frequency', free: 'Bundled 3x/week (Tue, Thu, Sun)', premium: 'Daily' },
      { label: 'Weekly parent report', free: true as string | boolean, premium: true as string | boolean },
      { label: 'Daily parent summary', free: false as string | boolean, premium: true as string | boolean },
      { label: 'Exam countdown & alerts', free: true as string | boolean, premium: true as string | boolean },
      { label: 'Auto pause after exam', free: false as string | boolean, premium: true as string | boolean },
      { label: 'Auto restart for new term', free: false as string | boolean, premium: true as string | boolean },
      { label: 'Exam result follow-up reminders', free: false as string | boolean, premium: true as string | boolean },
      { label: 'Smart tutor/diagnostic triggers', free: false as string | boolean, premium: true as string | boolean },
      { label: 'Crash course & holiday prompts', free: false as string | boolean, premium: true as string | boolean },
      { label: 'Blurred daily insights preview', free: true as string | boolean, premium: false as string | boolean },
    ],
    zh: [
      { label: '跟踪孩子数量', free: '1', premium: '不限' },
      { label: '每个孩子的科目', free: '1', premium: '所有科目' },
      { label: '打卡频率', free: '每周3次合并打卡（二、四、日）', premium: '每天' },
      { label: '每周家长报告', free: true as string | boolean, premium: true as string | boolean },
      { label: '每日家长摘要', free: false as string | boolean, premium: true as string | boolean },
      { label: '考试倒计时和提醒', free: true as string | boolean, premium: true as string | boolean },
      { label: '考后自动暂停', free: false as string | boolean, premium: true as string | boolean },
      { label: '新学期自动重启', free: false as string | boolean, premium: true as string | boolean },
      { label: '考试结果跟进提醒', free: false as string | boolean, premium: true as string | boolean },
      { label: '智能补习/评估推荐', free: false as string | boolean, premium: true as string | boolean },
      { label: '速成班和假期提示', free: false as string | boolean, premium: true as string | boolean },
      { label: '模糊每日分析预览', free: true as string | boolean, premium: false as string | boolean },
    ],
  },
} as const;

/* ── O-Level topic bank ── */
const OLEVEL_TOPICS: Record<string, string[]> = {
  'Physics': [
    'Kinematics', 'Dynamics & Newton\'s Laws', 'Forces & Pressure',
    'Thermal Physics', 'Waves & Light', 'Electromagnetic Spectrum',
    'Electricity & Circuits', 'Magnetism & Electromagnetism', 'Radioactivity',
  ],
  'Chemistry': [
    'Atomic Structure & Bonding', 'Mole Concept & Stoichiometry',
    'Acids, Bases & Salts', 'Redox Reactions', 'Electrolysis',
    'Energy Changes', 'Rate of Reaction', 'Organic Chemistry',
  ],
  'A. Mathematics': [
    'Quadratic Functions & Inequalities', 'Indices & Surds',
    'Polynomials & Partial Fractions', 'Logarithms', 'Trigonometry',
    'Differentiation', 'Integration', 'Binomial Theorem', 'Matrices',
  ],
  'E. Mathematics': [
    'Numbers & Algebra', 'Percentage & Ratio', 'Mensuration',
    'Geometry & Angles', 'Trigonometry', 'Graphs & Functions',
    'Statistics', 'Probability', 'Vectors & Transformations',
  ],
};
const OLEVEL_SUBJ_KEYS = Object.keys(OLEVEL_TOPICS);

const StudyPulseLanding: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const t = (key: keyof typeof T) => (T[key] as Record<Lang, string>)[lang];

  // O-Level topic selector
  const [activeSubj, setActiveSubj] = useState<string>(OLEVEL_SUBJ_KEYS[0]);
  const [selectedTopics, setSelectedTopics] = useState<Record<string, Set<string>>>(
    () => Object.fromEntries(OLEVEL_SUBJ_KEYS.map((k) => [k, new Set<string>()])),
  );
  const toggleTopic = (subj: string, topic: string) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev[subj]);
      next.has(topic) ? next.delete(topic) : next.add(topic);
      return { ...prev, [subj]: next };
    });
  };
  const totalSelected = OLEVEL_SUBJ_KEYS.reduce((acc, k) => acc + selectedTopics[k].size, 0);
  const buildWaMessage = () => {
    const lines: string[] = ['Hi, I\'d like to reserve a spot for the O-Level June Holiday Crash Course.', ''];
    OLEVEL_SUBJ_KEYS.forEach((subj) => {
      const topics = [...selectedTopics[subj]];
      if (topics.length) lines.push(`${subj}: ${topics.join(', ')}`);
    });
    lines.push('', 'Please prepare materials for the above weak topics. Thank you!');
    return encodeURIComponent(lines.join('\n'));
  };

  // Countdown to registration deadline: 20 May 2026 23:59:59 SGT (UTC+8)
  const DEADLINE = new Date('2026-05-20T23:59:59+08:00').getTime();
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, DEADLINE - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(Math.max(0, DEADLINE - Date.now())), 1000);
    return () => clearInterval(id);
  }, []);
  const days = Math.floor(timeLeft / 86400000);
  const hours = Math.floor((timeLeft % 86400000) / 3600000);
  const mins = Math.floor((timeLeft % 3600000) / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="min-h-screen bg-[#faf8f4] text-slate-900">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-[linear-gradient(155deg,#0f172a_0%,#1e3a5f_50%,#0c4a3e_100%)] px-4 pb-16 pt-20 text-white sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true">
          <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute right-[-6%] top-24 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="absolute bottom-[-10%] left-1/3 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Language toggle */}
          <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20">
            <Globe size={13} /> {lang === 'en' ? '中文' : 'EN'}
          </button>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            <BarChart3 size={14} aria-hidden="true" />
            {t('badge')}
          </div>
          <h1 className="mx-auto max-w-4xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {t('heroH1a')}<br className="hidden sm:block" />
            <span className="text-amber-300">{t('heroH1b')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            {t('heroSub')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/studypulse/setup" className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-amber-300">
              {t('startFree')} <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Link>
            <a href="#pricing" className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20">
              {t('seePricing')}
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-400">{t('alreadyAcct')} <Link to="/studypulse/login" className="font-semibold text-amber-300 hover:text-amber-200">{t('signIn')}</Link></p>

          {/* Trust stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { val: t('stat1'), sub: t('stat1sub') },
              { val: t('stat2'), sub: t('stat2sub') },
              { val: t('stat3'), sub: t('stat3sub') },
            ].map((s) => (
              <div key={s.sub} className="text-center">
                <p className="text-xl font-black text-white sm:text-2xl">{s.val}</p>
                <p className="mt-1 text-[11px] text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM ═══════════ */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">{t('problemH2')}</h2>
            <p className="mt-3 text-slate-600">{t('problemSub')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {([
              { icon: Smartphone, color: 'red' as const, title: t('prob1t'), desc: t('prob1d') },
              { icon: AlertTriangle, color: 'amber' as const, title: t('prob2t'), desc: t('prob2d') },
              { icon: Clock3, color: 'orange' as const, title: t('prob3t'), desc: t('prob3d') },
              { icon: Target, color: 'slate' as const, title: t('prob4t'), desc: t('prob4d') },
            ]).map((item) => (
              <div key={item.title} className={`rounded-2xl border p-6 ${item.color === 'red' ? 'border-red-100 bg-gradient-to-br from-red-50 to-white' : item.color === 'amber' ? 'border-amber-100 bg-gradient-to-br from-amber-50 to-white' : item.color === 'orange' ? 'border-orange-100 bg-gradient-to-br from-orange-50 to-white' : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'}`}>
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.color === 'red' ? 'bg-red-100 text-red-500' : item.color === 'amber' ? 'bg-amber-100 text-amber-600' : item.color === 'orange' ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-500'}`}>
                  <item.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">{t('howH2')}</h2>
            <p className="mt-3 text-slate-600">{t('howSub')}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CalendarCheck, step: '1', title: t('how1t'), desc: t('how1d') },
              { icon: CheckCircle2, step: '2', title: t('how2t'), desc: t('how2d') },
              { icon: MessageSquare, step: '3', title: t('how3t'), desc: t('how3d') },
              { icon: Zap, step: '4', title: t('how4t'), desc: t('how4d') },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{item.step}</div>
                <item.icon size={20} className="mb-3 text-blue-700" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT FREE USERS SEE (conversion nudge) ═══════════ */}
      <section className="border-t border-slate-200 bg-[#faf8f4] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">{t('freeH2')}</h2>
            <p className="mt-3 text-slate-600">{t('freeSub')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* What you GET */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-600">{t('freeYouGet')}</p>
              <ul className="space-y-3">
                {(T.freeGet[lang] as readonly string[]).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* What you DON'T get */}
            <div className="rounded-2xl border border-red-200 bg-white p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-red-500">{t('freeDontGet')}</p>
              <ul className="space-y-3">
                {(T.freeMiss[lang] as readonly string[]).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-500">
                    <X size={15} className="mt-0.5 shrink-0 text-red-400" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* The reality */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:col-span-2 lg:col-span-1">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-700">{t('freeDiff')}</p>
              <p className="text-sm leading-6 text-slate-700">{t('freeDiffP1')}</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">{t('freeDiffP2')}</p>
              <a href="#pricing" className="mt-5 inline-flex items-center text-sm font-bold text-amber-700 hover:text-amber-800">
                {t('seePremium')} <ArrowRight size={14} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FIRST IN SINGAPORE ═══════════ */}
      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
            <Sparkles size={14} /> {t('firstBadge')}
          </div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">{t('firstH2')}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">{t('firstDesc')}</p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
            {[
              { title: t('notTuition'), desc: t('notTuitionD') },
              { title: t('notHomework'), desc: t('notHomeworkD') },
              { title: t('notScreen'), desc: t('notScreenD') },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-stone-50 p-5">
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 2-TIER PRICING ═══════════ */}
      <section id="pricing" className="border-t border-slate-200 bg-[#faf8f4] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">{t('priceH2')}</h2>
            <p className="mt-3 text-slate-600">{t('priceSub')}</p>
          </div>

          {/* 2 Cards */}
          <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
            {/* FREE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t('priceFree')}</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-black text-slate-900">$0</span>
                <span className="mb-1 text-sm text-slate-500">{t('priceForever')}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{t('priceFreeTry')}</p>
              <div className="mt-6 space-y-3">
                <Row label={t('r1child')} included />
                <Row label={t('r1subj')} included />
                <Row label={t('r3wk')} included />
                <Row label={t('rWeekly')} included />
                <Row label={t('rDaily')} />
                <Row label={t('rPause')} />
                <Row label={t('rTrigger')} />
              </div>
              <Link to="/studypulse/setup" className="mt-7 inline-flex w-full items-center justify-center rounded-xl border-2 border-slate-900 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50">
                {t('priceStartFree')}
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="relative rounded-3xl border-2 border-amber-400 bg-white p-7 shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-950">{t('recommended')}</div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">{t('pricePrem')}</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-black text-slate-900">$9.90</span>
                <span className="mb-1 text-sm text-slate-500">{t('priceMonth')}</span>
              </div>
              <p className="mt-2 text-sm text-amber-700 font-semibold">{t('priceBubble')}</p>
              <div className="mt-6 space-y-3">
                <Row label={t('rUnlimKids')} included highlight />
                <Row label={t('rAllSubj')} included highlight />
                <Row label={t('rDailyCI')} included highlight />
                <Row label={t('rDailySum')} included highlight />
                <Row label={t('rPause')} included highlight />
                <Row label={t('rExamRemind')} included highlight />
                <Row label={t('rSmartTutor')} included highlight />
              </div>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-slate-700">
                <div className="flex items-center justify-between"><span className="font-semibold">Core Monthly (Recurring)</span><span className="font-black">S$9.90/mo</span></div>
                <div className="mt-2 flex items-center justify-between"><span>Exam Pass (30 Days, One-Time)</span><span>S$14.90</span></div>
                <div className="mt-1 flex items-center justify-between"><span>Exam Sprint (60 Days, One-Time)</span><span>S$24.90</span></div>
                <div className="mt-1 flex items-center justify-between"><span>Exam Season (120 Days, One-Time)</span><span>S$43.90</span></div>
              </div>
              <Link to="/studypulse/setup?plan=premium" className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-amber-400">
                <Crown size={16} className="mr-2" /> {t('priceGetPrem')}
              </Link>
              <p className="mt-3 text-center text-xs text-slate-400">{t('pricePaynow')}</p>
            </div>
          </div>

          {/* Full comparison table (collapsed by default) */}
          <details className="mx-auto mt-8 max-w-5xl">
            <summary className="cursor-pointer text-center text-sm font-semibold text-blue-600 hover:text-blue-700">
              {t('priceCompare')}
            </summary>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 font-bold text-slate-500">{t('priceFeature')}</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500">{t('priceFree')}</th>
                    <th className="px-4 py-3 text-center font-bold text-amber-600">{t('pricePrem')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(T.cmpRows[lang] as readonly {label: string; free: string | boolean; premium: string | boolean}[]).map((r) => (
                    <tr key={r.label} className="border-b border-slate-50">
                      <td className="px-4 py-2.5 text-slate-700">{r.label}</td>
                      <td className="px-4 py-2.5 text-center">{renderCell(r.free)}</td>
                      <td className="px-4 py-2.5 text-center">{renderCell(r.premium)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-50 bg-slate-50 font-bold">
                    <td className="px-4 py-2.5 text-slate-900">{t('priceLabel')}</td>
                    <td className="px-4 py-2.5 text-center text-slate-900">$0</td>
                    <td className="px-4 py-2.5 text-center text-amber-700">$9.90/{lang === 'en' ? 'mo' : '月'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      {/* ═══════════ THE REAL QUESTION ═══════════ */}
      <section className="border-t border-slate-200 bg-slate-900 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base font-black text-white sm:text-lg">
            {t('realQ')} <span className="text-amber-300">{t('realQhl')}</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">{t('realQsub')}</p>
          <Link to="/studypulse/setup" className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300">
            {t('tryFree')} <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-black text-slate-900 sm:text-3xl">{t('faqH2')}</h2>
          {(T.faqs[lang] as readonly {q: string; a: string}[]).map((item, i) => (
            <div key={i} className="border-b border-slate-100">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-900">{item.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="pb-4 text-sm leading-6 text-slate-600">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ HOLIDAY CRASH COURSES ═══════════ */}
      <section className="border-t-4 border-amber-500 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">

          {/* Section header */}
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
              <Timer size={13} /> {t('ccSectionBadge')}
            </span>
          </div>
          <h2 className="text-center text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            {t('ccSectionH2')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-slate-300 sm:text-base">
            {t('ccSectionSub')}
          </p>

          {/* Countdown */}
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-amber-500/30 bg-amber-950/30 p-5 text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-300">{t('ccDeadlineLabel')}</p>
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              {[
                { val: days, label: lang === 'en' ? 'Days' : '天' },
                { val: hours, label: lang === 'en' ? 'Hrs' : '时' },
                { val: mins, label: lang === 'en' ? 'Min' : '分' },
                { val: secs, label: lang === 'en' ? 'Sec' : '秒' },
              ].map(({ val, label }, i, arr) => (
                <React.Fragment key={label}>
                  <div className="flex flex-col items-center">
                    <span className="tabular-nums rounded-xl bg-white/10 px-3 py-2 text-3xl font-black text-white sm:text-4xl">
                      {String(val).padStart(2, '0')}
                    </span>
                    <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</span>
                  </div>
                  {i < arr.length - 1 && <span className="mb-4 text-2xl font-black text-amber-400">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── TWO PROGRAMME CARDS ── */}
          <div className="mt-10 grid gap-8 lg:grid-cols-2">

            {/* ── PSLE CARD ── */}
            <div className="rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/60 to-slate-900 p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-sky-300">{t('psleBadge')}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{t('psleH3')}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t('psleSub')}</p>

              {/* Schedule info */}
              <div className="mt-5 space-y-2">
                <div className="flex items-start gap-2">
                  <CalendarCheck size={14} className="mt-0.5 shrink-0 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-200">{t('psleDates')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen size={14} className="mt-0.5 shrink-0 text-sky-400" />
                  <span className="text-xs text-slate-300">{t('psleStructure')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock3 size={14} className="mt-0.5 shrink-0 text-sky-400" />
                  <span className="text-xs text-slate-300">{t('psleSession')}</span>
                </div>
              </div>

              {/* Feature mini-grid */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {([
                  { icon: BookOpen, tKey: 'psleF1t' as const, dKey: 'psleF1d' as const },
                  { icon: Star, tKey: 'psleF2t' as const, dKey: 'psleF2d' as const },
                  { icon: Target, tKey: 'psleF3t' as const, dKey: 'psleF3d' as const },
                  { icon: Crown, tKey: 'psleF4t' as const, dKey: 'psleF4d' as const },
                ] as const).map(({ icon: Icon, tKey, dKey }) => (
                  <div key={tKey} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <Icon size={14} className="mb-1.5 text-sky-300" aria-hidden="true" />
                    <p className="text-[11px] font-bold text-white">{t(tKey)}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-400">{t(dKey)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-950/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-sky-300">{t('ccEarlyBird')}</p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="text-2xl font-black text-white">{t('psleEarlyPrice')}</span>
                  <span className="mb-0.5 text-sm text-slate-400 line-through">{t('psleRegularPrice')}</span>
                  <span className="mb-0.5 text-xs text-slate-500">{t('ccRegularLabel')}</span>
                </div>
                <p className="mt-2 text-[11px] text-red-300">{t('ccSpotsLeft')}</p>
              </div>

              {/* CTAs */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <a
                  href="https://wa.me/6500000000?text=Hi%2C%20I%27d%20like%20to%20reserve%20a%20spot%20for%20the%20PSLE%20June%20Holiday%20Crash%20Course"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-sky-400"
                >
                  {t('ccCTA')} <ArrowRight size={15} className="ml-2" />
                </a>
                <a
                  href="mailto:hello@integratedlearnings.com?subject=PSLE%20Crash%20Course%20Enquiry"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/15"
                >
                  <PhoneCall size={14} className="mr-1.5" /> {t('ccContactSchedule')}
                </a>
              </div>
            </div>

            {/* ── O-LEVEL CARD ── */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-slate-900 p-7">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">{t('olevBadge')}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{t('olevH3')}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{t('olevSub')}</p>

              {/* Schedule info */}
              <div className="mt-5 space-y-2">
                <div className="flex items-start gap-2">
                  <CalendarCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-200">{t('olevDates')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock3 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  <span className="text-xs text-slate-300">{t('olevSession')}</span>
                </div>
              </div>

              {/* ── TOPIC SELECTOR ── */}
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-black/30 p-4">
                <p className="text-xs font-bold text-emerald-300">{t('olevTopicLabel')}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-slate-400">{t('olevTopicSub')}</p>

                {/* Subject tabs */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {OLEVEL_SUBJ_KEYS.map((subj) => {
                    const count = selectedTopics[subj].size;
                    const active = activeSubj === subj;
                    return (
                      <button
                        key={subj}
                        onClick={() => setActiveSubj(subj)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                          active
                            ? 'bg-emerald-500 text-white shadow'
                            : 'border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {subj}
                        {count > 0 && (
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                            active ? 'bg-white/30 text-white' : 'bg-emerald-500/70 text-white'
                          }`}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Topic checkboxes */}
                <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {OLEVEL_TOPICS[activeSubj].map((topic) => {
                    const checked = selectedTopics[activeSubj].has(topic);
                    return (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(activeSubj, topic)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[11px] font-medium transition ${
                          checked
                            ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-200'
                            : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          checked ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {checked && <Check size={10} strokeWidth={3} className="text-white" />}
                        </span>
                        {topic}
                      </button>
                    );
                  })}
                </div>

                {/* Selection summary */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[11px] text-slate-500">
                    {totalSelected > 0
                      ? <span className="font-semibold text-emerald-300">{totalSelected} {t('olevTopicSelected')}</span>
                      : <span>{t('olevTopicNone')}</span>}
                  </p>
                  {totalSelected > 0 && (
                    <button
                      onClick={() => setSelectedTopics(Object.fromEntries(OLEVEL_SUBJ_KEYS.map((k) => [k, new Set<string>()])))}
                      className="text-[11px] text-slate-500 underline hover:text-slate-300"
                    >
                      {lang === 'en' ? 'Clear all' : '清除全部'}
                    </button>
                  )}
                </div>
              </div>

              {/* Feature mini-grid */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {([
                  { icon: BookOpen, tKey: 'olevF1t' as const, dKey: 'olevF1d' as const },
                  { icon: Star, tKey: 'olevF2t' as const, dKey: 'olevF2d' as const },
                  { icon: Target, tKey: 'olevF3t' as const, dKey: 'olevF3d' as const },
                  { icon: Crown, tKey: 'olevF4t' as const, dKey: 'olevF4d' as const },
                ] as const).map(({ icon: Icon, tKey, dKey }) => (
                  <div key={tKey} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <Icon size={14} className="mb-1.5 text-emerald-300" aria-hidden="true" />
                    <p className="text-[11px] font-bold text-white">{t(tKey)}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-400">{t(dKey)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-950/40 p-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-300">{t('ccEarlyBird')}</p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="text-2xl font-black text-white">{t('olevEarlyPrice')}</span>
                  <span className="mb-0.5 text-sm text-slate-400 line-through">{t('olevRegularPrice')}</span>
                  <span className="mb-0.5 text-xs text-slate-500">{t('ccRegularLabel')}</span>
                </div>
                <p className="mt-2 text-[11px] text-red-300">{t('ccSpotsLeft')}</p>
              </div>

              {/* CTAs */}
              <div className="mt-5 flex flex-col gap-2">
                {totalSelected > 0 ? (
                  <a
                    href={`https://wa.me/6500000000?text=${buildWaMessage()}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-400"
                  >
                    <MessageSquare size={15} className="mr-2" />
                    {t('olevTopicCTAsome')}
                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">{totalSelected}</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-white/10 px-5 py-3.5 text-sm font-semibold text-slate-500"
                  >
                    {t('olevTopicCTAnone')}
                  </button>
                )}
                <a
                  href="mailto:hello@integratedlearnings.com?subject=O-Level%20Crash%20Course%20Enquiry"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/15"
                >
                  <PhoneCall size={14} className="mr-1.5" /> {t('ccContactSchedule')}
                </a>
              </div>
            </div>

          </div>{/* end two-card grid */}

          {/* Bottom note */}
          <p className="mt-8 text-center text-xs text-slate-500">{t('ccScheduleNote')}</p>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-white sm:text-3xl">{t('bottomH2a')}<br />{t('bottomH2b')}</h2>
          <p className="mt-3 text-base text-slate-400">{t('bottomSub')}</p>
          <Link to="/studypulse/setup" className="mt-8 inline-flex items-center justify-center rounded-xl bg-amber-400 px-8 py-4 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-amber-300">
            {t('bottomBtn')} <ArrowRight size={16} className="ml-2" />
          </Link>
          <p className="mt-4 text-xs text-slate-500">{t('bottomNote')}</p>
        </div>
      </section>
    </div>
  );
};

/* ── Pricing row helper ── */
const Row: React.FC<{ label: string; included?: boolean; highlight?: boolean }> = ({ label, included, highlight }) => (
  <div className="flex items-center gap-2.5">
    {included
      ? <Check size={15} className={highlight ? 'text-amber-500' : 'text-emerald-500'} />
      : <Minus size={15} className="text-slate-300" />}
    <span className={`text-sm ${included ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
  </div>
);

/* ── Comparison table cell helper ── */
const renderCell = (val: string | boolean) => {
  if (val === true) return <Check size={16} className="mx-auto text-emerald-500" />;
  if (val === false) return <X size={16} className="mx-auto text-slate-300" />;
  return <span className="text-slate-700">{val}</span>;
};

export default StudyPulseLanding;