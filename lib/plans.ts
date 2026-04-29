export type PlanId = "free" | "weekly" | "quarterly" | "lifetime";

export interface Plan {
  id: PlanId;
  nameEn: string;
  nameHe: string;
  price: number;
  displayPrice: string;
  per?: string;
  featuresHe: string[];
  color: "slate" | "sky" | "purple" | "amber";
  /** Days until expiry. null = lifetime (never expires). undefined = free (no subscription). */
  renewalDays?: number | null;
}

const SHARED_FEATURES_HE = [
  "בניית קורות חיים מקצועית עם AI",
  "שדרוג וניתוח קורות חיים",
  "תרגום קורות חיים חכם (עברית ↔ אנגלית)",
  "יועץ קריירה ללא הגבלה",
  "סקאוט חיפוש עבודה ללא הגבלה",
];

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    nameEn: "Free",
    nameHe: "חינמי",
    price: 0,
    displayPrice: "₪0",
    featuresHe: [
      "אבחון אישיות מלא (MBTI + Holland)",
      "כיוון חיים — בחירת מסלול",
      "תצוגה מוגבלת של הסיכום",
      "צ'אט יועץ מוגבל (10 הודעות ביום)",
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
    featuresHe: SHARED_FEATURES_HE,
    color: "sky",
  },
  quarterly: {
    id: "quarterly",
    nameEn: "3 Months",
    nameHe: "3 חודשים",
    price: 59,
    displayPrice: "₪59",
    per: "/ 3 חודשים",
    renewalDays: 90,
    featuresHe: SHARED_FEATURES_HE,
    color: "purple",
  },
  lifetime: {
    id: "lifetime",
    nameEn: "Lifetime",
    nameHe: "לצמיתות",
    price: 99,
    displayPrice: "₪99",
    renewalDays: null,
    featuresHe: SHARED_FEATURES_HE,
    color: "amber",
  },
};
