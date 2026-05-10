"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export default function CountUp({ to, duration = 1400, suffix = "", prefix = "", decimals = 0 }: Props) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setValue(to);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setStarted(true);

        let startTime: number | null = null;

        const tick = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(parseFloat((eased * to).toFixed(decimals)));
          if (progress < 1) requestAnimationFrame(tick);
          else setValue(to);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [to, duration, decimals]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();

  return (
    <span
      ref={ref}
      className={started ? "animate-counter-in" : "opacity-0"}
      style={started ? { animation: "counterUp 0.4s ease both" } : {}}
    >
      {prefix}{display}{suffix}
    </span>
  );
}
