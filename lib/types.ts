export interface UserProfile {
  rawText: string;
  parsedData: {
    name?: string;
    age?: number;
    education?: string;
    yearsExperience?: number;
    skills?: string[];
    currentRole?: string;
    location?: string;
    salaryExpectation?: string;
    workPreference?: "remote" | "hybrid" | "onsite" | "flexible";
    careerChangeInterest?: boolean;
    targetRoles?: string[];
    constraints?: string[];
    languages?: string[];
    pregnancyWeek?: number;
    additionalNotes?: string;
    maxCommuteKm?: number;
  };
  missingFields: string[];
  clarifyingQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  matchScore: number;
  matchReasons: string[];
  matchNegatives?: string[];
  isRemote: boolean;
  salaryRange?: string;
  salaryNote?: string;
  postedDate?: string;
  source: string;
  isNonObvious?: boolean; // Scout suggested this proactively
}

export interface AppState {
  phase: "upload" | "interview" | "searching" | "results";
  userProfile: UserProfile | null;
  chatMessages: ChatMessage[];
  jobResults: JobResult[];
  isLoading: boolean;
  error: string | null;
}

export type AppMode = "jobs" | "advisor";

export interface DiagnosisAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface MarketReality {
  salaryRange: string;
  trainingNeeded: string;
  marketDemand: string;
  timeToEntry: string;
}

export interface CareerPath {
  title: string;
  domain: string;
  reasoning: string;
  matchBridge: string;
  marketReality?: MarketReality;
}

export interface DiagnosisResult {
  mbtiType?: string;
  hollandCode?: string;
  topMessage?: string;
  topRoles?: string[];
  strengths: string[];
  workEnvironmentFit: string[];
  careerDirections: string[];
  summary: string;
  completedAt: string;
  // Career advisor fields
  reflection?: string;
  careerPaths?: CareerPath[];
  tomorrowStep?: string; // legacy — kept for old saved states
  weekOneSteps?: string[];
  realismNote?: string;
}

export type LifePath = "employee" | "entrepreneur" | "studies";

export interface PathOption {
  path: LifePath;
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  firstSteps: string[];
  fitScore: number;
  earningPotential?: number;
  qualityOfLife?: number;
}

export interface DirectionResult {
  recommendedPath: LifePath;
  rationale: string;
  options: PathOption[];
  completedAt: string;
}

export interface CVImprovement {
  section: string;
  issue: string;
  suggestion: string;
}

export interface CVReview {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: CVImprovement[];
  rewrittenSummary: string;
  completedAt: string;
}

export interface LinkedInProfile {
  headline: string;
  about: string;
  experienceBullets: string[];
  skills: string[];
  keywords: string[];
  completedAt: string;
}

export interface TargetCompany {
  name: string;
  reason: string;
  size: string;
}

export interface HotJob {
  title: string;
  company: string;
  source: string;
  description: string;
}

export interface SearchStrategy {
  targetCompanies: TargetCompany[];
  hiddenMarketTips: string[];
  networkingPlan: string[];
  outreachTemplate: string;
  hotJobs?: HotJob[];
  thirtyDayPlan?: string[];
  facebookGroups?: string[];
  topLine?: string;
  completedAt: string;
}

export interface MockInterview {
  role: string;
  messages: ChatMessage[];
  finished: boolean;
  feedback: string | null;
  completedAt: string | null;
}

export type AdvisorStage =
  | "diagnosis"
  | "direction"
  | "cv"
  | "linkedin"
  | "strategy"
  | "done";

export const STAGE_ORDER: AdvisorStage[] = [
  "diagnosis",
  "direction",
  "cv",
  "linkedin",
  "strategy",
];

export interface SkillGapResource {
  title: string;
  type: "course" | "book" | "video" | "practice";
  platform?: string;
  free: boolean;
}

export interface SkillGapItem {
  skill: string;
  importance: "high" | "medium" | "low";
  currentLevel: "none" | "basic" | "intermediate";
  resources: SkillGapResource[];
}

export interface JDFitResult {
  score: number;
  matchPoints: string[];
  gapPoints: string[];
  tips: string[];
}

export interface OnboardingPlan {
  days30: string[];
  days60: string[];
  days90: string[];
  completedAt: string;
}

export interface FreelanceKit {
  pricingGuidance: string[];
  legalSteps: string[];
  firstClientSources: string[];
  monthlyGoal: string;
  completedAt: string;
}

export interface PracticalPrepSection {
  category: string;
  items: string[];
}

export interface PracticalPrep {
  format: string;
  whatToBring: string[];
  whatToExpect: PracticalPrepSection[];
  howToStandOut: string[];
  completedAt: string;
}

export interface SalaryRange {
  role: string;
  junior: string;
  mid: string;
  senior: string;
  notes: string;
}

export interface SalaryResearch {
  ranges: SalaryRange[];
  marketInsight: string;
  negotiationTip: string;
  completedAt: string;
}

export interface TransitionPhase {
  name: string;
  duration: string;
  actions: string[];
  milestone: string;
}

export interface TransitionRoadmap {
  totalDuration: string;
  phases: TransitionPhase[];
  honestNote: string;
  completedAt: string;
}

export interface AdvisorState {
  userProfile: UserProfile;
  introDismissed: boolean;
  selfIntroCompleted: boolean;
  chatMessageCount: number;
  isPremium: boolean;
  currentStage: AdvisorStage;
  diagnosis: DiagnosisResult | null;
  direction: DirectionResult | null;
  chosenPath: LifePath | null;
  cvSkipped: boolean;
  cvReview: CVReview | null;
  linkedIn: LinkedInProfile | null;
  linkedInSkipped: boolean;
  strategy: SearchStrategy | null;
  mockInterview: MockInterview | null;
  skillGap?: SkillGapItem[] | null;
  onboardingPlan?: OnboardingPlan | null;
  jobSearchDeadline?: string | null;
  freelanceKit?: FreelanceKit | null;
  practicalPrep?: PracticalPrep | null;
  salaryResearch?: SalaryResearch | null;
  transitionRoadmap?: TransitionRoadmap | null;
  chatMessages: ChatMessage[];
  lastVisitedAt?: string;
}

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface JobApplication {
  id: string;
  job: JobResult;
  status: ApplicationStatus;
  savedAt: string;
  appliedAt?: string;
  interviewDate?: string;
  notes?: string;
  coverLetter?: string;
}
