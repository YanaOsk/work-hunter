"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { t } from "@/lib/i18n";
import LogoMark from "./LogoMark";

export default function SiteFooter() {
  const { lang } = useLanguage();
  const tx = t[lang];
  const he = lang === "he";

  const columns = he
    ? [
        {
          label: "מוצר",
          links: [
            { href: "/", label: "ראשי" },
            { href: "/pricing", label: "תמחור" },
            { href: "/reviews", label: "ביקורות" },
          ],
        },
        {
          label: "כלים",
          links: [
            { href: "/advisor?profileId=default-advisor", label: "יועץ קריירה" },
            { href: "/cv-builder", label: "בונה קורות חיים" },
            { href: "/cv-examples", label: "דוגמאות קורות חיים" },
            { href: "/tracker", label: "מעקב בקשות" },
          ],
        },
        {
          label: "חברה",
          links: [
            { href: "/contact", label: "צרו קשר" },
            { href: "/privacy", label: "פרטיות" },
            { href: "/terms", label: "תנאי שימוש" },
          ],
        },
      ]
    : [
        {
          label: "Product",
          links: [
            { href: "/", label: "Home" },
            { href: "/pricing", label: "Pricing" },
            { href: "/reviews", label: "Reviews" },
          ],
        },
        {
          label: "Tools",
          links: [
            { href: "/advisor?profileId=default-advisor", label: "Career Advisor" },
            { href: "/cv-builder", label: "CV Builder" },
            { href: "/cv-examples", label: "CV Examples" },
            { href: "/tracker", label: "Job Tracker" },
          ],
        },
        {
          label: "Company",
          links: [
            { href: "/contact", label: "Contact" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ],
        },
      ];

  return (
    <footer
      className="border-t border-white/[0.06] mt-8"
      style={{ background: "rgba(12,12,13,0.60)" }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-12 pb-8">
        {/* Top row: logo + columns */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pb-10 border-b border-white/[0.05]`} dir={he ? "rtl" : "ltr"}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3 hover:opacity-90 transition w-fit">
              <LogoMark size="sm" />
              <span className="text-white font-semibold tracking-tight">Work Hunter</span>
            </Link>
            <p className="text-white/35 text-xs leading-relaxed max-w-[180px]">
              {he
                ? "חיפוש עבודה חכם, מונחה בינה מלאכותית, בעברית."
                : "AI-powered job search, built for the Israeli market."}
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.label}>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.10em] mb-3">
                {col.label}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-white/50 hover:text-white/90 text-sm transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          dir={he ? "rtl" : "ltr"}
        >
          <p className="text-white/25 text-xs">{tx.footerRights}</p>
          <div className="flex items-center gap-4">
            <span className="text-white/20 text-[10px] uppercase tracking-widest">
              {he ? "עברית / English" : "Hebrew / English"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
