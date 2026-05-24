"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdvisorState, CareerPath, LifePath, SkillGapItem, StudyInstitution, OnboardingPlan, FreelanceKit, PracticalPrep, SalaryResearch, TransitionRoadmap, LinkedInProfile } from "@/lib/types";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import { queueAutoStart, queueAdvisorScoutContext } from "@/lib/autoStart";

const CHECKLIST_KEY = "work_hunter_weekly_checklist";

function buildChecklist(state: AdvisorState, lang: string): string[] {
  const items: string[] = [];
  if (state.diagnosis?.weekOneSteps?.length)
    items.push(...state.diagnosis.weekOneSteps.slice(0, 3));
  const chosen = state.direction?.options?.find((o) => o.path === state.chosenPath);
  if (chosen?.firstSteps?.length) items.push(chosen.firstSteps[0]);
  if (state.cvReview?.improvements?.length) items.push(state.cvReview.improvements[0].suggestion);
  if (state.linkedInSkipped)
    items.push(lang === "he" ? "עדכנו את פרופיל הלינקדאין שלכם" : "Update your LinkedIn profile");
  if (state.strategy?.thirtyDayPlan?.length) items.push(state.strategy.thirtyDayPlan[0]);
  const seen = new Set<string>();
  return items.filter((it) => { if (!it || seen.has(it)) return false; seen.add(it); return true; }).slice(0, 8);
}

interface Props {
  advisorState: AdvisorState;
  onBack: () => void;
  onOpenInterview: () => void;
  onExit: () => void;
  onUpdate?: (next: AdvisorState) => void;
}

