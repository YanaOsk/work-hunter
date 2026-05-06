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

export type CvTemplate = "slate" | "minimal" | "accent" | "executive" | "tech" | "bold" | "elegant" | "gradient" | "ats" | "clean" | "split" | "creative" | "exec2";

export const CV_TEMPLATES: { id: CvTemplate; labelHe: string; labelEn: string; supportsPhoto?: boolean }[] = [
  { id: "slate",     labelHe: "Nova",          labelEn: "Nova",          supportsPhoto: true  },
  { id: "minimal",   labelHe: "Nordic",        labelEn: "Nordic",        supportsPhoto: true  },
  { id: "accent",    labelHe: "Sidebar",       labelEn: "Sidebar",       supportsPhoto: true  },
  { id: "executive", labelHe: "Classic",       labelEn: "Classic"                             },
  { id: "tech",      labelHe: "Code",          labelEn: "Code"                                },
  { id: "bold",      labelHe: "Impact",        labelEn: "Impact"                              },
  { id: "elegant",   labelHe: "Timeline",      labelEn: "Timeline",      supportsPhoto: true  },
  { id: "gradient",  labelHe: "Prism",         labelEn: "Prism"                               },
  { id: "ats",       labelHe: "ATS",           labelEn: "ATS"                                 },
  { id: "clean",     labelHe: "Minimalist",    labelEn: "Minimalist",    supportsPhoto: true  },
  { id: "split",     labelHe: "Split",         labelEn: "Split",         supportsPhoto: true  },
  { id: "creative",  labelHe: "Creative",      labelEn: "Creative",      supportsPhoto: true  },
  { id: "exec2",     labelHe: "Executive Pro", labelEn: "Executive Pro", supportsPhoto: true  },
];

export const CV_ACCENT_COLORS: { hex: string; labelHe: string; labelEn: string }[] = [
  // Purples
  { hex: "#7c3aed", labelHe: "סגול",           labelEn: "Purple"        },
  { hex: "#9333ea", labelHe: "סגול בהיר",      labelEn: "Violet"        },
  { hex: "#6366f1", labelHe: "אינדיגו",        labelEn: "Indigo"        },
  { hex: "#a855f7", labelHe: "פוקסיה",         labelEn: "Fuchsia"       },
  { hex: "#c026d3", labelHe: "מגנטה",          labelEn: "Magenta"       },
  { hex: "#4f46e5", labelHe: "אינדיגו כהה",   labelEn: "Deep Indigo"   },
  // Blues
  { hex: "#2563eb", labelHe: "כחול",           labelEn: "Blue"          },
  { hex: "#0369a1", labelHe: "כחול כהה",       labelEn: "Navy"          },
  { hex: "#0ea5e9", labelHe: "כחול שמיים",     labelEn: "Sky Blue"      },
  { hex: "#0891b2", labelHe: "ציאן",           labelEn: "Cyan"          },
  { hex: "#1d4ed8", labelHe: "כחול עמוק",      labelEn: "Royal Blue"    },
  { hex: "#38bdf8", labelHe: "תכלת",           labelEn: "Light Blue"    },
  // Greens
  { hex: "#059669", labelHe: "ירוק",           labelEn: "Emerald"       },
  { hex: "#16a34a", labelHe: "ירוק כהה",       labelEn: "Green"         },
  { hex: "#0d9488", labelHe: "טורקיז",         labelEn: "Teal"          },
  { hex: "#65a30d", labelHe: "ירוק-צהוב",      labelEn: "Lime"          },
  { hex: "#15803d", labelHe: "ירוק יער",       labelEn: "Forest"        },
  { hex: "#2dd4bf", labelHe: "מנטה",           labelEn: "Mint"          },
  // Reds & Pinks
  { hex: "#e11d48", labelHe: "אדום",           labelEn: "Rose"          },
  { hex: "#be123c", labelHe: "ארגמן",          labelEn: "Crimson"       },
  { hex: "#ec4899", labelHe: "ורוד",           labelEn: "Pink"          },
  { hex: "#f43f5e", labelHe: "אדום-ורוד",      labelEn: "Coral Red"     },
  { hex: "#db2777", labelHe: "ורוד כהה",       labelEn: "Deep Pink"     },
  { hex: "#fb7185", labelHe: "ורוד פסטל",      labelEn: "Pastel Pink"   },
  // Oranges & Yellows
  { hex: "#ea580c", labelHe: "כתום",           labelEn: "Orange"        },
  { hex: "#d97706", labelHe: "ענבר",           labelEn: "Amber"         },
  { hex: "#b45309", labelHe: "חום-כתום",       labelEn: "Burnt Orange"  },
  { hex: "#92400e", labelHe: "ברונזה",         labelEn: "Bronze"        },
  { hex: "#ca8a04", labelHe: "זהב",            labelEn: "Gold"          },
  { hex: "#f59e0b", labelHe: "צהוב-כתום",      labelEn: "Yellow"        },
  // Neutrals & Darks
  { hex: "#0f172a", labelHe: "כחול-שחור",      labelEn: "Midnight"      },
  { hex: "#1e293b", labelHe: "כחול כהה",       labelEn: "Slate Dark"    },
  { hex: "#374151", labelHe: "אפור כהה",       labelEn: "Charcoal"      },
  { hex: "#6b7280", labelHe: "אפור",           labelEn: "Gray"          },
  { hex: "#9ca3af", labelHe: "אפור בהיר",      labelEn: "Silver"        },
  { hex: "#111827", labelHe: "שחור",           labelEn: "Black"         },
  { hex: "#ffffff", labelHe: "לבן",            labelEn: "White"         },
  // Warm neutrals
  { hex: "#78716c", labelHe: "חום-אפור",       labelEn: "Warm Gray"     },
  { hex: "#a16207", labelHe: "חרדל",           labelEn: "Mustard"       },
  { hex: "#7f1d1d", labelHe: "בורדו",          labelEn: "Burgundy"      },
  { hex: "#134e4a", labelHe: "ירוק-כהה-טורק",  labelEn: "Dark Teal"     },
  { hex: "#1e3a5f", labelHe: "כחול נייבי",     labelEn: "Deep Navy"     },
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
