import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, UserProfile } from '../types';
import { getLeaderboardData } from '../services/storageService';
import { Trophy, Medal, User } from 'lucide-react';

interface Props {
  user: UserProfile;
  onBack: () => void;
}

export const Leaderboard: React.FC<Props> = ({ user, onBack }) => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setData(getLeaderboardData(user));
  }, [user]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-400 fill-orange-400" />;
    return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; 返回首页
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-100">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h2 className="text-2xl font-bold flex justify-center items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-300" /> 学习排行榜
          </h2>
          <p className="opacity-80 mt-1">看看谁是学习小标兵！</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-indigo-50 text-indigo-900 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">排名</th>
                <th className="px-6 py-4">同学</th>
                <th className="px-6 py-4">年级</th>
                <th className="px-6 py-4 text-center">总积分</th>
                <th className="px-6 py-4 text-center hidden sm:table-cell">连续打卡</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((entry, index) => {
                const isMe = entry.name === user.name;
                return (
                  <tr 
                    key={index} 
                    className={`${isMe ? 'bg-yellow-50' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                          ${index === 0 ? 'bg-yellow-500' : isMe ? 'bg-blue-500' : 'bg-gray-400'}`}>
                          {entry.name[0]}
                       </div>
                       {entry.name} {isMe && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">我</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{entry.grade}</td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">{entry.totalScore}</td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                        {entry.streak} 天
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};