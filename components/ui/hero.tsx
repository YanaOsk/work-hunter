"use client"
import { useEffect, useRef, useState } from "react"
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import { AppMode } from "@/lib/types"
import { useLanguage } from "@/components/LanguageProvider"
import CountUp from "@/components/CountUp"

interface Props {
  onChoose: (mode: AppMode) => void
}

export default function HeroShader({ onChoose }: Props) {
  const { lang } = useLanguage()
  const he = lang === "he"
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden" dir={he ? "rtl" : "ltr"}>
      {/* SVG filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02  0 1 0 0 0.02  0 0 1 0 0.05  0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#5E6AD2" />
            <stop offset="70%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Mesh gradient layers */}
      {mounted && (
        <>
          <MeshGradient
            className="absolute inset-0 w-full h-full"
            colors={["#000000", "#0f0f23", "#5E6AD2", "#1a1a3e", "#06b6d4"]}
            speed={0.3}
          />
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-40"
            colors={["#000000", "#5E6AD2", "#06b6d4", "#ffffff"]}
            speed={0.2}
          />
        </>
      )}

      {/* Main hero content */}
      <main className={`absolute bottom-10 z-20 max-w-2xl ${he ? "right-8" : "left-8"}`}>
        <div className="text-left">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
            style={{ filter: "url(#glass-effect)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent rounded-full" />
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
              {he ? "✨ סוכן קריירה מבוסס AI — ישראל 2025" : "✨ AI Career Scout — Israel 2025"}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span
              className="block font-light text-white/90 text-4xl md:text-5xl lg:text-6xl mb-2 tracking-wider"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #5E6AD2 30%, #06b6d4 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "url(#text-glow)",
              }}
            >
              {he ? "מצא את" : "Find Your"}
            </motion.span>
            <span className="block font-black text-white drop-shadow-2xl">
              {he ? "הקריירה" : "Career"}
            </span>
            <span className="block font-light text-white/80 italic">
              {he ? "שלך" : "with AI"}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {he
              ? "סוכן AI אישי שמנתח את הפרופיל שלך ומוצא את המשרות הכי מתאימות עבורך בשוק הישראלי."
              : "Your personal AI agent that analyzes your profile and finds the most relevant jobs in the Israeli market."}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.button
              onClick={() => onChoose("advisor")}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm transition-all duration-300 hover:from-indigo-400 hover:to-cyan-400 cursor-pointer shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {he ? "יועץ קריירה" : "Career Advisor"}
            </motion.button>
            <motion.button
              onClick={() => onChoose("jobs")}
              className="px-10 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-indigo-400/50 hover:text-indigo-100 cursor-pointer backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {he ? "חפש משרות" : "Search Jobs"}
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Stats — bottom right */}
      <div className={`absolute bottom-10 z-20 ${he ? "left-8" : "right-8"}`}>
        <div className="flex flex-col gap-4 items-end">
          {[
            { value: 2400, suffix: "+", label: he ? "משתמשים" : "users" },
            { value: 4.8, suffix: "★", label: he ? "דירוג" : "rating", decimals: 1 },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 + i * 0.15 }}
            >
              <div className="text-white font-bold text-xl leading-none tracking-tight">
                <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} duration={1400} />
              </div>
              <div className="text-white/35 text-[10px] mt-0.5 uppercase tracking-wide">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pulsing border decoration */}
      {mounted && (
        <div className="absolute top-1/2 -translate-y-1/2 right-12 z-10 pointer-events-none hidden lg:block">
          <PulsingBorder
            colors={["#5E6AD2", "#06b6d4", "#ffffff", "#818cf8", "#67e8f9"]}
            colorBack="#00000000"
            speed={1.2}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={4}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.4}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            style={{ width: "320px", height: "320px", borderRadius: "50%", opacity: 0.6 }}
          />
        </div>
      )}
    </div>
  )
}
