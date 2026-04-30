"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "../LanguageProvider";
import { t } from "@/lib/i18n";
import SiteFooter from "../SiteFooter";
import CvEditor from "./CvEditor";
import CvPreview from "./CvPreview";
import CvUpgrader from "./CvUpgrader";
import CvTranslator from "./CvTranslator";
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
import type { CvMeta } from "@/lib/cvs";

type View = "list" | "editor";

export default function CvBuilderPage() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user?.email;
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from");
  const cvIdParam = searchParams.get("cvId");

  const [view, setView] = useState<View>("list");
  const [cvList, setCvList] = useState<CvMeta[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [activeCvId, setActiveCvId] = useState<string | null>(null);
  const [cvName, setCvName] = useState("");
  const [data, setData] = useState<CvData>(EMPTY_CV);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [downloading, setDownloading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importDragging, setImportDragging] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load CV list on mount (authenticated) or localStorage (guest)
  useEffect(() => {
    if (status === "loading") return;
    if (isLoggedIn) {
      fetchList();
    } else {
      // Guest: load from localStorage, go straight to editor
      setListLoading(false);
      setData(loadCv(lang));
      setLoaded(true);
      setView("editor");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, status]);

  // Guest autosave
  useEffect(() => {
    if (!isLoggedIn && loaded) saveCv(data, lang);
  }, [data, loaded, isLoggedIn]);

  // Auto-open a specific CV when cvId is in the URL
  useEffect(() => {
    if (!cvIdParam || view === "editor" || cvList.length === 0) return;
    const meta = cvList.find((c) => c.id === cvIdParam);
    if (meta) openExisting(meta);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvList, cvIdParam]);

  const fetchList = async () => {
    setListLoading(true);
    try {
      const res = await fetch("/api/cvs");
      if (res.ok) {
        const list: CvMeta[] = await res.json();
        setCvList(list);
      }
    } catch {
      // silently fail
    } finally {
      setListLoading(false);
    }
  };

  const openNew = () => {
    setActiveCvId(null);
    setCvName(tx.cvUntitled);
    setData(EMPTY_CV);
    setLoaded(true);
    setSaveStatus("idle");
    setView("editor");
  };

  const openExisting = async (meta: CvMeta) => {
    try {
      const res = await fetch(`/api/cvs/${meta.id}`);
      if (res.ok) {
        const saved = await res.json();
        setActiveCvId(saved.id);
        setCvName(saved.name);
        setData(saved.data);
        setLoaded(true);
        setSaveStatus("idle");
        setView("editor");
      }
    } catch {
      // silently fail
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn || saving) return;
    setSaving(true);
    setSaveStatus("saving");
    try {
      if (activeCvId) {
        // Update existing
        const res = await fetch(`/api/cvs/${activeCvId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cvName, data }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          await fetchList();
        }
      } else {
        // Create new
        const res = await fetch("/api/cvs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cvName, data }),
        });
        if (res.ok) {
          const saved = await res.json();
          setActiveCvId(saved.id);
          setSaveStatus("saved");
          await fetchList();
        }
      }
    } catch {
      setSaveStatus("idle");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tx.cvDeleteConfirm)) return;
    try {
      await fetch(`/api/cvs/${id}`, { method: "DELETE" });
      setCvList((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // silently fail
    }
  };

  const handleBackToList = () => {
    if (fromUrl) {
      router.push(fromUrl);
    } else {
      setView("list");
      fetchList();
    }
  };

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

  const handleReset = () => setShowResetModal(true);

  const confirmReset = () => {
    if (!isLoggedIn) clearCv(lang);
    setData(EMPTY_CV);
    setShowResetModal(false);
  };

  const handleImport = async () => {
    if (!importFile || importing) return;
    setImporting(true);
    setImportError("");
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("lang", lang);
      const res = await fetch("/api/import-cv", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Import failed");
      }
      const cvData: CvData = await res.json();
      setActiveCvId(null);
      setCvName(cvData.personal.fullName
        ? (lang === "he" ? `קורות חיים — ${cvData.personal.fullName}` : `Resume — ${cvData.personal.fullName}`)
        : tx.cvUntitled);
      setData(cvData);
      setLoaded(true);
      setSaveStatus("idle");
      setShowImportModal(false);
      setImportFile(null);
      setView("editor");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : tx.cvImportError);
    } finally {
      setImporting(false);
    }
  };

  const handleTranslateDone = (translatedData: CvData, newName: string) => {
    setActiveCvId(null);
    setCvName(newName);
    setData(translatedData);
    setLoaded(true);
    setSaveStatus("idle");
    setShowTranslateModal(false);
    setView("editor");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === "he" ? "he-IL" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ---------- SESSION LOADING ----------
  if (status === "loading") {
    return <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900" />;
  }

  // ---------- LIST VIEW ----------
  if (isLoggedIn && view === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              {fromUrl && (
                <button
                  onClick={() => router.push(fromUrl)}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm mb-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {lang === "he" ? "חזור" : "Back"}
                </button>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{tx.cvMyCvs}</h1>
              <p className="text-white/50 text-sm">{cvList.length} {lang === "he" ? "קורות חיים" : "resume(s)"}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowImportModal(true); setImportFile(null); setImportError(""); }}
                className="border border-white/20 hover:border-purple-500/60 bg-white/5 hover:bg-purple-500/10 text-white/70 hover:text-white font-medium px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {tx.cvImportCv}
              </button>
              <button
                onClick={openNew}
                className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {tx.cvNewCv}
              </button>
            </div>
          </div>

          {/* Import modal */}
          {showImportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-white font-bold text-lg">{tx.cvImportTitle}</h2>
                    <p className="text-white/50 text-sm mt-1">{tx.cvImportSubtitle}</p>
                  </div>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-white/30 hover:text-white/70 transition ml-4 mt-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Drop zone */}
                <div
                  onClick={() => !importing && importInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setImportDragging(true); }}
                  onDragLeave={() => setImportDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImportDragging(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f?.type === "application/pdf") { setImportFile(f); setImportError(""); }
                  }}
                  className={`group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                    importDragging
                      ? "border-purple-400 bg-purple-500/10"
                      : importFile
                      ? "border-emerald-500/60 bg-emerald-500/5"
                      : "border-white/20 hover:border-purple-500 hover:bg-purple-500/8"
                  }`}
                >
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setImportFile(f); setImportError(""); }
                    }}
                  />
                  {importFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium truncate max-w-[200px]">{importFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-8 h-8 mx-auto mb-2 text-white/30 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-white/50 text-sm group-hover:text-white/80 transition-colors">{tx.cvImportDrop}</p>
                    </>
                  )}
                </div>

                {importError && (
                  <p className="text-rose-400 text-xs mb-3 text-center">{importError}</p>
                )}

                <button
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white hover:text-white/80 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-purple-900/30"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {tx.cvImporting}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                      </svg>
                      {tx.cvImportStart}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {listLoading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin w-8 h-8 text-white/30" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : cvList.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-14 h-14 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-white/40 text-sm mb-6">
                {lang === "he" ? "עדיין אין לך קורות חיים שמורים" : "You have no saved resumes yet"}
              </p>
              <button
                onClick={openNew}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition"
              >
                {tx.cvNewCv}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvList.map((cv) => (
                <div
                  key={cv.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 hover:bg-white/[0.07] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate text-sm">{cv.name}</h3>
                      <p className="text-white/40 text-xs mt-1">
                        {tx.cvLastUpdated}: {formatDate(cv.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(cv.id)}
                      className="ms-2 text-rose-400/50 hover:text-rose-400 transition opacity-0 group-hover:opacity-100"
                      title={lang === "he" ? "מחק" : "Delete"}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => openExisting(cv)}
                    className="w-full mt-3 bg-white/5 hover:bg-purple-600 border border-white/10 hover:border-purple-500 text-white/70 hover:text-white text-xs font-medium py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {tx.cvEditBtn}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ---------- EDITOR VIEW ----------
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900">

      {/* Mobile desktop-recommendation banner */}
      <div className="lg:hidden print:hidden bg-amber-500/10 border-b border-amber-500/25 px-4 py-3 flex items-center gap-3 animate-fade-in-down">
        <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-amber-300 text-sm leading-snug">
          {lang === "he"
            ? "לחוויה הטובה ביותר בבניית קורות החיים, מומלץ להשתמש במסך מחשב."
            : "For the best CV building experience, we recommend using a desktop computer."}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 print:p-0 print:max-w-none">
        <header className="print:hidden mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isLoggedIn && (
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1 text-white/50 hover:text-white transition flex-shrink-0 text-sm"
                    title={fromUrl ? (lang === "he" ? "חזור" : "Back") : tx.cvBackToList}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {fromUrl ? (lang === "he" ? "חזור" : "Back") : tx.cvBackToList}
                  </button>
                )}
                {isLoggedIn ? (
                  <input
                    value={cvName}
                    onChange={(e) => setCvName(e.target.value)}
                    className="text-2xl md:text-3xl font-bold text-white bg-transparent border-b border-white/20 focus:border-purple-500 outline-none pb-0.5 max-w-xs"
                    placeholder={tx.cvUntitled}
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{tx.cvBuilderTitle}</h1>
                )}
              </div>
              {tx.cvBuilderSubtitle && <p className="text-white/60 text-sm max-w-2xl">{tx.cvBuilderSubtitle}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isLoggedIn ? (
                <span className="text-emerald-400 text-xs flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {tx.cvBuilderSaved}
                </span>
              ) : (
                <span
                  className={`text-xs flex items-center gap-1.5 transition ${
                    saveStatus === "saved" ? "text-emerald-400" : saveStatus === "saving" ? "text-white/40" : "text-white/0"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {saveStatus === "saving" ? tx.cvSaving : tx.cvSavedOk}
                </span>
              )}

              <button
                onClick={handleReset}
                className="text-white/50 hover:text-white text-sm px-3 py-2 border border-white/10 hover:border-white/20 rounded-lg transition"
              >
                {tx.cvBuilderReset}
              </button>

              <div className="relative group/tt">
                <button
                  onClick={() => setShowTranslateModal(true)}
                  className="text-white/60 hover:text-white text-sm px-3 py-2 border border-white/10 hover:border-sky-500/50 rounded-lg transition flex items-center gap-1.5"
                >
                  <span className="text-sm leading-none">🌐</span>
                  <span className="hidden sm:inline">{tx.cvTranslateBtn}</span>
                </button>
                <div className={`pointer-events-none absolute top-full ${lang === "he" ? "right-0" : "left-0"} mt-2 w-64 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-white/75 text-xs leading-relaxed shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity duration-150 z-50`}>
                  {tx.cvTranslateBtnTooltip}
                </div>
              </div>

              <div className="relative group/tt2">
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-white/60 hover:text-white text-sm px-3 py-2 border border-white/10 hover:border-amber-500/50 rounded-lg transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden sm:inline">{tx.cvUpgradeBtn}</span>
                </button>
                <div className={`pointer-events-none absolute top-full ${lang === "he" ? "right-0" : "left-0"} mt-2 w-64 bg-slate-800 border border-white/15 rounded-xl px-3 py-2.5 text-white/75 text-xs leading-relaxed shadow-xl opacity-0 group-hover/tt2:opacity-100 transition-opacity duration-150 z-50`}>
                  {tx.cvUpgradeBtnTooltip}
                </div>
              </div>

              <button
                onClick={() => { setShowImportModal(true); setImportFile(null); setImportError(""); }}
                className="text-white/60 hover:text-white text-sm px-3 py-2 border border-white/10 hover:border-purple-500/50 rounded-lg transition flex items-center gap-1.5"
                title={tx.cvImportCv}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">{tx.cvImportCv}</span>
              </button>

              {isLoggedIn && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  {saving ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  {saving ? tx.cvSaving : tx.cvSaveCv}
                </button>
              )}

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

          <div className="hidden lg:block lg:col-span-3 print:block print:col-span-1">
            <div ref={previewRef} className="lg:sticky lg:top-[110px] print:static">
              <CvPreview data={data} />
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <SiteFooter />
      </div>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowResetModal(false)}
          />
          <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl shadow-black/40 animate-slide-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {lang === "he" ? "איפוס קורות חיים" : "Reset Resume"}
              </h3>
              <p className="text-white/55 text-sm mb-7">
                {tx.cvBuilderResetConfirm}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition text-sm font-medium"
                >
                  {lang === "he" ? "ביטול" : "Cancel"}
                </button>
                <button
                  onClick={confirmReset}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition text-sm font-semibold shadow-lg shadow-rose-500/20"
                >
                  {tx.cvBuilderReset}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade modal — available from editor view only */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8">
            <CvUpgrader
              cvData={data}
              onApplyChanges={(newData) => setData(newData)}
              onClose={() => setShowUpgradeModal(false)}
            />
          </div>
        </div>
      )}

      {/* Translate modal */}
      {showTranslateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <CvTranslator
              currentData={data}
              currentName={cvName || tx.cvUntitled}
              onDone={handleTranslateDone}
              onClose={() => setShowTranslateModal(false)}
            />
          </div>
        </div>
      )}

      {/* Import modal — available from editor view too */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-lg">{tx.cvImportTitle}</h2>
                <p className="text-white/50 text-sm mt-1">{tx.cvImportSubtitle}</p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-white/30 hover:text-white/70 transition ml-4 mt-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div
              onClick={() => !importing && importInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setImportDragging(true); }}
              onDragLeave={() => setImportDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setImportDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f?.type === "application/pdf") { setImportFile(f); setImportError(""); }
              }}
              className={`group border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                importDragging
                  ? "border-purple-400 bg-purple-500/10"
                  : importFile
                  ? "border-emerald-500/60 bg-emerald-500/5"
                  : "border-white/20 hover:border-purple-500 hover:bg-purple-500/10"
              }`}
            >
              <input
                ref={importInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setImportFile(f); setImportError(""); }
                }}
              />
              {importFile ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium truncate max-w-[200px]">{importFile.name}</span>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mx-auto mb-2 text-white/30 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-white/50 text-sm group-hover:text-white/80 transition-colors">{tx.cvImportDrop}</p>
                </>
              )}
            </div>

            {importError && (
              <p className="text-rose-400 text-xs mb-3 text-center">{importError}</p>
            )}

            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white hover:text-white/80 font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-purple-900/30"
            >
              {importing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {tx.cvImporting}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>
                  {tx.cvImportStart}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
