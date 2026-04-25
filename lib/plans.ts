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
    price: 49,
    displayPrice: "₪49",
    per: "/ שבוע",
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
    nameHe: "Career Boost",
    price: 99,
    displayPrice: "₪99",
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
    price: 149,
    displayPrice: "₪149",
    per: "/ חודש",
    featuresHe: [
      "כל מה שב-Career Boost",
      "התאמות משרה ללא הגבלה",
      "צ'ק-אין שבועי עם יועץ AI",
      "ראיונות מדומים ללא הגבלה",
      "מעקב הגשות",
      "תמיכה ייעודית",
    ],
    color: "amber",
  },
};
