import React from 'react';
import { DiceSkinId } from '../types/game';

interface Dice3DProps {
  value: number; // 1-6
  size?: number; // px, default 48
  isRolling?: boolean;
  isHighlighted?: boolean;
  isWildOne?: boolean;
  skin?: DiceSkinId;
  onClick?: () => void;
  className?: string;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  size = 48,
  isRolling = false,
  isHighlighted = false,
  isWildOne = false,
  skin = 'classic_ivory',
  onClick,
  className = '',
}) => {
  // Theme styling based on skin
  const getSkinStyles = () => {
    switch (skin) {
      case 'obsidian_gold':
        return {
          cubeBg: 'bg-stone-900 border-2 border-stone-700 shadow-[0_8px_16px_rgba(0,0,0,0.85),inset_0_2px_3px_rgba(255,255,255,0.15)]',
          pipColor: 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6),0_0_3px_rgba(251,191,36,0.6)]',
          onePipColor: 'bg-gradient-to-b from-rose-500 via-rose-600 to-red-700 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.6),0_0_4px_rgba(244,63,94,0.6)]',
        };
      case 'cyber_neon':
        return {
          cubeBg: 'bg-slate-950 border-2 border-cyan-500/80 shadow-[0_8px_20px_rgba(6,182,212,0.4),inset_0_2px_4px_rgba(34,211,238,0.4)]',
          pipColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]',
          onePipColor: 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,1)]',
        };
      case 'pure_gold':
        return {
          cubeBg: 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-2 border-amber-300 shadow-[0_8px_18px_rgba(180,83,9,0.6),inset_0_2px_4px_rgba(255,255,255,0.7)]',
          pipColor: 'bg-amber-950 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.4)]',
          onePipColor: 'bg-rose-900 shadow-[inset_0_2px_3px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.4)]',
        };
      case 'classic_ivory':
      default:
        // Authentic Bar Ivory Dice (Classic Pure Bold Crimson Red 1 & 4, Deep Obsidian Black 2, 3, 5, 6 with clear recessed depth)
        return {
          cubeBg: 'bg-gradient-to-br from-[#ffffff] via-[#fbf9f5] to-[#ece7df] border-2 border-stone-400 shadow-[0_8px_18px_rgba(0,0,0,0.55),inset_0_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(0,0,0,0.12)]',
          pipColor: 'bg-[#111113] shadow-[inset_0_2px_3px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.85)] ring-0.5 ring-black/20',
          onePipColor: 'bg-gradient-to-b from-[#e11d48] to-[#be123c] shadow-[inset_0_2px_3px_rgba(0,0,0,0.7),0_1px_1px_rgba(255,255,255,0.85)] ring-0.5 ring-rose-900/30',
        };
    }
  };

  const skinStyle = getSkinStyles();

  // Render pips on a clean, balanced 3x3 grid with high clarity
  const renderPips = (val: number) => {
    const isOne = val === 1;
    const isFour = val === 4;
    // Authentic Bar Chinese Dice: 1 is big red, 4 is red, 2/3/5/6 are black
    const isRedPip = isOne || isFour;
    const dotColor = isRedPip ? skinStyle.onePipColor : skinStyle.pipColor;

    // Pip layouts for 3x3 grid [row, col]
    const pipsLayout: Record<number, number[][]> = {
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
    };

    const activePips = pipsLayout[val] || pipsLayout[1];

    // Compute dot diameter: 1 is very large and prominent (66%), standard dots are large and distinct (44%)
    const dotSizeClass = isOne ? 'w-[66%] h-[66%]' : 'w-[44%] h-[44%]';

    return (
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 p-1 pointer-events-none">
        {Array.from({ length: 9 }).map((_, idx) => {
          const r = Math.floor(idx / 3);
          const c = idx % 3;
          const hasDot = activePips.some(([row, col]) => row === r && col === c);

          if (!hasDot) return <div key={idx} />;

          return (
            <div key={idx} className="flex items-center justify-center">
              <span
                className={`rounded-full transition-all duration-200 ${dotColor} ${dotSizeClass} shrink-0`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative select-none flex-shrink-0 cursor-pointer ${className}`}
    >
      {/* Contact shadow on table */}
      <div
        className={`absolute -bottom-1.5 left-1 right-1 h-3 rounded-full bg-black/60 blur-xs transition-opacity duration-300 ${
          isRolling ? 'opacity-30 scale-90' : 'opacity-80 scale-100'
        }`}
      />

      {/* 3D Die Body matching authentic bar dice */}
      <div
        className={`w-full h-full rounded-2xl relative overflow-hidden transition-all duration-300 transform ${
          skinStyle.cubeBg
        } ${
          isHighlighted
            ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-stone-900 scale-110 shadow-[0_0_18px_rgba(251,191,36,0.9)]'
            : 'hover:-translate-y-0.5'
        }`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Specular gloss top sheen reflection */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

        {/* Die Face Pips */}
        {renderPips(value)}

        {/* Wild 1 marker star badge if 1 is active */}
        {isWildOne && value === 1 && !isRolling && (
          <span className="absolute -top-0.5 -right-0.5 text-[8px] font-black px-1 rounded-full bg-amber-500 text-stone-950 shadow-xs border border-amber-300">
            ★
          </span>
        )}
      </div>
    </div>
  );
};
