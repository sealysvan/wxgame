import React from 'react';
import { Bid, DiceSkinId, GamePhase } from '../types/game';
import { Dice3D } from './Dice3D';
import { Minus, Plus, Video } from 'lucide-react';

interface ActionControlsProps {
  phase: GamePhase;
  isUserTurn: boolean;
  currentBid: Bid | null;
  minCount: number;
  maxCount: number;
  selectedCount: number;
  selectedPip: number;
  onCountChange: (count: number) => void;
  onPipChange: (pip: number) => void;
  onBid: () => void;
  onChallenge: () => void;
  onReroll: () => void;
  onStartRoll: () => void;
  hasFreeReroll: boolean;
  onRequestAdReroll: () => void;
  isRolling: boolean;
  selectedDiceSkin: DiceSkinId;
  isStraight?: boolean;
  straightLabel?: string;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  phase,
  isUserTurn,
  currentBid,
  minCount,
  maxCount,
  selectedCount,
  selectedPip,
  onCountChange,
  onPipChange,
  onBid,
  onChallenge,
  onReroll,
  onStartRoll,
  hasFreeReroll,
  onRequestAdReroll,
  isRolling,
  selectedDiceSkin,
  isStraight = false,
  straightLabel = '',
}) => {
  // If in ROLLING phase, display giant Shake button
  if (phase === 'ROLLING') {
    return (
      <div className="w-full px-4 py-3 flex flex-col items-center">
        <button
          onClick={onStartRoll}
          disabled={isRolling}
          className={`w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-black text-xl shadow-[0_8px_20px_rgba(245,158,11,0.5)] border-2 border-amber-300 transform transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isRolling ? 'animate-pulse' : 'hover:scale-102'
          }`}
        >
          <span className="text-2xl animate-spin">🎲</span>
          <span>{isRolling ? '摇盅中...' : '摇一摇 掷骰'}</span>
        </button>
      </div>
    );
  }

  // Check if current selection is legal raise
  const isBidLegal = () => {
    if (!currentBid) {
      return selectedCount >= minCount && selectedCount <= maxCount && selectedPip >= 1 && selectedPip <= 6;
    }
    if (selectedCount > currentBid.count) {
      return true;
    }
    if (selectedCount === currentBid.count) {
      return selectedPip > currentBid.pip;
    }
    return false;
  };

  const legal = isBidLegal();

  // In BIDDING phase
  return (
    <div className="w-full px-3 py-2 bg-stone-950/90 backdrop-blur-md border-t border-amber-500/20">
      <div className="max-w-sm mx-auto flex flex-col gap-2">
        {isUserTurn ? (
          <>
            {/* Top row: Quantity Stepper & Pip Selectors */}
            <div className="flex items-center justify-between gap-1.5 w-full">
              {/* Count Stepper */}
              <div className="flex items-center bg-stone-900 border border-amber-500/30 rounded-xl p-0.5 shadow-inner shrink-0">
                <button
                  onClick={() => onCountChange(Math.max(minCount, selectedCount - 1))}
                  disabled={selectedCount <= minCount}
                  className="w-7 h-7 rounded-lg bg-stone-800 text-amber-400 font-bold flex items-center justify-center hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="w-8 text-center font-mono font-black text-base text-amber-300">
                  {selectedCount}
                </div>
                <button
                  onClick={() => onCountChange(Math.min(maxCount, selectedCount + 1))}
                  disabled={selectedCount >= maxCount}
                  className="w-7 h-7 rounded-lg bg-stone-800 text-amber-400 font-bold flex items-center justify-center hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dice Pip Selectors (1 to 6) - Guaranteed to fit inside mobile width without overflow */}
              <div className="flex items-center justify-around flex-1 gap-0.5 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
                {[1, 2, 3, 4, 5, 6].map(pip => {
                  const isSelected = selectedPip === pip;
                  // If same count as current bid, pip must be greater than current bid pip
                  const isPipDisabled = Boolean(
                    currentBid && selectedCount === currentBid.count && pip <= currentBid.pip
                  );

                  return (
                    <button
                      key={pip}
                      onClick={() => onPipChange(pip)}
                      disabled={isPipDisabled}
                      className={`relative p-0.5 rounded-lg transition-all shrink-0 ${
                        isSelected
                          ? 'bg-amber-400/25 ring-2 ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                          : 'opacity-75 hover:opacity-100'
                      } ${isPipDisabled ? 'opacity-20 pointer-events-none' : ''}`}
                    >
                      <Dice3D value={pip} size={24} skin={selectedDiceSkin} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row: Actions */}
            <div className="flex items-center gap-2">
              {/* Reroll Button (Straight privilege, Free, or Rewarded Ad) */}
              <button
                onClick={isStraight || hasFreeReroll ? onReroll : onRequestAdReroll}
                title={isStraight ? `摇到${straightLabel}，触发酒吧特权免费重摇！` : '重摇骰子'}
                className={`px-3 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all shrink-0 ${
                  isStraight
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border-2 border-yellow-200 shadow-[0_0_16px_rgba(251,191,36,0.9)] animate-pulse'
                    : 'bg-stone-900 border border-stone-700 text-stone-300 hover:border-amber-400'
                }`}
              >
                <span>{isStraight ? '顺子重摇' : '重摇'}</span>
                <span
                  className={`text-[10px] flex items-center gap-0.5 ${
                    isStraight ? 'text-stone-950 font-black' : 'text-amber-400'
                  }`}
                >
                  {isStraight ? (
                    '✨特权免费'
                  ) : hasFreeReroll ? (
                    '免费1次'
                  ) : (
                    <>
                      <Video className="w-2.5 h-2.5" />+1
                    </>
                  )}
                </span>
              </button>

              {/* Challenge / "开!" Button (Large Red) */}
              {currentBid && (
                <button
                  onClick={onChallenge}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 text-white font-black text-lg shadow-[0_6px_16px_rgba(225,29,72,0.5)] border border-rose-400 transform active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="text-xl">⚠️</span>
                  <span>开!</span>
                </button>
              )}

              {/* Bid / "喊" Button */}
              <button
                onClick={onBid}
                disabled={!legal}
                className={`py-3 rounded-xl font-black text-lg border transform active:scale-95 transition-all flex items-center justify-center gap-1 ${
                  currentBid ? 'flex-1' : 'w-full'
                } ${
                  legal
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 border-amber-300 shadow-[0_6px_16px_rgba(245,158,11,0.5)]'
                    : 'bg-stone-800 text-stone-500 border-stone-700 opacity-50 pointer-events-none'
                }`}
              >
                <span>叫 {selectedCount}个</span>
                <Dice3D value={selectedPip} size={18} skin={selectedDiceSkin} />
              </button>
            </div>
          </>
        ) : (
          /* Waiting for other player's turn */
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>等待其他玩家动作...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
