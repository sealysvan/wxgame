import React from 'react';
import { CupSkinId, DiceSkinId } from '../types/game';
import { Dice3D } from './Dice3D';
import { checkStraight } from '../utils/diceRules';

interface BarDiceCupProps {
  dice: number[];
  isOpen: boolean;
  isRolling: boolean;
  isRevealing: boolean;
  selectedDiceSkin: DiceSkinId;
  selectedCupSkin: CupSkinId;
  onToggleCup: () => void;
  onReroll?: () => void;
  matchingPip?: number;
  wildOnesActive?: boolean;
}

export const BarDiceCup: React.FC<BarDiceCupProps> = ({
  dice,
  isOpen,
  isRolling,
  isRevealing,
  selectedDiceSkin,
  selectedCupSkin,
  onToggleCup,
  onReroll,
  matchingPip,
  wildOnesActive = true,
}) => {
  // Styling according to selected cup skin (classic amber/orange bar resin from reference photo)
  const getCupSkinStyles = () => {
    switch (selectedCupSkin) {
      case 'carved_mahogany':
        return {
          trayBg: 'bg-gradient-to-br from-amber-950 via-amber-900 to-stone-950 border-amber-700/80 shadow-[0_12px_28px_rgba(0,0,0,0.85)]',
          cupBg: 'bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border-amber-600/70',
          ribbonColor: 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-amber-500/80',
          knobColor: 'bg-gradient-to-b from-amber-800 to-amber-950 border-amber-600',
          gloss: 'from-amber-200/30 via-white/10 to-transparent',
        };
      case 'midnight_metal':
        return {
          trayBg: 'bg-gradient-to-br from-slate-900 via-slate-950 to-black border-cyan-500/60 shadow-[0_12px_28px_rgba(0,0,0,0.9)]',
          cupBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 border-cyan-500/50',
          ribbonColor: 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 border-cyan-300',
          knobColor: 'bg-gradient-to-b from-slate-700 to-slate-900 border-cyan-400',
          gloss: 'from-cyan-300/30 via-white/10 to-transparent',
        };
      case 'vintage_leather':
      default:
        // Classic Bar Amber/Orange Glossy Resin Cup (Matching user photo)
        return {
          trayBg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-amber-300 shadow-[0_14px_32px_rgba(217,119,6,0.65),inset_0_3px_6px_rgba(255,255,255,0.45)]',
          cupBg: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 border-amber-300',
          ribbonColor: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 border-amber-200',
          knobColor: 'bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 border-amber-300',
          gloss: 'from-white/50 via-white/20 to-transparent',
        };
    }
  };

  const skin = getCupSkinStyles();
  const shouldShowOpen = (isOpen || isRevealing) && !isRolling;
  const straight = checkStraight(dice);

  return (
    <div className="relative w-full max-w-sm h-64 flex flex-col items-center justify-end select-none">
      {/* 1. Base Dish Tray (底盘 - shallow circular orange dish holding the 5 dice) */}
      <div
        onClick={onToggleCup}
        className={`relative w-76 h-36 rounded-[50%] border-4 flex items-center justify-center transition-transform cursor-pointer ${
          skin.trayBg
        } ${isRolling ? 'animate-table-rumble scale-95' : 'scale-100'}`}
        style={{
          boxShadow: '0 16px 36px rgba(0,0,0,0.85), inset 0 4px 10px rgba(0,0,0,0.3)',
        }}
      >
        {/* Tray Inner Rim Lip */}
        <div className="absolute inset-1.5 rounded-[50%] border border-black/20 pointer-events-none" />

        {/* Straight (顺子) notification badge & reroll shortcut */}
        {straight.isStraight && shouldShowOpen && (
          <div
            onClick={e => e.stopPropagation()}
            className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs px-3.5 py-1 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.95)] border-2 border-yellow-200 animate-bounce whitespace-nowrap"
          >
            <span className="flex items-center gap-1">
              <span>✨</span>
              <span>{straight.label}！可重摇一次</span>
            </span>
            {onReroll && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onReroll();
                }}
                className="px-2.5 py-0.5 rounded-full bg-stone-950 text-amber-300 text-[11px] font-black hover:bg-stone-900 border border-amber-400 active:scale-95 transition-transform flex items-center gap-1 shadow-xs"
              >
                <span>立即重摇</span>
                <span>🎲</span>
              </button>
            )}
          </div>
        )}

        {/* 2. Five Large High-Contrast Dice (Visible when cup is opened/revealed, NEVER during shake) */}
        <div
          className={`relative z-10 flex items-center justify-center gap-2.5 transition-all duration-300 ${
            shouldShowOpen ? 'opacity-100 scale-100 translate-y-1' : 'opacity-0 scale-75 pointer-events-none'
          }`}
        >
          {dice.map((dieVal, idx) => (
            <Dice3D
              key={idx}
              value={dieVal}
              size={46}
              isRolling={false}
              skin={selectedDiceSkin}
              isWildOne={wildOnesActive}
              isHighlighted={
                matchingPip ? dieVal === matchingPip || (wildOnesActive && dieVal === 1) : false
              }
            />
          ))}
        </div>
      </div>

      {/* 3. The 3D Dice Cup Cover (盅身 - stepped cylindrical cup with top knob and middle rib) */}
      <div
        onClick={onToggleCup}
        className={`absolute z-20 cursor-pointer transition-all duration-300 ease-out origin-bottom-right ${
          isRolling
            ? 'bottom-12 animate-cup-vigorous-shake'
            : shouldShowOpen
            ? 'bottom-16 translate-x-28 -translate-y-14 rotate-[44deg] scale-95 shadow-[0_25px_45px_rgba(0,0,0,0.75)]'
            : 'bottom-5 translate-x-0 translate-y-0 rotate-0 shadow-[0_16px_30px_rgba(0,0,0,0.85)] hover:-translate-y-1'
        }`}
      >
        {/* Subtle Ambient Motion Aura when rolling */}
        {isRolling && (
          <div className="absolute -inset-2 pointer-events-none rounded-full bg-amber-400/10 blur-xl animate-pulse" />
        )}

        {/* Outer Cup Container */}
        <div className="relative flex flex-col items-center">
          {/* A. Top Handle Knob (顶部圆钮提手) */}
          <div
            className={`w-15 h-6.5 rounded-t-xl rounded-b-md border-t border-x relative overflow-hidden shadow-md ${skin.knobColor}`}
          >
            {/* Top specular highlight */}
            <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-b ${skin.gloss}`} />
          </div>

          {/* Knob Neck Connector */}
          <div className="w-11 h-2 bg-black/35" />

          {/* B. Upper Cup Dome / Tapered Cylinder (上层盅身) */}
          <div
            className={`w-34 h-15 rounded-t-2xl border-t border-x relative overflow-hidden shadow-inner ${skin.cupBg}`}
          >
            {/* Glossy vertical sheen reflection line */}
            <div className={`absolute inset-y-0 left-5 w-4.5 bg-gradient-to-r ${skin.gloss}`} />
          </div>

          {/* C. Middle Ribbed Ring (腰身凸起防滑棱圈 - Distinct Bar Feature) */}
          <div
            className={`w-38 h-3.5 rounded-full border-y shadow-sm relative overflow-hidden -my-0.5 z-10 ${skin.ribbonColor}`}
          >
            <div className={`absolute inset-y-0 left-6 w-3.5 bg-gradient-to-r ${skin.gloss}`} />
          </div>

          {/* D. Lower Cup Barrel (下层宽体圆筒) */}
          <div
            className={`w-36 h-20 rounded-b-xl border-b border-x relative overflow-hidden shadow-lg ${skin.cupBg}`}
          >
            {/* Glossy sheen continued */}
            <div className={`absolute inset-y-0 left-6 w-5.5 bg-gradient-to-r ${skin.gloss}`} />

            {/* Bottom Lip Ring Shadow */}
            <div className="absolute bottom-0 inset-x-0 h-2.5 bg-black/45" />
          </div>
        </div>
      </div>
    </div>
  );
};
