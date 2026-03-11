import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Brain, ClipboardList, Target, ArrowRight, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

const InternationalStudents: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#60a5fa 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <p className="mb-3 inline-block rounded-full bg-sky-500/20 border border-sky-400/30 px-5 py-1.5 text-sm font-bold text-sky-300">
            🌏 国际学生学业辅导
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
            在新加坡学习？<br />我们帮助您适应本地课程。
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 leading-relaxed mb-4">
            Integrated Learnings 为在新加坡就读的国际学生提供专业学业辅导。
            无论您来自中国、香港、台湾或其他地区，我们都能帮助您顺利过渡到新加坡教育体系。
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Integrated Learnings provides professional academic support for international students studying in Singapore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#inquiry-form" className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-8 py-4 text-base font-semibold text-white shadow-xl transition hover:bg-sky-600">
              免费咨询 · Free Consultation
              <ArrowRight size={18} />
            </a>
            <a href="https://wa.me/6598882675" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
              <Phone size={18} />
              WhatsApp 联系我们
            </a>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">国际学生常见的学业挑战</h2>
          <p className="text-slate-500 text-sm">Common Academic Challenges for International Students</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { emoji: '📚', title: '课程体系差异', titleEn: 'Syllabus Differences', desc: '新加坡的MOE课程、IB和IGCSE与中国课程有显著差异，特别是在数学表达、科学术语和英文学术写作方面。' },
            { emoji: '🗣️', title: '学术英语障碍', titleEn: 'Academic English Gap', desc: '课堂授课、考试题目、论文写作都需要较高的英语水平。日常英语和学术英语有很大区别。' },
            { emoji: '📝', title: '考试方式不同', titleEn: 'Different Exam Formats', desc: '新加坡考试注重应用题、开放式回答和批判性思维。死记硬背的方式在这里效果有限。' },
            { emoji: '🔄', title: '适应期压力', titleEn: 'Adjustment Stress', desc: '新环境、新同学、新的学习方式——同时应对这些挑战是很大的压力。' },
            { emoji: '📊', title: '学业进度落差', titleEn: 'Progress Gaps', desc: '某些科目可能超前（如数学），但其他科目可能落后（如英文），需要针对性的补习计划。' },
            { emoji: '🎯', title: '目标不明确', titleEn: 'Unclear Pathways', desc: '不了解PSLE、O-Level、A-Level等考试体系，难以制定长期学习计划。' },
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400 mb-2">{item.titleEn}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-3">我们的辅导服务</h2>
            <p className="text-slate-500 text-sm">Our Academic Support Services</p>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              我们不是留学中介。我们是学业顾问，帮助已经在新加坡就读的学生取得更好的学业成绩。
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: <BookOpen className="text-sky-600" size={28} />,
                title: '课程衔接辅导',
                titleEn: 'Syllabus Bridging Support',
                desc: '针对从中国课程转入新加坡MOE、IB或IGCSE课程的学生，提供定制化的衔接辅导，填补知识空白。',
                tags: ['MOE课程', 'IB', 'IGCSE', '知识衔接'],
              },
              {
                icon: <Target className="text-sky-600" size={28} />,
                title: '一对一学科辅导',
                titleEn: '1-to-1 Subject Tutoring',
                desc: '由经验丰富的本地教师提供英文、数学、科学等科目的一对一辅导，根据学生的实际水平和目标量身定制。',
                tags: ['英文', '数学', '科学', '华文'],
              },
              {
                icon: <ClipboardList className="text-sky-600" size={28} />,
                title: '考试准备',
                titleEn: 'Exam Preparation',
                desc: '针对PSLE、O-Level、A-Level、IB和IGCSE等考试，提供考试技巧训练、模拟考试和针对性练习。',
                tags: ['PSLE', 'O-Level', 'A-Level', 'IB/IGCSE'],
              },
              {
                icon: <Brain className="text-sky-600" size={28} />,
                title: '学习策略指导',
                titleEn: 'Study Strategy Guidance',
                desc: '帮助学生建立适合新加坡学术环境的学习习惯、时间管理能力和应试策略。',
                tags: ['学习方法', '时间管理', '应试策略'],
              },
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-sky-100 bg-white p-8 shadow-sm hover:shadow-md transition">
                <div className="mb-4 inline-flex rounded-xl bg-sky-50 p-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{item.titleEn}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3">服务流程</h2>
          <p className="text-slate-500 text-sm">How It Works</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { step: '1', title: '提交咨询', titleEn: 'Submit Inquiry', desc: '填写下方表格，告诉我们您孩子目前的学校、年级、课程体系和需要帮助的科目。' },
            { step: '2', title: '学业评估', titleEn: 'Learning Assessment', desc: '我们的顾问会评估学生的学业情况和学习风格，制定个性化的辅导方案。' },
            { step: '3', title: '匹配导师', titleEn: 'Educator Matching', desc: '根据评估结果，推荐最合适的教师——不仅要专业对口，教学风格也要匹配。' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-xl font-black text-sky-700">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-xs text-slate-400 mb-2">{item.titleEn}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-center">
            {[
              { label: '新加坡注册', labelEn: 'Singapore-Registered', icon: '🇸🇬' },
              { label: '认证教师', labelEn: 'Verified Educators', icon: '✅' },
              { label: '诊断式教学', labelEn: 'Diagnostic-First', icon: '🔬' },
              { label: '无隐藏费用', labelEn: 'No Hidden Fees', icon: '💰' },
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                <p className="text-xs text-slate-400">{item.labelEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="bg-gradient-to-b from-sky-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-3">免费学业咨询</h2>
            <p className="text-slate-500 text-sm mb-2">Free Learning Consultation</p>
            <p className="text-slate-600">
              填写以下表格，我们的顾问将在1-2个工作日内联系您。<br />
              <span className="text-sm text-slate-400">无需创建账户 · 完全免费</span>
            </p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 rounded-lg bg-sky-50 border border-sky-100 p-4">
              <p className="text-sm text-sky-800">
                <strong>💡 提示：</strong>在"补充说明"中请注明您孩子之前就读的学校和课程体系（如人教版、北师大版等），以便我们更好地了解情况。
              </p>
            </div>
            <ParentInquiryForm />
          </div>
        </div>
      </section>

      {/* Contact / WeChat */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-3">联系方式 · Contact</h3>
              <div className="space-y-3 text-slate-300 text-sm">
                <p className="flex items-center gap-3">
                  <Phone size={16} className="text-sky-400" />
                  <span>WhatsApp: <a href="https://wa.me/6598882675" className="text-sky-400 hover:underline">+65 9888 2675</a></span>
                </p>
                <p className="flex items-center gap-3">
                  <MessageCircle size={16} className="text-sky-400" />
                  <span>Email: manage.integrated.learnings@gmail.com</span>
                </p>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                服务时间：周一至周日 9:00 AM - 9:00 PM (SGT)<br />
                Operating hours: Mon–Sun, 9am–9pm SGT
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-slate-400 mb-3">也可以通过 WhatsApp 直接用中文联系我们</p>
              <a href="https://wa.me/6598882675" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#20bd5a]">
                <Phone size={18} className="fill-current" />
                WhatsApp 中文咨询
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <Link to="/tuition" className="text-sm text-slate-400 hover:text-white transition">
              ← 返回主页 · Back to Main Site
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InternationalStudents;
