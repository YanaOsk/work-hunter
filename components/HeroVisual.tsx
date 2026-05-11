"use client";

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none pointer-events-none" style={{ height: "520px" }}>

      {/* ── Background concentric circles ── */}
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
        <div className="absolute w-[420px] h-[420px] rounded-full border border-[#5E6AD2]/[0.07]" />
        <div className="absolute w-[310px] h-[310px] rounded-full border border-[#5E6AD2]/[0.10]" />
        <div className="absolute w-[210px] h-[210px] rounded-full" style={{ background: "radial-gradient(circle, rgba(94,106,210,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* ── Illustration ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] z-10">
        <svg width="300" height="295" viewBox="0 0 300 295" fill="none" xmlns="http://www.w3.org/2000/svg">

          <style>{`
            @keyframes wh-float {
              0%,100% { transform:translateY(0); }
              50%      { transform:translateY(-9px); }
            }
            @keyframes wh-glow {
              0%,100% { opacity:.65; }
              50%      { opacity:1; }
            }
            @keyframes wh-cur {
              0%,49%   { opacity:1; }
              50%,100% { opacity:0; }
            }
            @keyframes wh-c1 {
              0%,10%  { opacity:0; }
              25%,78% { opacity:1; }
              90%,100%{ opacity:0; }
            }
            @keyframes wh-c2 {
              0%,27%  { opacity:0; }
              42%,78% { opacity:1; }
              90%,100%{ opacity:0; }
            }
            @keyframes wh-c3 {
              0%,44%  { opacity:0; }
              59%,78% { opacity:1; }
              90%,100%{ opacity:0; }
            }
            @keyframes wh-badge {
              0%,60%  { opacity:0; transform:scale(.8); }
              70%,80% { opacity:1; transform:scale(1.05); }
              84%,100%{ opacity:0; transform:scale(1); }
            }
            .wh-scene { animation: wh-float 4.5s ease-in-out infinite; transform-box:fill-box; transform-origin:center bottom; }
            .wh-glow  { animation: wh-glow  3s   ease-in-out infinite; }
            .wh-cur   { animation: wh-cur   1s   step-end  infinite; }
            .wh-c1    { animation: wh-c1  5.5s ease-in-out infinite; }
            .wh-c2    { animation: wh-c2  5.5s ease-in-out infinite; }
            .wh-c3    { animation: wh-c3  5.5s ease-in-out infinite; }
            .wh-badge { animation: wh-badge 5.5s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
          `}</style>

          <defs>
            <radialGradient id="sg" cx="50%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="#5E6AD2" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#5E6AD2" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#2A1205"/>
              <stop offset="100%" stopColor="#120802"/>
            </linearGradient>
            <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6D79DB"/>
              <stop offset="100%" stopColor="#4A56C0"/>
            </linearGradient>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000" floodOpacity="0.2"/>
            </filter>
          </defs>

          <g className="wh-scene">

            {/* ── DESK ── */}
            <rect x="0"  y="252" width="300" height="20" rx="6" fill="#C9AB84"/>
            <rect x="0"  y="252" width="300" height="5"  rx="3" fill="#DEC9A4" opacity=".7"/>

            {/* ── LAPTOP KEYBOARD ── */}
            <rect x="36" y="236" width="228" height="18" rx="8" fill="#2D3748" filter="url(#softShadow)"/>
            <rect x="42" y="237" width="216" height="13" rx="6" fill="#3D4A5C"/>
            {/* key rows */}
            {[0,1,2].map(r => [0,1,2,3,4,5,6,7,8].map(c => (
              <rect key={`${r}-${c}`} x={52+c*21} y={239+r*3.5} width={15} height={2.5} rx={1} fill="#2D3748" opacity={.5}/>
            )))}
            <rect x="112" y="241" width="76" height="9" rx="4" fill="#2D3748" opacity=".7"/>

            {/* ── LAPTOP SCREEN ── */}
            <rect x="38"  y="58"  width="224" height="180" rx="11" fill="#1F2937" filter="url(#softShadow)"/>
            <rect x="46"  y="66"  width="208" height="164" rx="7"  fill="#111827"/>
            <rect x="52"  y="72"  width="196" height="152" rx="5"  fill="#0F172A"/>

            {/* ── SCREEN UI ── */}
            {/* browser bar */}
            <rect x="52" y="72" width="196" height="18" rx="5" fill="#1E293B"/>
            <circle cx="63"  cy="81" r="3.2" fill="#FF5F57" opacity=".85"/>
            <circle cx="74"  cy="81" r="3.2" fill="#FFBD2E" opacity=".85"/>
            <circle cx="85"  cy="81" r="3.2" fill="#28C940" opacity=".85"/>
            <rect x="98"  y="76" width="114" height="10" rx="3.5" fill="#334155"/>
            <rect x="101" y="78" width="68"  height="6"  rx="2"   fill="#475569"/>

            {/* search bar */}
            <rect x="56" y="94" width="188" height="21" rx="5.5" fill="#1E293B"/>
            <circle cx="69"  cy="104.5" r="5"  stroke="#5E6AD2" strokeWidth="1.8" fill="none"/>
            <line x1="73" y1="108" x2="76" y2="111" stroke="#5E6AD2" strokeWidth="2" strokeLinecap="round"/>
            <rect x="80" y="100" width="114" height="9" rx="3" fill="#334155"/>
            <rect x="195" y="100" width="1.5" height="9" fill="#5E6AD2" className="wh-cur"/>
            <rect x="200" y="97" width="40" height="16" rx="5" fill="#5E6AD2"/>
            <rect x="205" y="101" width="20" height="6"  rx="2" fill="white" opacity=".95"/>
            <rect x="205" y="109" width="13" height="2.5" rx="1" fill="white" opacity=".5"/>

            {/* result count */}
            <rect x="56" y="119" width="30" height="6" rx="2" fill="#64748B" opacity=".55"/>
            <rect x="89" y="119" width="24" height="6" rx="2" fill="#4ADE80" opacity=".75"/>

            {/* Job card 1 */}
            <g className="wh-c1">
              <rect x="56" y="129" width="192" height="28" rx="5.5" fill="#1E293B"/>
              <rect x="62" y="135" width="18" height="16" rx="4"    fill="#5E6AD2" opacity=".9"/>
              <rect x="86" y="136" width="70" height="6"   rx="2"   fill="#E2E8F0"/>
              <rect x="86" y="145" width="48" height="4"   rx="1.5" fill="#64748B"/>
              <rect x="220" y="138" width="23" height="9"  rx="4.5" fill="#4ADE80" opacity=".8"/>
              <rect x="224" y="141" width="15" height="3"  rx="1.5" fill="white"  opacity=".95"/>
            </g>

            {/* Job card 2 */}
            <g className="wh-c2">
              <rect x="56" y="161" width="192" height="28" rx="5.5" fill="#1E293B"/>
              <rect x="62" y="167" width="18" height="16" rx="4"    fill="#6366F1" opacity=".9"/>
              <rect x="86" y="168" width="58" height="6"   rx="2"   fill="#E2E8F0"/>
              <rect x="86" y="177" width="40" height="4"   rx="1.5" fill="#64748B"/>
              <rect x="217" y="170" width="26" height="9"  rx="4.5" fill="#5E6AD2" opacity=".75"/>
              <rect x="221" y="173" width="18" height="3"  rx="1.5" fill="white"  opacity=".95"/>
            </g>

            {/* Job card 3 */}
            <g className="wh-c3">
              <rect x="56" y="193" width="192" height="28" rx="5.5" fill="#1E293B"/>
              <rect x="62" y="199" width="18" height="16" rx="4"    fill="#8B5CF6" opacity=".9"/>
              <rect x="86" y="200" width="80" height="6"   rx="2"   fill="#E2E8F0"/>
              <rect x="86" y="209" width="54" height="4"   rx="1.5" fill="#64748B"/>
              <rect x="218" y="202" width="25" height="9"  rx="4.5" fill="#F59E0B" opacity=".7"/>
              <rect x="222" y="205" width="17" height="3"  rx="1.5" fill="white"  opacity=".95"/>
            </g>

            {/* match badge */}
            <g className="wh-badge">
              <rect x="156" y="130" width="52" height="18" rx="9" fill="#4ADE80"/>
              <rect x="163" y="135" width="8"  height="8"  rx="4" fill="white" opacity=".9"/>
              <rect x="175" y="137" width="26" height="4"  rx="2" fill="white" opacity=".9"/>
            </g>

            {/* screen glow */}
            <rect x="52" y="72" width="196" height="152" rx="5" fill="url(#sg)" className="wh-glow"/>

            {/* ── WOMAN (seen from behind) ── */}

            {/* Left arm */}
            <path d="M 102 162 C 94 175 78 198 56 236 L 72 241 C 92 205 108 182 114 168 Z" fill="url(#shirtGrad)"/>
            {/* left hand */}
            <ellipse cx="53" cy="238" rx="16" ry="8" fill="#E8A87C" transform="rotate(-15 53 238)"/>

            {/* Right arm */}
            <path d="M 198 162 C 206 175 222 198 244 236 L 228 241 C 208 205 192 182 186 168 Z" fill="url(#shirtGrad)"/>
            {/* right hand */}
            <ellipse cx="247" cy="238" rx="16" ry="8" fill="#E8A87C" transform="rotate(15 247 238)"/>

            {/* Shirt / shoulders (peek above screen bottom & at sides) */}
            <path d="M 96 58 Q 116 48 150 46 Q 184 48 204 58 Q 180 54 150 53 Q 120 54 96 58 Z" fill="url(#shirtGrad)"/>

            {/* ── HAIR (the star of the show) ── */}
            {/* Main hair mass */}
            <path d="
              M 150 5
              C 178 2 200 14 202 36
              C 204 52 200 66 198 82
              C 196 96 194 108 192 120
              C 190 132 186 140 182 148
              C 178 156 172 160 166 158
              L 134 158
              C 128 160 122 156 118 148
              C 114 140 110 132 108 120
              C 106 108 104 96 102 82
              C 100 66 96 52 98 36
              C 100 14 122 2 150 5 Z
            " fill="url(#hairGrad)"/>

            {/* Hair shine / highlight */}
            <path d="
              M 150 7
              C 165 5 178 12 182 26
              C 176 18 164 12 150 11
              C 136 12 124 18 118 26
              C 122 12 135 5 150 7 Z
            " fill="white" opacity=".07"/>

            {/* Hair strand details (subtle lines for depth) */}
            <path d="M 150 8  C 158 20 162 40 160 62" stroke="#3A1A0A" strokeWidth="1.5" fill="none" opacity=".35"/>
            <path d="M 150 8  C 142 20 138 40 140 62" stroke="#3A1A0A" strokeWidth="1.5" fill="none" opacity=".35"/>
            <path d="M 180 20 C 188 36 192 58 190 80" stroke="#3A1A0A" strokeWidth="1"   fill="none" opacity=".3"/>
            <path d="M 120 20 C 112 36 108 58 110 80" stroke="#3A1A0A" strokeWidth="1"   fill="none" opacity=".3"/>

            {/* Hair ends — slight wave at bottom */}
            <path d="
              M 134 158
              C 138 165 144 166 150 164
              C 156 166 162 165 166 158
            " fill="#1A0A05" opacity=".6"/>

            {/* Neck (just a sliver visible at hair part) */}
            <rect x="138" y="50" width="24" height="10" rx="5" fill="#E8A87C" opacity=".6"/>

          </g>
        </svg>
      </div>

      {/* ── Floating card: Resume Score ── */}
      <div className="absolute z-20 animate-hero-in" style={{ top: "22%", left: "2%", animationDelay: "0.15s" }}>
        <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2.5 border border-black/[0.06]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ background: "#4ADE80" }}>91%</div>
          <div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight" dir="rtl">ציון קורות החיים</p>
            <p className="text-[10px] text-gray-400 leading-tight" dir="rtl">מצוין · ATS מוכן</p>
          </div>
        </div>
      </div>

      {/* ── Floating card: ATS badge ── */}
      <div className="absolute z-20 animate-hero-in" style={{ top: "30%", right: "0%", animationDelay: "0.25s" }}>
        <div className="rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-md" style={{ background: "#5E6AD2" }}>
          <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-white text-[11px] font-semibold whitespace-nowrap" dir="rtl">ATS מושלם</p>
        </div>
      </div>

      {/* ── Floating card: Skills ── */}
      <div className="absolute z-20 animate-hero-in" style={{ bottom: "24%", right: "0%", animationDelay: "0.35s" }}>
        <div className="bg-white rounded-2xl shadow-lg p-3.5 border border-black/[0.06] min-w-[160px]">
          <p className="text-[10px] font-semibold text-gray-500 mb-2 flex items-center gap-1" dir="rtl">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            כישורים
          </p>
          <div className="space-y-1.5">
            {["ניהול", "חשיבה אנליטית", "מנהיגות"].map((skill) => (
              <div key={skill} className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 text-[11px] font-medium text-gray-700 text-right">
                {skill}
              </div>
            ))}
            <button className="text-[10px] text-[#5E6AD2] font-semibold pt-0.5 w-full text-right" style={{ pointerEvents: "none" }}>
              + הוסף כישור
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating card: AI Coach ── */}
      <div className="absolute z-20 animate-hero-in" style={{ bottom: "10%", left: "2%", right: "18%", animationDelay: "0.45s" }}>
        <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2.5 border border-black/[0.06]">
          <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
            style={{ background: "conic-gradient(#5E6AD2, #4ADE80, #5E6AD2)" }}>
            <div className="w-4 h-4 rounded-full bg-white" />
          </div>
          <p className="text-[11px] text-gray-400 flex-1 text-right" dir="rtl">שאל/י את יועץ ה-AI...</p>
        </div>
      </div>

    </div>
  );
}
