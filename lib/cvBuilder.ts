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
