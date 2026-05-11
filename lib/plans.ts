export type PlanId = "free" | "weekly" | "monthly" | "quarterly" | "annual";

export interface Plan {
  id: PlanId;
  nameEn: string;
  nameHe: string;
  price: number;
  displayPrice: string;
  per?: string;
  subPriceHe?: string;
  subPriceEn?: string;
  featuresHe: string[];
  color: "slate" | "sky" | "teal" | "purple" | "amber";
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
  monthly: {
    id: "monthly",
    nameEn: "Monthly",
    nameHe: "חודשי",
    price: 49,
    displayPrice: "₪49",
    per: "/ חודש",
    renewalDays: 30,
    featuresHe: SHARED_FEATURES_HE,
    color: "teal",
  },
  quarterly: {
    id: "quarterly",
    nameEn: "3 Months",
    nameHe: "3 חודשים",
    price: 99,
    displayPrice: "₪99",
    per: "/ 3 חודשים",
    subPriceHe: "כ-₪33 לחודש",
    subPriceEn: "~₪33/mo",
    renewalDays: 90,
    featuresHe: SHARED_FEATURES_HE,
    color: "purple",
  },
  annual: {
    id: "annual",
    nameEn: "Annual",
    nameHe: "שנתי",
    price: 249,
    displayPrice: "₪249",
    per: "/ שנה",
    subPriceHe: "כ-₪21 לחודש",
    subPriceEn: "~₪21/mo",
    renewalDays: 365,
    featuresHe: SHARED_FEATURES_HE,
    color: "amber",
  },
};
