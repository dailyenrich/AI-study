import { UserProfile, Grade, RewardItem, LeaderboardEntry, Subject } from "../types";

const USER_KEY = 'ttyx_user';
const HISTORY_KEY = 'ttyx_history';

// Initial rewards catalog
export const REWARD_CATALOG: RewardItem[] = [
  { id: 'r1', name: '橡皮擦', cost: 20, icon: '🧼', description: '超级干净的橡皮擦' },
  { id: 'r2', name: '卡通铅笔', cost: 30, icon: '✏️', description: '书写流畅的HB铅笔' },
  { id: 'r3', name: '贴纸包', cost: 50, icon: '✨', description: '一套可爱的奖励贴纸' },
  { id: 'r4', name: '笔记本', cost: 100, icon: '📓', description: '精美的A5练习本' },
  { id: 'r5', name: '水彩笔', cost: 200, icon: '🎨', description: '12色可水洗水彩笔' },
  { id: 'r6', name: '乐高小人', cost: 500, icon: '🧩', description: '随机乐高小人仔' },
];

// Mock Leaderboard Generator
export const getLeaderboardData = (userProfile?: UserProfile): LeaderboardEntry[] => {
  const mockNames = ['小明', '小红', '李华', '张伟', '王芳', 'Mike', 'Emma', '子涵', '欣怡'];
  const entries: LeaderboardEntry[] = mockNames.map((name, idx) => ({
    name,
    grade: Object.values(Grade)[Math.floor(Math.random() * 6)],
    totalScore: Math.floor(Math.random() * 500) + 50,
    streak: Math.floor(Math.random() * 30),
    avatarId: idx % 8
  }));

  if (userProfile) {
    entries.push({
      name: userProfile.name,
      grade: userProfile.grade,
      totalScore: userProfile.points, // Simplified: assume points ~ score for now
      streak: userProfile.streak,
      avatarId: 99
    });
  }

  return entries.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
};

export const loadUserProfile = (): UserProfile | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveUserProfile = (profile: UserProfile) => {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
};

export const getDailyProgress = (date: string): Record<Subject, boolean> => {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  const dayData = history[date] || {};
  return {
    [Subject.CHINESE]: !!dayData[Subject.CHINESE],
    [Subject.MATH]: !!dayData[Subject.MATH],
    [Subject.ENGLISH]: !!dayData[Subject.ENGLISH],
  };
};

export const saveQuizResult = (date: string, subject: Subject, score: number) => {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  if (!history[date]) history[date] = {};
  
  // Don't overwrite if already done to prevent farming, but for this demo we allow re-try logic if needed.
  // Here we assume strictly one success per day marks it done.
  history[date][subject] = { score, timestamp: Date.now() };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const checkAndResetStreak = (profile: UserProfile): UserProfile => {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = profile.lastCheckInDate;
    
    if (lastDate === today) return profile;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = profile.streak;
    if (lastDate !== yesterdayStr) {
        // Missed a day (or more), reset streak
        newStreak = 0; 
    }
    
    // We don't update the date here, we update it when they actually finish a task
    return { ...profile, streak: newStreak };
};