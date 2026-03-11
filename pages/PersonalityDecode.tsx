import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   NUMEROLOGY ENGINE — Pure math, no API needed
   ═══════════════════════════════════════════════════════ */

/** Reduce a number to a single digit (1-9) */
function reduceToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n || 9; // treat 0 as 9
}

/** Calculate Life Path Number from date string "YYYY-MM-DD" */
function lifePathNumber(dob: string): number {
  const digits = dob.replace(/-/g, '').split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceToSingle(sum);
}

/** Build the numerology triangle rows from birthday digits */
function buildTriangle(dob: string): number[][] {
  const digits = dob.replace(/-/g, '').split('').map(Number);
  const rows: number[][] = [digits];
  let current = digits;
  while (current.length > 1) {
    const next: number[] = [];
    for (let i = 0; i < current.length - 1; i++) {
      next.push(reduceToSingle(current[i] + current[i + 1]));
    }
    rows.push(next);
    current = next;
  }
  return rows;
}

/** Pythagorean letter-to-number mapping */
function letterToNumber(ch: string): number {
  const map: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  return map[ch.toLowerCase()] || 0;
}

/** Calculate name number from pinyin */
function nameNumber(name: string): number {
  const sum = name.split('').reduce((s, ch) => s + letterToNumber(ch), 0);
  return reduceToSingle(sum);
}

/* ═══════════════════════════════════════════════════════
   PERSONALITY DATA — Pre-written descriptions per number
   ═══════════════════════════════════════════════════════ */

interface PersonalityProfile {
  title: string;
  titleEn: string;
  emoji: string;
  color: string;
  core: string;
  strengths: string[];
  learningStyle: string;
  learningTips: string[];
  idealTutor: string;
  growthArea: string;
}

