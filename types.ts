export enum Subject {
  CHINESE = '语文',
  MATH = '数学',
  ENGLISH = '英语'
}

export enum Grade {
  ONE = '一年级',
  TWO = '二年级',
  THREE = '三年级',
  FOUR = '四年级',
  FIVE = '五年级',
  SIX = '六年级'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_BLANK = 'FILL_IN_BLANK'
}

export interface Question {
  id: number;
  type: QuestionType;
  content: string;
  options?: string[]; // Only for Multiple Choice
  correctAnswer: string; // The correct answer for internal checking (though we use AI to grade mostly)
}

export interface QuizAttempt {
  date: string; // YYYY-MM-DD
  subject: Subject;
  questions: Question[];
  userAnswers: string[];
  score: number; // 0-10
  feedback: string; // AI feedback
  completed: boolean;
}

export interface UserProfile {
  name: string;
  grade: Grade;
  points: number;
  streak: number;
  lastCheckInDate: string;
  inventory: string[]; // IDs of bought items
}

export interface LeaderboardEntry {
  name: string;
  grade: Grade;
  totalScore: number;
  streak: number;
  avatarId: number;
}

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description: string;
}