
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader, Section, Button, RoadmapCard } from '../components/Components';
import { ROADMAP_TOPICS } from '../constants';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';

// --- VISUALIZATION CONSTANTS ---
const CONFIG = {
  w: 1000, // Wide canvas for clear separation
  h: 1400, // Tall canvas for vertical flow
  c: 500,  // Center X
  
  // Colors
  primary: '#64748b', // Slate 500
  express: '#1e40af', // Blue 800
  normal: '#059669', // Emerald 600
  tertiary: '#4f46e5', // Indigo 600
};

// --- NODES CONFIGURATION ---
const NODES = {
  // PHASE 1: PRIMARY
  pStart: { x: 500, y: 60, title: "Primary 1 - 3", id: 'primary', color: 'bg-slate-400' },
  pStd: { x: 380, y: 160, title: "Standard", sub: "P4-P6", id: 'primary', color: 'bg-blue-600' },
  pFdn: { x: 620, y: 160, title: "Foundation", sub: "P4-P6", id: 'primary', color: 'bg-emerald-500' },
  psle: { x: 500, y: 280, title: "PSLE", sub: "National Exam", id: 'psle', color: 'bg-slate-800', main: true },
  
  // PHASE 2: SECONDARY SPLIT (Wide Separation)
  secExp: { x: 200, y: 450, title: "G3 (Express)", sub: "Sec 1-4", id: 'secondary', color: 'bg-blue-700' },
  secNorm: { x: 800, y: 450, title: "G2 / G1 (Normal)", sub: "Sec 1-4", id: 'secondary', color: 'bg-emerald-600' },
  
  // PHASE 3: EXAMS
  nLevel: { x: 800, y: 600, title: "N-Levels", sub: "Sec 4 Exam", id: 'secondary', color: 'bg-emerald-700', main: true },
  
  // THE BRIDGE: SEC 5 (Center)
  sec5: { x: 500, y: 675, title: "Sec 5", sub: "G2 Bridge", id: 'secondary', color: 'bg-emerald-600', small: true },
  
  // MAIN O-LEVEL NODE (Left)
  oLevel: { x: 200, y: 750, title: "O-Levels", sub: "Sec 4/5 Exam", id: 'olevel', color: 'bg-blue-800', main: true },
  
  // PHASE 4: ITE TRACK (Right)
  ite: { x: 800, y: 750, title: "ITE Nitec", sub: "2 Years", id: 'postsec', color: 'bg-emerald-800' },
  highNitec: { x: 800, y: 950, title: "Higher Nitec", sub: "Step Up", id: 'postsec', color: 'bg-emerald-800' },
  
  // PHASE 4: TERTIARY HUBS
  jc: { x: 150, y: 1000, title: "Junior College", sub: "A-Levels", id: 'postsec', color: 'bg-indigo-600', main: true },
  poly: { x: 500, y: 1100, title: "Polytechnic", sub: "Diploma", id: 'postsec', color: 'bg-indigo-600', main: true },
  
  // PHASE 5: UNI
  uni: { x: 500, y: 1300, title: "University", sub: "Degree", id: 'postsec', color: 'bg-slate-900', main: true },
};

