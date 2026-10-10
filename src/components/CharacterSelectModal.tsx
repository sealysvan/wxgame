import React from 'react';
import { UserCharacter, UserStats } from '../types/game';
import { sound } from '../utils/audio';
import { X, Check, Sparkles } from 'lucide-react';

export const BAR_CHARACTERS: UserCharacter[] = [
  {
    id: 'char_jiuxian',
    name: '摇骰酒仙',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=140&h=140&fit=crop&crop=face',
    title: '千杯不醉',
    personality: '潇洒自如',
    quote: '酒过三巡，真假自在心中。',
  },
  {
    id: 'char_shouhou',
    name: '夜场骰后',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&h=140&fit=crop&crop=face',
    title: '全场瞩目',
    personality: '气场全开',
    quote: '想开我？先看看你的底牌够不够硬。',
  },
  {
    id: 'char_xinli',
    name: '心理战神',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&h=140&fit=crop&crop=face',
    title: '深藏不露',
    personality: '虚实莫测',
    quote: '每一次叫点，都在我的算计之中。',
  },
  {
    id: 'char_jinzhu',
    name: '豪迈金主',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&h=140&fit=crop&crop=face',
    title: '包场豪客',
    personality: '霸气重诺',
    quote: '输了算我的，今晚酒水管够！',
  },
  {
    id: 'char_duxia',
    name: '狂野赌侠',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=140&h=140&fit=crop&crop=face',
    title: '敢吹敢拼',
    personality: '嗜险嗜胜',
    quote: '顺风乘胜追击，逆风绝地翻盘！',
  },
  {
    id: 'char_daimeng',
    name: '呆萌酒客',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=140&h=140&fit=crop&crop=face',
    title: '扮猪吃虎',
    personality: '元气灵动',
    quote: '我真的一颗都没对上……你信吗？嘻嘻。',
  },
];

interface CharacterSelectModalProps {
  currentStats: UserStats;
  onSelectCharacter: (char: UserCharacter) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  currentStats,
  onSelectCharacter,
  onClose,
}) => {
  const selectedId = currentStats.selectedCharacterId || BAR_CHARACTERS[0].id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-500/40 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col relative max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-300 font-black text-lg">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>选择登场人物</span>
          </div>

          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character List */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 flex flex-col gap-2.5">
          {BAR_CHARACTERS.map(char => {
            const isSelected = char.id === selectedId;

            return (
              <div
                key={char.id}
                onClick={() => {
                  sound.playTap();
                  onSelectCharacter(char);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/50 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                    : 'bg-stone-900/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                {/* Left Avatar & Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-13 h-13 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform ${
                      isSelected ? 'border-amber-400 scale-105 shadow-md' : 'border-stone-700'
                    }`}
                  >
                    <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-100">{char.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {char.title}
                      </span>
                    </div>

                    <span className="text-xs text-amber-400/80 font-medium mt-0.5">
                      {char.personality}
                    </span>

                    <span className="text-[11px] text-stone-400 line-clamp-1 italic mt-0.5">
                      "{char.quote}"
                    </span>
                  </div>
                </div>

                {/* Right Selection Indicator */}
                <div className="pl-2">
                  {isSelected ? (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border border-stone-700 flex items-center justify-center text-xs text-stone-500">
                      选
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Confirmation */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black text-sm shadow-[0_6px_16px_rgba(245,158,11,0.4)] border border-amber-300 hover:scale-102 active:scale-98 transition-all"
        >
          确定选择
        </button>
      </div>
    </div>
  );
};
