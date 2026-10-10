import React from 'react';
import { Player, Bid, CupSkinId, DiceSkinId } from '../types/game';
import { Dice3D } from './Dice3D';
import { BarDiceCup } from './BarDiceCup';
import barBackdrop from '../assets/images/bar_speakeasy_table_1791613205851.jpg';
import { LogOut } from 'lucide-react';

interface BarSceneProps {
  players: Player[];
  activePlayerIndex: number;
  currentBid: Bid | null;
  userPlayer: Player;
  isRolling: boolean;
  isCupOpen: boolean;
  onToggleCup: () => void;
  selectedCupSkin: CupSkinId;
  selectedDiceSkin: DiceSkinId;
  turnCountdown: number;
  isRevealing: boolean;
  matchingPip?: number;
  wildOnesActive?: boolean;
  onExitMatch?: () => void;
}

export const BarScene: React.FC<BarSceneProps> = ({
  players,
  activePlayerIndex,
  currentBid,
  userPlayer,
  isRolling,
  isCupOpen,
  onToggleCup,
  selectedCupSkin,
  selectedDiceSkin,
  turnCountdown,
  isRevealing,
  matchingPip,
  wildOnesActive = true,
  onExitMatch,
}) => {
  // Opponents are everyone except user
  const opponents = players.filter(p => !p.isUser);

  // Styling for cup skins
  const getCupStyle = () => {
    switch (selectedCupSkin) {
      case 'carved_mahogany':
        return 'bg-gradient-to-b from-amber-900 via-amber-950 to-stone-950 border-amber-600/70 shadow-[0_12px_24px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(251,191,36,0.3)]';
      case 'midnight_metal':
        return 'bg-gradient-to-b from-slate-800 via-slate-900 to-black border-cyan-500/50 shadow-[0_12px_24px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(34,211,238,0.3)]';
      case 'vintage_leather':
      default:
        return 'bg-gradient-to-b from-amber-800 via-stone-900 to-stone-950 border-amber-700/60 shadow-[0_12px_24px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(245,158,11,0.2)]';
    }
  };

  // Render 3 HP Beer Mugs for each player
  const renderHP = (hp: number, isDrunk: boolean) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3].map(i => {
          const isAlive = i <= hp && !isDrunk;
          return (
            <div
              key={i}
              className={`w-4 h-4.5 rounded-sm relative flex flex-col justify-end overflow-hidden transition-all duration-300 border ${
                isAlive
                  ? 'border-amber-400 bg-amber-950/80 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                  : 'border-stone-700 bg-stone-900/60 opacity-40'
              }`}
            >
              {/* Handle */}
              <div
                className={`absolute -right-1 top-1 w-1.5 h-2.5 rounded-r border-t border-r border-b ${
                  isAlive ? 'border-amber-400' : 'border-stone-700'
                }`}
              />
              {/* Foam */}
              {isAlive && <div className="h-1 bg-amber-100 w-full" />}
              {/* Beer liquid */}
              {isAlive && <div className="h-2.5 bg-gradient-to-t from-amber-600 to-amber-400 w-full" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={barBackdrop}
          alt="Bar atmosphere"
          className="w-full h-full object-cover object-top opacity-55 filter brightness-75 contrast-125 scale-105"
        />
        {/* Subtle Vignette & Neon Atmospheric Glow */}
        <div className="absolute inset-0 bg-radial from-transparent via-stone-950/70 to-stone-950" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-44 bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Top Header Bar with Exit Button */}
      <div className="relative z-20 w-full px-3 pt-2.5 flex items-center justify-between">
        {onExitMatch ? (
          <button
            onClick={onExitMatch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-950/80 border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-500/50 active:scale-95 transition-all shadow-md text-xs font-semibold backdrop-blur-md"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>退出</span>
          </button>
        ) : <div />}

        {/* Rolling Status Pill */}
        {isRolling && (
          <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-black animate-pulse flex items-center gap-1.5 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>全力摇盅中...</span>
          </div>
        )}
      </div>

      {/* Opponents Ring Layer (Top & Mid Sides) */}
      <div className="relative z-10 w-full px-3 pt-1">
        <div className="grid grid-cols-3 gap-2 items-start max-w-sm mx-auto">
          {opponents.map(opp => {
            const isTurn = players[activePlayerIndex]?.id === opp.id;
            const hasBid = currentBid?.playerId === opp.id;

            return (
              <div
                key={opp.id}
                className={`flex flex-col items-center transition-all duration-300 ${
                  opp.isEliminated ? 'opacity-35 grayscale' : ''
                }`}
              >
                {/* Speech Bubble / Last Bid */}
                <div className="h-7 mb-1 flex items-center justify-center">
                  {!isRolling && hasBid && currentBid && (
                    <div className="animate-bounce bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-lg text-xs shadow-[0_2px_8px_rgba(251,191,36,0.5)] flex items-center gap-1 border border-amber-300">
                      <span>{currentBid.count}</span>
                      <span>×</span>
                      <Dice3D value={currentBid.pip} size={14} skin={selectedDiceSkin} />
                    </div>
                  )}
                </div>

                {/* Avatar with Turn Ring */}
                <div className="relative">
                  {isTurn && (
                    <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400 border-dashed animate-spin shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                  )}
                  <div
                    className={`w-12 h-12 rounded-full overflow-hidden border-2 relative transition-all duration-300 ${
                      isTurn ? 'border-amber-300 scale-105' : 'border-stone-700'
                    }`}
                  >
                    <img
                      src={opp.avatar}
                      alt={opp.name}
                      className="w-full h-full object-cover"
                    />
                    {opp.isEliminated && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-sm font-black text-rose-500">醉</span>
                      </div>
                    )}
                  </div>

                  {/* Turn Countdown Ring Indicator */}
                  {isTurn && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-mono font-bold text-[10px] flex items-center justify-center shadow-xs">
                      {turnCountdown}
                    </div>
                  )}
                </div>

                {/* HP Beer Glasses */}
                <div className="mt-1">
                  {renderHP(opp.hp, opp.isEliminated)}
                </div>

                {/* Opponent Cup or Revealed Dice on Table */}
                <div className="mt-2 h-14 flex items-center justify-center">
                  {isRevealing || opp.isEliminated ? (
                    /* Revealed mini dice */
                    <div className="flex gap-0.5 items-center justify-center p-1 bg-black/40 rounded-lg backdrop-blur-xs border border-white/10">
                      {opp.dice.map((d, dIdx) => (
                        <Dice3D
                          key={dIdx}
                          value={d}
                          size={18}
                          skin={selectedDiceSkin}
                          isHighlighted={
                            matchingPip ? d === matchingPip || (wildOnesActive && d === 1) : false
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    /* Concealed Cup with Rattle Animation when Rolling */
                    <div
                      className={`w-11 h-13 rounded-t-xl rounded-b-md border border-stone-600/80 bg-gradient-to-b from-stone-800 to-stone-950 flex flex-col items-center justify-center shadow-lg transition-transform ${
                        isRolling ? 'animate-cup-shake' : ''
                      }`}
                    >
                      <div className="w-8 h-1 rounded-full bg-stone-700 mb-1" />
                      <span className="text-[10px] text-stone-500 font-bold">5</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Bar Table Surface (Wood Grain & Table Felt with Perspective) */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-end pb-3">
        {/* Active Bid Showcase (Center Table Display) */}
        <div className="w-full max-w-xs mx-auto mb-1 flex flex-col items-center min-h-[44px] justify-center">
          {!isRolling && currentBid ? (
            <div className="bg-stone-950/85 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-amber-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center gap-3">
              <span className="text-xs text-stone-400 font-medium">当前叫点</span>
              <div className="flex items-center gap-1.5 text-2xl font-black text-amber-400">
                <span>{currentBid.count}</span>
                <span className="text-sm text-stone-500">个</span>
                <Dice3D value={currentBid.pip} size={30} skin={selectedDiceSkin} />
              </div>
              {!currentBid.isWildOneActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-600 text-rose-300">
                  斋
                </span>
              )}
            </div>
          ) : (
            <div className="h-7 flex items-center text-xs text-amber-400/70 font-semibold tracking-wider">
              {isRolling ? '晃动手机或长按摇盅...' : '准备起叫'}
            </div>
          )}
        </div>

        {/* User's Cup and Dice Zone - Completely Open, No Clipping Box */}
        <div className="relative w-full max-w-sm flex flex-col items-center justify-center">
          {/* Subtle Ambient Counter Reflection */}
          <div className="absolute w-80 h-36 rounded-[50%] bg-amber-500/10 blur-2xl pointer-events-none" />

          {/* Authentic Bar Dice Cup & Base Dish (Matching reference image) */}
          <BarDiceCup
            dice={userPlayer.dice}
            isOpen={isCupOpen}
            isRolling={isRolling}
            isRevealing={isRevealing}
            selectedDiceSkin={selectedDiceSkin}
            selectedCupSkin={selectedCupSkin}
            onToggleCup={onToggleCup}
            matchingPip={matchingPip}
            wildOnesActive={wildOnesActive}
          />

          {/* User HP and Quick Status Bar */}
          <div className="w-72 mt-2 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-300">我</span>
              {renderHP(userPlayer.hp, userPlayer.isEliminated)}
            </div>

            {/* Cup Peek / Conceal toggle */}
            <button
              onClick={onToggleCup}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-900/90 border border-stone-700 text-stone-200 text-xs font-semibold hover:border-amber-400 transition-colors shadow-md"
            >
              <span>{isCupOpen ? '扣盅' : '看点'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

