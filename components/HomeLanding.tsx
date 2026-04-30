"use client";

import { AppMode } from "@/lib/types";
import HeroSection from "./HeroSection";
import PainPoints from "./PainPoints";
import HowItWorks from "./HowItWorks";
import ServicesIntro from "./ServicesIntro";
import AllFields from "./AllFields";
import JobMarketFacts from "./JobMarketFacts";
import HighlightedReviews from "./HighlightedReviews";
import FaqSection from "./FaqSection";
import FinalCTA from "./FinalCTA";
import SiteFooter from "./SiteFooter";
import FadeIn from "./FadeIn";

interface Props {
  onChoose: (mode: AppMode) => void;
}

const Divider = () => <div className="border-t border-white/5" />;

export default function HomeLanding({ onChoose }: Props) {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 min-h-screen">
      <HeroSection onChoose={onChoose} />

      <Divider />
      <FadeIn>
        <PainPoints />
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
        <AllFields />
      </FadeIn>

      <Divider />
      <FadeIn>
        <JobMarketFacts />
      </FadeIn>

      <Divider />
      <FadeIn>
        <HighlightedReviews />
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
  );
}
