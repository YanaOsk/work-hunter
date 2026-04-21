"use client";

interface Props {
  title: string;
  intro: string;
  actionLabel: string;
  onBack: () => void;
  onAction: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export default function StageIntro({
  title,
  intro,
  actionLabel,
  onBack,
  onAction,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-white/50 hover:text-white text-sm mb-6">
          ← Back
        </button>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-white/80 leading-relaxed text-lg">{intro}</p>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={onAction}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl transition"
            >
              {actionLabel}
            </button>
            {secondaryLabel && onSecondary && (
              <button
                onClick={onSecondary}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium py-3.5 rounded-xl transition"
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
