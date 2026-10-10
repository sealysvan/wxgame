import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { Video, RotateCcw, Home, Flame, Coins, ShieldCheck } from 'lucide-react';

interface SettlementModalProps {
  isWinner: boolean;
  winner: Player;
  coinsEarned: number;
  winStreak: number;
  onPlayAgain: () => void;
  onReturnLobby: () => void;
  onWatchAdDouble: () => void;
  onWatchAdProtectStreak: () => void;
  hasClaimedDouble: boolean;
  hasProtectedStreak: boolean;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  isWinner,
  winner,
  coinsEarned,
  winStreak,
  onPlayAgain,
  onReturnLobby,
  onWatchAdDouble,
  onWatchAdProtectStreak,
  hasClaimedDouble,
  hasProtectedStreak,
}) => {
  useEffect(() => {
    if (isWinner) {
      sound.playVictoryFanfare();
      // Fire confetti bursts
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff'],
      });
    } else {
      sound.playDefeat();
    }
  }, [isWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        {/* Result Header */}
        <div className="mb-2">
          {isWinner ? (
            <div className="relative">
              <span className="text-5xl block animate-bounce">👑</span>
              <h2 className="text-3xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent mt-2">
                绝顶骰王
              </h2>
            </div>
          ) : (
            <div className="relative">
              <span className="text-5xl block">🍺</span>
              <h2 className="text-3xl font-black text-rose-500 mt-2">
                不胜酒力
              </h2>
              <p className="text-xs text-stone-400 mt-1">胜者：{winner.name}</p>
            </div>
          )}
        </div>

        {/* Win Streak & Stats Card */}
        <div className="w-full my-4 p-4 rounded-2xl bg-stone-900/90 border border-amber-500/30 flex items-center justify-around shadow-inner">
          {/* Win Streak */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mb-0.5">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>连胜</span>
            </div>
            <span className="text-2xl font-black font-mono text-amber-300">
              {winStreak}
            </span>
          </div>

          <div className="w-px h-8 bg-stone-800" />

          {/* Coins Earned */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 font-bold text-xs mb-0.5">
              <Coins className="w-4 h-4" />
              <span>金币</span>
            </div>
            <span
              className={`text-2xl font-black font-mono ${
                coinsEarned >= 0 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {coinsEarned >= 0 ? `+${coinsEarned}` : coinsEarned}
            </span>
          </div>
        </div>

        {/* Rewarded Ad Options */}
        {isWinner && !hasClaimedDouble && (
          <button
            onClick={onWatchAdDouble}
            className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.6)] border border-amber-300 hover:scale-102 active:scale-98 transition-all"
          >
            <Video className="w-4 h-4" />
            <span>看视频 金币翻倍 (+{coinsEarned})</span>
          </button>
        )}

        {!isWinner && winStreak > 1 && !hasProtectedStreak && (
          <button
            onClick={onWatchAdProtectStreak}
            className="w-full mb-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.5)] border border-emerald-400 hover:scale-102 active:scale-98 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>看视频 保护连胜 (保住{winStreak}连胜)</span>
          </button>
        )}

        {/* Action Buttons */}
        <div className="w-full flex gap-2">
          <button
            onClick={onReturnLobby}
            className="flex-1 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 font-bold text-sm flex items-center justify-center gap-1.5 hover:bg-stone-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>大厅</span>
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-sm flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.5)] border border-amber-300 hover:scale-102 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再来一局</span>
          </button>
        </div>
      </div>
    </div>
  );
};
