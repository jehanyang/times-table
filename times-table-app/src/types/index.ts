export interface Question {
  factor1: number;
  factor2: number;
  answer: number;
  id: string;
}

export interface PracticeSettings {
  selectedTables: number[];
  sessionLength?: number;
  adaptiveDifficulty: boolean;
  difficultyMultiplier: number; // How much more often difficult questions appear (1.0 = normal, 2.0 = 2x more often)
  questionDelay: number; // Delay in milliseconds between questions (500-3000ms)
}

export interface SessionStats {
  correct: number;
  total: number;
  startTime: Date;
  endTime?: Date;
  questions: QuestionResult[];
}

export interface QuestionResult {
  question: Question;
  userAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number; // in milliseconds
}

export interface AppState {
  currentScreen: 'setup' | 'practice' | 'results';
  practiceSettings: PracticeSettings;
  currentSession: SessionStats | null;
  currentQuestion: Question | null;
  questionIndex: number;
}

export type ScreenType = 'setup' | 'practice' | 'results' | 'profile';

// User Profile Types
export interface UserProfile {
  id: string;
  name: string;
  createdAt: Date;
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  questionStats: QuestionStats;
}

export interface QuestionStats {
  [key: string]: QuestionStatDetail; // key format: "factor1x factor2" e.g., "3x4"
}

export interface QuestionStatDetail {
  factor1: number;
  factor2: number;
  attempts: number;
  correct: number;
  totalTime: number; // total time spent on this question type in milliseconds
  averageTime: number; // average time per attempt
  successRate: number; // percentage of correct answers
  lastAttempted: Date;
  recentAttempts: QuestionAttempt[]; // Last 10 attempts for improvement tracking
}

export interface QuestionAttempt {
  timeSpent: number;
  isCorrect: boolean;
  date: Date;
}

export interface ImprovementIndicator {
  questionKey: string;
  factor1: number;
  factor2: number;
  recentAverageTime: number;
  previousAverageTime: number;
  improvement: number; // percentage change (negative means faster)
  isSignificant: boolean; // if improvement is > 15% change
}