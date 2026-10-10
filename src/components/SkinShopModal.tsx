import React, { useState } from 'react';
import { CupSkinId, DiceSkinId, UserStats } from '../types/game';
import { Dice3D } from './Dice3D';
import { sound } from '../utils/audio';
import { X, Check, Lock, Sparkles, Coins } from 'lucide-react';

interface SkinShopModalProps {
  stats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  onClose: () => void;
}

interface DiceSkinItem {
  id: DiceSkinId;
  name: string;
  price: number;
}

interface CupSkinItem {
  id: CupSkinId;
  name: string;
  price: number;
}

const DICE_SKINS: DiceSkinItem[] = [
  { id: 'classic_ivory', name: '经典象牙', price: 0 },
  { id: 'obsidian_gold', name: '黑曜金珀', price: 2000 },
  { id: 'cyber_neon', name: '霓虹赛博', price: 3500 },
  { id: 'pure_gold', name: '流光纯金', price: 5000 },
];

const CUP_SKINS: CupSkinItem[] = [
  { id: 'vintage_leather', name: '经典琥珀橙', price: 0 },
  { id: 'carved_mahogany', name: '红木雕花', price: 2500 },
  { id: 'midnight_metal', name: '暗夜金属', price: 4000 },
];

export const SkinShopModal: React.FC<SkinShopModalProps> = ({ stats, onUpdateStats, onClose }) => {
  const [tab, setTab] = useState<'dice' | 'cup'>('dice');

  const unlockedDiceSkins = stats.unlockedDiceSkins || ['classic_ivory'];
  const unlockedCupSkins = stats.unlockedCupSkins || ['vintage_leather'];

  const handleSelectDice = (skin: DiceSkinItem) => {
    sound.playTap();
    const isUnlocked = unlockedDiceSkins.includes(skin.id);

    if (isUnlocked) {
      onUpdateStats(prev => ({ ...prev, selectedDiceSkin: skin.id }));
    } else if (stats.coins >= skin.price) {
      sound.playCoin();
      onUpdateStats(prev => ({
        ...prev,
        coins: prev.coins - skin.price,
        unlockedDiceSkins: [...(prev.unlockedDiceSkins || ['classic_ivory']), skin.id],
        selectedDiceSkin: skin.id,
      }));
    }
  };

  const handleSelectCup = (skin: CupSkinItem) => {
    sound.playTap();
    const isUnlocked = unlockedCupSkins.includes(skin.id);

    if (isUnlocked) {
      onUpdateStats(prev => ({ ...prev, selectedCupSkin: skin.id }));
    } else if (stats.coins >= skin.price) {
      sound.playCoin();
      onUpdateStats(prev => ({
        ...prev,
        coins: prev.coins - skin.price,
        unlockedCupSkins: [...(prev.unlockedCupSkins || ['vintage_leather']), skin.id],
        selectedCupSkin: skin.id,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col relative max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
            <Sparkles className="w-5 h-5" />
            <span>装扮典藏</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-stone-900 px-2 py-1 rounded-lg border border-amber-500/30">
              <Coins className="w-3.5 h-3.5" />
              <span>{stats.coins}</span>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-stone-900/90 p-1 rounded-xl border border-stone-800 my-3">
          <button
            onClick={() => setTab('dice')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'dice' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400'
            }`}
          >
            骰子外观
          </button>
          <button
            onClick={() => setTab('cup')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              tab === 'cup' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-400'
            }`}
          >
            骰盅造型
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
          {tab === 'dice' ? (
            DICE_SKINS.map(item => {
              const isUnlocked = unlockedDiceSkins.includes(item.id);
              const isEquipped = stats.selectedDiceSkin === item.id;
              const canAfford = stats.coins >= item.price;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectDice(item)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isEquipped
                      ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                      : 'bg-stone-900/70 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Dice3D value={6} size={36} skin={item.id} />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-stone-200">{item.name}</span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {item.price === 0 ? '默认拥有' : `${item.price} 金币`}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 佩戴中
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700">
                        装备
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-500 opacity-60'
                        }`}
                      >
                        <Lock className="w-3 h-3" /> 解锁
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            CUP_SKINS.map(item => {
              const isUnlocked = unlockedCupSkins.includes(item.id);
              const isEquipped = stats.selectedCupSkin === item.id;
              const canAfford = stats.coins >= item.price;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectCup(item)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isEquipped
                      ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                      : 'bg-stone-900/70 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-12 flex flex-col items-center justify-center">
                      {item.id === 'carved_mahogany' ? (
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-1.5 rounded-t-xs bg-amber-700 border border-amber-600" />
                          <div className="w-7 h-4 rounded-t-md bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border-t border-x border-amber-600/70" />
                          <div className="w-8 h-1 bg-amber-600 -my-0.5 z-10 rounded-full" />
                          <div className="w-7.5 h-4.5 rounded-b-md bg-gradient-to-r from-amber-950 via-amber-800 to-stone-950 border-b border-x border-amber-700/60" />
                        </div>
                      ) : item.id === 'midnight_metal' ? (
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-1.5 rounded-t-xs bg-slate-700 border border-cyan-400" />
                          <div className="w-7 h-4 rounded-t-md bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 border-t border-x border-cyan-500/70" />
                          <div className="w-8 h-1 bg-cyan-500 -my-0.5 z-10 rounded-full" />
                          <div className="w-7.5 h-4.5 rounded-b-md bg-gradient-to-r from-slate-950 via-slate-900 to-black border-b border-x border-cyan-500/50" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-3.5 h-1.5 rounded-t-xs bg-amber-400 border border-amber-300" />
                          <div className="w-7 h-4 rounded-t-md bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 border-t border-x border-amber-300" />
                          <div className="w-8 h-1 bg-amber-400 -my-0.5 z-10 rounded-full" />
                          <div className="w-7.5 h-4.5 rounded-b-md bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 border-b border-x border-amber-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-stone-200">{item.name}</span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {item.price === 0 ? '默认拥有' : `${item.price} 金币`}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 佩戴中
                      </span>
                    ) : isUnlocked ? (
                      <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700">
                        装备
                      </span>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-500 opacity-60'
                        }`}
                      >
                        <Lock className="w-3 h-3" /> 解锁
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
