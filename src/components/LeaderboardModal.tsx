import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/game';
import { BannerAd } from './AdModal';
import { X, Trophy, Flame, Coins } from 'lucide-react';

interface LeaderboardModalProps {
  userStreak: number;
  userCoins: number;
  onClose: () => void;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    name: '三里屯骰仙',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    winStreak: 28,
    coins: 98400,
    tier: '巅峰骰王',
  },
  {
    rank: 2,
    name: '夜店小王子',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    winStreak: 21,
    coins: 64200,
    tier: '巅峰骰王',
  },
  {
    rank: 3,
    name: '九街千杯不醉',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    winStreak: 17,
    coins: 48900,
    tier: '铂金骰霸',
  },
  {
    rank: 4,
    name: '摇骰一把手',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    winStreak: 14,
    coins: 31200,
    tier: '铂金骰霸',
  },
  {
    rank: 5,
    name: '不吃香菜只喝酒',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    winStreak: 11,
    coins: 24500,
    tier: '黄金博豪',
  },
  {
    rank: 6,
    name: '老北京醉鬼',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face',
    winStreak: 9,
    coins: 18200,
    tier: '黄金博豪',
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  userStreak,
  userCoins,
  onClose,
}) => {
  const [tab, setTab] = useState<'streak' | 'coins'>('streak');

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.8)]">
            1
          </span>
        );
      case 2:
        return (
          <span className="w-6 h-6 rounded-full bg-slate-300 text-stone-950 font-black text-xs flex items-center justify-center">
            2
          </span>
        );
      case 3:
        return (
          <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
            3
          </span>
        );
      default:
        return (
          <span className="w-6 h-6 font-mono font-bold text-stone-500 text-xs flex items-center justify-center">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col relative max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
            <Trophy className="w-5 h-5" />
            <span>风云骰神榜</span>
          </div>

          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex bg-stone-900/90 p-1 rounded-xl border border-stone-800 my-3">
          <button
            onClick={() => setTab('streak')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              tab === 'streak' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>连胜排行</span>
          </button>
          <button
            onClick={() => setTab('coins')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              tab === 'coins' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>财富富豪</span>
          </button>
        </div>

        {/* Ranking List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {LEADERBOARD_DATA.map(item => (
            <div
              key={item.rank}
              className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {getRankBadge(item.rank)}
                <img
                  src={item.avatar}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-stone-700"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-200">{item.name}</span>
                  <span className="text-[10px] text-amber-400/80">{item.tier}</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                {tab === 'streak' ? (
                  <span className="font-mono font-black text-amber-400 text-sm flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    {item.winStreak}
                  </span>
                ) : (
                  <span className="font-mono font-black text-amber-300 text-xs flex items-center gap-0.5">
                    <Coins className="w-3 h-3" />
                    {item.coins}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* User's own rank card */}
          <div className="mt-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 text-stone-400 font-mono font-bold text-xs flex items-center justify-center">
                99+
              </span>
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-sm font-black text-amber-300">
                我
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-amber-300">我的战绩</span>
                <span className="text-[10px] text-stone-400">白银酒客</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              {tab === 'streak' ? (
                <span className="font-mono font-black text-amber-400 text-sm flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {userStreak}
                </span>
              ) : (
                <span className="font-mono font-black text-amber-300 text-xs flex items-center gap-0.5">
                  <Coins className="w-3 h-3" />
                  {userCoins}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-3">
          <BannerAd />
        </div>
      </div>
    </div>
  );
};
