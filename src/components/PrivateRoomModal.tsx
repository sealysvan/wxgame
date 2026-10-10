import React, { useState } from 'react';
import { Player } from '../types/game';
import { sound } from '../utils/audio';
import { X, Users, Copy, Check, Play, UserPlus } from 'lucide-react';

interface PrivateRoomModalProps {
  onStartRoomGame: (playerCount: number) => void;
  onClose: () => void;
}

export const PrivateRoomModal: React.FC<PrivateRoomModalProps> = ({
  onStartRoomGame,
  onClose,
}) => {
  const [roomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState(4);

  const handleCopy = () => {
    sound.playTap();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`【酒吧骰王】房号：${roomCode}，速来摇骰拼酒！`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    sound.playCupSlam();
    onStartRoomGame(playerCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
            <Users className="w-5 h-5" />
            <span>好友私房</span>
          </div>

          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Code Display */}
        <div className="my-4 p-4 rounded-2xl bg-stone-900 border border-amber-500/30 flex flex-col items-center">
          <span className="text-xs text-stone-400 mb-1">专属房号</span>
          <div className="text-3xl font-mono font-black tracking-widest text-amber-300">
            {roomCode}
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 px-3 py-1 rounded-lg bg-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-stone-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制邀请' : '复制房号'}</span>
          </button>
        </div>

        {/* Player Count Selector */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>对战人数</span>
            <span className="text-amber-400 font-bold">{playerCount} 人局</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 6].map(num => (
              <button
                key={num}
                onClick={() => {
                  sound.playTap();
                  setPlayerCount(num);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  playerCount === num
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-900 text-stone-400 border border-stone-800'
                }`}
              >
                {num}人
              </button>
            ))}
          </div>
        </div>

        {/* Player Slots Preview */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-500/50 flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-xs font-bold text-amber-300">
              房主
            </div>
            <span className="text-[11px] text-stone-300 font-bold mt-1">我</span>
          </div>

          {Array.from({ length: playerCount - 1 }).map((_, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-stone-900/40 border border-stone-800 flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-500">
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">已就绪</span>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-black text-base shadow-[0_6px_16px_rgba(245,158,11,0.5)] border border-amber-300 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-stone-950" />
          <span>开始对局</span>
        </button>
      </div>
    </div>
  );
};
