export type StageStatus =
  | 'briefing'        // 企業説明会・OB訪問（新卒）
  | 'es'              // ES選考（新卒）
  | 'aptitude'        // 適性検査（新卒）
  | 'casual'
  | 'gd'              // グループディスカッション（新卒）
  | 'interview_1'
  | 'interview_2'
  | 'final'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'

export type HiringType = 'newgrad' | 'midcareer'

export type SignalStrength = 'high' | 'medium' | 'low'
export type RecommendationLevel = 'strong_yes' | 'yes' | 'neutral' | 'no'
export type LetterStatus = 'draft' | 'reviewed' | 'sent'

export interface CareerValue {
  value: string
  strength: SignalStrength
  evidence: string
}

export interface Concern {
  concern: string
  severity: SignalStrength
  response?: string
}

export interface PositiveReaction {
  topic: string
  description: string
}

export interface CandidateSignal {
  id: string
  interviewId: string
  stageLabel: string
  careerValues: CareerValue[]
  interests: string[]
  concerns: Concern[]
  positiveReactions: PositiveReaction[]
  questionsAsked: string[]
  energyLevel: 1 | 2 | 3 | 4 | 5
  overallNote: string
  source: 'manual' | 'ai_extracted'
  createdAt: string
}

export interface Evaluation {
  overallScore: 1 | 2 | 3 | 4 | 5
  skillScore: 1 | 2 | 3 | 4 | 5
  cultureFitScore: 1 | 2 | 3 | 4 | 5
  potentialScore: 1 | 2 | 3 | 4 | 5
  comment: string
  concerns: string
  recommendation: RecommendationLevel
  submittedBy: string
  submittedAt: string
}

export interface KeyMessage {
  message: string
  rationale: string
  signalBasis: string
}

export interface TalkTrack {
  scenario: string
  script: string
}

export interface StepAttractPlan {
  id: string
  interviewId: string
  continuityNotes: string[]
  keyMessages: KeyMessage[]
  talkTracks: TalkTrack[]
  questionsToAsk: string[]
  contentToSend: string[]
  openingMessage: string
  generatedAt: string
  status: 'draft' | 'confirmed'
}

export interface FeedbackLetter {
  id: string
  interviewId: string
  stageLabel: string
  type: 'stage_pass' | 'offer'
  subject: string
  salutation: string
  passReasonSection: string
  passReasons: string[]
  attractSection: string
  nextStepSection: string
  closing: string
  status: LetterStatus
  generatedAt: string
  reviewedAt?: string
  sentAt?: string
}

export interface Interview {
  id: string
  applicationId: string
  stage: StageStatus
  stageLabel: string
  scheduledAt: string
  conductedAt?: string
  format: 'online' | 'offline'
  interviewers: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
  evaluation?: Evaluation
  signal?: CandidateSignal
  attractPlan?: StepAttractPlan
  feedbackLetter?: FeedbackLetter
  handoffNotes?: string[]
}

export interface EVP {
  category: string
  content: string
  icon: string
}

export interface AppealPoint {
  point: string
  evidence: string
  targetSegments: string[]
}

export interface CompanyAttractionProfile {
  id: string
  jobId?: string
  jobTitle?: string
  hiringConcept: string
  evp: EVP[]
  targetPersona: string
  appealPoints: AppealPoint[]
  cultureKeywords: string[]
  updatedAt: string
}

export interface GapAnalysisItem {
  point: string
  signalEvidence: string
  matchScore: number
}

export interface AttractStrategy {
  id: string
  coreAngle: string
  coreAngleRationale: string
  subAngles: string[]
  concernsToAddress: { concern: string; approach: string }[]
  stepwiseApproach: { step: string; focus: string }[]
  competitorDiff: string
  generatedAt: string
  version: number
}

export interface CandidateCard {
  id: string
  version: number
  profileSummary: string
  careerHighlights: string[]
  impressionByStage: { stage: string; impression: string }[]
  recommendation: RecommendationLevel
  hiringScore: number
  bestAttractAngle: string
  remainingConcerns: string[]
  offerRecommendation: string
  generatedAt: string
}

export interface Application {
  id: string
  candidateId: string
  jobId: string
  jobTitle: string
  currentStage: StageStatus
  status: 'active' | 'rejected' | 'withdrawn' | 'hired'
  appliedAt: string
  recruiter: string
  interviews: Interview[]
  attractStrategy?: AttractStrategy
  gapAnalysis?: {
    matching: GapAnalysisItem[]
    untold: { point: string; recommendation: string }[]
    concernResponses: { concern: string; response: string }[]
  }
  candidateCard?: CandidateCard
}

export interface Candidate {
  id: string
  tenantId: string
  fullName: string
  email: string
  phone: string
  source: string
  currentCompany: string
  currentTitle: string
  yearsExperience: number
  applications: Application[]
  consentGiven: boolean
  consentDate: string
  createdAt: string
  avatarInitials: string
  avatarColor: string
  // 新卒固有フィールド
  hiringType?: HiringType
  university?: string
  faculty?: string
  graduationYear?: number
  clubActivities?: string
  internship?: string
  jobHuntingAxis?: string  // 就活の軸
  toeicScore?: number
}
