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

export interface CvMilitary {
  unit: string;
  role: string;
  start: string;
  end: string;
  reserveDuty: boolean;
}

export type CvTemplate = "slate" | "minimal" | "accent" | "executive" | "tech" | "bold" | "elegant" | "gradient";

export const CV_TEMPLATES: { id: CvTemplate; labelHe: string; labelEn: string; supportsPhoto?: boolean }[] = [
  { id: "slate",     labelHe: "Nova",     labelEn: "Nova",     supportsPhoto: true  },
  { id: "minimal",   labelHe: "Nordic",   labelEn: "Nordic",   supportsPhoto: true  },
  { id: "accent",    labelHe: "Sidebar",  labelEn: "Sidebar",  supportsPhoto: true  },
  { id: "executive", labelHe: "Classic",  labelEn: "Classic"                        },
  { id: "tech",      labelHe: "Code",     labelEn: "Code"                           },
  { id: "bold",      labelHe: "Impact",   labelEn: "Impact"                         },
  { id: "elegant",   labelHe: "Timeline", labelEn: "Timeline", supportsPhoto: true  },
  { id: "gradient",  labelHe: "Prism",    labelEn: "Prism"                          },
];

export const CV_ACCENT_COLORS: { hex: string; labelHe: string; labelEn: string }[] = [
  { hex: "#7c3aed", labelHe: "סגול",      labelEn: "Purple"   },
  { hex: "#2563eb", labelHe: "כחול",      labelEn: "Blue"     },
  { hex: "#059669", labelHe: "ירוק",      labelEn: "Emerald"  },
  { hex: "#e11d48", labelHe: "אדום",      labelEn: "Rose"     },
  { hex: "#d97706", labelHe: "כתום",      labelEn: "Amber"    },
  { hex: "#0891b2", labelHe: "ציאן",      labelEn: "Cyan"     },
  { hex: "#6366f1", labelHe: "אינדיגו",   labelEn: "Indigo"   },
  { hex: "#0f172a", labelHe: "כהה",       labelEn: "Slate"    },
  { hex: "#ec4899", labelHe: "ורוד",      labelEn: "Pink"     },
  { hex: "#ea580c", labelHe: "כתום כהה",  labelEn: "Orange"   },
  { hex: "#0d9488", labelHe: "טורקיז",    labelEn: "Teal"     },
  { hex: "#16a34a", labelHe: "ירוק כהה",  labelEn: "Green"    },
  { hex: "#9333ea", labelHe: "סגול בהיר", labelEn: "Violet"   },
  { hex: "#0369a1", labelHe: "כחול כהה",  labelEn: "Navy"     },
  { hex: "#be123c", labelHe: "ארגמן",     labelEn: "Crimson"  },
  { hex: "#92400e", labelHe: "ברונזה",    labelEn: "Bronze"   },
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
    photo: string;
  };
  summary: string;
  experiences: CvExperience[];
  educations: CvEducation[];
  military: CvMilitary;
  skills: string;
  languages: string;
  volunteering: string;
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
    photo: "",
  },
  summary: "",
  experiences: [],
  educations: [],
  military: {
    unit: "",
    role: "",
    start: "",
    end: "",
    reserveDuty: false,
  },
  skills: "",
  languages: "",
  volunteering: "",
  template: "slate",
  accentColor: "#7c3aed",
};

const STORAGE_KEY = (lang?: string) =>
  lang === "en" ? "work_hunter_cv_builder_en" : "work_hunter_cv_builder_he";

function parseCvData(parsed: Partial<CvData>): CvData {
  return {
    personal: { ...EMPTY_CV.personal, ...(parsed.personal || {}) },
    summary: parsed.summary ?? "",
    experiences: parsed.experiences ?? [],
    educations: parsed.educations ?? [],
    military: { ...EMPTY_CV.military, ...(parsed.military || {}) },
    skills: parsed.skills ?? "",
    languages: parsed.languages ?? "",
    volunteering: parsed.volunteering ?? "",
    template: parsed.template ?? "slate",
    accentColor: parsed.accentColor ?? "#7c3aed",
  };
}

export function loadCv(lang?: string): CvData {
  if (typeof window === "undefined") return EMPTY_CV;
  try {
    const raw = localStorage.getItem(STORAGE_KEY(lang));
    if (!raw) return EMPTY_CV;
    return parseCvData(JSON.parse(raw) as Partial<CvData>);
  } catch {
    return EMPTY_CV;
  }
}

export function saveCv(data: CvData, lang?: string): void {
  localStorage.setItem(STORAGE_KEY(lang), JSON.stringify(data));
}

export function clearCv(lang?: string): void {
  localStorage.removeItem(STORAGE_KEY(lang));
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
