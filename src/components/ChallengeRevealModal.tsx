import React, { useEffect, useState } from 'react';
import { Player, RoundResult, DiceSkinId } from '../types/game';
import { Dice3D } from './Dice3D';
import { sound } from '../utils/audio';

interface ChallengeRevealModalProps {
  roundResult: RoundResult;
  players: Player[];
  onNextRound: () => void;
  selectedDiceSkin: DiceSkinId;
}

export const ChallengeRevealModal: React.FC<ChallengeRevealModalProps> = ({
  roundResult,
  players,
  onNextRound,
  selectedDiceSkin,
}) => {
  const { challengerId, bidderId, bid, totalMatchingDice, wildOnesCount, challengerLost, loserId } =
    roundResult;

  const challenger = players.find(p => p.id === challengerId);
  const bidder = players.find(p => p.id === bidderId);
  const loser = players.find(p => p.id === loserId);

  const [tallyCount, setTallyCount] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);

  // Progressive count up animation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current <= totalMatchingDice) {
        setTallyCount(current);
        sound.playTallyStep(1 + (current / 10));
      } else {
        clearInterval(interval);
        setShowOutcome(true);
        sound.playDrinkGulp();
      }
    }, 280);

    return () => clearInterval(interval);
  }, [totalMatchingDice]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/40 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Banner Title */}
        <div className="mb-4">
          <div className="inline-block px-4 py-1 rounded-full bg-rose-600 text-white font-black text-sm tracking-wider uppercase shadow-[0_0_15px_rgba(225,29,72,0.8)]">
            全员亮骰 查验
          </div>
        </div>

        {/* Challenged Bid Summary */}
        <div className="flex items-center gap-2 text-stone-300 text-sm mb-4">
          <span className="font-bold text-amber-400">{bidder?.name}</span>
          <span>喊点</span>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 border border-amber-400/40 font-mono font-bold text-amber-300">
            <span>{bid.count}</span>
            <span>×</span>
            <Dice3D value={bid.pip} size={18} skin={selectedDiceSkin} />
          </div>
          <span>被</span>
          <span className="font-bold text-rose-400">{challenger?.name}</span>
          <span>质疑</span>
        </div>

        {/* All Players Revealed Dice Table */}
        <div className="w-full bg-stone-900/80 rounded-2xl p-3 border border-stone-800 mb-4 flex flex-col gap-2.5 max-h-52 overflow-y-auto">
          {players.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-2 border-b border-stone-800/60 pb-1.5 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-1.5 min-w-[70px]">
                <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full border border-stone-700" />
                <span className="text-xs font-semibold text-stone-300 truncate max-w-[50px]">{p.name}</span>
              </div>
              <div className="flex gap-1">
                {p.dice.map((d, i) => {
                  const isMatch = d === bid.pip || (bid.isWildOneActive && d === 1);
                  return (
                    <Dice3D
                      key={i}
                      value={d}
                      size={24}
                      skin={selectedDiceSkin}
                      isHighlighted={isMatch}
                      isWildOne={bid.isWildOneActive}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tally Comparison */}
        <div className="flex items-center justify-center gap-6 my-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-stone-400">实有点数</span>
            <span className="text-3xl font-mono font-black text-amber-400">
              {tallyCount}
            </span>
            {bid.isWildOneActive && wildOnesCount > 0 && (
              <span className="text-[10px] text-stone-500">含 {wildOnesCount}个万能1</span>
            )}
          </div>
          <span className="text-2xl font-black text-stone-600">VS</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-stone-400">叫点数量</span>
            <span className="text-3xl font-mono font-black text-stone-200">
              {bid.count}
            </span>
          </div>
        </div>

        {/* Outcome & Penalty */}
        {showOutcome && (
          <div className="w-full mt-3 p-3 rounded-2xl bg-stone-900/90 border border-stone-700 flex flex-col items-center gap-2 animate-in zoom-in-90 duration-300">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span className="text-rose-400 font-black">{loser?.name}</span>
              <span className="text-stone-300">
                {challengerLost ? '质疑失败，罚酒一杯！' : '吹牛被抓，罚酒一杯！'}
              </span>
            </div>
            <div className="text-xs text-rose-500 font-bold flex items-center gap-1">
              <span>🍺 生命 -1</span>
              {loser?.hp === 0 && <span className="text-amber-400">(已醉倒出局)</span>}
            </div>

            <button
              onClick={onNextRound}
              className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-sm shadow-[0_4px_12px_rgba(245,158,11,0.5)] border border-amber-300 hover:scale-102 active:scale-98 transition-all"
            >
              继续
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
