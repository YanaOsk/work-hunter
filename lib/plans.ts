export type PlanId = "free" | "weekly" | "one-time" | "pro";

export interface Plan {
  id: PlanId;
  nameEn: string;
  nameHe: string;
  price: number;
  displayPrice: string;
  per?: string;
  featuresHe: string[];
  color: "slate" | "sky" | "purple" | "amber";
  /** Days until renewal. null = lifetime (one-time purchase). undefined = free (no subscription). */
  renewalDays?: number | null;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    nameEn: "Free",
    nameHe: "חינמי",
    price: 0,
    displayPrice: "₪0",
    featuresHe: [
      "3 שיחות עם יועץ AI",
      "ניתוח קורות חיים בסיסי",
      "עד 5 התאמות משרה לחיפוש",
      "תמיכת קהילה",
    ],
    color: "slate",
  },
  weekly: {
    id: "weekly",
    nameEn: "Weekly",
    nameHe: "שבועי",
    price: 25,
    displayPrice: "₪25",
    per: "/ שבוע",
    renewalDays: 7,
    featuresHe: [
      "שיחות יועץ AI ללא הגבלה",
      "בניית קורות חיים מלאה",
      "עד 20 התאמות משרה לחיפוש",
      "הכנה לראיון מדומה",
      "תמיכה בעדיפות גבוהה",
    ],
    color: "sky",
  },
  "one-time": {
    id: "one-time",
    nameEn: "Career Boost",
    nameHe: "המסע המלא",
    price: 99,
    displayPrice: "₪99",
    renewalDays: null, // lifetime — never expires
    featuresHe: [
      "ייעוץ קריירה מקיף וממוקד",
      "כתיבה מחדש של קורות חיים",
      "30 התאמות משרה מותאמות אישית",
      "אופטימיזציה לפרופיל LinkedIn",
      "ראיון מדומה (פגישה אחת)",
      "תמיכה לחיפוש עבודה 3 חודשים",
      "מפת דרכים אישית לקריירה",
      "תמיכה בעדיפות גבוהה",
    ],
    color: "purple",
  },
  pro: {
    id: "pro",
    nameEn: "Pro",
    nameHe: "Pro",
    price: 39,
    displayPrice: "₪39",
    per: "/ חודש",
    renewalDays: 90, // auto-renews every 3 months
    featuresHe: [
      "כל מה שב-המסע המלא",
      "התאמות משרה ללא הגבלה",
      "צ'ק-אין שבועי עם יועץ AI",
      "ראיונות מדומים ללא הגבלה",
      "מעקב הגשות",
      "תמיכה ייעודית",
    ],
    color: "amber",
  },
};
