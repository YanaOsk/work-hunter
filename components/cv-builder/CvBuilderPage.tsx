"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import PromoBanner from "../PromoBanner";
import NavBar from "../NavBar";
import SiteFooter from "../SiteFooter";
import CvEditor from "./CvEditor";
import CvPreview from "./CvPreview";
import { CvData, EMPTY_CV, clearCv, loadCv, saveCv } from "@/lib/cvBuilder";

export default function CvBuilderPage() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const [data, setData] = useState<CvData>(EMPTY_CV);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadCv());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveCv(data);
  }, [data, loaded]);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm(tx.cvBuilderResetConfirm)) {
      clearCv();
      setData(EMPTY_CV);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
      <div className="print:hidden">
        <PromoBanner />
        <NavBar />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 print:p-0 print:max-w-none">
        <header className="print:hidden mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
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
                onClick={handlePrint}
                className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {tx.cvBuilderDownload}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 print:grid-cols-1">
          <div className="lg:col-span-2 print:hidden">
            <CvEditor data={data} onChange={setData} />
          </div>

          <div className="lg:col-span-3 print:col-span-1">
            <div className="lg:sticky lg:top-[110px] print:static">
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
