import React from 'react';
import { UserProfile, Subject, Grade } from '../types';
import { getDailyProgress } from '../services/storageService';
import { BookOpen, Calculator, Languages, Flame, Trophy, ShoppingBag, Check, Calendar } from 'lucide-react';

interface Props {
  user: UserProfile;
  onStartQuiz: (subject: Subject) => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
}

export const Dashboard: React.FC<Props> = ({ user, onStartQuiz, onOpenShop, onOpenLeaderboard }) => {
  const today = new Date().toISOString().split('T')[0];
  const progress = getDailyProgress(today);

  // Calculate completion percentage for today
  const completedCount = Object.values(progress).filter(Boolean).length;
  const completionPercent = Math.round((completedCount / 3) * 100);

  const SubjectCard = ({ subject, icon: Icon, colorClass, bgClass, isDone }: any) => (
    <button
      onClick={() => !isDone && onStartQuiz(subject)}
      disabled={isDone}
      className={`relative overflow-hidden rounded-3xl p-6 text-left transition-all duration-300 shadow-lg group
        ${isDone ? 'bg-gray-100 cursor-default opacity-80' : `${bgClass} hover:shadow-xl transform hover:-translate-y-1`}
      `}
    >
      <div className="flex justify-between items-start z-10 relative">
        <div className={`p-3 rounded-2xl ${isDone ? 'bg-gray-200 text-gray-500' : 'bg-white/30 text-white backdrop-blur-sm'}`}>
          <Icon className="w-8 h-8" />
        </div>
        {isDone && <Check className="w-8 h-8 text-green-500" />}
      </div>
      
      <div className="mt-6 z-10 relative">
        <h3 className={`text-xl font-bold ${isDone ? 'text-gray-500' : 'text-white'}`}>{subject}</h3>
        <p className={`text-sm mt-1 ${isDone ? 'text-gray-400' : 'text-white/80'}`}>
          {isDone ? '今日已完成' : '10 道练习题'}
        </p>
      </div>

      {/* Decorative Circle */}
      <div className={`absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-20 ${isDone ? 'bg-gray-300' : 'bg-white'}`} />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800">你好, {user.name} 👋</h1>
          <p className="text-gray-500 mt-1">{user.grade} · 保持好奇心！</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
            <Flame className="w-5 h-5 fill-orange-500" />
            {user.streak} 天连续
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
            <Trophy className="w-5 h-5 fill-yellow-500" />
            {user.points} 积分
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
         <button onClick={onOpenShop} className="bg-white p-4 rounded-2xl shadow-md border border-purple-100 flex items-center gap-3 hover:bg-purple-50 transition-colors">
            <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="text-left">
                <div className="font-bold text-gray-800">积分商城</div>
                <div className="text-xs text-gray-500">兑换礼物</div>
            </div>
         </button>
         <button onClick={onOpenLeaderboard} className="bg-white p-4 rounded-2xl shadow-md border border-blue-100 flex items-center gap-3 hover:bg-blue-50 transition-colors">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                <Trophy className="w-6 h-6" />
            </div>
            <div className="text-left">
                <div className="font-bold text-gray-800">排行榜</div>
                <div className="text-xs text-gray-500">查看排名</div>
            </div>
         </button>
      </div>

      {/* Daily Goal Progress */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> 今日任务
            </h2>
            <span className="text-sm font-bold text-blue-600">{completionPercent}% 完成</span>
        </div>
        <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
            <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${completionPercent}%` }}
            />
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SubjectCard 
          subject={Subject.CHINESE} 
          icon={BookOpen} 
          bgClass="bg-gradient-to-br from-red-400 to-pink-500"
          isDone={progress[Subject.CHINESE]}
        />
        <SubjectCard 
          subject={Subject.MATH} 
          icon={Calculator} 
          bgClass="bg-gradient-to-br from-blue-400 to-cyan-500"
          isDone={progress[Subject.MATH]}
        />
        <SubjectCard 
          subject={Subject.ENGLISH} 
          icon={Languages} 
          bgClass="bg-gradient-to-br from-violet-400 to-purple-500"
          isDone={progress[Subject.ENGLISH]}
        />
      </div>
      
      {/* Decorative Quote */}
      <div className="text-center mt-10 pb-10">
        <p className="text-gray-400 italic text-sm">"好好学习，天天向上"</p>
      </div>
    </div>
  );
};