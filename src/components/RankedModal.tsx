import React from 'react';
import { UserStats } from '../types/game';
import { sound } from '../utils/audio';
import { X, Swords, Flame, Star, Shield } from 'lucide-react';

interface RankedModalProps {
  stats: UserStats;
  onStartRanked: () => void;
  onClose: () => void;
}

export const RankedModal: React.FC<RankedModalProps> = ({ stats, onStartRanked, onClose }) => {
  const getRankInfo = (points: number) => {
    if (points >= 2000) return { title: '巅峰骰王', icon: '👑', color: 'from-amber-400 to-amber-600', stars: 5 };
    if (points >= 1500) return { title: '铂金骰霸', icon: '💎', color: 'from-cyan-400 to-blue-600', stars: 4 };
    if (points >= 1000) return { title: '黄金博豪', icon: '🥇', color: 'from-amber-300 to-amber-500', stars: 3 };
    if (points >= 500) return { title: '白银酒客', icon: '🥈', color: 'from-slate-200 to-slate-400', stars: 2 };
    return { title: '青铜酒徒', icon: '🥉', color: 'from-amber-700 to-amber-900', stars: 1 };
  };

  const rank = getRankInfo(stats.rankPoints);

  const handleStart = () => {
    sound.playTap();
    onStartRanked();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col relative text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
            <Swords className="w-5 h-5" />
            <span>排位巅峰赛</span>
          </div>

          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Emblem Showcase */}
        <div className="my-5 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-950 to-stone-900 border-2 border-amber-400/80 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(251,191,36,0.4)]">
            {rank.icon}
          </div>

          <h3 className="text-2xl font-black text-amber-300 mt-3">{rank.title}</h3>

          <div className="flex items-center gap-1.5 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rank.stars
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-700'
                }`}
              />
            ))}
          </div>

          <span className="text-xs font-mono text-stone-400">
            段位积分：<b className="text-amber-400">{stats.rankPoints}</b> 分
          </span>
        </div>

        {/* Quick Season Info Card */}
        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-around mb-5">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-stone-500 font-medium">当前连胜</span>
            <span className="text-sm font-black text-amber-400 flex items-center gap-0.5 mt-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {stats.winStreak}
            </span>
          </div>
          <div className="w-px h-6 bg-stone-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-stone-500 font-medium">历史胜率</span>
            <span className="text-sm font-black text-stone-200 mt-0.5">
              {stats.totalGames > 0
                ? `${Math.round((stats.totalWins / stats.totalGames) * 100)}%`
                : '100%'}
            </span>
          </div>
          <div className="w-px h-6 bg-stone-800" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-stone-500 font-medium">段位保护</span>
            <span className="text-sm font-black text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
              可用
            </span>
          </div>
        </div>

        {/* Start Ranked Match */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-black text-base shadow-[0_6px_16px_rgba(245,158,11,0.5)] border border-amber-300 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Swords className="w-4 h-4" />
          <span>匹配排位对手</span>
        </button>
      </div>
    </div>
  );
};
