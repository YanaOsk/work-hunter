"use client";

import { useState } from "react";
import { AdvisorState, UserProfile } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onComplete: (profile: UserProfile) => void;
}

interface FormData {
  name: string;
  age: string;
  location: string;
  story: string;
  loves: string;
  dislikes: string;
}

type StepKey = "name" | "basics" | "story" | "loves" | "dislikes" | "welcome";

export default function SelfIntro({ advisorState, onBack, onComplete }: Props) {
  const { lang } = useLanguage();
  const tx = t[lang];
  const existingParsed = advisorState.userProfile.parsedData || {};

  const [data, setData] = useState<FormData>({
    name: existingParsed.name || "",
    age: existingParsed.age ? String(existingParsed.age) : "",
    location: existingParsed.location || "",
    story: "",
    loves: "",
    dislikes: "",
  });
  const [step, setStep] = useState<StepKey>("name");

  const steps: StepKey[] = ["name", "basics", "story", "loves", "dislikes", "welcome"];
  const currentIdx = steps.indexOf(step);
  const total = steps.length - 1;

  const update = (field: keyof FormData, value: string) => setData((d) => ({ ...d, [field]: value }));

  const finish = () => {
    const notes = [
      data.story && `סיפור: ${data.story}`,
      data.loves && `אוהב/ת: ${data.loves}`,
      data.dislikes && `לא אוהב/ת: ${data.dislikes}`,
    ]
      .filter(Boolean)
      .join("\n");

    const updatedProfile: UserProfile = {
      ...advisorState.userProfile,
      rawText: [data.story, data.loves, data.dislikes].filter(Boolean).join("\n\n"),
      parsedData: {
        ...existingParsed,
        name: data.name.trim() || existingParsed.name,
        age: data.age ? parseInt(data.age, 10) : existingParsed.age,
        location: data.location.trim() || existingParsed.location,
        additionalNotes: notes || existingParsed.additionalNotes,
      },
    };
    onComplete(updatedProfile);
  };

  const next = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
    else finish();
  };

  const canProceed: Record<StepKey, boolean> = {
    name: data.name.trim().length > 0,
    basics: true,
    story: true,
    loves: true,
    dislikes: true,
    welcome: true,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-xl">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-4">
          {tx.backToAdvisor}
        </button>

        {step !== "welcome" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-300 text-xs">
                {tx.selfIntroStepOf.replace("{n}", String(currentIdx + 1)).replace("{total}", String(total))}
              </span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all"
                style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8">
          {step === "name" && (
            <StepLayout
              emoji="👋"
              question={tx.selfIntroNameQ}
              sub={tx.selfIntroNameSub}
            >
              <input
                value={data.name}
                onChange={(e) => update("name", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canProceed.name && next()}
                autoFocus
                placeholder={tx.selfIntroNamePh}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </StepLayout>
          )}

          {step === "basics" && (
            <StepLayout
              emoji="✨"
              question={tx.selfIntroBasicsQ}
              sub={tx.selfIntroBasicsSub}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  value={data.age}
                  onChange={(e) => update("age", e.target.value.replace(/\D/g, "").slice(0, 3))}
                  inputMode="numeric"
                  placeholder={tx.selfIntroAgePh}
                  className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <input
                  value={data.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder={tx.selfIntroLocationPh}
                  className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </StepLayout>
          )}

          {step === "story" && (
            <StepLayout
              emoji="📖"
              question={tx.selfIntroStoryQ}
              sub={tx.selfIntroStorySub}
            >
              <textarea
                value={data.story}
                onChange={(e) => update("story", e.target.value)}
                placeholder={tx.selfIntroStoryPh}
                rows={4}
                autoFocus
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </StepLayout>
          )}

          {step === "loves" && (
            <StepLayout
              emoji="💜"
              question={tx.selfIntroLovesQ}
              sub={tx.selfIntroLovesSub}
            >
              <textarea
                value={data.loves}
                onChange={(e) => update("loves", e.target.value)}
                placeholder={tx.selfIntroLovesPh}
                rows={3}
                autoFocus
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </StepLayout>
          )}

          {step === "dislikes" && (
            <StepLayout
              emoji="😤"
              question={tx.selfIntroDislikesQ}
              sub={tx.selfIntroDislikesSub}
            >
              <textarea
                value={data.dislikes}
                onChange={(e) => update("dislikes", e.target.value)}
                placeholder={tx.selfIntroDislikesPh}
                rows={3}
                autoFocus
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
              />
            </StepLayout>
          )}

          {step === "welcome" && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {tx.selfIntroWelcome.replace("{name}", data.name.trim())}
              </h2>
              <p className="text-white/70 leading-relaxed">{tx.selfIntroWelcomeSub}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={next}
              disabled={!canProceed[step]}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition"
            >
              {step === "welcome" ? tx.selfIntroFinish : tx.selfIntroNext}
            </button>
            {step !== "name" && step !== "welcome" && (
              <button
                onClick={next}
                className="text-white/40 hover:text-white/70 text-sm"
              >
                {tx.selfIntroSkip}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepLayout({
  emoji,
  question,
  sub,
  children,
}: {
  emoji: string;
  question: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-3xl mb-3">{emoji}</div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">{question}</h2>
        <p className="text-white/60 text-sm leading-relaxed">{sub}</p>
      </div>
      {children}
    </div>
  );
}
