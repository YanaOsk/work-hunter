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

      {/* ── Animated job-search illustration ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] z-10">
        <svg width="280" height="285" viewBox="0 0 280 285" fill="none" xmlns="http://www.w3.org/2000/svg">

          <style>{`
            @keyframes wh-float {
              0%, 100% { transform: translateY(0px); }
              50%       { transform: translateY(-8px); }
            }
            @keyframes wh-glow {
              0%, 100% { opacity: 0.65; }
              50%       { opacity: 1; }
            }
            @keyframes wh-cursor {
              0%, 49% { opacity: 1; }
              50%,100% { opacity: 0; }
            }
            @keyframes wh-c1 {
              0%,12%  { opacity:0; }
              26%,78% { opacity:1; }
              91%,100%{ opacity:0; }
            }
            @keyframes wh-c2 {
              0%,28%  { opacity:0; }
              42%,78% { opacity:1; }
              91%,100%{ opacity:0; }
            }
            @keyframes wh-c3 {
              0%,44%  { opacity:0; }
              58%,78% { opacity:1; }
              91%,100%{ opacity:0; }
            }
            @keyframes wh-match {
              0%,58%  { opacity:0; transform:scale(0.85); }
              68%,78% { opacity:1; transform:scale(1); }
              91%,100%{ opacity:0; transform:scale(1); }
            }
            .wh-scene  { animation: wh-float 4.5s ease-in-out infinite; transform-box:fill-box; transform-origin:center bottom; }
            .wh-glow   { animation: wh-glow   3s   ease-in-out infinite; }
            .wh-cursor { animation: wh-cursor  1s   step-end  infinite; }
            .wh-c1     { animation: wh-c1  5.5s ease-in-out infinite; }
            .wh-c2     { animation: wh-c2  5.5s ease-in-out infinite; }
            .wh-c3     { animation: wh-c3  5.5s ease-in-out infinite; }
            .wh-match  { animation: wh-match 5.5s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
          `}</style>

          <defs>
            <radialGradient id="sg" cx="50%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="#5E6AD2" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#5E6AD2" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8BFA0"/>
              <stop offset="100%" stopColor="#C4A882"/>
            </linearGradient>
          </defs>

          <g className="wh-scene">

            {/* ── DESK ── */}
            <rect x="0" y="248" width="280" height="18" rx="6" fill="url(#deskGrad)"/>
            <rect x="0" y="248" width="280" height="4"  rx="3" fill="#E8CFA8" opacity="0.7"/>

            {/* ── LAPTOP KEYBOARD ── */}
            <rect x="38" y="232" width="204" height="18" rx="7" fill="#2D3748"/>
            <rect x="44" y="233" width="192" height="13" rx="5" fill="#3D4A5C"/>
            {/* key rows */}
            {[0,1,2].map(row =>
              [0,1,2,3,4,5,6,7].map(col => (
                <rect key={`${row}-${col}`} x={54+col*22} y={235+row*3.5} width={16} height={2.5} rx={1} fill="#2D3748" opacity={0.55}/>
              ))
            )}
            <rect x="110" y="237" width="60" height="8"  rx="4" fill="#2D3748" opacity="0.7"/>

            {/* ── LAPTOP SCREEN outer frame ── */}
            <rect x="40" y="66" width="200" height="168" rx="10" fill="#1F2937"/>
            {/* bezel */}
            <rect x="47" y="73" width="186" height="154" rx="7"  fill="#111827"/>
            {/* display */}
            <rect x="52" y="78" width="176" height="144" rx="5"  fill="#0F172A"/>

            {/* ── SCREEN UI ── */}
            {/* browser chrome */}
            <rect x="52" y="78" width="176" height="16" rx="5" fill="#1E293B"/>
            <circle cx="61"  cy="86" r="3"   fill="#FF5F57" opacity="0.85"/>
            <circle cx="71"  cy="86" r="3"   fill="#FFBD2E" opacity="0.85"/>
            <circle cx="81"  cy="86" r="3"   fill="#28C940" opacity="0.85"/>
            <rect x="92" y="82" width="108" height="8" rx="3" fill="#334155"/>
            <rect x="95" y="84" width="58"  height="4" rx="2" fill="#475569"/>

            {/* search bar */}
            <rect x="56" y="98" width="168" height="18" rx="5" fill="#1E293B"/>
            <circle cx="68" cy="107" r="4"  stroke="#5E6AD2" strokeWidth="1.5" fill="none"/>
            <line x1="71" y1="110" x2="74" y2="113" stroke="#5E6AD2" strokeWidth="1.8" strokeLinecap="round"/>
            <rect x="78" y="103" width="98" height="8" rx="2.5" fill="#334155"/>
            <rect x="177" y="103" width="1.5" height="8" fill="#5E6AD2" className="wh-cursor"/>
            <rect x="182" y="100" width="38" height="14" rx="4.5" fill="#5E6AD2"/>
            <rect x="186" y="104" width="18" height="5"  rx="2" fill="white" opacity="0.95"/>
            <rect x="186" y="110" width="12" height="2"  rx="1" fill="white" opacity="0.45"/>

            {/* result count */}
            <rect x="56" y="120" width="26" height="5" rx="1.5" fill="#64748B" opacity="0.55"/>
            <rect x="85" y="120" width="20" height="5" rx="1.5" fill="#4ADE80" opacity="0.75"/>

            {/* Job card 1 */}
            <g className="wh-c1">
              <rect x="56" y="129" width="172" height="24" rx="5" fill="#1E293B"/>
              <rect x="61" y="134" width="16" height="14" rx="3.5" fill="#5E6AD2" opacity="0.9"/>
              <rect x="82" y="135" width="60" height="5"   rx="1.5" fill="#E2E8F0"/>
              <rect x="82" y="143" width="40" height="3.5" rx="1"   fill="#64748B"/>
              <rect x="209" y="137" width="14" height="6"  rx="3"   fill="#4ADE80" opacity="0.8"/>
            </g>

            {/* Job card 2 */}
            <g className="wh-c2">
              <rect x="56" y="156" width="172" height="24" rx="5" fill="#1E293B"/>
              <rect x="61" y="161" width="16" height="14" rx="3.5" fill="#6366F1" opacity="0.9"/>
              <rect x="82" y="162" width="52" height="5"   rx="1.5" fill="#E2E8F0"/>
              <rect x="82" y="170" width="35" height="3.5" rx="1"   fill="#64748B"/>
              <rect x="206" y="164" width="17" height="6"  rx="3"   fill="#5E6AD2" opacity="0.75"/>
            </g>

            {/* Job card 3 */}
            <g className="wh-c3">
              <rect x="56" y="183" width="172" height="24" rx="5" fill="#1E293B"/>
              <rect x="61" y="188" width="16" height="14" rx="3.5" fill="#8B5CF6" opacity="0.9"/>
              <rect x="82" y="189" width="68" height="5"   rx="1.5" fill="#E2E8F0"/>
              <rect x="82" y="197" width="44" height="3.5" rx="1"   fill="#64748B"/>
              <rect x="203" y="191" width="20" height="6"  rx="3"   fill="#F59E0B" opacity="0.7"/>
            </g>

            {/* "Match!" sparkle badge */}
            <g className="wh-match">
              <rect x="156" y="130" width="42" height="16" rx="8" fill="#4ADE80"/>
              <text x="177" y="141" fontSize="8" fontWeight="700" fill="white" textAnchor="middle" fontFamily="system-ui,sans-serif">✓ 94% התאמה</text>
            </g>

            {/* screen glow */}
            <rect x="52" y="78" width="176" height="144" rx="5" fill="url(#sg)" className="wh-glow"/>

            {/* ── WOMAN ── */}

            {/* left arm visible beside screen */}
            <path d="M88 152 C80 163 66 178 48 226 L62 231 C78 186 94 169 98 157 Z" fill="#5E6AD2"/>
            {/* left hand on keyboard */}
            <ellipse cx="46" cy="228" rx="14" ry="7" fill="#F0B496" transform="rotate(-13 46 228)"/>

            {/* right arm */}
            <path d="M192 152 C200 163 214 178 232 226 L218 231 C202 186 186 169 182 157 Z" fill="#5E6AD2"/>
            {/* right hand */}
            <ellipse cx="234" cy="228" rx="14" ry="7" fill="#F0B496" transform="rotate(13 234 228)"/>

            {/* neck */}
            <rect x="131" y="54" width="18" height="16" rx="7" fill="#F0B496"/>

            {/* shirt collar / shoulders (peek above screen) */}
            <path d="M94 67 Q116 56 140 54 Q164 56 186 67 Q162 62 140 61 Q118 62 94 67 Z" fill="#5E6AD2"/>

            {/* ── HAIR (behind head) ── */}
            <ellipse cx="143" cy="34" rx="35" ry="37" fill="#1A0A05"/>

            {/* ── FACE ── */}
            <ellipse cx="143" cy="38" rx="27" ry="29" fill="#F0B496"/>

            {/* hair top covers forehead */}
            <path d="M116 34 Q118 8 143 5 Q168 8 170 34 Q157 20 143 18 Q129 20 116 34 Z" fill="#1A0A05"/>

            {/* side hair strands */}
            <path d="M116 34 C111 46 110 58 113 68 C115 57 115 46 117 39 Z" fill="#1A0A05"/>
            <path d="M170 34 C175 46 175 58 172 68 C170 57 170 46 169 39 Z" fill="#1A0A05"/>

            {/* ears */}
            <ellipse cx="117" cy="39" rx="5"   ry="6.5" fill="#F0B496"/>
            <ellipse cx="169" cy="39" rx="5"   ry="6.5" fill="#F0B496"/>
            <ellipse cx="117" cy="40" rx="2.5" ry="3.5" fill="#E09676" opacity="0.45"/>
            <ellipse cx="169" cy="40" rx="2.5" ry="3.5" fill="#E09676" opacity="0.45"/>

            {/* earrings */}
            <circle cx="117" cy="45" r="3"   fill="#5E6AD2"/>
            <circle cx="117" cy="45" r="1.5" fill="#8B96E0"/>
            <circle cx="169" cy="45" r="3"   fill="#5E6AD2"/>
            <circle cx="169" cy="45" r="1.5" fill="#8B96E0"/>

            {/* ── EYES ── */}
            {/* left */}
            <ellipse cx="131" cy="36" rx="7"   ry="7"   fill="white"/>
            <ellipse cx="132" cy="37" rx="5"   ry="5.5" fill="#3D2010"/>
            <ellipse cx="132" cy="37" rx="3"   ry="3.2" fill="#0A0500"/>
            <circle  cx="134" cy="35" r="1.5"           fill="white"/>
            {/* right */}
            <ellipse cx="155" cy="36" rx="7"   ry="7"   fill="white"/>
            <ellipse cx="156" cy="37" rx="5"   ry="5.5" fill="#3D2010"/>
            <ellipse cx="156" cy="37" rx="3"   ry="3.2" fill="#0A0500"/>
            <circle  cx="158" cy="35" r="1.5"           fill="white"/>

            {/* eyelash hints */}
            <path d="M124 29 Q131 26 138 29" stroke="#0A0500" strokeWidth="1.5" fill="none" opacity="0.35"/>
            <path d="M148 29 Q155 26 162 29" stroke="#0A0500" strokeWidth="1.5" fill="none" opacity="0.35"/>

            {/* eyebrows */}
            <path d="M122 26 Q130 23 138 26" stroke="#1A0A05" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <path d="M148 26 Q156 23 164 26" stroke="#1A0A05" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

            {/* nose */}
            <path d="M139 46 Q143 51 147 46" stroke="#D08A65" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

            {/* smile */}
            <path d="M134 56 Q143 63 152 56" stroke="#C07050" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

            {/* cheek blush */}
            <ellipse cx="120" cy="46" rx="9" ry="5" fill="#F4A0A0" opacity="0.38"/>
            <ellipse cx="166" cy="46" rx="9" ry="5" fill="#F4A0A0" opacity="0.38"/>

            {/* ── PONYTAIL ── */}
            <path d="M165 14 Q192 4 194 24 Q198 42 186 55 Q175 37 168 32 Z" fill="#1A0A05"/>
            {/* hair-tie */}
            <circle cx="168" cy="17" r="5"   fill="#5E6AD2"/>
            <circle cx="168" cy="17" r="2.5" fill="#7B8CE0"/>
            {/* ponytail strand lines */}
            <path d="M172 20 Q185 30 185 44" stroke="#2A1A0F" strokeWidth="1.2" fill="none" opacity="0.5"/>
            <path d="M176 18 Q190 26 190 38" stroke="#2A1A0F" strokeWidth="0.8" fill="none" opacity="0.35"/>

          </g>
        </svg>
      </div>

      {/* ── Floating card: Resume Score ── */}
      <div className="absolute z-20 animate-hero-in" style={{ top: "22%", left: "2%", animationDelay: "0.15s" }}>
        <div className="bg-white rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2.5 border border-black/[0.06]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
            style={{ background: "#4ADE80" }}>
            91%
          </div>
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
