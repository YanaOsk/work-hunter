"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";

interface Props {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultLocation?: string;
  onClose: () => void;
}

export default function AddToCalendarModal({ defaultTitle = "", defaultDescription = "", defaultLocation = "", onClose }: Props) {
  const { lang } = useLanguage();
  const he = lang === "he";

  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [location, setLocation] = useState(defaultLocation);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ eventUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/calendar/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, date, time, durationMinutes: duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setDone({ eventUrl: data.eventUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#141415] border border-white/10 rounded-3xl p-6 shadow-2xl" dir={he ? "rtl" : "ltr"}>
        <button onClick={onClose} className="absolute top-4 end-4 text-white/30 hover:text-white/70 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-1">{he ? "נוסף ליומן!" : "Added to calendar!"}</h2>
            <p className="text-white/50 text-sm mb-5">{he ? "האירוע נוצר בהצלחה ביומן Google שלך" : "Event successfully created in your Google Calendar"}</p>
            <div className="flex gap-3 justify-center">
              <a href={done.eventUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#5E6AD2] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#6D79DB] transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {he ? "פתח ביומן" : "Open in Calendar"}
              </a>
              <button onClick={onClose} className="text-white/50 hover:text-white text-sm px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition">
                {he ? "סגור" : "Close"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#4285F4]/15 border border-[#4285F4]/25 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-white font-bold">{he ? "הוסף ראיון ליומן" : "Add interview to calendar"}</h2>
                <p className="text-white/40 text-xs">{he ? "Google Calendar" : "Google Calendar"}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-white/50 text-xs mb-1">{he ? "כותרת" : "Title"}</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#5E6AD2]/60 transition"
                  placeholder={he ? "ראיון עבודה — שם החברה" : "Job interview — Company name"} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-xs mb-1">{he ? "תאריך" : "Date"}</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5E6AD2]/60 transition" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1">{he ? "שעה" : "Time"}</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5E6AD2]/60 transition" />
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1">{he ? "משך (דקות)" : "Duration (min)"}</label>
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5E6AD2]/60 transition">
                  <option value={30}>30 {he ? "דקות" : "min"}</option>
                  <option value={45}>45 {he ? "דקות" : "min"}</option>
                  <option value={60}>60 {he ? "דקות" : "min"}</option>
                  <option value={90}>90 {he ? "דקות" : "min"}</option>
                  <option value={120}>120 {he ? "דקות" : "min"}</option>
                </select>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1">{he ? "מיקום / לינק (אופציונלי)" : "Location / Link (optional)"}</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#5E6AD2]/60 transition"
                  placeholder={he ? "כתובת או קישור Zoom/Meet" : "Address or Zoom/Meet link"} />
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1">{he ? "תיאור (אופציונלי)" : "Description (optional)"}</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#5E6AD2]/60 transition resize-none"
                  placeholder={he ? "פרטים נוספים..." : "Additional details..."} />
              </div>

              {error && <p className="text-rose-400 text-sm">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-[#5E6AD2] hover:bg-[#6D79DB] disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-xl transition">
                {loading ? (he ? "מוסיף..." : "Adding...") : (he ? "הוסף ליומן" : "Add to calendar")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
