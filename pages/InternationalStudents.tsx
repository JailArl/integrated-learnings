import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Brain, ClipboardList, Target, ArrowRight,
  CheckCircle2, Phone, MessageCircle, GraduationCap,
  ShieldCheck, Users, Heart, Star, Sparkles, ChevronDown,
  ChevronUp, X, Check, Award, TrendingUp, Clock, Zap,
} from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

/* ─── ANIMATED COUNTER HOOK ────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ─── SCROLL FADE-IN HOOK ──────────────────────────── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1)';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── FAQ ACCORDION ────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${open ? 'border-emerald-300 bg-emerald-50/50 shadow-md' : 'border-slate-100 bg-white hover:border-emerald-200'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <span className="font-bold text-slate-900 text-[15px]">💬 {q}</span>
        {open ? <ChevronUp size={18} className="flex-shrink-0 text-emerald-500" /> : <ChevronDown size={18} className="flex-shrink-0 text-slate-400" />}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5 px-5' : 'max-h-0'}`}
      >
        <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
const InternationalStudents: React.FC = () => {
  /* Sticky nav state */
  const [scrolled, setScrolled] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Counter refs */
  const stat1 = useCountUp(200);
  const stat2 = useCountUp(50);
  const stat3 = useCountUp(95);
  const stat4 = useCountUp(7);

  /* Fade-in refs */
  const fadeAbout = useFadeIn();
  const fadePain = useFadeIn();
  const fadeService = useFadeIn();
  const fadeCompare = useFadeIn();
  const fadeSteps = useFadeIn();
  const fadeTestimonial = useFadeIn();
  const fadeFaq = useFadeIn();
  const fadePathway = useFadeIn();
  const fadeForm = useFadeIn();

  const navLinks = [
    { label: '关于我们', href: '#about' },
    { label: '常见挑战', href: '#challenges' },
    { label: '服务内容', href: '#services' },
    { label: '家长反馈', href: '#testimonials' },
    { label: '升学路径', href: '#pathway' },
    { label: '免费咨询', href: '#inquiry-form' },
  ];

  return (
    <div className="min-h-screen bg-white scroll-smooth">

      {/* ─── Global CSS animations ────────────────── */}
      <style>{`
        @keyframes float { 0%,100%{ transform:translateY(0) rotate(0deg) } 50%{ transform:translateY(-20px) rotate(3deg) } }
        @keyframes float2 { 0%,100%{ transform:translateY(0) rotate(0deg) } 50%{ transform:translateY(-15px) rotate(-2deg) } }
        @keyframes pulse-ring { 0%{ transform:scale(.8); opacity:1 } 100%{ transform:scale(2.4); opacity:0 } }
        @keyframes gradient-x { 0%,100%{ background-position:0% 50% } 50%{ background-position:100% 50% } }
        .animate-float { animation: float 6s ease-in-out infinite }
        .animate-float2 { animation: float2 8s ease-in-out infinite }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite }
        .animate-gradient { background-size:200% 200%; animation: gradient-x 6s ease infinite }
      `}</style>

      {/* ═══════════════════════════════════════════════
          STICKY GLASSMORPHISM NAVBAR
          ═══════════════════════════════════════════════ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-emerald-100/30 py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/zh" className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-sky-600 px-2.5 py-1.5 text-sm font-black text-white shadow">IL</div>
            <span className={`font-bold text-sm transition ${scrolled ? 'text-slate-800' : 'text-slate-700'}`}>Integrated Learnings</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition hover:bg-emerald-50 hover:text-emerald-700 ${scrolled ? 'text-slate-600' : 'text-slate-500'}`}
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://wa.me/6598882675"
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#20bd5a]"
            >
              <Phone size={13} />
              WhatsApp
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileNav(!mobileNav)} className="md:hidden rounded-lg p-2 hover:bg-emerald-50">
            <div className="space-y-1.5">
              <div className={`h-0.5 w-5 bg-slate-600 transition-all ${mobileNav ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`h-0.5 w-5 bg-slate-600 transition-all ${mobileNav ? 'opacity-0' : ''}`} />
              <div className={`h-0.5 w-5 bg-slate-600 transition-all ${mobileNav ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileNav && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-4 space-y-1 shadow-xl">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileNav(false)} className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════════════
          HERO — animated blobs + gradient mesh
          ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50/30 animate-gradient" />

        {/* Floating blob shapes (CSS animated — beats Raintree55's static SVGs) */}
        <div className="absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-sky-200/20 blur-3xl animate-float2" />
        <div className="absolute top-1/2 left-1/3 h-[300px] w-[300px] rounded-full bg-amber-100/20 blur-3xl animate-float" />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#0ea5e9 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — emotive copy */}
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 backdrop-blur px-5 py-2 text-xs font-bold text-emerald-700 tracking-wider shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-pulse-ring" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                新加坡 · 专业学业辅导
              </span>

              <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
                孩子来了新加坡，
                <span className="relative">
                  <span className="relative z-10">学业跟不上</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-emerald-200/50 -z-0 rounded" />
                </span>
                怎么办？
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-lg">
                我们不是留学中介——我们是您孩子在新加坡的<strong className="text-emerald-700">学业顾问</strong>。
                <br />先诊断、再推荐，找到<strong className="text-emerald-700">真正适合</strong>孩子的老师和方案。
              </p>
              <p className="mt-2 text-sm text-slate-400 italic">
                Helping international students adapt and excel in Singapore&rsquo;s education system.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#inquiry-form" className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-200/50 transition-all hover:shadow-2xl hover:shadow-emerald-300/50 hover:-translate-y-0.5 active:translate-y-0">
                  免费学业咨询
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" />
                </a>
                <a href="https://wa.me/6598882675" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-white/70 backdrop-blur px-8 py-4 text-base font-bold text-emerald-700 transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5">
                  <Phone size={18} />
                  WhatsApp 中文咨询
                </a>
              </div>
              <Link to="/zh/fortune" className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 transition">
                ✨ 性格解码 — 发现孩子的天赋密码
                <ArrowRight size={14} />
              </Link>

              {/* Mini social proof */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['🧑‍🎓', '👩‍🎓', '👨‍🎓', '👩‍🏫'].map((e, i) => (
                    <div key={i} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-sm shadow-sm">{e}</div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">200+ 家庭信赖</p>
                  <p className="text-xs text-slate-400">在新加坡的中国家庭选择了我们</p>
                </div>
              </div>
            </div>

            {/* Right — glassmorphism trust card */}
            <div className="relative">
              {/* Floating decoration */}
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-400 opacity-20 blur-sm animate-float2" />

              <div className="relative rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-2xl shadow-emerald-200/30">
                <div className="absolute -top-3 -right-3 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
                  ✓ 合规注册
                </div>

                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-600 p-4 text-white shadow-lg">
                    <GraduationCap size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Integrated Learnings</h3>
                    <p className="text-sm text-slate-500">新加坡专业学业辅导平台</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: <ShieldCheck size={18} className="text-emerald-500" />, text: '新加坡本地注册，合规运营', en: 'Locally registered' },
                    { icon: <Users size={18} className="text-emerald-500" />, text: '经验丰富的认证教师团队', en: 'Certified educators' },
                    { icon: <Star size={18} className="text-emerald-500" />, text: '诊断式教学，先评估再定方案', en: 'Assessment-first approach' },
                    { icon: <Heart size={18} className="text-emerald-500" />, text: '一对一关注每个孩子的需求', en: 'Personalized 1-to-1 support' },
                  ].map((item, i) => (
                    <div key={i} className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-50/80 to-sky-50/30 px-4 py-3 transition hover:from-emerald-100/80 hover:shadow-sm">
                      {item.icon}
                      <div>
                        <span className="text-sm font-medium text-slate-700">{item.text}</span>
                        <span className="ml-2 text-[10px] text-slate-400">{item.en}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-emerald-500 p-4 text-center text-white">
                  <p className="text-sm font-bold">📞 首次咨询 + 学业诊断 = 完全免费</p>
                  <p className="text-xs mt-1 opacity-80">Free consultation & academic assessment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400">
          <span className="text-xs">向下了解更多</span>
          <ChevronDown size={20} className="animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS — animated counters (Raintree55 doesn't have this)
          ═══════════════════════════════════════════════ */}
      <section className="relative border-y border-emerald-100 bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-600 animate-gradient">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center text-white">
            {[
              { ref: stat1.ref, count: stat1.count, suffix: '+', label: '学生家庭', en: 'Families Served', icon: <Users size={22} /> },
              { ref: stat2.ref, count: stat2.count, suffix: '+', label: '认证教师', en: 'Certified Educators', icon: <Award size={22} /> },
              { ref: stat3.ref, count: stat3.count, suffix: '%', label: '满意率', en: 'Satisfaction Rate', icon: <TrendingUp size={22} /> },
              { ref: stat4.ref, count: stat4.count, suffix: '天', label: '平均匹配', en: 'Avg. Match Time', icon: <Clock size={22} /> },
            ].map((s, i) => (
              <div key={i} ref={s.ref} className="group">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition group-hover:bg-white/30">
                  {s.icon}
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight">{s.count}{s.suffix}</div>
                <div className="text-sm font-bold mt-1">{s.label}</div>
                <div className="text-[10px] opacity-60">{s.en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          关于我们 · ABOUT
          ═══════════════════════════════════════════════ */}
      <section id="about" className="bg-white scroll-mt-20">
        <div ref={fadeAbout} className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">ABOUT US</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">孩子的学业需要，就是我们的追求</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
          </div>

          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-5 text-slate-600 leading-relaxed">
              <p className="text-lg">
                很多家长带孩子来到新加坡后发现：<strong className="text-slate-800">课程体系不一样、考试方式不一样、英文要求更高了</strong>。
              </p>
              <p>
                孩子在国内成绩很好，到了新加坡却突然跟不上——这让家长非常焦虑。
              </p>
              <p className="text-lg font-medium text-emerald-700 bg-emerald-50 rounded-xl px-5 py-4 border-l-4 border-emerald-400">
                "我们理解这种焦虑。因为我们每天都在帮助这样的家庭。"
              </p>
              <p>
                Integrated Learnings 的做法很简单：<strong className="text-slate-800">先诊断，再推荐</strong>。
                我们会先了解孩子目前的学业水平、学习习惯和薄弱环节，然后推荐最适合的导师和学习方案——不是随便派一个老师，
                而是找到<strong className="text-slate-800">真正适合您孩子的那一位</strong>。
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-sky-50 p-8 border border-emerald-100 shadow-lg shadow-emerald-50">
              <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-lg">
                <Sparkles size={22} className="text-emerald-500" />
                我们的特点
              </h3>
              <div className="space-y-3">
                {[
                  { text: '不是留学中介，专注学业提升', en: 'Academic support, not recruitment' },
                  { text: '本地注册，新加坡认证教师', en: 'MOE-certified educators' },
                  { text: '诊断式教学——先找问题，再解决', en: 'Assessment-first teaching' },
                  { text: '一对一匹配，教学风格也要对', en: 'Personality-matched tutoring' },
                  { text: '中英双语沟通，家长无障碍', en: 'Bilingual support (中/EN)' },
                  { text: '无隐藏费用，灵活合约', en: 'Transparent pricing' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-500 group-hover:scale-110 transition" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">{item.text}</span>
                      <span className="ml-2 text-[10px] text-slate-400">{item.en}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          常见挑战 · PAIN POINTS
          ═══════════════════════════════════════════════ */}
      <section id="challenges" className="bg-gradient-to-b from-slate-50 to-white scroll-mt-20">
        <div ref={fadePain} className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">CHALLENGES</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">来新加坡读书，这些问题您遇到了吗？</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: '📚', title: '课程体系完全不同', desc: 'MOE、IB、IGCSE与人教版/北师大版差异很大。数学内容相似但解题思路不同，科学术语全是英文。', color: 'from-red-50 to-white hover:border-red-200' },
              { emoji: '🗣️', title: '学术英语跟不上', desc: '日常英语能应付，但课堂讨论、审题、论文写作需要学术英语——很多孩子"听得懂但答不好"。', color: 'from-amber-50 to-white hover:border-amber-200' },
              { emoji: '📝', title: '考试方式大不同', desc: '新加坡重视应用能力和批判性思维。死记硬背行不通。PSLE、O/A-Level都有独特策略。', color: 'from-blue-50 to-white hover:border-blue-200' },
              { emoji: '😰', title: '自信心受打击', desc: '在国内一直是好学生，来新加坡后成绩下降——对自信心和学习动力是很大的打击。', color: 'from-purple-50 to-white hover:border-purple-200' },
              { emoji: '📊', title: '各科进度不均衡', desc: '数学可能超前，但英文和人文科目严重落后。需要针对性计划，不能"全面撒网"。', color: 'from-emerald-50 to-white hover:border-emerald-200' },
              { emoji: '🎯', title: '升学路径不清晰', desc: 'PSLE分流、O-Level选科、JC还是Poly——家长很难帮孩子做正确的升学规划。', color: 'from-sky-50 to-white hover:border-sky-200' },
            ].map((item, idx) => (
              <div key={idx} className={`group rounded-2xl border border-slate-100 bg-gradient-to-br ${item.color} p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm group-hover:scale-110 transition">{item.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          服务内容 · SERVICES
          ═══════════════════════════════════════════════ */}
      <section id="services" className="bg-white scroll-mt-20">
        <div ref={fadeService} className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">OUR SERVICES</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">我们能帮孩子做什么</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
            <p className="mt-5 text-slate-600 max-w-2xl mx-auto">
              不仅仅是"找一个老师"。每位学生先经过学业诊断，再制定个性化学习方案。
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: <BookOpen className="text-white" size={24} />,
                gradient: 'from-emerald-500 to-emerald-600',
                title: '课程衔接辅导',
                titleEn: 'Syllabus Bridging',
                desc: '从中国课程过渡到MOE、IB或IGCSE体系。填补知识空白，适应新的学习方式和评估标准。',
                highlight: '适合刚到新加坡的学生',
              },
              {
                icon: <Target className="text-white" size={24} />,
                gradient: 'from-sky-500 to-sky-600',
                title: '一对一学科辅导',
                titleEn: '1-to-1 Subject Tutoring',
                desc: '英文、数学、科学、华文——由了解国际学生需求的教师一对一授课，按实际水平和目标量身定制。',
                highlight: '最受欢迎',
              },
              {
                icon: <ClipboardList className="text-white" size={24} />,
                gradient: 'from-amber-500 to-amber-600',
                title: '考试备战',
                titleEn: 'Exam Preparation',
                desc: '针对PSLE、O/A-Level、IB、IGCSE考试，提供模拟考试、技巧训练和历年真题分析。',
                highlight: '考前3-6个月开始',
              },
              {
                icon: <Brain className="text-white" size={24} />,
                gradient: 'from-purple-500 to-purple-600',
                title: '学习策略指导',
                titleEn: 'Study Strategy',
                desc: '建立高效学习习惯、时间管理和应试心态。特别适合从"被动学习"转变为"主动学习"的学生。',
                highlight: '终身受益',
              },
            ].map((item, idx) => (
              <div key={idx} className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                {/* Hover gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} transition-all duration-300 group-hover:h-1.5`} />

                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 rounded-xl bg-gradient-to-br ${item.gradient} p-3 shadow-lg`}>{item.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">{item.highlight}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.titleEn}</p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          对比 · COMPARISON (unique — Raintree55 has nothing like this)
          ═══════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div ref={fadeCompare} className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">WHY US</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">我们 vs 普通补习</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
          </div>

          <div className="overflow-hidden rounded-2xl border border-emerald-200 shadow-lg bg-white">
            <div className="grid grid-cols-3 text-center font-bold text-sm">
              <div className="bg-slate-50 p-4 text-slate-600 border-b border-r border-slate-200" />
              <div className="bg-emerald-600 p-4 text-white border-b">✨ Integrated Learnings</div>
              <div className="bg-slate-100 p-4 text-slate-500 border-b">普通补习中心</div>
            </div>
            {[
              { feature: '学业诊断', us: true, them: false },
              { feature: '一对一匹配导师', us: true, them: false },
              { feature: '了解国际生需求', us: true, them: false },
              { feature: '中文沟通支持', us: true, them: false },
              { feature: '课程衔接规划', us: true, them: false },
              { feature: '免费更换教师', us: true, them: false },
              { feature: '灵活合约/无锁定', us: true, them: false },
              { feature: '升学路径建议', us: true, them: false },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-center text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} border-b border-slate-100 last:border-0`}>
                <div className="p-3.5 text-left font-medium text-slate-700 border-r border-slate-100">{row.feature}</div>
                <div className="p-3.5 flex items-center justify-center">
                  <Check size={18} className="text-emerald-500" />
                </div>
                <div className="p-3.5 flex items-center justify-center">
                  <X size={18} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          服务流程 · HOW IT WORKS — visual timeline
          ═══════════════════════════════════════════════ */}
      <section className="bg-white">
        <div ref={fadeSteps} className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">HOW IT WORKS</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">简单三步，开始学业提升之旅</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
          </div>

          <div className="relative">
            {/* Connecting gradient line */}
            <div className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-0.5 -translate-x-1/2 bg-gradient-to-b from-emerald-400 via-sky-400 to-purple-400 sm:block" />

            <div className="grid gap-10 sm:grid-cols-3">
              {[
                { step: '01', title: '提交咨询', titleEn: 'Submit Inquiry', desc: '填写表格或WhatsApp联系。请告诉我们孩子的年级、学校类型和需要帮助的科目。', icon: '📋', color: 'from-emerald-400 to-emerald-500' },
                { step: '02', title: '学业诊断', titleEn: 'Assessment', desc: '顾问会评估孩子的学业水平、学习风格和薄弱环节，制定个性化辅导方案。', icon: '🔬', color: 'from-sky-400 to-sky-500' },
                { step: '03', title: '匹配导师', titleEn: 'Matching', desc: '根据诊断结果推荐最合适的教师——专业对口、教学风格也要与孩子性格匹配。', icon: '🤝', color: 'from-purple-400 to-purple-500' },
              ].map((item) => (
                <div key={item.step} className="relative text-center group">
                  <div className={`relative z-10 mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${item.color} text-3xl shadow-xl transition group-hover:scale-110 group-hover:shadow-2xl`}>
                    {item.icon}
                  </div>
                  <div className="mb-1 text-xs font-black tracking-widest text-emerald-600">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 mb-3">{item.titleEn}</p>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 p-6 text-center text-white shadow-lg">
            <p className="text-base font-bold">
              ✨ 整个过程完全免费 · 不满意随时终止 · 找到真正适合孩子的方案
            </p>
            <p className="text-xs mt-1 opacity-80">Free consultation · No commitment · Personalized for your child</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          家长心声 · TESTIMONIALS (Raintree55 only has student stories)
          ═══════════════════════════════════════════════ */}
      <section id="testimonials" className="bg-gradient-to-b from-slate-50 to-white scroll-mt-20">
        <div ref={fadeTestimonial} className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">PARENT VOICES</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">来听听家长怎么说</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: '孩子刚转到MOE学校时，英文和科学完全跟不上。IL的老师用了一个月帮他把基础补上来了，现在已经能跟上课堂节奏。最重要的是孩子重拾了自信！',
                parent: '王女士',
                child: '儿子，Sec 2',
                from: '上海',
                stars: 5,
              },
              {
                quote: '我们试过好几个补习中心，都不了解中国学生的情况。IL的顾问第一次沟通就说出了我女儿的核心问题——不是不聪明，是学术英语的表达方式不一样。现在数学成绩从C到A了！',
                parent: '陈先生',
                child: '女儿，P5',
                from: '北京',
                stars: 5,
              },
              {
                quote: '用中文就能和顾问沟通太方便了！不用担心表达不清楚。老师也很有耐心，我儿子说"终于遇到一个能听懂我问题的老师了"。',
                parent: '李女士',
                child: '儿子，Sec 4',
                from: '广州',
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 text-sm font-bold text-emerald-700">
                    {t.parent[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.parent}</p>
                    <p className="text-xs text-slate-400">来自{t.from} · {t.child}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FAQ — interactive accordion
          ═══════════════════════════════════════════════ */}
      <section className="bg-white">
        <div ref={fadeFaq} className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">您可能想问的问题</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
          </div>

          <div className="space-y-3">
            <FaqItem q="你们是留学中介吗？" a="不是。我们专注于为已经在新加坡就读的学生提供学业辅导。我们不办理留学申请或签证。" />
            <FaqItem q="老师是什么背景？" a="我们的教师都是经过认证的新加坡本地教育者，熟悉MOE课程、IB和IGCSE体系，并且有辅导国际学生的经验。" />
            <FaqItem q="可以用中文沟通吗？" a="当然可以！顾问团队支持中英双语沟通。您可以用中文和我们讨论孩子的情况，我们会帮您安排一切。" />
            <FaqItem q="费用怎么算？" a="咨询和学业诊断完全免费。辅导费用根据年级和科目透明收费，无隐藏费用，合约灵活可随时终止。" />
            <FaqItem q="多快可以开始上课？" a="提交咨询后，我们通常在3-7天内完成诊断并匹配合适的教师。" />
            <FaqItem q="如果老师不合适怎么办？" a="我们提供免费更换教师服务。在前两节课内如果觉得不合适，可以免费换一位。" />
            <FaqItem q="我的孩子还没到新加坡，可以先咨询吗？" a="可以！我们可以提前评估孩子的学业情况，帮您了解需要准备什么，以便到了新加坡后尽快适应。" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          升学路径 · EDUCATION PATHWAY
          ═══════════════════════════════════════════════ */}
      <section id="pathway" className="bg-gradient-to-b from-sky-50 to-white scroll-mt-20">
        <div ref={fadePathway} className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">EDUCATION PATHWAY</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">新加坡教育体系简介</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
            <p className="mt-5 text-slate-600 max-w-2xl mx-auto">
              了解升学路径，才能帮孩子做出正确的选择。我们的顾问可以帮您梳理最适合的路线。
            </p>
          </div>

          {/* Visual pathway with connecting arrows */}
          <div className="relative">
            <div className="absolute left-[50%] top-0 bottom-0 hidden w-0.5 bg-gradient-to-b from-emerald-300 via-sky-300 to-purple-300 lg:block" />

            <div className="grid gap-6 lg:grid-cols-2">
              {[
                { level: '小学', levelEn: 'Primary (P1-P6)', exam: 'PSLE', desc: '六年制，P6参加PSLE考试。成绩决定中学分流。国际学生通常通过AEIS考试入学。', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
                { level: '中学', levelEn: 'Secondary (Sec 1-4/5)', exam: 'O-Level', desc: '4-5年。Sec 4参加O-Level考试，决定升JC还是Poly。关键的分水岭。', gradient: 'from-sky-500 to-sky-600', bg: 'bg-sky-50 border-sky-200' },
                { level: '初级学院', levelEn: 'Junior College (JC1-2)', exam: 'A-Level', desc: '两年制大学预科。A-Level考试难度高，需要针对性备考策略。目标大学的主要路线。', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 border-amber-200' },
                { level: '理工学院', levelEn: 'Polytechnic (3 years)', exam: 'Diploma', desc: '三年制文凭课程，注重实践。毕业后可工作或申请大学。适合有明确职业方向的学生。', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 border-purple-200' },
              ].map((item, idx) => (
                <div key={idx} className={`group relative rounded-2xl border p-6 ${item.bg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white text-sm font-black shadow`}>
                        {idx + 1}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{item.level}</h3>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{item.exam}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{item.levelEn}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <a href="#inquiry-form" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 font-bold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5">
              <Zap size={18} />
              不确定？免费咨询顾问帮您分析
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          咨询表 · INQUIRY FORM
          ═══════════════════════════════════════════════ */}
      <section id="inquiry-form" className="relative overflow-hidden scroll-mt-20">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-50" />
        <div className="absolute -top-32 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-200/20 blur-3xl" />

        <div ref={fadeForm} className="relative mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">FREE CONSULTATION</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-slate-900">开始您的免费学业咨询</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
            <p className="mt-5 text-slate-600">
              填写以下表格，顾问将在1-2个工作日内用中文或英文联系您。
            </p>
            <div className="mt-3 inline-flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400" />无需账户</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400" />完全免费</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400" />中英双语</span>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200/60 bg-white/80 backdrop-blur-xl p-6 shadow-2xl shadow-emerald-100/30 md:p-8">
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 px-5 py-4">
              <p className="text-sm text-emerald-800 leading-relaxed">
                <strong>💡 温馨提示：</strong>在"补充说明"中请注明以下信息：
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

      {/* ═══════════════════════════════════════════════
          联系方式 · FOOTER
          ═══════════════════════════════════════════════ */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3 items-start">
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
                让每一个来新加坡读书的孩子都能获得适合自己的学习支持。
              </p>
            </div>

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
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} Integrated Learnings Singapore. All rights reserved.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FLOATING WHATSAPP CTA (always visible)
          ═══════════════════════════════════════════════ */}
      <a
        href="https://wa.me/6598882675"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-3xl group"
        aria-label="WhatsApp 中文咨询"
      >
        {/* Ping ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" />
        <span className="relative flex items-center gap-2">
          <Phone size={20} className="fill-current" />
          <span className="hidden sm:inline text-sm">中文咨询</span>
        </span>
      </a>
    </div>
  );
};

export default InternationalStudents;