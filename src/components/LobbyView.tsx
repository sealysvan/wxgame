import React from 'react';
import { UserStats } from '../types/game';
import { BannerAd } from './AdModal';
import barLogo from '../assets/images/bar_dice_cup_logo_1791613219326.jpg';
import barBackdrop from '../assets/images/bar_speakeasy_table_1791613205851.jpg';
import {
  Coins,
  Flame,
  Volume2,
  VolumeX,
  Trophy,
  Sparkles,
  Users,
  Swords,
  Bot,
  Zap,
} from 'lucide-react';

interface LobbyViewProps {
  stats: UserStats;
  onQuickMatch: () => void;
  onOpenPrivateRoom: () => void;
  onOpenRanked: () => void;
  onPracticeMatch: () => void;
  onOpenSkinShop: () => void;
  onOpenLeaderboard: () => void;
  onToggleSound: () => void;
  onRequestAdCoin: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  stats,
  onQuickMatch,
  onOpenPrivateRoom,
  onOpenRanked,
  onPracticeMatch,
  onOpenSkinShop,
  onOpenLeaderboard,
  onToggleSound,
  onRequestAdCoin,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={barBackdrop}
          alt="Bar Lounge"
          className="w-full h-full object-cover brightness-65 contrast-110 scale-105"
        />
        <div className="absolute inset-0 bg-radial from-transparent via-stone-950/70 to-stone-950" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full px-4 pt-3 flex items-center justify-between">
        {/* User Profile */}
        <div className="flex items-center gap-2 bg-stone-950/80 backdrop-blur-md p-1 pr-3 rounded-full border border-stone-800 shadow-md">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-400">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-200">酒客·我</span>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>{stats.winStreak} 连胜</span>
            </div>
          </div>
        </div>

        {/* Currency & Audio Toggles */}
        <div className="flex items-center gap-2">
          {/* Gold Coins Button */}
          <button
            onClick={onRequestAdCoin}
            className="flex items-center gap-1.5 bg-stone-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-500/40 text-amber-300 hover:border-amber-400 transition-colors shadow-md"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-black text-xs">{stats.coins}</span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center">
              +
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-8 h-8 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
          >
            {stats.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-500" />
            )}
          </button>
        </div>
      </div>

      {/* Center Hero & Quick Match Button */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 max-w-sm mx-auto">
        {/* Game Emblem Logo */}
        <div className="relative mb-5 flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.5)] transform -rotate-2 hover:rotate-0 transition-transform">
            <img src={barLogo} alt="Bar Dice King" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 mt-2.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            酒吧骰王
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-amber-400/70 font-semibold tracking-widest uppercase mt-0.5">
            <span>· 大话骰 ·</span>
          </div>
        </div>

        {/* Primary Action: 快速匹配 (Giant Pulsing Button) */}
        <button
          onClick={onQuickMatch}
          className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-black text-2xl shadow-[0_10px_28px_rgba(245,158,11,0.6)] border-2 border-amber-300 transform active:scale-95 hover:scale-102 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <Zap className="w-6 h-6 fill-stone-950" />
          <span>快速匹配</span>
        </button>

        {/* Secondary Modes Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mt-3.5">
          {/* 排位赛 */}
          <button
            onClick={onOpenRanked}
            className="py-3 px-3 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-stone-200 font-bold text-sm flex items-center justify-center gap-2 hover:border-amber-400 hover:bg-stone-900 transition-all shadow-md active:scale-98"
          >
            <Swords className="w-4 h-4 text-amber-400" />
            <span>排位巅峰</span>
          </button>

          {/* 好友私房 */}
          <button
            onClick={onOpenPrivateRoom}
            className="py-3 px-3 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-stone-200 font-bold text-sm flex items-center justify-center gap-2 hover:border-amber-400 hover:bg-stone-900 transition-all shadow-md active:scale-98"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>好友私房</span>
          </button>
        </div>

        {/* Secondary Toolbar: 皮肤, 排行榜, 练习模式 */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2.5">
          <button
            onClick={onOpenSkinShop}
            className="py-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:border-stone-700 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>皮肤</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="py-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:border-stone-700 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>排行榜</span>
          </button>

          <button
            onClick={onPracticeMatch}
            className="py-2.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:border-stone-700 transition-colors"
          >
            <Bot className="w-4 h-4 text-stone-400" />
            <span>练习模式</span>
          </button>
        </div>
      </div>

      {/* Bottom WeChat Mini-Game Banner Ad */}
      <div className="relative z-10 w-full pb-2">
        <BannerAd />
      </div>
    </div>
  );
};
