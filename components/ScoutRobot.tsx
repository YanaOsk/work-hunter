export default function ScoutRobot({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <style>{`
        @keyframes robot-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes robot-blink {
          0%, 88%, 100% { transform: scaleY(1); }
          94% { transform: scaleY(0.07); }
        }
        @keyframes antenna-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @keyframes button-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .sr-body  { animation: robot-float 3.6s ease-in-out infinite; }
        .sr-eye-l { animation: robot-blink 4.2s ease-in-out infinite; transform-origin: 42px 58px; }
        .sr-eye-r { animation: robot-blink 4.2s ease-in-out infinite 0.25s; transform-origin: 78px 58px; }
        .sr-ant   { animation: antenna-glow 1.9s ease-in-out infinite; }
        .sr-btn1  { animation: button-pulse 2.1s ease-in-out infinite; }
        .sr-btn2  { animation: button-pulse 2.1s ease-in-out infinite 0.7s; }
        .sr-btn3  { animation: button-pulse 2.1s ease-in-out infinite 1.4s; }
      `}</style>

      <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Antenna stem */}
        <line x1="60" y1="28" x2="60" y2="11" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round"/>
        {/* Antenna ball */}
        <circle className="sr-ant" cx="60" cy="7" r="6" fill="#7c3aed" opacity="0.9"/>
        <circle cx="60" cy="7" r="3" fill="#c4b5fd"/>

        <g className="sr-body">
          {/* Head */}
          <rect x="18" y="28" width="84" height="62" rx="16" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
          <rect x="26" y="34" width="30" height="7" rx="3.5" fill="#4c1d95" opacity="0.45"/>

          {/* Left eye socket */}
          <circle cx="42" cy="58" r="13" fill="#0f172a" stroke="#6d28d9" strokeWidth="1.5"/>
          <g className="sr-eye-l">
            <circle cx="42" cy="58" r="7" fill="#7c3aed"/>
            <circle cx="44" cy="56" r="2.5" fill="#c4b5fd"/>
            <circle cx="40" cy="60" r="1" fill="#ede9fe" opacity="0.6"/>
          </g>

          {/* Right eye socket */}
          <circle cx="78" cy="58" r="13" fill="#0f172a" stroke="#6d28d9" strokeWidth="1.5"/>
          <g className="sr-eye-r">
            <circle cx="78" cy="58" r="7" fill="#7c3aed"/>
            <circle cx="80" cy="56" r="2.5" fill="#c4b5fd"/>
            <circle cx="76" cy="60" r="1" fill="#ede9fe" opacity="0.6"/>
          </g>

          {/* Mouth */}
          <path d="M 40 80 Q 60 93 80 80" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M 40 80 Q 60 93 80 80" stroke="#c4b5fd" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.35"/>

          {/* Neck */}
          <rect x="50" y="88" width="20" height="10" rx="4" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1"/>

          {/* Body */}
          <rect x="22" y="98" width="76" height="58" rx="14" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
          <rect x="30" y="104" width="28" height="6" rx="3" fill="#4c1d95" opacity="0.35"/>

          {/* Chest buttons */}
          <g className="sr-btn1">
            <circle cx="42" cy="120" r="5" fill="#6d28d9" stroke="#a78bfa" strokeWidth="1"/>
            <circle cx="42" cy="120" r="2" fill="#c4b5fd" opacity="0.8"/>
          </g>
          <g className="sr-btn2">
            <circle cx="60" cy="120" r="5" fill="#059669" stroke="#34d399" strokeWidth="1"/>
            <circle cx="60" cy="120" r="2" fill="#6ee7b7" opacity="0.8"/>
          </g>
          <g className="sr-btn3">
            <circle cx="78" cy="120" r="5" fill="#b45309" stroke="#fbbf24" strokeWidth="1"/>
            <circle cx="78" cy="120" r="2" fill="#fde68a" opacity="0.8"/>
          </g>

          {/* Chest panel */}
          <rect x="32" y="132" width="56" height="16" rx="6" fill="#0f172a" stroke="#4c1d95" strokeWidth="1"/>
          <rect x="36" y="136" width="12" height="2" rx="1" fill="#7c3aed" opacity="0.8"/>
          <rect x="36" y="140" width="20" height="2" rx="1" fill="#7c3aed" opacity="0.5"/>
          <rect x="36" y="144" width="8"  height="2" rx="1" fill="#7c3aed" opacity="0.3"/>

          {/* Left arm */}
          <rect x="2" y="102" width="18" height="38" rx="9" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
          <circle cx="11" cy="140" r="5" fill="#0f172a" stroke="#6d28d9" strokeWidth="1"/>

          {/* Right arm */}
          <rect x="100" y="102" width="18" height="38" rx="9" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="1.5"/>
          <circle cx="109" cy="140" r="5" fill="#0f172a" stroke="#6d28d9" strokeWidth="1"/>
        </g>
      </svg>
    </div>
  );
}
