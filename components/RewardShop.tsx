import React from 'react';
import { UserProfile, RewardItem } from '../types';
import { REWARD_CATALOG } from '../services/storageService';
import { ShoppingBag, Star, CheckCircle } from 'lucide-react';

interface Props {
  user: UserProfile;
  onPurchase: (item: RewardItem) => void;
  onBack: () => void;
}

export const RewardShop: React.FC<Props> = ({ user, onPurchase, onBack }) => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          &larr; 返回首页
        </button>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm border border-yellow-200">
          <Star className="w-5 h-5 fill-yellow-500" />
          当前积分: {user.points}
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-700 mb-2 flex justify-center items-center gap-3">
          <ShoppingBag className="w-8 h-8" /> 积分商城
        </h2>
        <p className="text-gray-500">努力学习赚取积分，兑换你喜欢的礼物吧！</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {REWARD_CATALOG.map((item) => {
          const isOwned = user.inventory.includes(item.id);
          const canAfford = user.points >= item.cost;

          return (
            <div 
              key={item.id} 
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 ${
                isOwned ? 'border-green-300 bg-green-50' : 'border-white hover:border-purple-300 hover:shadow-xl'
              }`}
            >
              <div className="h-32 bg-gradient-to-b from-blue-50 to-white flex items-center justify-center text-6xl">
                {item.icon}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{item.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-yellow-600 flex items-center gap-1">
                    {item.cost} <Star className="w-3 h-3 fill-yellow-500" />
                  </span>
                  
                  {isOwned ? (
                    <button disabled className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1 cursor-default">
                      <CheckCircle className="w-4 h-4" /> 已拥有
                    </button>
                  ) : (
                    <button 
                      onClick={() => onPurchase(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${
                        canAfford 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      兑换
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};