"use client";

import { AppMode } from "@/lib/types";
import PromoBanner from "./PromoBanner";
import NavBar from "./NavBar";
import HeroSection from "./HeroSection";
import PainPoints from "./PainPoints";
import HowItWorks from "./HowItWorks";
import ServicesIntro from "./ServicesIntro";
import AllFields from "./AllFields";
import JobMarketFacts from "./JobMarketFacts";
import HighlightedReviews from "./HighlightedReviews";
import PlansSection from "./PlansSection";
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
      <PromoBanner />
      <NavBar onStart={() => onChoose("advisor")} />

      <HeroSection onChoose={onChoose} />

      <Divider />
      <FadeIn>
        <PainPoints />
      </FadeIn>

      <Divider />
      <div id="how-it-works">
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
        <PlansSection />
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