const PROFILES: Record<number, PersonalityProfile> = {
  1: {
    title: '领导者',
    titleEn: 'The Leader',
    emoji: '👑',
    color: 'from-red-500 to-orange-500',
    core: '天生的领导者。独立、自信、有决断力。喜欢掌控局面，不喜欢被他人指挥。有强烈的个人意志和创造力，常常是团队中第一个提出新想法的人。',
    strengths: ['独立自主', '目标明确', '创新思维', '执行力强'],
    learningStyle: '喜欢自主学习，不愿意被过度管束。需要理解"为什么要学"才能投入。在竞争环境中容易被激发动力。喜欢挑战性的题目，对重复练习容易失去耐心。',
    learningTips: ['给予适度自主权，让孩子参与学习计划的制定', '设定有挑战性的目标，激发竞争意识', '避免过度重复的练习方式，注重深度而非广度', '鼓励领导力，比如让孩子给同学讲解题目'],
    idealTutor: '需要一位尊重其独立性、能提出挑战性问题的导师。过于严格控制型的老师可能引起反感。',
    growthArea: '需要学习倾听他人、接受不同意见。有时候过于自信可能忽略细节。',
  },
  2: {
    title: '协调者',
    titleEn: 'The Diplomat',
    emoji: '🤝',
    color: 'from-blue-500 to-cyan-500',
    core: '天生的协调者。温和、细心、善于察觉他人的情绪。重视和谐的关系，是优秀的倾听者和合作伙伴。在团队中常常是默默支持大家的角色。',
    strengths: ['共情能力强', '善于合作', '注重细节', '耐心温和'],
    learningStyle: '在温暖、低压力的环境中学习效果最好。需要老师的鼓励和肯定。小组学习比独立学习更有动力。对批评比较敏感，容易因为一次不好的成绩而丧失信心。',
    learningTips: ['创造安全、鼓励性的学习氛围', '多给正面反馈，少用批评方式', '可以安排学习伙伴，利用社交动力', '帮助建立抗挫折能力，学会从错误中学习'],
    idealTutor: '需要一位温和、有耐心、善于鼓励的导师。严厉型老师会严重影响其学习积极性。',
    growthArea: '需要增强自信，学会独立思考和表达自己的观点，减少对他人认可的依赖。',
  },
  3: {
    title: '表达者',
    titleEn: 'The Communicator',
    emoji: '🎨',
    color: 'from-yellow-500 to-amber-500',
    core: '天生的表达者。活泼、有创造力、善于沟通。想象力丰富，喜欢用各种方式表达自己。在社交场合如鱼得水，总能给周围人带来快乐。',
    strengths: ['创造力强', '表达能力佳', '乐观积极', '想象力丰富'],
    learningStyle: '需要多样化的学习方式，纯粹的死记硬背会让他们痛苦。通过故事、图像、讨论等方式学习效果更好。注意力容易分散，需要有趣的学习内容来保持专注。',
    learningTips: ['用故事化、视觉化的方式教学', '允许多种表达方式（画图、口述、表演等）', '将学习内容与现实生活联系起来', '适当控制社交活动，保证专注学习时间'],
    idealTutor: '需要一位有趣、互动性强、教学方式多样化的导师。照本宣科的教学方式会让他们迅速走神。',
    growthArea: '需要学习自律和专注力。有时候想法太多但执行不够，需要帮助他们将创意落地。',
  },
  4: {
    title: '建造者',
    titleEn: 'The Builder',
    emoji: '🏗️',
    color: 'from-green-600 to-emerald-500',
    core: '天生的建造者。务实、有条理、注重细节。做事脚踏实地，喜欢有明确的计划和步骤。是最可靠的执行者，承诺的事情一定会完成。',
    strengths: ['做事有条理', '踏实可靠', '注重细节', '坚持不懈'],
    learningStyle: '喜欢结构化的学习方式。需要明确的学习计划、清晰的步骤和可衡量的目标。按部就班地学习时效果最好。不喜欢突然改变计划，对模糊的指令会感到不安。',
    learningTips: ['制定详细的学习计划和时间表', '把大目标拆分成小步骤，逐一完成', '提供清晰的评分标准和学习框架', '适当鼓励灵活思维，接受"没有标准答案"的情况'],
    idealTutor: '需要一位有条理、教学步骤清晰、能提供系统化学习方案的导师。随意、无计划的教学方式会让他们焦虑。',
    growthArea: '需要学习更灵活的思维方式。过于固执可能会错过创新解决方案。学会接受不确定性。',
  },
  5: {
    title: '探索者',
    titleEn: 'The Explorer',
    emoji: '🌍',
    color: 'from-purple-500 to-violet-500',
    core: '天生的探索者。好奇、爱自由、适应力强。喜欢新鲜事物和变化，不喜欢被限制。学习新技能的速度很快，但如果觉得无聊就会迅速转移注意力。',
    strengths: ['适应力强', '好奇心旺盛', '多才多艺', '学习速度快'],
    learningStyle: '需要不断有新鲜感的学习体验。同一种教学方式连续用太久就会厌倦。喜欢动手实践、实地考察、实验等体验式学习。容易同时对多件事感兴趣，但难以深入坚持。',
    learningTips: ['频繁变换学习方式和环境', '多安排实践性、体验式学习活动', '帮助建立"先深入一件事再换"的习惯', '利用多感官学习：读、写、听、做结合'],
    idealTutor: '需要一位教学方式灵活多变、善于创新的导师。一成不变的教学模式是最大的障碍。',
    growthArea: '需要学习坚持和深入。浅尝辄止是最大的挑战。帮助他们找到真正热爱的领域并深耕。',
  },
  6: {
    title: '守护者',
    titleEn: 'The Nurturer',
    emoji: '💝',
    color: 'from-pink-500 to-rose-500',
    core: '天生的守护者。有责任感、关爱他人、追求和谐。家庭观念很强，对朋友忠诚。天生有照顾他人的倾向，常常是班级里帮助同学的那个人。',
    strengths: ['责任心强', '善良有爱', '值得信赖', '追求完美'],
    learningStyle: '在感受到被关心和支持的环境中学习最好。学习动力常常来自"不想让父母/老师失望"。喜欢帮助同学，在教他人的过程中自己也能加深理解。有完美主义倾向，可能花过多时间在一个问题上。',
    learningTips: ['让孩子知道"尽力就好"，减少完美主义压力', '安排教学相长的机会（辅导弟妹或同学）', '在学业和休息之间建立平衡', '注意孩子是否因太在意他人而忽略自身需求'],
    idealTutor: '需要一位有温度、真诚关心学生的导师。建立信任关系后，学习效果会大幅提升。',
    growthArea: '需要学会把自己的需求放在优先位置。避免过度承担他人的问题而忽略自己的学习。',
  },
  7: {
    title: '思考者',
    titleEn: 'The Thinker',
    emoji: '🔬',
    color: 'from-indigo-500 to-blue-600',
    core: '天生的思考者。善于分析、追求真理、独立思考。喜欢深入研究问题的本质，不满足于表面的答案。是班级里提出"为什么"最多的那个学生。',
    strengths: ['分析能力强', '独立思考', '追求深度', '逻辑严密'],
    learningStyle: '需要理解原理才能真正记住。死记硬背对这类孩子几乎无效。喜欢安静的学习环境，需要时间独处思考。在深度学习方面表现出色，但可能在需要快速反应的考试中吃亏。',
    learningTips: ['教学时多解释"为什么"，不要只告诉"怎么做"', '允许孩子有独处和安静思考的时间', '提供深度阅读和研究性学习材料', '练习考试时间管理，提高答题速度'],
    idealTutor: '需要一位学识渊博、能深入讲解原理的导师。浮于表面的教学无法满足他们的求知欲。',
    growthArea: '需要学习社交技能和表达自己的想法。有时候过于追求完美的理解反而影响效率。',
  },
  8: {
    title: '成就者',
    titleEn: 'The Achiever',
    emoji: '🏆',
    color: 'from-amber-600 to-yellow-500',
    core: '天生的成就者。目标导向、有野心、注重结果。喜欢挑战和竞争，对成功有强烈的渴望。在学业上往往表现出色，因为他们清楚知道自己想要什么。',
    strengths: ['目标导向', '意志坚强', '组织能力强', '自我驱动'],
    learningStyle: '被目标和成就感驱动。需要明确看到学习与未来成功之间的联系。在排名和竞赛中表现出色。可能过于关注结果（成绩）而忽视学习过程本身的乐趣。',
    learningTips: ['设定明确的短期和长期学习目标', '帮助建立学业目标与人生规划的联系', '适当参加学术竞赛，激发潜力', '引导关注学习过程，不仅仅是分数'],
    idealTutor: '需要一位能帮助设定高目标并有策略地实现的导师。太过温和可能让他们觉得没有挑战。',
    growthArea: '需要学习享受过程，而不仅仅关注结果。过度的压力可能导致焦虑和倦怠。',
  },
  9: {
    title: '理想者',
    titleEn: 'The Idealist',
    emoji: '🌟',
    color: 'from-teal-500 to-emerald-500',
    core: '天生的理想者。富有同情心、胸怀宽广、有人道主义精神。关心世界和社会问题，有着"让世界变得更好"的愿望。在人文学科和艺术方面往往有独特天赋。',
    strengths: ['同理心强', '视野宽广', '直觉敏锐', '富有激情'],
    learningStyle: '学习动力来自内在意义感。需要理解"学这个对世界有什么用"。在人文、社会科学、艺术等领域自然表现出色。对纯粹实用性的学科（如数学公式）可能缺乏兴趣。',
    learningTips: ['将学习内容与社会意义联系起来', '鼓励参与社区服务和公益活动', '在理科学习中融入现实应用场景', '帮助将理想主义转化为具体行动计划'],
    idealTutor: '需要一位有教育理想、能启发思考的导师。纯应试技巧的教学无法点燃他们的热情。',
    growthArea: '需要学习平衡理想与现实。有时候过于理想化可能导致对现实的失望和不切实际的期望。',
  },
};

