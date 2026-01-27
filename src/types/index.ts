export interface CompressedProblem {
  t: string;           // title
  fid: string;         // frontend_id (public number like "1")
  d: 'E' | 'M' | 'H';  // difficulty
  s: string;           // problem_slug (for URL)
  tp: string[];        // topics
}

export interface Problem {
  title: string;
  frontendId: string | null;  // null for freeform
  difficulty: 'E' | 'M' | 'H' | null;  // null for freeform
  slug: string | null;  // null for freeform
  topics: string[];
  url: string | null;  // null for freeform
  isLeetCode: boolean;
}

export type AppPhase = 'idle' | 'ready' | 'design' | 'coding' | 'grading' | 'complete';

export interface SessionData {
  problem: Problem | null;
  designTime: number;      // milliseconds
  codingTime: number;      // milliseconds
  designOverThreshold: boolean;
  codingOverThreshold: boolean;
  grade: number | null;    // 1-4 scale
  notes: string;
  date: string;
}

export interface AppState {
  phase: AppPhase;
  session: SessionData;
}

export type AppAction =
  | { type: 'SELECT_PROBLEM'; problem: Problem }
  | { type: 'START_DESIGN' }
  | { type: 'FINISH_DESIGN'; time: number; overThreshold: boolean }
  | { type: 'FINISH_CODING'; time: number; overThreshold: boolean }
  | { type: 'SET_GRADE'; grade: number }
  | { type: 'SET_NOTES'; notes: string }
  | { type: 'COMPLETE_GRADING' }
  | { type: 'RESET' };

export interface HistoryEntry {
  id: string;
  date: string;
  problemTitle: string;
  problemId: string | null;
  isLeetCode: boolean;
  difficulty: 'E' | 'M' | 'H' | null;
  designTime: number;
  codingTime: number;
  totalTime: number;
  grade: number | null;
  notes: string;
}
