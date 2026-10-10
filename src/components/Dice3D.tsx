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
          cubeBg: 'bg-stone-900 border-stone-700/80 shadow-[0_6px_12px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)]',
          pipColor: 'bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]',
          onePipColor: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]',
        };
      case 'cyber_neon':
        return {
          cubeBg: 'bg-slate-950 border-cyan-500/50 shadow-[0_6px_16px_rgba(6,182,212,0.3),inset_0_1px_2px_rgba(34,211,238,0.4)]',
          pipColor: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]',
          onePipColor: 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,1)]',
        };
      case 'pure_gold':
        return {
          cubeBg: 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border-amber-300 shadow-[0_6px_14px_rgba(180,83,9,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)]',
          pipColor: 'bg-amber-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]',
          onePipColor: 'bg-rose-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]',
        };
      case 'classic_ivory':
      default:
        return {
          cubeBg: 'bg-white border-2 border-stone-300 shadow-[0_6px_14px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,1)]',
          pipColor: 'bg-stone-950 shadow-xs',
          onePipColor: 'bg-red-600 shadow-xs',
        };
    }
  };

  const skinStyle = getSkinStyles();

  // Render pips on a 3x3 grid
  const renderPips = (val: number) => {
    const isOne = val === 1;
    const isFour = val === 4;
    const dotColor = isOne ? skinStyle.onePipColor : isFour && skin === 'classic_ivory' ? 'bg-red-600' : skinStyle.pipColor;

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

    // Compute dot diameter according to die size
    const dotSizeClass = isOne ? 'w-[42%] h-[42%]' : 'w-[28%] h-[28%]';

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
                className={`rounded-full transition-all duration-200 ${dotColor} ${dotSizeClass}`}
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

      {/* 3D Die Body */}
      <div
        className={`w-full h-full rounded-xl border relative overflow-hidden transition-all duration-300 transform ${
          skinStyle.cubeBg
        } ${
          isHighlighted
            ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-stone-900 scale-110 shadow-[0_0_16px_rgba(251,191,36,0.8)]'
            : 'hover:-translate-y-0.5'
        }`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Specular gloss top sheen */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

        {/* Die Face Pips */}
        {renderPips(value)}

        {/* Clear numeric indicator for crystal-clear readability */}
        {size >= 32 && (
          <span
            className={`absolute bottom-0.5 right-1 text-[11px] font-mono font-black select-none pointer-events-none ${
              value === 1 || (value === 4 && skin === 'classic_ivory')
                ? 'text-red-600'
                : skin === 'obsidian_gold'
                ? 'text-amber-400'
                : skin === 'cyber_neon'
                ? 'text-cyan-300'
                : 'text-stone-950'
            }`}
          >
            {value}
          </span>
        )}

        {/* Wild 1 marker icon badge */}
        {isWildOne && value === 1 && !isRolling && (
          <span className="absolute -top-1 -right-1 text-[9px] font-black px-1 rounded-full bg-amber-500 text-stone-950 shadow-xs">
            ★
          </span>
        )}
      </div>
    </div>
  );
};