/** Name analysis descriptions */
const NAME_ANALYSIS: Record<number, { verdict: string; detail: string }> = {
  1: { verdict: '名字蕴含独立与领导力', detail: '您的名字数字能量倾向于独立和创新。这个名字赋予孩子勇于开拓的精神，适合走自己独特的道路。' },
  2: { verdict: '名字蕴含合作与平衡', detail: '您的名字数字带有和谐的能量。这个名字帮助孩子在人际关系中找到平衡，善于与他人合作共赢。' },
  3: { verdict: '名字蕴含创意与表达', detail: '您的名字数字充满创造力。这个名字给予孩子丰富的想象力和表达能力，适合在艺术和沟通领域发展。' },
  4: { verdict: '名字蕴含稳定与务实', detail: '您的名字数字注重根基。这个名字赋予孩子脚踏实地的品质，做事有条理、有计划，值得信赖。' },
  5: { verdict: '名字蕴含自由与变化', detail: '您的名字数字充满活力。这个名字赋予孩子对新事物的好奇心和适应力，适合在多元环境中成长。' },
  6: { verdict: '名字蕴含关爱与责任', detail: '您的名字数字带有温暖的能量。这个名字赋予孩子强烈的责任感和关爱之心，天生的守护者。' },
  7: { verdict: '名字蕴含智慧与探索', detail: '您的名字数字指向深度思考。这个名字赋予孩子追求真理的精神，善于分析和独立思考。' },
  8: { verdict: '名字蕴含力量与成就', detail: '您的名字数字充满力量。这个名字赋予孩子追求成功的驱动力，善于规划目标并付诸行动。' },
  9: { verdict: '名字蕴含理想与包容', detail: '您的名字数字带有人文能量。这个名字赋予孩子宽广的视野和对世界的关怀，富有同情心。' },
};

