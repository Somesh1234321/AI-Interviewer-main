/** Shared TypeScript types for the AI Interview experience. */

export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface Mission {
  day: number;
  title: string;
  passed?: boolean | null;
  attempts?: number | null;
  skipped?: boolean | null;
}

export interface Signals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: CandidateMember;
  missions: Mission[];
  signals: Signals;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewResponse {
  reply: string;
  done: boolean;
  feedback?: Feedback | null;
}

export interface InterviewRequest {
  sessionId: string;
  candidate?: Candidate;
  message?: string;
}

/** A message rendered in the chat transcript. */
export interface ChatMessage {
  role: "interviewer" | "candidate";
  content: string;
}