export default function SummaryView({ advisorState, onBack, onOpenInterview, onExit, onUpdate }: Props) {
  const { lang } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const tx = t[lang];
  const { diagnosis, direction, cvReview, strategy, mockInterview, chosenPath, userProfile } = advisorState;
  const name = userProfile.parsedData?.name || "";
  const contentRef = useRef<HTMLDivElement>(null);
  // Always-fresh ref so closures inside functional setState updaters never spread stale advisorState
  const advisorStateRef = useRef(advisorState);
  advisorStateRef.current = advisorState;
  const [downloading, setDownloading] = useState(false);
  const [emailInput, setEmailInput] = useState(session?.user?.email || "");
  const [emailState, setEmailState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [checkedItems, setCheckedItems] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set<number>();
    try {
      const raw = localStorage.getItem(CHECKLIST_KEY);
      return raw ? new Set<number>(JSON.parse(raw) as number[]) : new Set<number>();
    } catch { return new Set<number>(); }
  });

  // Readiness conditions — drive section visibility
  const isStudyPath = chosenPath === "studies";
  const hasRelevantCV = !advisorState.cvSkipped && !!cvReview;
  const hasExperience = (userProfile.parsedData.yearsExperience ?? 0) > 0;
  // Ready to job-search: not on study path AND has reviewed CV or work experience
  const isReadyForJobs = !isStudyPath && (hasRelevantCV || hasExperience);

  // DNA role like/dislike — single combined state to avoid cross-state sync issues
  const [rolePrefs, setRolePrefs] = useState<{ liked: Set<string>; disliked: Set<string> }>(() => ({
    liked: new Set(advisorState.likedRoles ?? []),
    disliked: new Set(advisorState.dislikedRoles ?? []),
  }));
  const likedRoles = rolePrefs.liked;
  const dislikedRoles = rolePrefs.disliked;

  const toggleLikeRole = (role: string) => {
    setRolePrefs((prev) => {
      const liked = new Set(prev.liked);
      const disliked = new Set(prev.disliked);
      if (liked.has(role)) { liked.delete(role); } else { liked.add(role); disliked.delete(role); }
      onUpdate?.({ ...advisorStateRef.current, likedRoles: [...liked], dislikedRoles: [...disliked] });
      return { liked, disliked };
    });
  };
  const toggleDislikeRole = (role: string) => {
    setRolePrefs((prev) => {
      const liked = new Set(prev.liked);
      const disliked = new Set(prev.disliked);
      if (disliked.has(role)) { disliked.delete(role); } else { disliked.add(role); liked.delete(role); }
      onUpdate?.({ ...advisorStateRef.current, likedRoles: [...liked], dislikedRoles: [...disliked] });
      return { liked, disliked };
    });
  };

  const checklist = buildChecklist(advisorState, lang);

  const toggleCheck = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [skillGapError, setSkillGapError] = useState("");
  const [skillGapData, setSkillGapData] = useState<SkillGapItem[] | null>(advisorState.skillGap ?? null);

  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [onboardingData, setOnboardingData] = useState<OnboardingPlan | null>(advisorState.onboardingPlan ?? null);

  const [deadline, setDeadline] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("work_hunter_job_deadline") ?? "";
  });
  const [deadlineInput, setDeadlineInput] = useState(deadline);

  const weeksLeft = deadline
    ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (7 * 86400000)))
    : null;

  const handleSetDeadline = () => {
    if (!deadlineInput) return;
    setDeadline(deadlineInput);
    try { localStorage.setItem("work_hunter_job_deadline", deadlineInput); } catch {}
  };

  const loadSkillGap = async () => {
    setSkillGapLoading(true);
    setSkillGapError("");
    try {
      const res = await fetch("/api/advisor/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, diagnosis, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const gaps = data.gaps as SkillGapItem[];
      setSkillGapData(gaps);
      onUpdate?.({ ...advisorState, skillGap: gaps });
    } catch {
      setSkillGapError(lang === "he" ? "שגיאה בניתוח — נסה שוב" : "Analysis failed — try again");
    } finally {
      setSkillGapLoading(false);
    }
  };

  const [freelanceLoading, setFreelanceLoading] = useState(false);
  const [freelanceError, setFreelanceError] = useState("");
  const [freelanceData, setFreelanceData] = useState<FreelanceKit | null>(advisorState.freelanceKit ?? null);

  const [practicalLoading, setPracticalLoading] = useState(false);
  const [practicalError, setPracticalError] = useState("");
  const [practicalData, setPracticalData] = useState<PracticalPrep | null>(advisorState.practicalPrep ?? null);

  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [salaryData, setSalaryData] = useState<SalaryResearch | null>(advisorState.salaryResearch ?? null);

  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionError, setTransitionError] = useState("");
  const [transitionData, setTransitionData] = useState<TransitionRoadmap | null>(advisorState.transitionRoadmap ?? null);

  const [linkedInLoading, setLinkedInLoading] = useState(false);
  const [linkedInError, setLinkedInError] = useState("");
  const [linkedInData, setLinkedInData] = useState<LinkedInProfile | null>(advisorState.linkedIn ?? null);

  const loadLinkedIn = async () => {
    setLinkedInLoading(true); setLinkedInError("");
    try {
      const res = await fetch("/api/advisor/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile,
          diagnosis,
          currentLinkedin: null,
          targetRole: diagnosis?.topRoles?.[0] ?? null,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setLinkedInData(data as LinkedInProfile);
      onUpdate?.({ ...advisorStateRef.current, linkedIn: data as LinkedInProfile });
    } catch { setLinkedInError(lang === "he" ? "שגיאה — נסה שוב" : "Failed — try again"); }
    finally { setLinkedInLoading(false); }
  };

  const loadFreelance = async () => {
    setFreelanceLoading(true); setFreelanceError("");
    try {
      const res = await fetch("/api/advisor/freelance-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, diagnosis, chosenPath, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFreelanceData(data as FreelanceKit);
      onUpdate?.({ ...advisorState, freelanceKit: data as FreelanceKit });
    } catch { setFreelanceError(lang === "he" ? "שגיאה — נסה שוב" : "Failed — try again"); }
    finally { setFreelanceLoading(false); }
  };

  const loadPractical = async () => {
    setPracticalLoading(true); setPracticalError("");
    try {
      const res = await fetch("/api/advisor/practical-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, diagnosis, role: diagnosis?.topRoles?.[0], lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPracticalData(data as PracticalPrep);
      onUpdate?.({ ...advisorState, practicalPrep: data as PracticalPrep });
    } catch { setPracticalError(lang === "he" ? "שגיאה — נסה שוב" : "Failed — try again"); }
    finally { setPracticalLoading(false); }
  };

  const loadSalary = async () => {
    setSalaryLoading(true); setSalaryError("");
    try {
      const res = await fetch("/api/advisor/salary-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, diagnosis, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSalaryData(data as SalaryResearch);
      onUpdate?.({ ...advisorState, salaryResearch: data as SalaryResearch });
    } catch { setSalaryError(lang === "he" ? "שגיאה — נסה שוב" : "Failed — try again"); }
    finally { setSalaryLoading(false); }
  };

  const loadTransition = async () => {
    setTransitionLoading(true); setTransitionError("");
    try {
      const res = await fetch("/api/advisor/transition-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, diagnosis, chosenPath, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTransitionData(data as TransitionRoadmap);
      onUpdate?.({ ...advisorState, transitionRoadmap: data as TransitionRoadmap });
    } catch { setTransitionError(lang === "he" ? "שגיאה — נסה שוב" : "Failed — try again"); }
    finally { setTransitionLoading(false); }
  };

  const loadOnboarding = async () => {
    setOnboardingLoading(true);
    setOnboardingError("");
    try {
      const res = await fetch("/api/advisor/onboarding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chosenPath,
          topRoles: diagnosis?.topRoles ?? [],
          strategy,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const plan = data as OnboardingPlan;
      setOnboardingData(plan);
      onUpdate?.({ ...advisorState, onboardingPlan: plan });
    } catch {
      setOnboardingError(lang === "he" ? "שגיאה ביצירת התוכנית — נסה שוב" : "Failed to generate plan — try again");
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const wrapper = contentRef.current;
    if (!wrapper || downloading) return;
    setDownloading(true);
    try {
      const { toCanvas } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const hidden = Array.from(wrapper.querySelectorAll<HTMLElement>("[data-no-pdf]"));
      hidden.forEach((el) => (el.style.display = "none"));

      const canvas = await toCanvas(wrapper, {
        pixelRatio: 2,
        backgroundColor: "#0C0C0D",
        skipFonts: false,
        style: { direction: "ltr" },
      });

      hidden.forEach((el) => el.style.removeProperty("display"));

      if (canvas.width === 0 || canvas.height === 0) throw new Error("Canvas is empty");

      const pageW = 210; // mm
      const pageH = 297; // mm
      // pixels that fit on one A4 page at the same horizontal scale
      const pageH_px = Math.floor((pageH / pageW) * canvas.width);
      const pageCount = Math.ceil(canvas.height / pageH_px);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      for (let p = 0; p < pageCount; p++) {
        if (p > 0) pdf.addPage();
        const srcY  = p * pageH_px;
        const srcH  = Math.min(pageH_px, canvas.height - srcY);

        const slice = document.createElement("canvas");
        slice.width  = canvas.width;
        slice.height = pageH_px;
        const sctx = slice.getContext("2d")!;
        sctx.fillStyle = "#0C0C0D";
        sctx.fillRect(0, 0, slice.width, slice.height);
        sctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, pageW, pageH);
      }

      pdf.save(`career-summary-${name || "advisor"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim() || emailState === "sending") return;
    setEmailState("sending");
    try {
      const res = await fetch("/api/advisor/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: emailInput.trim(), advisorState, lang }),
      });
      if (!res.ok) throw new Error("Failed");
      setEmailState("sent");
    } catch {
      setEmailState("failed");
    }
  };

  const handleSendToScout = () => {
    const lines: string[] = [];
    if (diagnosis?.topRoles?.length)
      lines.push(`תפקידים שמתאימים לי: ${diagnosis.topRoles.join(", ")}`);
    if (chosenPath)
      lines.push(`מסלול: ${pathLabel(chosenPath, tx)}`);
    if (diagnosis?.strengths?.length)
      lines.push(`חוזקות: ${diagnosis.strengths.slice(0, 3).join(", ")}`);
    queueAdvisorScoutContext(lines.join("\n"));
    queueAutoStart("jobs");
    router.push("/");
  };

  const chosenOption = direction?.options?.find((o) => o.path === chosenPath);
  const otherOptions = direction?.options?.filter((o) => o.path !== chosenPath) ?? [];

  return (
    <div style={{ background: "var(--background)" }} className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto" ref={contentRef}>
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-white/50 hover:text-white text-sm transition">
            {tx.backToMap}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/80 disabled:opacity-50 text-sm border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-xl transition"
              title={lang === "he" ? "הורד כ-PDF" : "Download as PDF"}
            >
              {downloading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {downloading ? (lang === "he" ? "מכין..." : "Preparing...") : "PDF"}
            </button>
            <a href="/tracker" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-300 border border-white/10 hover:border-purple-500/40 px-2.5 py-1.5 rounded-lg transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {lang === "he" ? "מעקב הגשות" : "My Applications"}
            </a>
            <button onClick={onExit} className="text-white/50 hover:text-white text-sm transition">
              {tx.newSearch}
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{tx.summaryTitle}</h1>
          <p className="text-purple-300">
            {name && `${name} · `}
            {tx.summarySubtitle}
          </p>
        </div>

        {/* Top Message — personal brand statement */}
        {diagnosis?.topMessage && (
          <div className="relative mb-8 px-8 py-6 bg-gradient-to-br from-purple-600/15 via-emerald-600/10 to-purple-600/15 border border-purple-500/25 rounded-2xl overflow-hidden text-center">
            <div className="absolute top-3 start-5 text-5xl leading-none text-purple-500/20 select-none">"</div>
            <p className="text-lg md:text-xl font-semibold text-white/95 leading-relaxed relative z-10">
              {diagnosis.topMessage}
            </p>
            <div className="absolute bottom-1 end-5 text-5xl leading-none text-purple-500/20 select-none">"</div>
          </div>
        )}

        {/* Weekly action checklist */}
        {checklist.length > 0 && (
          <div className="mb-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5" data-no-pdf>
            <h3 className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-3">
              {tx.weeklyChecklistTitle}
            </h3>
            <ul className="space-y-2.5">
              {checklist.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => toggleCheck(i)}
                >
                  <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                    checkedItems.has(i)
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-white/30 group-hover:border-emerald-500/50"
                  }`}>
                    {checkedItems.has(i) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed transition ${
                    checkedItems.has(i) ? "text-white/30 line-through" : "text-white/85"
                  }`}>
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-white/30 text-xs mt-3">
              {checkedItems.size}/{checklist.length}{" "}
              {lang === "he" ? "הושלמו" : "completed"}
            </p>
          </div>
        )}

        {/* Goal deadline */}
        <div className="mb-5 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4" data-no-pdf>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-amber-300 text-xs font-semibold uppercase tracking-wide">{isStudyPath ? tx.goalStudyDeadlineTitle : tx.goalDeadlineTitle}</h3>
            {weeksLeft !== null && (
              <span className="ms-auto text-amber-400 text-xs font-bold tabular-nums">
                {weeksLeft} {tx.goalWeeksLeft}
              </span>
            )}
          </div>
          {deadline ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.max(5, 100 - (weeksLeft ?? 0) * 4)}%` }} />
              </div>
              <button
                onClick={() => { setDeadline(""); setDeadlineInput(""); try { localStorage.removeItem("work_hunter_job_deadline"); } catch {} }}
                className="text-white/30 hover:text-white/60 text-xs transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSetDeadline}
                disabled={!deadlineInput}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                {tx.goalDeadlineSet}
              </button>
            </div>
          )}
        </div>

        {/* Career Advisory Panel — reflection, 3 paths, week-one steps, realism */}
        {diagnosis && (diagnosis.reflection || diagnosis.careerPaths?.length || diagnosis.weekOneSteps?.length || diagnosis.tomorrowStep) && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3">
              {lang === "he" ? "ייעוץ תעסוקתי מותאם אישית" : "Your personalized career advisory"}
            </h2>

            {/* Reflection */}
            {diagnosis.reflection && (
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl px-5 py-4">
                <h3 className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-2">
                  {tx.summaryReflection}
                </h3>
                <p className="text-white/85 text-sm leading-relaxed">{diagnosis.reflection}</p>
              </div>
            )}

            {/* 3 Career Paths */}
            {diagnosis.careerPaths && diagnosis.careerPaths.length > 0 && (
              <div>
                <h3 className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-3">
                  {tx.summaryCareerPaths}
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {diagnosis.careerPaths.map((path: CareerPath, i: number) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-emerald-400 text-xs font-bold tabular-nums flex-shrink-0">
                          #{i + 1}
                        </span>
                        <span className="text-[10px] bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded-full">
                          {path.domain}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-sm">{path.title}</p>
                      <p className="text-white/65 text-xs leading-relaxed">{path.reasoning}</p>
                      <div className="mt-auto pt-2 border-t border-white/10">
                        <span className="text-purple-300 text-[10px] font-semibold uppercase tracking-wide block mb-1">
                          {tx.summaryMatchBridge}
                        </span>
                        <p className="text-white/80 text-xs italic">{path.matchBridge}</p>
                      </div>
                      {path.marketReality && (
                        <div className="pt-2 border-t border-white/10 space-y-1">
                          <span className="text-amber-300 text-[10px] font-semibold uppercase tracking-wide block">
                            {lang === "he" ? "מציאות שוק" : "Market reality"}
                          </span>
                          {[
                            [tx.summaryMarketSalary, path.marketReality.salaryRange],
                            [tx.summaryMarketDemand, path.marketReality.marketDemand],
                            [tx.summaryMarketEntry, path.marketReality.timeToEntry],
                            [tx.summaryMarketTraining, path.marketReality.trainingNeeded],
                          ].map(([label, value]) => value ? (
                            <div key={label} className="flex gap-1.5 text-[10px]">
                              <span className="text-white/40 flex-shrink-0">{label}:</span>
                              <span className="text-white/70">{value}</span>
                            </div>
                          ) : null)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Week One Steps (new) or legacy tomorrowStep */}
            {diagnosis.weekOneSteps && diagnosis.weekOneSteps.length > 0 ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4">
                <h3 className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-3">
                  {tx.summaryWeekOneSteps}
                </h3>
                <ol className="space-y-3">
                  {diagnosis.weekOneSteps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-white/90 text-sm leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : diagnosis.tomorrowStep ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-4">
                <h3 className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-2">
                  {tx.summaryTomorrowStep}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed font-medium">{diagnosis.tomorrowStep}</p>
              </div>
            ) : null}

            {/* Realism Note */}
            {diagnosis.realismNote && (
              <div className="flex items-start gap-3 px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl">
                <span className="text-white/30 text-lg flex-shrink-0 mt-0.5">!</span>
                <div>
                  <span className="text-white/40 text-xs font-semibold uppercase tracking-wide block mb-1">
                    {tx.summaryRealismNote}
                  </span>
                  <p className="text-white/70 text-sm leading-relaxed">{diagnosis.realismNote}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transition roadmap */}
        {diagnosis && (
          <Section title={tx.transitionTitle}>
            {transitionData ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-amber-300 text-xs font-semibold uppercase tracking-wide">{tx.transitionTotal}: </span>
                    <span className="text-white font-bold">{transitionData.totalDuration}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {transitionData.phases.map((phase, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold">{i + 1}</div>
                        {i < transitionData.phases.length - 1 && <div className="w-px flex-1 bg-purple-500/20 mt-1" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-white font-semibold text-sm">{phase.name}</h4>
                          <span className="text-purple-400 text-xs bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">{phase.duration}</span>
                        </div>
                        <ul className="space-y-1 mb-2">
                          {phase.actions.map((a, j) => (
                            <li key={j} className="text-white/70 text-sm flex gap-2">
                              <span className="text-purple-400 flex-shrink-0">→</span>{a}
                            </li>
                          ))}
                        </ul>
                        <p className="text-emerald-400 text-xs">✓ {phase.milestone}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-white/30 flex-shrink-0">!</span>
                  <div>
                    <span className="text-white/40 text-xs font-semibold uppercase tracking-wide block mb-1">{tx.transitionHonest}</span>
                    <p className="text-white/70 text-sm leading-relaxed">{transitionData.honestNote}</p>
                  </div>
                </div>
                <button onClick={loadTransition} disabled={transitionLoading} className="text-xs text-white/30 hover:text-white/60 transition disabled:opacity-40">
                  {lang === "he" ? "↺ רענן" : "↺ Refresh"}
                </button>
              </div>
            ) : transitionLoading ? (
              <LoadingSpinner text={tx.transitionGenerating} />
            ) : (
              <GenerateButton onClick={loadTransition} icon="map" label={tx.transitionGenerate} error={transitionError} />
            )}
          </Section>
        )}

        {/* Section 1: Professional DNA */}
        {diagnosis && (
          <Section title={tx.summarySection1}>
            {/* MBTI + Holland */}
            <div className="flex items-center gap-2 mb-4">
              {diagnosis.mbtiType && (
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-mono">
                  {diagnosis.mbtiType}
                </span>
              )}
              {diagnosis.hollandCode && (
                <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-mono">
                  {diagnosis.hollandCode}
                </span>
              )}
            </div>

            {/* Summary — personal address */}
            <p className="text-white/85 leading-relaxed mb-5">{diagnosis.summary}</p>

            {/* Top roles with like/dislike */}
            {diagnosis.topRoles && diagnosis.topRoles.length > 0 && (
              <div className="mb-5">
                <h4 className="text-emerald-300 text-xs font-semibold mb-2.5 uppercase tracking-wide">
                  {tx.summaryTopRoles}
                </h4>
                <p className="text-white/40 text-xs mb-2">
                  {lang === "he" ? "סמנו אם התפקיד מתאים לכם" : "Mark whether this role suits you"}
                </p>
                <div className="flex flex-col gap-2">
                  {diagnosis.topRoles.map((role, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition ${
                        likedRoles.has(role)
                          ? "bg-emerald-500/20 border-emerald-500/50"
                          : dislikedRoles.has(role)
                          ? "bg-white/[0.02] border-white/10 opacity-50"
                          : "bg-emerald-500/10 border-emerald-500/20"
                      }`}
                    >
                      <span className="text-emerald-400 text-xs font-bold tabular-nums flex-shrink-0">#{i + 1}</span>
                      <span className="text-white font-medium text-sm flex-1">{role}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleLikeRole(role)}
                          title={lang === "he" ? "זה מתאים לי" : "This suits me"}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition ${
                            likedRoles.has(role)
                              ? "bg-emerald-500/30 text-emerald-300"
                              : "text-white/25 hover:text-emerald-400 hover:bg-emerald-500/15"
                          }`}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => toggleDislikeRole(role)}
                          title={lang === "he" ? "זה לא מתאים לי" : "This doesn't suit me"}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition ${
                            dislikedRoles.has(role)
                              ? "bg-rose-500/20 text-rose-300"
                              : "text-white/25 hover:text-rose-400 hover:bg-rose-500/10"
                          }`}
                        >
                          ✗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths / environments / directions */}
            <div className="grid md:grid-cols-3 gap-4">
              <MiniList title={tx.diagnosisStrengths} items={diagnosis.strengths} color="emerald" />
              <MiniList title={tx.diagnosisEnvironments} items={diagnosis.workEnvironmentFit} color="purple" />
              <MiniList title={tx.diagnosisDirections} items={diagnosis.careerDirections} color="blue" />
            </div>
          </Section>
        )}

        {/* Skill gap analysis */}
        {diagnosis && (
          <Section title={tx.skillGapTitle}>
            {skillGapData ? (
              <div className="space-y-4">
                {skillGapData.map((item, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.importance === "high"
                          ? "bg-rose-500/20 text-rose-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {item.importance === "high" ? tx.skillGapHigh : tx.skillGapMedium}
                      </span>
                      <h4 className="text-white font-semibold text-sm">{item.skill}</h4>
                    </div>

                    {/* Formal credential + institutions */}
                    {item.requiredCredential && (
                      <div className="mb-3">
                        <div className="inline-flex items-center gap-1.5 bg-purple-500/15 border border-purple-500/30 rounded-lg px-3 py-1.5 mb-3">
                          <svg className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                          <span className="text-purple-200 text-xs font-semibold">
                            {lang === "he" ? "הסמכה נדרשת:" : "Required credential:"}{" "}
                            {item.requiredCredential}
                          </span>
                        </div>
                        {item.institutions && item.institutions.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-white/40 text-[10px] uppercase tracking-wide font-semibold">
                              {lang === "he" ? "מוסדות לימוד בישראל" : "Institutions in Israel"}
                            </p>
                            {item.institutions.map((inst: StudyInstitution, j: number) => (
                              <div key={j} className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 space-y-1.5">
                                <p className="text-white font-semibold text-sm">{inst.name}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                  {inst.location && (
                                    <span className="text-white/50 text-xs flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      </svg>
                                      {inst.location}
                                    </span>
                                  )}
                                  {inst.duration && (
                                    <span className="text-white/50 text-xs flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {inst.duration}
                                    </span>
                                  )}
                                  {inst.estimatedCost && (
                                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {inst.estimatedCost}
                                    </span>
                                  )}
                                </div>
                                {inst.admissionRequirements && (
                                  <p className="text-white/40 text-xs">
                                    <span className="text-white/30">{lang === "he" ? "תנאי קבלה:" : "Admission:"}</span>{" "}
                                    {inst.admissionRequirements}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skill resources (for gaps without formal credentials) */}
                    {(!item.requiredCredential || !item.institutions?.length) && item.resources?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.resources.map((r, j) => (
                          <div key={j} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                            <span className="text-white/50 text-[10px] uppercase tracking-wide">{r.type}</span>
                            <span className="text-white/80 text-xs font-medium">{r.title}</span>
                            {r.platform && <span className="text-white/40 text-[10px]">· {r.platform}</span>}
                            <span className={`text-[10px] font-semibold ms-1 ${r.free ? "text-emerald-400" : "text-white/30"}`}>
                              {r.free ? tx.skillGapFree : tx.skillGapPaid}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={loadSkillGap}
                  disabled={skillGapLoading}
                  className="text-xs text-white/30 hover:text-white/60 transition disabled:opacity-40"
                >
                  {lang === "he" ? "↺ רענן ניתוח" : "↺ Refresh analysis"}
                </button>
              </div>
            ) : skillGapLoading ? (
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {tx.skillGapGenerating}
              </div>
            ) : (
              <div className="space-y-3">
                {skillGapError && <p className="text-rose-400 text-sm">{skillGapError}</p>}
                <button
                  onClick={loadSkillGap}
                  className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-300 text-sm font-medium px-4 py-2.5 rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {tx.skillGapGenerate}
                </button>
              </div>
            )}
          </Section>
        )}

        {/* Salary research */}
        {diagnosis && (
          <Section title={tx.salaryTitle}>
            {!isReadyForJobs && !salaryData && (
              <p className="text-white/50 text-xs mb-3 leading-relaxed">
                {lang === "he"
                  ? "ממוצעי השכר בשוק לתפקידים אלו — לאחר קבלת ההסמכה הנדרשת תוכלו להיכנס לשוק ברמת Junior ולהתקדם משם."
                  : "Market salary averages for these roles — after completing the required training, you can enter at the Junior level."}
              </p>
            )}
            {salaryData ? (
              <div className="space-y-4">
                {!isReadyForJobs && (
                  <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-amber-300 text-xs">
                      {lang === "he"
                        ? "אלו ממוצעי שוק — לאחר ההכשרה תוכלו להתחיל מרמת Junior"
                        : "Market averages — after training you can start at Junior level"}
                    </p>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-start text-white/40 text-xs font-semibold pb-2 pe-4">{lang === "he" ? "תפקיד" : "Role"}</th>
                        <th className="text-center text-white/40 text-xs font-semibold pb-2 px-2">{tx.salaryJunior}</th>
                        <th className="text-center text-white/40 text-xs font-semibold pb-2 px-2">{tx.salaryMid}</th>
                        <th className="text-center text-white/40 text-xs font-semibold pb-2 ps-2">{tx.salarySenior}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {salaryData.ranges.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2.5 pe-4">
                            <p className="text-white font-medium text-xs">{r.role}</p>
                            {r.notes && <p className="text-white/40 text-[10px] mt-0.5">{r.notes}</p>}
                          </td>
                          <td className="py-2.5 px-2 text-center text-white/70 text-xs tabular-nums">{r.junior}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-400 text-xs font-semibold tabular-nums">{r.mid}</td>
                          <td className="py-2.5 ps-2 text-center text-purple-400 text-xs tabular-nums">{r.senior}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3 space-y-2">
                  <p className="text-blue-300 text-xs leading-relaxed">{salaryData.marketInsight}</p>
                  {isReadyForJobs && salaryData.negotiationTip && (
                    <p className="text-emerald-300 text-xs font-medium">💡 {salaryData.negotiationTip}</p>
                  )}
                </div>
                <button onClick={loadSalary} disabled={salaryLoading} className="text-xs text-white/30 hover:text-white/60 transition disabled:opacity-40">
                  {lang === "he" ? "↺ רענן נתונים" : "↺ Refresh data"}
                </button>
              </div>
            ) : salaryLoading ? (
              <LoadingSpinner text={tx.salaryGenerating} />
            ) : (
              <GenerateButton onClick={loadSalary} icon="chart" label={tx.salaryGenerate} error={salaryError} />
            )}
          </Section>
        )}

        {/* Section 2: Chosen path */}
        {chosenOption && (
          <Section title={tx.summarySection2}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-white">{pathLabel(chosenOption.path, tx)}</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
                ⭐ {chosenOption.fitScore}/100
              </span>
            </div>
            {direction?.rationale && (
              <p className="text-white/75 italic text-sm mb-4">{direction.rationale}</p>
            )}
            <p className="text-white/85 leading-relaxed mb-4">{chosenOption.summary}</p>

            {/* Earning potential vs quality of life bars */}
            {(chosenOption.earningPotential !== undefined || chosenOption.qualityOfLife !== undefined) && (
              <div className="mb-4 space-y-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                {chosenOption.earningPotential !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-xs w-32 flex-shrink-0 text-end">
                      {tx.summaryEarningPotential}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${chosenOption.earningPotential}%` }}
                      />
                    </div>
                    <span className="text-emerald-400 text-xs font-mono w-7 text-end">
                      {chosenOption.earningPotential}
                    </span>
                  </div>
                )}
                {chosenOption.qualityOfLife !== undefined && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/50 text-xs w-32 flex-shrink-0 text-end">
                      {tx.summaryQualityOfLife}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${chosenOption.qualityOfLife}%` }}
                      />
                    </div>
                    <span className="text-purple-400 text-xs font-mono w-7 text-end">
                      {chosenOption.qualityOfLife}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <MiniList title={tx.pros} items={chosenOption.pros} color="emerald" />
              <MiniList title={tx.cons} items={chosenOption.cons} color="rose" />
              <MiniList title={tx.firstSteps} items={chosenOption.firstSteps} color="blue" />
            </div>
          </Section>
        )}

        {/* Freelance kit — only for entrepreneur path */}
        {chosenPath === "entrepreneur" && (
          <Section title={tx.freelanceKitTitle}>
            {freelanceData ? (
              <div className="space-y-5">
                {[
                  { label: tx.freelanceKitPricing, items: freelanceData.pricingGuidance, color: "emerald" },
                  { label: tx.freelanceKitLegal, items: freelanceData.legalSteps, color: "blue" },
                  { label: tx.freelanceKitClients, items: freelanceData.firstClientSources, color: "purple" },
                ].map(({ label, items, color }) => (
                  <div key={label}>
                    <h4 className={`text-${color}-300 text-xs font-semibold uppercase tracking-wide mb-2`}>{label}</h4>
                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-white/80">
                          <span className={`text-${color}-400 flex-shrink-0 font-bold text-xs mt-0.5`}>{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                  <span className="text-amber-300 text-xs font-semibold uppercase tracking-wide">{tx.freelanceKitGoal}: </span>
                  <span className="text-white/85 text-sm">{freelanceData.monthlyGoal}</span>
                </div>
                <button onClick={loadFreelance} disabled={freelanceLoading} className="text-xs text-white/30 hover:text-white/60 transition disabled:opacity-40">
                  {lang === "he" ? "↺ רענן" : "↺ Refresh"}
                </button>
              </div>
            ) : freelanceLoading ? (
              <LoadingSpinner text={tx.freelanceKitGenerating} />
            ) : (
              <GenerateButton onClick={loadFreelance} icon="briefcase" label={tx.freelanceKitGenerate} error={freelanceError} />
            )}
          </Section>
        )}

        {/* Section 2b: Other paths comparison */}
        {otherOptions.length > 0 && (
          <Section title={tx.summaryAllPaths}>
            <div className="grid md:grid-cols-2 gap-3">
              {otherOptions.map((opt) => (
                <div key={opt.path} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{pathLabel(opt.path, tx)}</h4>
                    <span className="text-xs text-white/40">{opt.fitScore}/100</span>
                  </div>
                  <p className="text-white/70 text-sm mb-3">{opt.summary}</p>

                  {/* Compact bars for other options */}
                  {(opt.earningPotential !== undefined || opt.qualityOfLife !== undefined) && (
                    <div className="space-y-1.5 mb-3">
                      {opt.earningPotential !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/35 text-[10px] w-24 text-end flex-shrink-0">
                            {tx.summaryEarningPotential}
                          </span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${opt.earningPotential}%` }} />
                          </div>
                          <span className="text-white/40 text-[10px] w-5 text-end">{opt.earningPotential}</span>
                        </div>
                      )}
                      {opt.qualityOfLife !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-white/35 text-[10px] w-24 text-end flex-shrink-0">
                            {tx.summaryQualityOfLife}
                          </span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500/70 rounded-full" style={{ width: `${opt.qualityOfLife}%` }} />
                          </div>
                          <span className="text-white/40 text-[10px] w-5 text-end">{opt.qualityOfLife}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <MiniList title={tx.pros} items={(opt.pros ?? []).slice(0, 2)} color="emerald" small />
                    <MiniList title={tx.cons} items={(opt.cons ?? []).slice(0, 2)} color="rose" small />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Section 3: CV Review */}
        {cvReview && (
          <Section title={tx.summarySection3}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">{tx.cvScore}</span>
              <span className="text-3xl font-bold text-emerald-400">{cvReview.overallScore}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <MiniList title={tx.cvStrengths} items={cvReview.strengths} color="emerald" />
              <MiniList title={tx.cvWeaknesses} items={cvReview.weaknesses} color="rose" />
            </div>
            {(cvReview.improvements ?? []).length > 0 && (
              <div className="mb-4">
                <h4 className="text-blue-300 text-sm font-semibold mb-2">{tx.cvImprovements}</h4>
                <div className="space-y-2">
                  {(cvReview.improvements ?? []).map((imp, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                      <div className="text-blue-300 text-xs font-semibold mb-1 uppercase">{imp.section}</div>
                      <div className="text-white/60 mb-1">❌ {imp.issue}</div>
                      <div className="text-white/90">✓ {imp.suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-purple-300 text-sm font-semibold mb-2">{tx.cvRewritten}</h4>
              <div className="bg-white/5 border border-purple-500/30 rounded-lg p-3 text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                {cvReview.rewrittenSummary}
              </div>
            </div>
            <div className="mt-4 flex justify-end" data-no-pdf>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem("work_hunter_advisor_cv_import", JSON.stringify({
                      summary: cvReview.rewrittenSummary,
                      improvements: cvReview.improvements ?? [],
                    }));
                  } catch {}
                  router.push("/cv-builder");
                }}
                className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-500/60 px-3 py-1.5 rounded-xl transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {tx.cvBuilderAdvisorImportBtn}
              </button>
            </div>
          </Section>
        )}

        {/* Section 4: LinkedIn Profile */}
        <Section title={tx.summarySection4}>
          {linkedInData ? (
            <div className="space-y-4">
              <CopyField label={tx.linkedinHeadline} copyLabel={tx.linkedinCopyHeadline} text={linkedInData.headline}>
                <p className="text-white font-semibold">{linkedInData.headline}</p>
              </CopyField>
              <CopyField label={tx.linkedinAbout} copyLabel={tx.linkedinCopyAbout} text={linkedInData.about}>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{linkedInData.about}</p>
              </CopyField>
              {linkedInData.experienceBullets?.length > 0 && (
                <CopyField
                  label={tx.linkedinExperience}
                  copyLabel={tx.linkedinCopyBullets}
                  text={linkedInData.experienceBullets.map((b) => `• ${b}`).join("\n")}
                >
                  <ul className="space-y-1">
                    {linkedInData.experienceBullets.map((b, i) => (
                      <li key={i} className="text-white/80 text-sm flex gap-2">
                        <span className="text-sky-400 flex-shrink-0">•</span><span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </CopyField>
              )}
              {linkedInData.skills?.length > 0 && (
                <div>
                  <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.linkedinSkills}</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedInData.skills.map((s, i) => (
                      <span key={i} className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {linkedInData.keywords?.length > 0 && (
                <div>
                  <p className="text-sky-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.linkedinKeywords}</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedInData.keywords.map((k, i) => (
                      <span key={i} className="text-xs bg-sky-500/15 text-sky-300 border border-sky-500/25 px-2.5 py-1 rounded-full">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : linkedInLoading ? (
            <LoadingSpinner text={tx.linkedinGenerating} />
          ) : (
            <GenerateButton onClick={loadLinkedIn} icon="linkedin" label={tx.linkedinGenerate} error={linkedInError} />
          )}
        </Section>

        {/* Study-path users: point to Transition Roadmap instead of job strategy */}
        {isStudyPath && strategy && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl px-5 py-4 mb-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <div>
                <p className="text-blue-300 text-sm font-semibold mb-1">
                  {lang === "he" ? "אסטרטגיית הכניסה לתחום שלכם" : "Your field entry strategy"}
                </p>
                <p className="text-white/60 text-xs leading-relaxed">
                  {lang === "he"
                    ? "המסלול שבחרתם מתמקד בלימודים — מפת הדרכים שלכם למעבר הקריירה מפורטת בסעיף מפת הדרכים למעלה. כאשר תסיימו את ההכשרה, חיפוש העבודה יהיה הצעד הבא."
                    : "Your chosen path focuses on studies — your career transition roadmap is detailed in the Roadmap section above. Once you complete training, job searching will be the next step."}
                </p>
                {strategy.topLine && (
                  <p className="text-white/80 text-xs italic mt-2 border-t border-blue-500/20 pt-2">
                    "{strategy.topLine}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Search Strategy — only for job-ready users */}
        {strategy && isReadyForJobs && (
          <Section title={tx.summarySection5}>
            {strategy.topLine && (
              <div className="mb-5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
                <p className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-1">{tx.summaryTopLine}</p>
                <p className="text-white/90 text-sm leading-relaxed italic">"{strategy.topLine}"</p>
              </div>
            )}

            {/* Hot jobs */}
            {strategy.hotJobs && strategy.hotJobs.length > 0 && (
              <div className="mb-5">
                <h4 className="text-rose-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.strategyHotJobs}</h4>
                <div className="space-y-2">
                  {strategy.hotJobs.map((j, i) => (
                    <div key={i} className="bg-white/5 rounded-xl px-3 py-2.5 text-sm border border-white/5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-medium">{j.title}</span>
                        {j.company && <span className="text-white/40 text-xs">@ {j.company}</span>}
                      </div>
                      {j.description && <p className="text-white/60 text-xs">{j.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Target companies */}
            {strategy.targetCompanies?.length > 0 && (
              <div className="mb-5">
                <h4 className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.strategyCompanies}</h4>
                <div className="space-y-2">
                  {strategy.targetCompanies.slice(0, 5).map((c, i) => (
                    <div key={i} className="bg-white/5 rounded-xl px-3 py-2 text-sm">
                      <span className="text-white font-medium">{c.name}</span>
                      <span className="text-white/40 text-xs ms-2">{c.size}</span>
                      <p className="text-white/60 text-xs mt-0.5">{c.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 30-day plan */}
            {strategy.thirtyDayPlan && strategy.thirtyDayPlan.length > 0 && (
              <div className="mb-5">
                <h4 className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.strategyThirtyDay}</h4>
                <ol className="space-y-2">
                  {strategy.thirtyDayPlan.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <p className="text-white/80 text-sm leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Networking plan */}
            {strategy.networkingPlan && strategy.networkingPlan.length > 0 && (
              <div className="mb-5">
                <MiniList title={tx.strategyNetwork} items={strategy.networkingPlan} color="blue" />
              </div>
            )}

            {/* Hidden market tips */}
            {strategy.hiddenMarketTips && strategy.hiddenMarketTips.length > 0 && (
              <div className="mb-5">
                <MiniList title={tx.strategySectionHidden} items={strategy.hiddenMarketTips} color="emerald" />
              </div>
            )}

            {/* Facebook groups */}
            {strategy.facebookGroups && strategy.facebookGroups.length > 0 && (
              <div className="mb-5">
                <h4 className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.strategyFacebook}</h4>
                <div className="flex flex-wrap gap-2">
                  {strategy.facebookGroups.map((g, i) => (
                    <span key={i} className="text-xs bg-blue-500/15 text-blue-200 border border-blue-500/20 px-2.5 py-1 rounded-full">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Outreach template */}
            {strategy.outreachTemplate && (
              <CopyField label={tx.strategyTemplate} copyLabel={lang === "he" ? "העתק תבנית" : "Copy template"} text={strategy.outreachTemplate}>
                <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{strategy.outreachTemplate}</div>
              </CopyField>
            )}
          </Section>
        )}

        {/* Practical interview prep — only for job-ready users */}
        {diagnosis && isReadyForJobs && (
          <Section title={tx.practicalPrepTitle}>
            {practicalData ? (
              <div className="space-y-4">
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-3">
                  <span className="text-purple-300 text-xs font-semibold uppercase tracking-wide block mb-1">{tx.practicalPrepFormat}</span>
                  <p className="text-white/85 text-sm leading-relaxed">{practicalData.format}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-amber-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.practicalPrepBring}</h4>
                    <ul className="space-y-1">
                      {practicalData.whatToBring.map((item, i) => (
                        <li key={i} className="text-white/80 text-sm flex gap-2"><span className="text-amber-400">•</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-emerald-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.practicalPrepStandOut}</h4>
                    <ul className="space-y-1">
                      {practicalData.howToStandOut.map((tip, i) => (
                        <li key={i} className="text-white/80 text-sm flex gap-2"><span className="text-emerald-400">★</span>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {practicalData.whatToExpect.length > 0 && (
                  <div>
                    <h4 className="text-blue-300 text-xs font-semibold uppercase tracking-wide mb-2">{tx.practicalPrepExpect}</h4>
                    <div className="space-y-2">
                      {practicalData.whatToExpect.map((section, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5">
                          <p className="text-blue-300 text-xs font-semibold mb-1">{section.category}</p>
                          <ul className="space-y-0.5">
                            {section.items.map((it, j) => (
                              <li key={j} className="text-white/70 text-xs flex gap-1.5"><span className="text-blue-400">→</span>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={loadPractical} disabled={practicalLoading} className="text-xs text-white/30 hover:text-white/60 transition disabled:opacity-40">
                  {lang === "he" ? "↺ רענן" : "↺ Refresh"}
                </button>
              </div>
            ) : practicalLoading ? (
              <LoadingSpinner text={tx.practicalPrepGenerating} />
            ) : (
              <GenerateButton onClick={loadPractical} icon="clipboard" label={tx.practicalPrepGenerate} error={practicalError} />
            )}
          </Section>
        )}

        {/* Section 6: Mock Interview Feedback */}
        {mockInterview?.feedback && (
          <Section title={tx.summarySection6}>
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl px-5 py-4">
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">{mockInterview.feedback}</p>
            </div>
            {mockInterview.role && (
              <p className="text-white/30 text-xs mt-3">
                {lang === "he" ? `ראיון מדומה עבור: ${mockInterview.role}` : `Practiced for: ${mockInterview.role}`}
              </p>
            )}
          </Section>
        )}

        {/* Onboarding plan — only for job-ready users */}
        {isReadyForJobs && (
        <Section title={tx.onboardingTitle}>
          {onboardingData ? (
            <div className="grid md:grid-cols-3 gap-4">
              {([
                { key: "days30", label: tx.onboarding30, color: "emerald" },
                { key: "days60", label: tx.onboarding60, color: "blue" },
                { key: "days90", label: tx.onboarding90, color: "purple" },
              ] as const).map(({ key, label, color }) => (
                <div key={key} className="space-y-2">
                  <h4 className={`text-${color}-300 text-xs font-semibold uppercase tracking-wide`}>{label}</h4>
                  <ul className="space-y-1.5">
                    {onboardingData[key].map((step, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className={`text-${color}-400 flex-shrink-0 font-bold text-xs mt-0.5`}>{i + 1}.</span>
                        <span className="text-white/80 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : onboardingLoading ? (
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {tx.onboardingGenerating}
            </div>
          ) : (
            <div className="space-y-3">
              {onboardingError && <p className="text-rose-400 text-sm">{onboardingError}</p>}
              <button
                onClick={loadOnboarding}
                className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {tx.onboardingGenerate}
              </button>
            </div>
          )}
        </Section>
        )}

        {/* Email summary panel */}
        <div data-no-pdf className="mt-4 bg-white/[0.03] border border-white/10 rounded-3xl p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {tx.emailSummary}
          </h3>
          {emailState === "sent" ? (
            <p className="text-emerald-400 text-sm">{tx.emailSent}</p>
          ) : emailState === "failed" ? (
            <p className="text-rose-400 text-sm">{tx.emailFailed}</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={tx.emailInput}
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendEmail}
                disabled={!emailInput.trim() || emailState === "sending"}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition whitespace-nowrap"
              >
                {emailState === "sending" ? tx.emailSending : tx.emailSummary}
              </button>
            </div>
          )}
        </div>

        {/* Scout CTA — only for job-ready users */}
        {isReadyForJobs && <div data-no-pdf className="mt-4 bg-gradient-to-br from-purple-600/20 to-emerald-600/20 border border-purple-500/30 rounded-3xl p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 flex-shrink-0">
              <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {lang === "he" ? "עכשיו Scout ימצא לכם משרות" : "Now let Scout find your jobs"}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {lang === "he"
                  ? "Scout יקבל את הכיוונים שלכם מהייעוץ וימצא עבורכם משרות שמתאימות בדיוק לפרופיל."
                  : "Scout will receive your career direction and find jobs that match your profile precisely."}
              </p>
            </div>
          </div>
          <button
            onClick={handleSendToScout}
            className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition text-base"
          >
            {lang === "he" ? "שלח ל-Scout — מצא לי משרות" : "Send to Scout — Find my jobs"}
          </button>
        </div>}

        {/* Interview CTA — only for job-ready users */}
        {isReadyForJobs && <div data-no-pdf className="mt-4 bg-gradient-to-br from-rose-600/20 to-amber-600/20 border border-rose-500/30 rounded-3xl p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/20 flex-shrink-0">
              <svg className="w-6 h-6 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{tx.bonusInterview}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{tx.bonusInterviewDesc}</p>
            </div>
          </div>
          <button
            onClick={onOpenInterview}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl transition"
          >
            {tx.openInterview}
          </button>
        </div>}
      </div>
    </div>
  );
}

function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-white/50 text-sm">
      <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text}
    </div>
  );
}

const GENERATE_ICONS: Record<string, React.ReactNode> = {
  chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  map: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
  briefcase: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  clipboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
  linkedin: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" />,
};

function GenerateButton({ onClick, icon, label, error }: { onClick: () => void; icon: string; label: string; error?: string }) {
  return (
    <div className="space-y-2">
      {error && <p className="text-rose-400 text-sm">{error}</p>}
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 text-sm font-medium px-4 py-2.5 rounded-xl transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {GENERATE_ICONS[icon]}
        </svg>
        {label}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5">
      <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">{title}</h2>
      {children}
    </div>
  );
}

const MINI_COLORS = {
  emerald: { title: "text-emerald-300", bullet: "text-emerald-400" },
  purple: { title: "text-purple-300", bullet: "text-purple-400" },
  blue: { title: "text-blue-300", bullet: "text-blue-400" },
  rose: { title: "text-rose-300", bullet: "text-rose-400" },
} as const;

function MiniList({
  title,
  items,
  color,
  small = false,
}: {
  title: string;
  items: string[] | undefined | null;
  color: keyof typeof MINI_COLORS;
  small?: boolean;
}) {
  const c = MINI_COLORS[color];
  const safeItems = items ?? [];
  return (
    <div>
      <h4 className={`${c.title} ${small ? "text-[10px]" : "text-xs"} font-semibold mb-2 uppercase tracking-wide`}>
        {title}
      </h4>
      <ul className="space-y-1">
        {safeItems.map((it, i) => (
          <li key={i} className={`text-white/80 ${small ? "text-xs" : "text-sm"} flex gap-1.5`}>
            <span className={c.bullet}>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function pathLabel(
  path: LifePath,
  tx: { pathEmployee: string; pathEntrepreneur: string; pathStudies: string }
) {
  if (path === "employee") return tx.pathEmployee;
  if (path === "entrepreneur") return tx.pathEntrepreneur;
  return tx.pathStudies;
}

function CopyField({
  label,
  copyLabel,
  text,
  children,
}: {
  label: string;
  copyLabel: string;
  text: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sky-300 text-xs font-semibold uppercase tracking-wide">{label}</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-white/40 hover:text-sky-300 transition"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">✓</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copyLabel}
            </>
          )}
        </button>
      </div>
      {children}
    </div>
  );
}
