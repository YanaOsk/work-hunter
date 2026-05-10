"use client";

import { AppMode } from "@/lib/types";
import HeroSection from "./HeroSection";
import HowItWorks from "./HowItWorks";
import ServicesIntro from "./ServicesIntro";
import ReviewCarousel from "./ReviewCarousel";
import FinalCTA from "./FinalCTA";
import SiteFooter from "./SiteFooter";
import FadeIn from "./FadeIn";

interface Props {
  onChoose: (mode: AppMode) => void;
}

const Divider = () => <div className="border-t border-white/[0.05]" />;

export default function HomeLanding({ onChoose }: Props) {
  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
      {/* Aurora ambient mesh */}
      <div className="aurora-layer" aria-hidden>
        <div
          className="aurora-blob"
          style={{
            top: "-15%", left: "25%", width: "50%", height: "45%",
            background: "radial-gradient(ellipse, rgba(94,106,210,0.09) 0%, transparent 72%)",
          }}
        />
        <div
          className="aurora-blob"
          style={{
            bottom: "5%", right: "5%", width: "38%", height: "38%",
            background: "radial-gradient(ellipse, rgba(74,222,128,0.05) 0%, transparent 72%)",
            animationName: "auroraShift2", animationDuration: "24s",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <HeroSection onChoose={onChoose} />

        <Divider />
        <FadeIn>
          <ServicesIntro onChoose={onChoose} />
        </FadeIn>

        <Divider />
        <FadeIn>
          <HowItWorks />
        </FadeIn>

        <Divider />
        <FadeIn>
          <ReviewCarousel />
        </FadeIn>

        <FadeIn>
          <FinalCTA onChoose={onChoose} />
        </FadeIn>

        <SiteFooter />
      </div>
    </div>
  );
}
