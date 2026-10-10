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
  Gift,
  Wallet,
  UserCheck,
  Dices,
  Smartphone,
} from 'lucide-react';

interface LobbyViewProps {
  stats: UserStats;
  quickMatchCount: number;
  onChangeQuickMatchCount: (count: number) => void;
  onQuickMatch: () => void;
  onOpenPrivateRoom: () => void;
  onOpenRanked: () => void;
  onPracticeMatch: () => void;
  onOpenSkinShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenRedPacket: (tab?: 'claim' | 'exchange') => void;
  onOpenCharacterSelect: () => void;
  onOpenSoloCup: () => void;
  onToggleSound: () => void;
  onRequestAdCoin: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  stats,
  quickMatchCount,
  onChangeQuickMatchCount,
  onQuickMatch,
  onOpenPrivateRoom,
  onOpenRanked,
  onPracticeMatch,
  onOpenSkinShop,
  onOpenLeaderboard,
  onOpenRedPacket,
  onOpenCharacterSelect,
  onOpenSoloCup,
  onToggleSound,
  onRequestAdCoin,
}) => {
  const redPacketCash = typeof stats?.redPacketCash === 'number' ? stats.redPacketCash : 0;
  const cupsWon = typeof stats?.cupsWon === 'number' ? stats.cupsWon : 0;
  const claimedRedPackets = Array.isArray(stats?.claimedRedPackets) ? stats.claimedRedPackets : [];
  const canClaimAnyRedPacket = cupsWon >= 3 && !claimedRedPackets.includes(1);
  const currentAvatar = stats?.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&h=140&fit=crop&crop=face';
  const currentName = stats?.userName || '摇骰酒仙';

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
      <div className="relative z-10 w-full px-3 pt-3 flex items-center justify-between">
        {/* User Profile & Character Selection Trigger */}
        <div
          onClick={onOpenCharacterSelect}
          className="flex items-center gap-2 bg-stone-950/85 backdrop-blur-md p-1 pr-3 rounded-full border border-stone-800 shadow-md cursor-pointer hover:border-amber-400/70 transition-all active:scale-98"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400 relative">
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-stone-200">{currentName}</span>
              <span className="text-[9px] text-amber-400 bg-amber-950/80 px-1 rounded border border-amber-500/40">
                换人物
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>{stats.winStreak} 连胜</span>
            </div>
          </div>
        </div>

        {/* Currency & Red Packet & Audio Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Red Packet Cash Button */}
          <button
            onClick={() => onOpenRedPacket('exchange')}
            className="flex items-center gap-1 bg-gradient-to-r from-red-950/90 via-red-900/90 to-amber-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-red-500/50 text-amber-300 hover:border-amber-400 transition-colors shadow-md relative"
          >
            <span className="text-xs">🧧</span>
            <span className="font-mono font-black text-xs">¥{redPacketCash.toFixed(2)}</span>
            {canClaimAnyRedPacket && (
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-ping" />
            )}
          </button>

          {/* Gold Coins Button */}
          <button
            onClick={onRequestAdCoin}
            className="flex items-center gap-1 bg-stone-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-500/40 text-amber-300 hover:border-amber-400 transition-colors shadow-md"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-black text-xs">{stats.coins}</span>
            <span className="w-3 h-3 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black flex items-center justify-center">
              +
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-7.5 h-7.5 rounded-full bg-stone-900/80 border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-colors"
          >
            {stats.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            )}
          </button>
        </div>
      </div>

      {/* Center Hero & Quick Match Button */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 max-w-sm mx-auto">
        {/* Game Emblem Logo */}
        <div className="relative mb-2.5 flex flex-col items-center">
          <div className="w-18 h-18 rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.5)] transform -rotate-2 hover:rotate-0 transition-transform">
            <img src={barLogo} alt="Bar Dice King" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 mt-1.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            酒吧骰王
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400/70 font-semibold tracking-widest uppercase">
            <span>· 大话骰 ·</span>
          </div>
        </div>

        {/* Home Page Red Packet Features: 领取红包 & 红包兑换 Dual Entry */}
        <div className="w-full grid grid-cols-2 gap-2 mb-2.5">
          {/* 1. 领取红包 Entry */}
          <button
            onClick={() => onOpenRedPacket('claim')}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-red-950/90 via-red-900/80 to-amber-950/70 border border-red-500/60 flex items-center gap-2 text-left hover:border-amber-400 transition-all shadow-md active:scale-98 relative overflow-hidden group"
          >
            <div className="w-8 h-8 rounded-xl bg-red-600/80 border border-amber-400 flex items-center justify-center text-base shadow-xs group-hover:scale-105 transition-transform">
              <Gift className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-amber-200">领取红包</span>
                {canClaimAnyRedPacket && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] text-stone-300">
                赢酒 <span className="text-amber-400 font-bold">{cupsWon}</span> 杯可领
              </span>
            </div>
          </button>

          {/* 2. 红包兑换 Entry */}
          <button
            onClick={() => onOpenRedPacket('exchange')}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-stone-900 to-emerald-950/60 border border-amber-500/50 flex items-center gap-2 text-left hover:border-amber-400 transition-all shadow-md active:scale-98 relative overflow-hidden group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-700/80 border border-emerald-400 flex items-center justify-center text-base shadow-xs group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4 text-emerald-200" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-emerald-300">红包兑换</span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1 rounded font-bold">
                  提现
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-300 font-bold">
                余额 ¥{redPacketCash.toFixed(2)}
              </span>
            </div>
          </button>
        </div>

        {/* Quick Match Player Count Selector (2, 3, 5 Players) */}
        <div className="w-full mb-2 bg-stone-950/85 backdrop-blur-md p-1 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-1 shadow-md">
          {[2, 3, 5].map(count => (
            <button
              key={count}
              onClick={() => onChangeQuickMatchCount(count)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                quickMatchCount === count
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-xs scale-102'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{count}人场</span>
              <span className="text-[10px] opacity-75">
                {count === 2 ? '对决' : count === 3 ? '酒局' : '狂欢'}
              </span>
            </button>
          ))}
        </div>

        {/* Primary Action: 快速匹配 (Giant Pulsing Button) */}
        <button
          onClick={onQuickMatch}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-black text-lg shadow-[0_10px_28px_rgba(245,158,11,0.6)] border-2 border-amber-300 transform active:scale-95 hover:scale-102 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <Zap className="w-5 h-5 fill-stone-950" />
          <span>快速匹配 · {quickMatchCount}人局</span>
        </button>

        {/* Dedicated Solo Real-Dice-Cup Feature: 替代现实骰盅 · 晃手机摇骰 */}
        <div className="w-full mt-2.5">
          <button
            onClick={onOpenSoloCup}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950/70 to-stone-900 border-2 border-amber-400/60 shadow-[0_4px_16px_rgba(251,191,36,0.25)] flex items-center justify-between hover:border-amber-400 active:scale-98 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center shadow-md text-lg group-hover:scale-105 transition-transform">
                🎲
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-300">单人摇骰盅</span>
                  <span className="text-[9px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full">
                    现实替代
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">
                  晃手机摇骰 · 手动掀盅看点 · 防误触保护
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-1 rounded-xl border border-amber-500/40">
              <Smartphone className="w-3.5 h-3.5 animate-pulse" />
              <span>打开骰盅</span>
            </div>
          </button>
        </div>

        {/* Secondary Modes & Character Select Bar */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2">
          {/* 选择人物 */}
          <button
            onClick={onOpenCharacterSelect}
            className="py-2.5 px-2 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-stone-200 font-bold text-xs flex items-center justify-center gap-1 hover:border-amber-400 hover:bg-stone-900 transition-all shadow-md active:scale-98"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>选择人物</span>
          </button>

          {/* 排位赛 */}
          <button
            onClick={onOpenRanked}
            className="py-2.5 px-2 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-stone-200 font-bold text-xs flex items-center justify-center gap-1 hover:border-amber-400 hover:bg-stone-900 transition-all shadow-md active:scale-98"
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>排位巅峰</span>
          </button>

          {/* 好友私房 */}
          <button
            onClick={onOpenPrivateRoom}
            className="py-2.5 px-2 rounded-xl bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-stone-200 font-bold text-xs flex items-center justify-center gap-1 hover:border-amber-400 hover:bg-stone-900 transition-all shadow-md active:scale-98"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>好友私房</span>
          </button>
        </div>

        {/* Secondary Toolbar: 皮肤, 排行榜, 练习模式 */}
        <div className="grid grid-cols-3 gap-2 w-full mt-2">
          <button
            onClick={onOpenSkinShop}
            className="py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 hover:border-stone-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>皮肤</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 hover:border-stone-700 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>排行榜</span>
          </button>

          <button
            onClick={onPracticeMatch}
            className="py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300 font-bold text-xs flex flex-col items-center justify-center gap-0.5 hover:border-stone-700 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-stone-400" />
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