/* ═══════════════════════════════════════════════════════
   TRIANGLE VISUALISATION COMPONENT
   ═══════════════════════════════════════════════════════ */

const NumerologyTriangle: React.FC<{ rows: number[][]; visible: boolean }> = ({ rows, visible }) => {
  if (!visible || rows.length === 0) return null;
  return (
    <div className="flex flex-col items-center gap-1.5 py-4">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1.5 justify-center" style={{ animationDelay: `${ri * 100}ms` }}>
          {row.map((digit, di) => (
            <div
              key={di}
              className={`flex items-center justify-center rounded-lg font-bold text-sm transition-all duration-500
                ${ri === rows.length - 1
                  ? 'w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 scale-110'
                  : ri === 0
                    ? 'w-8 h-8 bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'w-8 h-8 bg-white text-slate-700 border border-slate-200 shadow-sm'
                }`}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: `${(ri * row.length + di) * 30}ms`,
              }}
            >
              {digit}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════ */

const PersonalityDecode: React.FC = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<{
    lifePath: number;
    nameNum: number;
    triangle: number[][];
    profile: PersonalityProfile;
    nameAnalysis: { verdict: string; detail: string };
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!name.trim() || !dob) return;

    const lp = lifePathNumber(dob);
    const nn = nameNumber(name.trim());
    const tri = buildTriangle(dob);

    setResult({
      lifePath: lp,
      nameNum: nn,
      triangle: tri,
      profile: PROFILES[lp],
      nameAnalysis: NAME_ANALYSIS[nn],
    });
    setShowResult(false);

    // Animate in after a brief delay
    setTimeout(() => {
      setShowResult(true);
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleReset = () => {
    setResult(null);
    setShowResult(false);
    setName('');
    setDob('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">

      {/* ──── Floating particles background ──── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/10"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.5; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* ──── HERO / INPUT ──── */}
      <section className="relative z-10">
        <div className="mx-auto max-w-3xl px-4 pt-20 pb-12 sm:px-6 text-center">
          {/* Back link */}
          <Link to="/zh" className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition mb-8">
            ← 返回中文主页
          </Link>

          <div className="mb-3">
            <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold text-emerald-400 tracking-widest">
              ✨ 性格解码 · Personality Decode
            </span>
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl leading-tight">
            发现孩子的<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              天赋密码
            </span>
          </h1>
          <p className="mt-4 text-slate-400 leading-relaxed max-w-xl mx-auto">
            基于生命灵数（Numerology）分析，通过姓名和生日解码孩子的核心性格、学习风格和天赋方向。
            了解孩子的性格特点，才能找到最适合的学习方式。
          </p>
          <p className="mt-2 text-xs text-slate-500">
            注意：该结果基于数字能量学的统计分析，仅供参考，不代表绝对定论。每个孩子都是独特的。
          </p>

          {/* ──── INPUT FORM ──── */}
          <div className="mt-10 mx-auto max-w-md">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/80 backdrop-blur-sm p-6 shadow-2xl shadow-black/30">
              <div className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wide">姓名拼音 · Name in Pinyin</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                    placeholder="例如：Zhang Xiaoming"
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wide">出生日期 · Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-xl border border-slate-600 bg-slate-700/50 px-4 py-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition outline-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim() || !dob}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  开始解码
                </button>
              </div>
              <p className="mt-3 text-[10px] text-slate-500 text-center">
                您的信息仅用于即时计算，不会被存储或发送到任何服务器。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── RESULTS ──── */}
      {result && (
        <section ref={resultRef} className="relative z-10 pb-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">

            {/* Life Path Number — Hero card */}
            <div
              className={`rounded-3xl border border-slate-700 bg-slate-800/80 backdrop-blur-sm p-8 shadow-2xl shadow-black/30 text-center transition-all duration-700 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p className="text-xs font-bold text-emerald-400 tracking-widest mb-4">生命灵数 · LIFE PATH NUMBER</p>
              <div className={`mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br ${result.profile.color} flex items-center justify-center text-5xl font-black text-white shadow-lg mb-4`}>
                {result.lifePath}
              </div>
              <div className="text-3xl mb-1">{result.profile.emoji}</div>
              <h2 className="text-2xl font-black text-white">{result.profile.title}</h2>
              <p className="text-sm text-slate-400">{result.profile.titleEn}</p>
              <p className="mt-4 text-slate-300 leading-relaxed text-sm max-w-lg mx-auto">{result.profile.core}</p>

              {/* Strengths tags */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {result.profile.strengths.map((s, i) => (
                  <span key={i} className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 text-xs font-medium text-emerald-400">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Numerology Triangle */}
            <div
              className={`mt-6 rounded-2xl border border-slate-700 bg-slate-800/80 backdrop-blur-sm p-6 shadow-xl text-center transition-all duration-700 delay-200 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p className="text-xs font-bold text-emerald-400 tracking-widest mb-2">数字能量三角 · NUMEROLOGY TRIANGLE</p>
              <p className="text-xs text-slate-500 mb-2">由生日数字逐层相加推导，底部数字为生命灵数</p>
              <NumerologyTriangle rows={result.triangle} visible={showResult} />
            </div>

            {/* Name Analysis */}
            <div
              className={`mt-6 rounded-2xl border border-slate-700 bg-slate-800/80 backdrop-blur-sm p-6 shadow-xl transition-all duration-700 delay-300 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <p className="text-xs font-bold text-emerald-400 tracking-widest mb-3">姓名能量分析 · NAME ANALYSIS</p>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                  {result.nameNum}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white text-sm">{result.nameAnalysis.verdict}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mt-1">{result.nameAnalysis.detail}</p>
                </div>
              </div>
            </div>

            {/* Learning Style — THE KEY EDUCATIONAL TIE-IN */}
            <div
              className={`mt-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/30 to-slate-800/80 backdrop-blur-sm p-6 shadow-xl transition-all duration-700 delay-400 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-emerald-400" />
                <p className="text-xs font-bold text-emerald-400 tracking-widest">学习风格分析 · LEARNING STYLE</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{result.profile.learningStyle}</p>

              <h4 className="text-xs font-bold text-slate-400 tracking-wide mb-2">📝 给家长的建议</h4>
              <div className="space-y-2">
                {result.profile.learningTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <p className="text-sm text-slate-300">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-slate-800/80 border border-slate-700 p-4">
                <h4 className="text-xs font-bold text-amber-400 tracking-wide mb-1">🎯 最适合的导师类型</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{result.profile.idealTutor}</p>
              </div>

              <div className="mt-3 rounded-xl bg-slate-800/80 border border-slate-700 p-4">
                <h4 className="text-xs font-bold text-sky-400 tracking-wide mb-1">🌱 成长方向</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{result.profile.growthArea}</p>
              </div>
            </div>

            {/* CTA — Lead capture */}
            <div
              className={`mt-8 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center shadow-2xl shadow-emerald-500/20 transition-all duration-700 delay-500 ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <h3 className="text-xl font-black text-white mb-2">根据孩子的性格，匹配最合适的导师</h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed max-w-md mx-auto mb-6">
                每个孩子的学习风格不同，需要的教学方式也不同。我们会根据学生的性格特点，推荐教学风格最匹配的导师。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/zh#inquiry-form"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-emerald-700 shadow-lg transition hover:-translate-y-0.5"
                >
                  免费学业咨询
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="https://wa.me/6598882675"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 font-bold text-white transition hover:bg-white/10"
                >
                  WhatsApp 联系我们
                </a>
              </div>
            </div>

            {/* Reset button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-400 transition"
              >
                <RefreshCw size={14} />
                重新测试
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ──── FOOTER ──── */}
      <footer className="relative z-10 border-t border-slate-800 py-8 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-xs text-slate-500">
            性格解码基于生命灵数（Pythagorean Numerology）统计分析。结果仅供参考，每个孩子都是独特的个体。
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-slate-600">
            <Link to="/zh" className="hover:text-emerald-400 transition">中文主页</Link>
            <span>·</span>
            <Link to="/tuition" className="hover:text-emerald-400 transition">Tuition Home</Link>
            <span>·</span>
            <a href="https://wa.me/6598882675" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">WhatsApp</a>
          </div>
          <p className="mt-3 text-[10px] text-slate-700">© {new Date().getFullYear()} Integrated Learnings Singapore</p>
        </div>
      </footer>
    </div>
  );
};

export default PersonalityDecode;
