"use client";

import { AppMode } from "@/lib/types";
import HeroSection from "./HeroSection";
import FeaturesGrid from "./FeaturesGrid";
import HowItWorks from "./HowItWorks";
import ServicesIntro from "./ServicesIntro";
import ReviewMarquee from "./ReviewMarquee";
import FaqSection from "./FaqSection";
import FinalCTA from "./FinalCTA";
import SiteFooter from "./SiteFooter";
import FadeIn from "./FadeIn";

interface Props {
  onChoose: (mode: AppMode) => void;
}

const Divider = () => <div className="border-t border-white/[0.05]" />;

export default function HomeLanding({ onChoose }: Props) {
  return (
    <div className="relative min-h-screen" style={{ background: "#0C0C0D" }}>
      {/* Linear Aurora — fixed ambient mesh */}
      <div className="aurora-layer" aria-hidden>
        {/* Top-center: accent indigo blob */}
        <div
          className="aurora-blob"
          style={{
            top: "-15%",
            left: "25%",
            width: "50%",
            height: "45%",
            background: "radial-gradient(ellipse, rgba(94,106,210,0.10) 0%, transparent 72%)",
          }}
        />
        {/* Bottom-right: mint green blob */}
        <div
          className="aurora-blob"
          style={{
            bottom: "5%",
            right: "5%",
            width: "38%",
            height: "38%",
            background: "radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 72%)",
            animationName: "auroraShift2",
            animationDuration: "24s",
          }}
        />
        {/* Mid-left: subtle secondary blob */}
        <div
          className="aurora-blob"
          style={{
            top: "40%",
            left: "-8%",
            width: "30%",
            height: "32%",
            background: "radial-gradient(ellipse, rgba(94,106,210,0.05) 0%, transparent 70%)",
            animationDuration: "30s",
          }}
        />
      </div>

      {/* Content — sits above aurora */}
      <div className="relative z-10">
        <HeroSection onChoose={onChoose} />

        <Divider />
        <FadeIn>
          <FeaturesGrid />
        </FadeIn>

        <Divider />
        <div id="how-it-works" className="scroll-mt-20">
          <FadeIn>
            <HowItWorks />
          </FadeIn>
        </div>

        <Divider />
        <FadeIn>
          <ServicesIntro onChoose={onChoose} />
        </FadeIn>

        <Divider />
        <FadeIn>
          <ReviewMarquee />
        </FadeIn>

        <Divider />
        <FadeIn>
          <FaqSection />
        </FadeIn>

        <FadeIn>
          <FinalCTA onChoose={onChoose} />
        </FadeIn>

        <SiteFooter />
      </div>
    </div>
  );
}
