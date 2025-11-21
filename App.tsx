import React, { useState, useEffect } from 'react';
import { UserProfile, Grade, Subject, RewardItem } from './types';
import { loadUserProfile, saveUserProfile, checkAndResetStreak, saveQuizResult } from './services/storageService';
import { Dashboard } from './components/Dashboard';
import { QuizView } from './components/QuizView';
import { RewardShop } from './components/RewardShop';
import { Leaderboard } from './components/Leaderboard';
import { BookOpen } from 'lucide-react';

// View State Enum
enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  SHOP = 'SHOP',
  LEADERBOARD = 'LEADERBOARD'
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);

  // Load user on mount
  useEffect(() => {
    const profile = loadUserProfile();
    if (profile) {
      const updatedProfile = checkAndResetStreak(profile);
      setUser(updatedProfile);
      saveUserProfile(updatedProfile);
      setView(AppView.DASHBOARD);
    }
  }, []);

  const handleLogin = (name: string, grade: Grade) => {
    const newUser: UserProfile = {
      name,
      grade,
      points: 0,
      streak: 1,
      lastCheckInDate: new Date().toISOString().split('T')[0], // Treat registration as day 1 check-in starts
      inventory: []
    };
    setUser(newUser);
    saveUserProfile(newUser);
    setView(AppView.DASHBOARD);
  };

  const startQuiz = (subject: Subject) => {
    setCurrentSubject(subject);
    setView(AppView.QUIZ);
  };

  const handleQuizComplete = (score: number) => {
    if (!user || !currentSubject) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Update Points
    const newPoints = user.points + score;
    
    // Update Streak Logic (Simple: if not checked in today, streak stays or increments if continuing)
    // Note: Simple logic - if we finished a quiz today, ensure streak is valid.
    // Real production would need robust date checking.
    let newStreak = user.streak;
    if (user.lastCheckInDate !== today) {
        newStreak += 1;
    }

    const updatedUser = {
      ...user,
      points: newPoints,
      streak: newStreak,
      lastCheckInDate: today
    };

    setUser(updatedUser);
    saveUserProfile(updatedUser);
    saveQuizResult(today, currentSubject, score);

    setView(AppView.DASHBOARD);
    setCurrentSubject(null);
  };

  const handlePurchase = (item: RewardItem) => {
    if (!user) return;
    if (user.points < item.cost) return;
    if (user.inventory.includes(item.id)) return;

    const updatedUser = {
      ...user,
      points: user.points - item.cost,
      inventory: [...user.inventory, item.id]
    };
    
    setUser(updatedUser);
    saveUserProfile(updatedUser);
    alert(`兑换成功！你获得了 ${item.name}`);
  };

  // --- RENDER HELPERS ---

  if (view === AppView.LOGIN) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {view === AppView.DASHBOARD && (
        <Dashboard 
          user={user} 
          onStartQuiz={startQuiz}
          onOpenShop={() => setView(AppView.SHOP)}
          onOpenLeaderboard={() => setView(AppView.LEADERBOARD)}
        />
      )}

      {view === AppView.QUIZ && currentSubject && (
        <QuizView 
          subject={currentSubject} 
          grade={user.grade} 
          onComplete={handleQuizComplete}
          onCancel={() => setView(AppView.DASHBOARD)}
        />
      )}

      {view === AppView.SHOP && (
        <RewardShop 
          user={user} 
          onPurchase={handlePurchase}
          onBack={() => setView(AppView.DASHBOARD)}
        />
      )}

      {view === AppView.LEADERBOARD && (
        <Leaderboard 
          user={user} 
          onBack={() => setView(AppView.DASHBOARD)}
        />
      )}
    </div>
  );
}

// Simple Login Component Internal
const LoginScreen = ({ onLogin }: { onLogin: (name: string, grade: Grade) => void }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade>(Grade.ONE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onLogin(name, grade);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-blue-400 to-purple-500">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-800">天天向上</h1>
          <p className="text-gray-500">小学生每日AI智能打卡</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">你的名字</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
              placeholder="请输入名字"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">你就读的年级</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(Grade).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    grade === g 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95"
          >
            开始学习之旅 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;