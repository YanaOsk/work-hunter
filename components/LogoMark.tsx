"use client";

interface Props {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export default function LogoMark({ size = "md", animate = false }: Props) {
  const dims =
    size === "sm" ? "w-8 h-8" : size === "md" ? "w-10 h-10" : "w-14 h-14";
  const iconDims = size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-7 h-7";

  return (
    <div
      className={`${dims} rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-emerald-500 animate-gradient flex items-center justify-center ${
        animate ? "animate-pulse-glow" : ""
      }`}
    >
      <svg
        className={iconDims}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
      >
        <path
          d="M4 18 L10 12 L14 15 L20 8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4" cy="18" r="1.6" fill="white" stroke="none" />
        <circle cx="10" cy="12" r="1.4" fill="white" stroke="none" />
        <circle cx="14" cy="15" r="1.4" fill="white" stroke="none" />
        <circle cx="20" cy="8" r="2.2" fill="white" stroke="none" />
      </svg>
    </div>
  );
}
