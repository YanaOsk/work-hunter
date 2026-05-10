"use client";

import { useEffect, useState, useRef } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsDark(!document.documentElement.classList.contains("light"));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const toggle = () => {
    const next = !isDark;
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    setSpinning(true);
    setIsDark(next);
    if (next) {
      root.classList.remove("light");
      localStorage.setItem("wh-theme", "dark");
    } else {
      root.classList.add("light");
      localStorage.setItem("wh-theme", "light");
    }
    timerRef.current = setTimeout(() => {
      root.classList.remove("theme-transitioning");
      setSpinning(false);
    }, 450);
  };

  if (!mounted) {
    return <div className="w-8 h-8 rounded-[6px]" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-8 h-8 rounded-[6px] flex items-center justify-center transition-all duration-150 text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent hover:border-white/[0.08]"
    >
      <span
        className="flex items-center justify-center"
        style={{
          transform: spinning ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
