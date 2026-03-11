import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Brain, ClipboardList, Target, ArrowRight,
  CheckCircle2, Phone, MessageCircle, GraduationCap,
  ShieldCheck, Users, Heart, Star, Sparkles,
} from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

const InternationalStudents: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ──────────────────────────────────────────────
          HERO — warm, parent-focused, bilingual
          ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-white" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — text */}
            <div>
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700 tracking-wider">
                🌏 学业辅导 · Academic Support
              </span>
              <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                孩子来了新加坡，<br />学业跟不上怎么办？
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Integrated Learnings 专注于帮助在新加坡就读的国际学生<strong className="text-slate-800">适应本地课程、提升学业成绩</strong>。
                我们不是留学中介——我们是您孩子在新加坡的<strong className="text-slate-800">学业顾问</strong>。
              </p>
              <p className="mt-2 text-sm text-slate-400 italic">
                We help international students already studying in Singapore adapt to the local curriculum and improve academically.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#inquiry-form" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 hover:-translate-y-0.5">
                  免费学业咨询
                  <ArrowRight size={18} />
                </a>
                <a href="https://wa.me/6598882675" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-white px-8 py-4 text-base font-bold text-emerald-700 transition hover:bg-emerald-50">
                  <Phone size={18} />
                  WhatsApp 中文咨询
                </a>
              </div>
            </div>

            {/* Right — trust card */}
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-100/50">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-4 text-white shadow-lg">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Integrated Learnings</h3>
                  <p className="text-sm text-slate-500">新加坡专业学业辅导</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: <ShieldCheck size={18} className="text-emerald-500" />, text: '新加坡本地注册，合规运营' },
                  { icon: <Users size={18} className="text-emerald-500" />, text: '经验丰富的本地认证教师团队' },
                  { icon: <Star size={18} className="text-emerald-500" />, text: '诊断式教学，先了解问题再定方案' },
                  { icon: <Heart size={18} className="text-emerald-500" />, text: '一对一关注每个孩子的学习需求' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-emerald-50/60 px-4 py-3">
                    {item.icon}
                    <span className="text-sm font-medium text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          关于我们 · ABOUT — Raintree-style narrative
          ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">关于我们</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">孩子的学业需要，就是我们的追求</h2>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                很多家长带孩子来到新加坡后发现：<strong className="text-slate-800">课程体系不一样、考试方式不一样、英文要求更高了</strong>。
                孩子在国内成绩很好，到了新加坡却突然跟不上——这让家长非常焦虑。
              </p>
              <p>
                我们理解这种焦虑。因为我们每天都在帮助这样的家庭。
              </p>
              <p>
                Integrated Learnings 的做法很简单：<strong className="text-slate-800">先诊断，再推荐</strong>。
                我们会先了解孩子目前的学业水平、学习习惯和薄弱环节，然后推荐最适合的导师和学习方案——不是随便派一个老师，
                而是找到真正适合您孩子的那一位。
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 p-8 border border-emerald-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-500" />
                我们的特点
              </h3>
              <div className="space-y-3">
                {[
                  '不是留学中介，专注学业提升',
                  '本地注册，新加坡认证教师',
                  '诊断式教学——先找问题，再解决',
                  '一对一匹配，教学风格也要对',
                  '中英双语沟通，家长无障碍',
                  '无隐藏费用，灵活合约',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          常见挑战 · PAIN POINTS
          ────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">常见挑战</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">来新加坡读书，这些问题您遇到了吗？</h2>
            <p className="mt-2 text-sm text-slate-400">Common challenges for international students in Singapore</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: '📚', title: '课程体系完全不同', desc: '新加坡MOE课程、IB、IGCSE与中国人教版/北师大版差异很大。数学虽然内容相似，但表达方式和解题思路不同；科学术语全是英文。' },
              { emoji: '🗣️', title: '学术英语跟不上', desc: '日常英语能应付，但课堂讨论、考试审题、论文写作需要的学术英语是另一个层次。很多孩子"听得懂但答不好"。' },
              { emoji: '📝', title: '考试方式大不同', desc: '新加坡考试重视应用能力和批判性思维。死记硬背在这里行不通。PSLE、O-Level、A-Level都有独特的考试策略。' },
              { emoji: '😰', title: '自信心受打击', desc: '在国内一直是好学生，来新加坡后成绩下降——这对孩子的自信心和学习动力是很大的打击。' },
              { emoji: '📊', title: '各科进度不均衡', desc: '数学可能超前，但英文和人文科目可能严重落后。需要一套针对性的补习计划，而不是"全面撒网"。' },
              { emoji: '🎯', title: '升学路径不清晰', desc: '不了解PSLE分流、O-Level选科、JC还是Poly的区别——家长很难帮孩子做出正确的升学规划。' },
            ].map((item, idx) => (
              <div key={idx} className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          服务内容 · SERVICES
          ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">服务内容</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">我们能帮孩子做什么</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              我们提供的不仅仅是"找一个老师"。每一位学生都会先经过学业诊断，再制定个性化的学习方案。
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: <BookOpen className="text-emerald-600" size={28} />,
                title: '课程衔接辅导',
                titleEn: 'Syllabus Bridging',
                desc: '从中国课程过渡到新加坡MOE、IB或IGCSE体系。我们帮助学生填补知识空白，适应新的学习方式和评估标准。',
                highlight: '适合刚到新加坡的学生',
              },
              {
                icon: <Target className="text-emerald-600" size={28} />,
                title: '一对一学科辅导',
                titleEn: '1-to-1 Subject Tutoring',
                desc: '英文、数学、科学、华文——由了解国际学生需求的本地教师一对一授课。根据孩子的实际水平和目标量身定制。',
                highlight: '最受欢迎的服务',
              },
              {
                icon: <ClipboardList className="text-emerald-600" size={28} />,
                title: '考试备战',
                titleEn: 'Exam Preparation',
                desc: '针对PSLE、O-Level、A-Level、IB和IGCSE考试，提供模拟考试、考试技巧训练和历年真题分析。',
                highlight: '考试前3-6个月开始',
              },
              {
                icon: <Brain className="text-emerald-600" size={28} />,
                title: '学习策略指导',
                titleEn: 'Study Strategy Guidance',
                desc: '帮助孩子建立高效的学习习惯、时间管理能力和应试心态。特别适合需要从"被动学习"转变为"主动学习"的学生。',
                highlight: '终身受益的技能',
              },
            ].map((item, idx) => (
              <div key={idx} className="group rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-8 shadow-sm transition hover:shadow-md">
                <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100 group-hover:bg-emerald-100 transition">{item.icon}</div>
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">{item.highlight}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{item.titleEn}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          服务流程 · HOW IT WORKS
          ────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">服务流程</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">简单三步，开始学业提升之旅</h2>
            <p className="mt-2 text-sm text-slate-400">Three simple steps to get started</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-emerald-200 sm:block" />

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { step: '1', title: '提交咨询', titleEn: 'Submit Inquiry', desc: '填写下方表格或通过WhatsApp联系我们。请告诉我们孩子目前的年级、学校类型和需要帮助的科目。', icon: '📋' },
                { step: '2', title: '学业诊断', titleEn: 'Learning Assessment', desc: '我们的顾问会评估孩子的学业水平、学习风格和薄弱环节，制定个性化的辅导方案。', icon: '🔬' },
                { step: '3', title: '匹配导师', titleEn: 'Educator Matching', desc: '根据诊断结果推荐最合适的教师——不仅专业要对口，教学风格也要和孩子的性格匹配。', icon: '🤝' },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg ring-4 ring-emerald-100">
                    {item.icon}
                  </div>
                  <div className="mb-1 text-xs font-bold text-emerald-600">第 {item.step} 步</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 mb-2">{item.titleEn}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="text-sm text-emerald-800">
              <strong>整个过程完全免费</strong>，不满意可以随时终止。我们的目标是帮您找到<strong>真正适合</strong>孩子的学习方案。
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          家长的顾虑 · PARENT Q&A
          ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">家长常见问题</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">您可能想问的问题</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { q: '你们是留学中介吗？', a: '不是。我们专注于为已经在新加坡就读的学生提供学业辅导。我们不办理留学申请或签证。' },
              { q: '老师是什么背景？', a: '我们的教师都是经过认证的新加坡本地教育者，熟悉MOE课程、IB和IGCSE体系，并且有辅导国际学生的经验。' },
              { q: '可以用中文沟通吗？', a: '当然可以！我们的顾问团队支持中英双语沟通。您可以用中文和我们讨论孩子的情况，我们会帮您安排一切。' },
              { q: '费用怎么算？', a: '咨询和学业诊断完全免费。辅导费用根据年级和科目透明收费，无隐藏费用，合约灵活可随时终止。' },
              { q: '多快可以开始上课？', a: '提交咨询后，我们通常在3-7天内完成诊断并匹配合适的教师。' },
              { q: '如果老师不合适怎么办？', a: '我们提供免费更换教师服务。在前两节课内如果觉得不合适，可以免费换一位。' },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-5 hover:border-emerald-200 transition">
                <h4 className="font-bold text-slate-900 mb-2 text-sm">💬 {item.q}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          新加坡教育路径 · EDUCATION PATHWAY
          ────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">升学路径</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">新加坡教育体系简介</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              了解新加坡的升学路径，才能帮助孩子做出正确的选择。我们的顾问可以帮您梳理最适合孩子的路线。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { level: '小学', levelEn: 'Primary (P1-P6)', exam: 'PSLE', desc: '六年制，P6参加PSLE考试。成绩决定中学分流。国际学生通常通过AEIS考试入学。', color: 'bg-emerald-50 border-emerald-200' },
              { level: '中学', levelEn: 'Secondary (Sec 1-4/5)', exam: 'O-Level / N-Level', desc: '4-5年制。Sec 4参加O-Level考试，成绩决定升JC还是Poly。', color: 'bg-sky-50 border-sky-200' },
              { level: '初级学院', levelEn: 'Junior College (JC1-2)', exam: 'A-Level', desc: '两年制，面向大学升学。A-Level考试难度较高，需要针对性的备考策略。', color: 'bg-amber-50 border-amber-200' },
              { level: '理工学院', levelEn: 'Polytechnic (3 years)', exam: 'Diploma', desc: '三年制文凭课程，注重实践。毕业后可工作或申请大学。适合有清晰职业方向的学生。', color: 'bg-purple-50 border-purple-200' },
            ].map((item, idx) => (
              <div key={idx} className={`rounded-xl border p-6 ${item.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{item.level}</h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{item.exam}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{item.levelEn}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              不确定孩子应该走哪条路？<a href="#inquiry-form" className="font-semibold text-emerald-600 hover:underline">联系我们的顾问</a>，免费帮您分析。
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          咨询表 · INQUIRY FORM
          ────────────────────────────────────────────── */}
      <section id="inquiry-form" className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">免费咨询</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900">开始您的免费学业咨询</h2>
            <p className="mt-3 text-slate-600">
              填写以下表格，我们的顾问将在1-2个工作日内用中文或英文联系您。
            </p>
            <p className="mt-1 text-sm text-slate-400">无需创建账户 · 完全免费 · 中英双语服务</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-4">
              <p className="text-sm text-emerald-800 leading-relaxed">
                <strong>💡 温馨提示：</strong>在"补充说明"中请注明以下信息，以便我们更好地了解孩子的情况：
              </p>
              <ul className="mt-2 space-y-1 text-sm text-emerald-700">
                <li>• 孩子之前就读的学校和课程体系（如人教版、北师大版等）</li>
                <li>• 来新加坡多长时间了</li>
                <li>• 目前就读的学校类型（政府学校/国际学校/私立学校）</li>
              </ul>
            </div>
            <ParentInquiryForm />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          联系方式 · CONTACT
          ────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3 items-start">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-sky-600 px-3 py-2 text-lg font-black text-white shadow">IL</div>
                <div>
                  <p className="font-bold text-white">Integrated Learnings</p>
                  <p className="text-xs text-slate-400">新加坡专业学业辅导</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                立足新加坡，专注于帮助国际学生提升学业成绩。
                我们的使命是让每一个来新加坡读书的孩子都能获得适合自己的学习支持。
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-white mb-4">联系方式 · Contact</h3>
              <div className="space-y-3 text-sm">
                <a href="https://wa.me/6598882675" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                  <Phone size={16} className="text-emerald-400" />
                  <span>WhatsApp: +65 9888 2675</span>
                </a>
                <div className="flex items-center gap-3 text-slate-300">
                  <MessageCircle size={16} className="text-emerald-400" />
                  <span>manage.integrated.learnings@gmail.com</span>
                </div>
                <p className="text-xs text-slate-500 pt-2">
                  服务时间：周一至周日 9:00 AM - 9:00 PM (SGT)
                </p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400 mb-4">更方便的方式：直接用中文 WhatsApp 联系我们</p>
              <a href="https://wa.me/6598882675" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-[#20bd5a] hover:-translate-y-0.5">
                <Phone size={18} className="fill-current" />
                WhatsApp 中文咨询
              </a>
              <p className="mt-3 text-xs text-slate-500">可发送中文/英文消息</p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center gap-3 border-t border-slate-800 pt-8">
            <Link to="/tuition" className="text-sm text-slate-400 hover:text-white transition">
              ← 返回主页 · Back to Main Site
            </Link>
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} Integrated Learnings Singapore. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InternationalStudents;