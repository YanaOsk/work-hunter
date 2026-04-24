"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import SiteFooter from "../SiteFooter";
import CvEditor from "./CvEditor";
import CvPreview from "./CvPreview";
import {
  CV_ACCENT_COLORS,
  CV_TEMPLATES,
  CvData,
  CvTemplate,
  EMPTY_CV,
  clearCv,
  loadCv,
  saveCv,
} from "@/lib/cvBuilder";

export default function CvBuilderPage() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [data, setData] = useState<CvData>(EMPTY_CV);
  const [loaded, setLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(loadCv());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCv(data);
  }, [data, loaded]);

  const handleDownload = async () => {
    const wrapper = previewRef.current;
    if (!wrapper || downloading) return;
    setDownloading(true);

    try {
      const { toCanvas } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const target = (wrapper.firstElementChild as HTMLElement) ?? wrapper;

      const canvas = await toCanvas(target, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        skipFonts: false,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas is empty");
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pageW = 210;
      const pageH = 297;
      const ratio = pageW / canvas.width;
      const totalH = canvas.height * ratio;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      let yOffset = 0;
      let remaining = totalH;

      while (remaining > 0) {
        pdf.addImage(imgData, "JPEG", 0, -yOffset, pageW, totalH);
        remaining -= pageH;
        if (remaining > 0) {
          pdf.addPage();
          yOffset += pageH;
        }
      }

      const fileName = (data.personal.fullName?.trim() || "cv").replace(/\s+/g, "_");
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF generation failed:", msg);
      alert(`שגיאה: ${msg}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    if (confirm(tx.cvBuilderResetConfirm)) {
      clearCv();
      setData(EMPTY_CV);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 print:p-0 print:max-w-none">
        <header className="print:hidden mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                {tx.cvBuilderTitle}
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-2xl">{tx.cvBuilderSubtitle}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-emerald-400 text-xs flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {tx.cvBuilderSaved}
              </span>
              <button
                onClick={handleReset}
                className="text-white/50 hover:text-white text-sm px-3 py-2 border border-white/10 hover:border-white/20 rounded-lg transition"
              >
                {tx.cvBuilderReset}
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                {downloading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                )}
                {downloading ? (lang === "he" ? "מכין..." : "Preparing...") : tx.cvBuilderDownload}
              </button>
            </div>
          </div>

          {/* Template selector */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-white/50 text-xs me-1">{lang === "he" ? "תבנית:" : "Template:"}</span>
            {CV_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setData((d) => ({ ...d, template: tpl.id as CvTemplate }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${
                  data.template === tpl.id
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {lang === "he" ? tpl.labelHe : tpl.labelEn}
              </button>
            ))}
          </div>

          {/* Accent color picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/50 text-xs me-1">{lang === "he" ? "צבע:" : "Color:"}</span>
            {CV_ACCENT_COLORS.map((c) => (
              <button
                key={c.hex}
                title={lang === "he" ? c.labelHe : c.labelEn}
                onClick={() => setData((d) => ({ ...d, accentColor: c.hex }))}
                className={`w-7 h-7 rounded-full transition-all border-2 ${
                  data.accentColor === c.hex
                    ? "scale-110 border-white shadow-lg"
                    : "border-white/20 hover:scale-110 hover:border-white/50"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:grid-cols-1">
          <div className="lg:col-span-2 print:hidden">
            <CvEditor data={data} onChange={setData} />
          </div>

          <div className="lg:col-span-3 print:col-span-1">
            <div ref={previewRef} className="lg:sticky lg:top-[110px] print:static">
              <CvPreview data={data} />
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