const MapNode: React.FC<{ 
  node: any; 
}> = ({ node }) => (
  <Link 
    to={`/roadmap/${node.id}`}
    className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition hover:scale-110 z-20 group`}
    style={{ left: node.x, top: node.y }}
  >
    <div className={`
      ${node.small ? 'px-3 py-1 text-xs' : 'px-6 py-2 text-sm'} 
      rounded-full shadow-lg border-2 border-white 
      ${node.color} text-white text-center whitespace-nowrap
      ${node.main ? 'ring-4 ring-blue-50 scale-110 font-bold' : 'font-semibold'}
    `}>
      {node.title}
    </div>
    {node.sub && (
      <div className="bg-white/95 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 mt-1 shadow-sm border border-slate-200">
        {node.sub}
      </div>
    )}
  </Link>
);

const EducationMRTMap: React.FC = () => {
  const [showMobileTimeline, setShowMobileTimeline] = React.useState(true);

  return (
    <div className="relative">
      {/* Mobile/Desktop Toggle */}
      <div className="md:hidden mb-4 flex justify-center gap-2">
        <button 
          onClick={() => setShowMobileTimeline(true)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${showMobileTimeline ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
        >
          Timeline View
        </button>
        <button 
          onClick={() => setShowMobileTimeline(false)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!showMobileTimeline ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}
        >
          Full Map
        </button>
      </div>

      {/* Mobile Timeline View - Enhanced */}
      {showMobileTimeline && (
        <div className="md:hidden space-y-1">
          {/* Primary Foundation */}
          <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-slate-400 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                P1-3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">Primary Foundation</h3>
                <p className="text-xs text-slate-500">Building blocks</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-blue-300"></div></div>

          {/* P4 SPLIT - Branch Indicator */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-200 p-4 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md text-xs">
                P4
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-800">⚡ First Major Split</h3>
                <p className="text-xs text-blue-600">Subject-Based Banding</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 bg-blue-100 border border-blue-300 rounded-lg p-2 text-center">
                <p className="text-xs font-bold text-blue-700">Standard</p>
              </div>
              <div className="flex-1 bg-emerald-100 border border-emerald-300 rounded-lg p-2 text-center">
                <p className="text-xs font-bold text-emerald-700">Foundation</p>
              </div>
            </div>
            <Link to="/roadmap/primary" className="text-xs text-blue-600 font-semibold mt-2 block hover:underline">Learn more →</Link>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-gradient-to-b from-blue-300 to-slate-700"></div></div>

          {/* PSLE - Major Checkpoint */}
          <div className="bg-gradient-to-br from-slate-100 to-white rounded-xl border-2 border-slate-700 p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-slate-300">
                🎯
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">PSLE</h3>
                <p className="text-xs text-slate-600">National Exam • AL Scoring</p>
              </div>
            </div>
            <div className="bg-amber-50 border-l-2 border-amber-400 pl-2 py-1 text-xs text-amber-800 mt-2">
              <strong>Critical:</strong> June hols = intensive revision month
            </div>
            <Link to="/roadmap/psle" className="text-xs text-secondary font-semibold mt-2 block hover:underline">View strategies →</Link>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-gradient-to-b from-slate-700 to-blue-700"></div></div>

          {/* Secondary - Dual Path */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border-2 border-slate-300 p-4 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-700 to-emerald-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md text-xs">
                Sec
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">Secondary School</h3>
                <p className="text-xs text-slate-500">G3 / G2 / G1 streams</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-100 border border-blue-400 rounded-lg p-2">
                <p className="text-xs font-bold text-blue-800 text-center">G3 Express</p>
                <p className="text-[10px] text-blue-600 text-center mt-1">→ O-Levels</p>
              </div>
              <div className="bg-emerald-100 border border-emerald-400 rounded-lg p-2">
                <p className="text-xs font-bold text-emerald-800 text-center">G2/G1 Normal</p>
                <p className="text-[10px] text-emerald-600 text-center mt-1">→ N-Levels first</p>
              </div>
            </div>
            <Link to="/roadmap/secondary" className="text-xs text-secondary font-semibold mt-2 block hover:underline">Understand FSBB →</Link>
          </div>

          <div className="flex justify-center items-center gap-1">
            <div className="w-0.5 h-6 bg-blue-700"></div>
            <span className="text-xs text-slate-400">+</span>
            <div className="w-0.5 h-6 bg-emerald-600"></div>
          </div>

          {/* National Exams */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">National Exams</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                <div className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold">N</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-emerald-800">N-Levels</p>
                  <p className="text-[10px] text-emerald-600">G2/G1 students (Sec 4)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="bg-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-blue-200">O</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-blue-800">O-Levels</p>
                  <p className="text-[10px] text-blue-600">G3 (Sec 4) + G2 (Sec 5)</p>
                </div>
              </div>
            </div>
            <Link to="/roadmap/olevel" className="text-xs text-secondary font-semibold mt-2 block hover:underline">L1R5 strategies →</Link>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-gradient-to-b from-blue-800 to-indigo-600"></div></div>

          {/* Post-Secondary - Triple Path */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border-2 border-indigo-200 p-4 shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                🎓
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-indigo-800">Post-Secondary</h3>
                <p className="text-xs text-indigo-600">Choose your path</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-2">
                <p className="text-xs font-bold text-indigo-900">Junior College (JC)</p>
                <p className="text-[10px] text-indigo-600">2 years → A-Levels → Uni</p>
              </div>
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-2">
                <p className="text-xs font-bold text-purple-900">Polytechnic</p>
                <p className="text-[10px] text-purple-600">3 years → Diploma → Uni/Work</p>
              </div>
              <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-2">
                <p className="text-xs font-bold text-emerald-900">ITE Track</p>
                <p className="text-[10px] text-emerald-600">Nitec → Higher Nitec → Poly</p>
              </div>
            </div>
            <Link to="/roadmap/postsec" className="text-xs text-indigo-600 font-semibold mt-2 block hover:underline">Compare routes →</Link>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-gradient-to-b from-indigo-600 to-slate-900"></div></div>

          {/* Final Destination */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-slate-600 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-slate-500">
                🏛️
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">University</h3>
                <p className="text-xs text-slate-300">All paths converge here</p>
              </div>
            </div>
            <div className="mt-3 bg-slate-700/50 rounded-lg p-2 border border-slate-500">
              <p className="text-[10px] text-slate-200">NUS • NTU • SMU • SUTD • SIT • SUSS</p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Map / Mobile Swipeable Map */}
      <div className={`${showMobileTimeline ? 'hidden md:block' : 'block'}`}>
        <div className="md:hidden mb-2 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-center text-amber-800">
          ← Swipe to explore full map →
        </div>
        <div className="w-full overflow-x-auto pb-8 bg-slate-50 rounded-xl border border-slate-200 shadow-inner">
          <div className="relative mx-auto" style={{ width: CONFIG.w, height: CONFIG.h }}>
          
          {/* SVG LAYER FOR LINES */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#1e40af" />
              </marker>
              <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#059669" />
              </marker>
              <marker id="arrow-indigo" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#4f46e5" />
              </marker>
            </defs>

            {/* 1. PRIMARY FLOW */}
            <path d={`M${NODES.pStart.x},${NODES.pStart.y} L${NODES.pStart.x},100`} stroke={CONFIG.primary} strokeWidth="4" />
            {/* Split */}
            <path d={`M${CONFIG.c},100 Q${NODES.pStd.x},100 ${NODES.pStd.x},${NODES.pStd.y}`} fill="none" stroke={CONFIG.express} strokeWidth="4" />
            <path d={`M${CONFIG.c},100 Q${NODES.pFdn.x},100 ${NODES.pFdn.x},${NODES.pFdn.y}`} fill="none" stroke={CONFIG.normal} strokeWidth="4" />
            {/* Merge */}
            <path d={`M${NODES.pStd.x},${NODES.pStd.y} Q${NODES.pStd.x},220 ${CONFIG.c},${NODES.psle.y}`} fill="none" stroke={CONFIG.express} strokeWidth="4" />
            <path d={`M${NODES.pFdn.x},${NODES.pFdn.y} Q${NODES.pFdn.x},220 ${CONFIG.c},${NODES.psle.y}`} fill="none" stroke={CONFIG.normal} strokeWidth="4" />

            {/* 2. SECONDARY SPLIT (Massive Separation) */}
            <path d={`M${NODES.psle.x},${NODES.psle.y} L${NODES.psle.x},350`} stroke={CONFIG.primary} strokeWidth="4" />
            {/* To Express Left */}
            <path d={`M${CONFIG.c},350 Q${NODES.secExp.x},350 ${NODES.secExp.x},${NODES.secExp.y}`} fill="none" stroke={CONFIG.express} strokeWidth="6" />
            {/* To Normal Right */}
            <path d={`M${CONFIG.c},350 Q${NODES.secNorm.x},350 ${NODES.secNorm.x},${NODES.secNorm.y}`} fill="none" stroke={CONFIG.normal} strokeWidth="6" />

            {/* 3. EXAM FLOWS */}
            {/* Express -> O-Level (Long drop left) */}
            <path d={`M${NODES.secExp.x},${NODES.secExp.y} L${NODES.oLevel.x},${NODES.oLevel.y}`} stroke={CONFIG.express} strokeWidth="6" markerEnd="url(#arrow-blue)" />
            
            {/* Normal -> N-Level (Drop right) */}
            <path d={`M${NODES.secNorm.x},${NODES.secNorm.y} L${NODES.nLevel.x},${NODES.nLevel.y}`} stroke={CONFIG.normal} strokeWidth="6" markerEnd="url(#arrow-green)" />

            {/* 4. CROSSROADS & TRANSFERS */}
            
            {/* BRIDGE: N-Level -> Sec 5 -> O-Level (Zig Zag) */}
            <path d={`M${NODES.nLevel.x},${NODES.nLevel.y} L${NODES.sec5.x},${NODES.sec5.y}`} stroke={CONFIG.normal} strokeWidth="3" strokeDasharray="6,4" markerEnd="url(#arrow-green)" />
            <path d={`M${NODES.sec5.x},${NODES.sec5.y} L${NODES.oLevel.x},${NODES.oLevel.y}`} stroke={CONFIG.normal} strokeWidth="3" strokeDasharray="6,4" markerEnd="url(#arrow-green)" />
            
            {/* PFP: N-Level -> Poly (Curve bypass through center) */}
            <path d={`M${NODES.nLevel.x},${NODES.nLevel.y} C${NODES.nLevel.x},900 ${CONFIG.c + 100},900 ${NODES.poly.x + 80},${NODES.poly.y}`} fill="none" stroke={CONFIG.normal} strokeWidth="2" strokeDasharray="4,4" markerEnd="url(#arrow-green)" />
            <text x="700" y="850" fill={CONFIG.normal} fontSize="11" fontWeight="bold">PFP (Direct to Poly)</text>

            {/* ITE TRACK: N-Level -> ITE -> Higher Nitec (Right Side) */}
            <path d={`M${NODES.nLevel.x},${NODES.nLevel.y} L${NODES.ite.x},${NODES.ite.y}`} stroke={CONFIG.normal} strokeWidth="5" />
            <path d={`M${NODES.ite.x},${NODES.ite.y} L${NODES.highNitec.x},${NODES.highNitec.y}`} stroke={CONFIG.normal} strokeWidth="5" />
            
            {/* Higher Nitec -> Poly (Inward Curve) */}
            <path d={`M${NODES.highNitec.x},${NODES.highNitec.y} Q${NODES.highNitec.x},${NODES.poly.y} ${NODES.poly.x + 80},${NODES.poly.y}`} fill="none" stroke={CONFIG.normal} strokeWidth="4" markerEnd="url(#arrow-green)" />

            {/* 5. TERTIARY DISTRIBUTION */}
            
            {/* O-Level -> JC (Down Left) */}
            <path d={`M${NODES.oLevel.x},${NODES.oLevel.y} L${NODES.jc.x},${NODES.jc.y}`} stroke={CONFIG.express} strokeWidth="5" markerEnd="url(#arrow-blue)" />
            
            {/* O-Level -> Poly (Curve to Center) */}
            <path d={`M${NODES.oLevel.x},${NODES.oLevel.y} Q${NODES.oLevel.x},${NODES.poly.y} ${NODES.poly.x - 80},${NODES.poly.y}`} fill="none" stroke={CONFIG.express} strokeWidth="5" markerEnd="url(#arrow-blue)" />

            {/* 6. TO UNIVERSITY */}
            {/* JC -> Uni */}
            <path d={`M${NODES.jc.x},${NODES.jc.y} Q${NODES.jc.x},${NODES.uni.y} ${NODES.uni.x - 60},${NODES.uni.y}`} fill="none" stroke={CONFIG.tertiary} strokeWidth="6" />
            {/* Poly -> Uni */}
            <path d={`M${NODES.poly.x},${NODES.poly.y} L${NODES.uni.x},${NODES.uni.y}`} stroke={CONFIG.tertiary} strokeWidth="6" />

          </svg>

          {/* HTML LAYER FOR NODES */}
          {Object.values(NODES).map((node, i) => (
            <MapNode key={i} node={node} />
          ))}

          {/* LEGEND */}
          <div className="absolute top-4 right-4 bg-white/95 p-4 rounded-xl border border-slate-200 shadow-lg text-xs z-30">
            <h4 className="font-bold text-slate-800 mb-3 border-b pb-2">Route Map Legend</h4>
            <div className="flex items-center mb-2"><div className="w-8 h-1.5 bg-blue-700 mr-2 rounded-full"></div> G3 / Express Route</div>
            <div className="flex items-center mb-2"><div className="w-8 h-1.5 bg-emerald-600 mr-2 rounded-full"></div> G2 / G1 Route</div>
            <div className="flex items-center mb-2"><div className="w-8 h-1.5 bg-indigo-600 mr-2 rounded-full"></div> Tertiary Route</div>
            <div className="flex items-center"><div className="w-8 h-0.5 border-t-2 border-dashed border-emerald-600 mr-2"></div> Bridge / Transfer</div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGES ---

const RoadmapLanding: React.FC = () => {
  return (
    <>
      <PageHeader 
        title="The Singapore Education Roadmap" 
        subtitle="A strategic guide from P1 to University. Follow the flow below to understand every turning point."
      />
      
      <Section className="bg-slate-50">
        <div className="text-center mb-8">
           <h2 className="text-2xl font-bold text-primary">Interactive Education Transit Map</h2>
           <p className="text-slate-500 max-w-2xl mx-auto">
             Visualizing the connections between O-Levels, N-Levels, ITE, Poly and JC.
           </p>
        </div>
        
        {/* THE NEW FLOW MAP */}
        <EducationMRTMap />

      </Section>

      <Section>
        {/* Phase 1: Primary Years */}
        <div className="mb-16">
          <div className="flex items-end mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-3xl font-bold text-primary mr-4">Phase 1: Primary Foundation</h2>
            <span className="text-slate-500 pb-1 font-medium">P1 to PSLE</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <RoadmapCard id="primary" title="Primary Years & P4 Streaming" />
             <RoadmapCard id="psle" title="PSLE & DSA-Sec" />
          </div>
        </div>

        {/* Phase 2: Secondary Years */}
        <div className="mb-16">
          <div className="flex items-end mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-3xl font-bold text-primary mr-4">Phase 2: Secondary Years</h2>
            <span className="text-slate-500 pb-1 font-medium">The Critical Middle</span>
          </div>
          
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8 rounded-r-lg">
             <div className="flex items-start">
                <AlertTriangle className="text-amber-600 mr-4 flex-shrink-0" />
                <div>
                   <h4 className="font-bold text-amber-900">Sec 2 Streaming Warning</h4>
                   <p className="text-amber-800 text-sm mt-1">
                      Your child's Sec 2 results determine their Sec 3 subjects (e.g., Pure Science, A-Math). 
                      Closing doors here (by failing to qualify) limits University Engineering and Medicine options later.
                   </p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-8 max-w-2xl">
             <RoadmapCard id="secondary" title="Lower Sec (FSBB)" />
          </div>
          
           {/* CTA for Sec 2 - Redirect to Parents */}
          <div className="mt-8 text-center">
             <Button to="/parents">Book Subject Combination Consultation</Button>
          </div>
        </div>

        {/* Phase 3: National Exams & Post-Sec */}
        <div className="mb-16">
          <div className="flex items-end mb-8 border-b border-slate-200 pb-4">
            <h2 className="text-3xl font-bold text-primary mr-4">Phase 3: The Final Lap</h2>
            <span className="text-slate-500 pb-1 font-medium">O-Levels & Beyond</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <RoadmapCard id="olevel" title="O-Levels, Bonus Points & DSA-JC" />
             <RoadmapCard id="coursework" title="O-Level Coursework (D&T / Art)" />
             <RoadmapCard id="postsec" title="Post-Secondary Routes (JC/Poly/ITE)" />
          </div>
        </div>

      </Section>
    </>
  );
};

const RoadmapDetail: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = ROADMAP_TOPICS[topicId || ''];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [topicId]);

  if (!topic) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
        <Button to="/roadmap">Back to Roadmap</Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={topic.title} subtitle={topic.description} />
      <Section className="max-w-4xl">
        <Link to="/roadmap" className="text-secondary font-medium hover:underline mb-8 block">&larr; Back to Roadmap overview</Link>
        
        <div className="space-y-12 mb-12">
          {topic.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center border-b border-slate-100 pb-4">
                {section.title}
              </h3>
              
              <div className="space-y-4">
                {section.content.map((para, pIdx) => (
                  <div key={pIdx} className="text-slate-700 leading-relaxed flex items-start">
                    {section.type === 'list' && <span className="mr-3 text-secondary font-bold">•</span>}
                    {section.type === 'warning' && <AlertTriangle className="mr-3 text-amber-500 flex-shrink-0" size={20} />}
                    {section.type === 'info' && <Info className="mr-3 text-blue-500 flex-shrink-0" size={20} />}
                    <span className={section.type === 'warning' ? 'font-medium text-slate-800' : ''}>{para}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="mt-12 bg-primary p-10 rounded-xl text-center border-2 border-slate-900 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2">Struggling with {topic.title}?</h3>
            <p className="text-slate-300 mb-8 text-lg">
              Don't wait until the grades drop. Our specialist tutors are ready to help with this specific stage.
            </p>
            <Button to="/parents" variant="white" className="px-8 py-4 text-lg font-bold">Find a Specialist for {topic.title}</Button>
          </div>
        </div>
      </Section>
    </>
  );
};

export { RoadmapLanding, RoadmapDetail };
