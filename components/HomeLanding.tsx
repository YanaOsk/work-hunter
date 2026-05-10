"use client";

import { AppMode } from "@/lib/types";
import HeroSection from "./HeroSection";
import AllFieldsSection from "./AllFieldsSection";
import FeaturesGrid from "./FeaturesGrid";
import FeatureShowcase from "./FeatureShowcase";
import HowItWorks from "./HowItWorks";
import ServicesIntro from "./ServicesIntro";
import ReviewCarousel from "./ReviewCarousel";
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
        <div
          className="aurora-blob"
          style={{
            top: "40%", left: "-8%", width: "30%", height: "32%",
            background: "radial-gradient(ellipse, rgba(94,106,210,0.04) 0%, transparent 70%)",
            animationDuration: "30s",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <HeroSection onChoose={onChoose} />

        {/* All Fields — clarifies we serve every sector */}
        <Divider />
        <FadeIn>
          <AllFieldsSection />
        </FadeIn>

        {/* Features bento grid */}
        <Divider />
        <FadeIn>
          <FeaturesGrid />
        </FadeIn>

        {/* Side-by-side feature showcase */}
        <Divider />
        <FadeIn>
          <FeatureShowcase />
        </FadeIn>

        {/* How it works */}
        <Divider />
        <div id="how-it-works" className="scroll-mt-20">
          <FadeIn>
            <HowItWorks />
          </FadeIn>
        </div>

        {/* Services intro */}
        <Divider />
        <FadeIn>
          <ServicesIntro onChoose={onChoose} />
        </FadeIn>

        {/* Reviews carousel */}
        <Divider />
        <FadeIn>
          <ReviewCarousel />
        </FadeIn>

        {/* FAQ */}
        <Divider />
        <FadeIn>
          <FaqSection />
        </FadeIn>

        {/* Final CTA */}
        <FadeIn>
          <FinalCTA onChoose={onChoose} />
        </FadeIn>

        <SiteFooter />
      </div>
    </div>
  );
}
