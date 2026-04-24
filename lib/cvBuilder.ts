export interface CvExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface CvEducation {
  id: string;
  degree: string;
  school: string;
  location: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export type CvTemplate = "slate" | "minimal" | "accent" | "executive" | "tech" | "bold" | "elegant" | "gradient";

export const CV_TEMPLATES: { id: CvTemplate; labelHe: string; labelEn: string }[] = [
  { id: "slate", labelHe: "מודרני", labelEn: "Modern" },
  { id: "minimal", labelHe: "מינימלי", labelEn: "Minimal" },
  { id: "accent", labelHe: "צבעוני", labelEn: "Accent" },
  { id: "executive", labelHe: "קלאסי", labelEn: "Classic" },
  { id: "tech", labelHe: "טכנולוגי", labelEn: "Tech" },
  { id: "bold", labelHe: "נועז", labelEn: "Bold" },
  { id: "elegant", labelHe: "אלגנטי", labelEn: "Elegant" },
  { id: "gradient", labelHe: "גרדיאנט", labelEn: "Gradient" },
];

export const CV_ACCENT_COLORS: { hex: string; labelHe: string; labelEn: string }[] = [
  { hex: "#7c3aed", labelHe: "סגול", labelEn: "Purple" },
  { hex: "#2563eb", labelHe: "כחול", labelEn: "Blue" },
  { hex: "#059669", labelHe: "ירוק", labelEn: "Emerald" },
  { hex: "#e11d48", labelHe: "אדום", labelEn: "Rose" },
  { hex: "#d97706", labelHe: "כתום", labelEn: "Amber" },
  { hex: "#0891b2", labelHe: "ציאן", labelEn: "Cyan" },
  { hex: "#6366f1", labelHe: "אינדיגו", labelEn: "Indigo" },
  { hex: "#0f172a", labelHe: "כהה", labelEn: "Slate" },
];

export interface CvData {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experiences: CvExperience[];
  educations: CvEducation[];
  skills: string;
  languages: string;
  template: CvTemplate;
  accentColor: string;
}

export const EMPTY_CV: CvData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experiences: [],
  educations: [],
  skills: "",
  languages: "",
  template: "slate",
  accentColor: "#7c3aed",
};

const STORAGE_KEY = "work_hunter_cv_builder";

export function loadCv(): CvData {
  if (typeof window === "undefined") return EMPTY_CV;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CV;
    const parsed = JSON.parse(raw) as Partial<CvData>;
    return {
      personal: { ...EMPTY_CV.personal, ...(parsed.personal || {}) },
      summary: parsed.summary ?? "",
      experiences: parsed.experiences ?? [],
      educations: parsed.educations ?? [],
      skills: parsed.skills ?? "",
      languages: parsed.languages ?? "",
      template: parsed.template ?? "slate",
      accentColor: parsed.accentColor ?? "#7c3aed",
    };
  } catch {
    return EMPTY_CV;
  }
}

export function saveCv(data: CvData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearCv(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function emptyExperience(): CvExperience {
  return {
    id: newId(),
    role: "",
    company: "",
    location: "",
    start: "",
    end: "",
    current: false,
    description: "",
  };
}

export function emptyEducation(): CvEducation {
  return {
    id: newId(),
    degree: "",
    school: "",
    location: "",
    start: "",
    end: "",
    current: false,
    description: "",
  };
}
