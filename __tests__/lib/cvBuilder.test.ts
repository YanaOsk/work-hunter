import { describe, it, expect, beforeEach } from "vitest";
import {
  EMPTY_CV,
  CV_TEMPLATES,
  loadCv,
  saveCv,
  clearCv,
  newId,
  emptyExperience,
  emptyEducation,
} from "@/lib/cvBuilder";

beforeEach(() => {
  localStorage.clear();
});

// --- EMPTY_CV ---
describe("EMPTY_CV", () => {
  it("has empty string fields", () => {
    expect(EMPTY_CV.personal.fullName).toBe("");
    expect(EMPTY_CV.summary).toBe("");
    expect(EMPTY_CV.skills).toBe("");
  });

  it("has empty arrays for experiences and educations", () => {
    expect(EMPTY_CV.experiences).toEqual([]);
    expect(EMPTY_CV.educations).toEqual([]);
  });

  it("defaults to slate template", () => {
    expect(EMPTY_CV.template).toBe("slate");
  });
});

// --- CV_TEMPLATES ---
describe("CV_TEMPLATES", () => {
  it("has exactly 8 templates", () => {
    expect(CV_TEMPLATES).toHaveLength(8);
  });

  it("contains all expected template IDs", () => {
    const ids = CV_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("slate");
    expect(ids).toContain("minimal");
    expect(ids).toContain("accent");
    expect(ids).toContain("executive");
    expect(ids).toContain("tech");
    expect(ids).toContain("bold");
    expect(ids).toContain("elegant");
    expect(ids).toContain("gradient");
  });

  it("each template has Hebrew and English labels", () => {
    CV_TEMPLATES.forEach((t) => {
      expect(t.labelHe.length).toBeGreaterThan(0);
      expect(t.labelEn.length).toBeGreaterThan(0);
    });
  });
});

// --- loadCv / saveCv / clearCv ---
describe("loadCv", () => {
  it("returns EMPTY_CV when nothing is stored", () => {
    const cv = loadCv();
    expect(cv.personal.fullName).toBe("");
    expect(cv.template).toBe("slate");
  });

  it("round-trips data correctly", () => {
    const data = {
      ...EMPTY_CV,
      personal: { ...EMPTY_CV.personal, fullName: "Yana Test" },
      summary: "Experienced developer",
      template: "minimal" as const,
    };
    saveCv(data);
    const loaded = loadCv();
    expect(loaded.personal.fullName).toBe("Yana Test");
    expect(loaded.summary).toBe("Experienced developer");
    expect(loaded.template).toBe("minimal");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem("work_hunter_cv_builder", "not-valid-json{{");
    const cv = loadCv();
    expect(cv).toEqual(EMPTY_CV);
  });

  it("clears cv correctly", () => {
    saveCv({ ...EMPTY_CV, summary: "some text" });
    clearCv();
    const cv = loadCv();
    expect(cv.summary).toBe("");
  });
});

// --- newId ---
describe("newId", () => {
  it("returns a non-empty string", () => {
    expect(newId().length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => newId()));
    expect(ids.size).toBe(100);
  });
});

// --- emptyExperience / emptyEducation ---
describe("emptyExperience", () => {
  it("has a unique id", () => {
    const a = emptyExperience();
    const b = emptyExperience();
    expect(a.id).not.toBe(b.id);
  });

  it("has empty string fields", () => {
    const exp = emptyExperience();
    expect(exp.role).toBe("");
    expect(exp.company).toBe("");
    expect(exp.current).toBe(false);
  });
});

describe("emptyEducation", () => {
  it("has a unique id", () => {
    const a = emptyEducation();
    const b = emptyEducation();
    expect(a.id).not.toBe(b.id);
  });

  it("has empty string fields", () => {
    const edu = emptyEducation();
    expect(edu.degree).toBe("");
    expect(edu.school).toBe("");
    expect(edu.current).toBe(false);
  });
});
