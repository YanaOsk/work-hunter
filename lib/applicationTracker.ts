import { ApplicationStatus, JobApplication, JobResult } from "./types";

const TRACKER_KEY = "work_hunter_tracker";

export function getApplications(profileId: string): JobApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${TRACKER_KEY}_${profileId}`);
    if (!raw) return [];
    return JSON.parse(raw) as JobApplication[];
  } catch {
    return [];
  }
}

function saveApplications(profileId: string, apps: JobApplication[]): void {
  localStorage.setItem(`${TRACKER_KEY}_${profileId}`, JSON.stringify(apps));
  syncToServerAsync(apps);
}

function syncToServerAsync(apps: JobApplication[]): void {
  if (typeof window === "undefined") return;
  fetch("/api/tracker", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ applications: apps }),
  }).catch(() => {});
}

export async function loadFromServer(): Promise<JobApplication[] | null> {
  try {
    const res = await fetch("/api/tracker");
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.applications) ? data.applications : null;
  } catch {
    return null;
  }
}

export async function mergeWithServer(profileId: string): Promise<void> {
  const serverApps = await loadFromServer();
  if (!serverApps) return;
  const local = getApplications(profileId);
  const merged = [...serverApps];
  for (const localApp of local) {
    if (!merged.find((a) => a.id === localApp.id)) {
      merged.push(localApp);
    }
  }
  localStorage.setItem(`${TRACKER_KEY}_${profileId}`, JSON.stringify(merged));
}

export function addApplication(profileId: string, job: JobResult): JobApplication {
  const apps = getApplications(profileId);
  const existing = apps.find((a) => a.id === job.id);
  if (existing) return existing;
  const newApp: JobApplication = {
    id: job.id,
    job,
    status: "saved",
    savedAt: new Date().toISOString(),
  };
  saveApplications(profileId, [newApp, ...apps]);
  return newApp;
}

export function removeApplication(profileId: string, jobId: string): void {
  const apps = getApplications(profileId).filter((a) => a.id !== jobId);
  saveApplications(profileId, apps);
}

export function updateApplicationStatus(
  profileId: string,
  jobId: string,
  status: ApplicationStatus
): void {
  const apps = getApplications(profileId).map((a) => {
    if (a.id !== jobId) return a;
    return {
      ...a,
      status,
      appliedAt: status === "applied" && !a.appliedAt ? new Date().toISOString() : a.appliedAt,
    };
  });
  saveApplications(profileId, apps);
}

export function updateApplicationNotes(profileId: string, jobId: string, notes: string): void {
  const apps = getApplications(profileId).map((a) =>
    a.id === jobId ? { ...a, notes } : a
  );
  saveApplications(profileId, apps);
}

export function isJobSaved(profileId: string, jobId: string): boolean {
  return getApplications(profileId).some((a) => a.id === jobId);
}

export function saveCoverLetter(profileId: string, jobId: string, letter: string): void {
  const apps = getApplications(profileId).map((a) =>
    a.id === jobId ? { ...a, coverLetter: letter } : a
  );
  saveApplications(profileId, apps);
}
