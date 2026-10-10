import React, { useEffect, useState } from 'react';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { Check, Loader2 } from 'lucide-react';

interface MatchingViewProps {
  players: Player[];
  onMatchComplete: () => void;
  onCancel: () => void;
}

export const MatchingView: React.FC<MatchingViewProps> = ({
  players,
  onMatchComplete,
  onCancel,
}) => {
  const [matchedCount, setMatchedCount] = useState(1);

  useEffect(() => {
    sound.playTap();
    const interval = setInterval(() => {
      setMatchedCount(prev => {
        if (prev < players.length) {
          sound.playBidCall();
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            sound.playCupSlam();
            onMatchComplete();
          }, 600);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [players, onMatchComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Radar Spinner */}
        <div className="relative w-28 h-28 my-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
          <div className="absolute inset-3 rounded-full border border-amber-500/30 border-b-amber-300 animate-[spin_2s_linear_infinite_reverse]" />
          <span className="text-3xl animate-pulse">🎲</span>
        </div>

        <h3 className="text-xl font-black text-amber-400 mt-2">
          寻找酒桌对手 · {players.length}人局
        </h3>
        <span className="text-xs text-stone-400 mt-1 font-mono">
          {matchedCount} / {players.length} 已就位
        </span>

        {/* Players Seats - Adaptive Layout for 2, 3, 5 players */}
        <div className="flex items-center justify-center gap-2.5 my-6 w-full flex-wrap">
          {players.map((p, idx) => {
            const isReady = idx < matchedCount;
            return (
              <div key={p.id} className="flex flex-col items-center min-w-[50px]">
                <div
                  className={`relative w-12 h-12 rounded-full border-2 overflow-hidden transition-all duration-300 ${
                    isReady
                      ? 'border-amber-400 scale-100 shadow-md'
                      : 'border-stone-800 bg-stone-900 opacity-40 scale-90'
                  }`}
                >
                  {isReady ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-stone-600 animate-spin" />
                    </div>
                  )}

                  {isReady && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border border-stone-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-stone-300 mt-1 truncate max-w-[55px]">
                  {isReady ? p.name : '匹配中'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-400 text-xs font-bold hover:text-white transition-colors"
        >
          取消匹配
        </button>
      </div>
    </div>
  );
};
