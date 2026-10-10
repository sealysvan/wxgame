import React, { useEffect, useState } from 'react';
import adBannerGraphic from '../assets/images/bar_ad_banner_mock_1791613233759.jpg';
import { sound } from '../utils/audio';
import { X, Play, Award } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  rewardTitle: string;
  onRewardGranted: () => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  rewardTitle,
  onRewardGranted,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(15);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 13) {
          setCanSkip(true); // Allow skip after 2-3 seconds for responsive testing
        }
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleComplete = () => {
    sound.playCoin();
    onRewardGranted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
      <div className="w-full max-w-sm bg-stone-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Top Video Status Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/80 text-white text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>奖励：{rewardTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-stone-400 font-bold">
              {secondsLeft > 0 ? `${secondsLeft}s` : '可领取'}
            </span>
            {canSkip && (
              <button
                onClick={handleComplete}
                className="px-2 py-0.5 rounded bg-stone-800 border border-stone-600 text-stone-200 text-[11px] font-bold hover:bg-stone-700"
              >
                跳过
              </button>
            )}
          </div>
        </div>

        {/* Video Simulation Screen */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <img
            src={adBannerGraphic}
            alt="Ad Content"
            className="w-full h-full object-cover brightness-90 animate-pulse duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-black text-sm">霓虹酒吧夜 · 特权礼包</span>
              <span className="text-[10px] text-amber-300">广告赞助商提供</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Play className="w-3.5 h-3.5 fill-amber-300" />
            </div>
          </div>
        </div>

        {/* Claim Action Bar */}
        <div className="p-4 bg-stone-950 flex flex-col gap-2">
          {secondsLeft === 0 ? (
            <button
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-black text-base shadow-[0_4px_16px_rgba(245,158,11,0.6)] border border-amber-300 hover:scale-102 active:scale-98 transition-all"
            >
              领取奖励
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="w-full py-2.5 rounded-xl bg-stone-800 text-stone-400 font-semibold text-xs border border-stone-700 hover:text-white"
            >
              观看中 ({secondsLeft}s)
            </button>
          )}

          <button
            onClick={onClose}
            className="text-[11px] text-stone-500 hover:text-stone-400 text-center py-1"
          >
            放弃奖励关闭
          </button>
        </div>
      </div>
    </div>
  );
};

interface InterstitialAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({ isOpen, onClose }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85">
      <div className="relative w-full max-w-xs bg-stone-900 border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={countdown > 0}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs border border-white/20 disabled:opacity-40"
        >
          {countdown > 0 ? countdown : <X className="w-3.5 h-3.5" />}
        </button>

        {/* Ad Graphic */}
        <img
          src={adBannerGraphic}
          alt="Interstitial ad"
          className="w-full aspect-square object-cover"
        />

        <div className="p-3 bg-stone-950 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-200">骰王俱乐部精选</span>
            <span className="text-[10px] text-stone-500">点击立即体验</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-black text-xs"
          >
            了解
          </button>
        </div>
      </div>
    </div>
  );
};

export const BannerAd: React.FC = () => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="w-full max-w-sm mx-auto px-2 py-1 relative">
      <div className="w-full h-14 rounded-xl bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-500/30 flex items-center justify-between px-2.5 overflow-hidden shadow-md">
        <div className="flex items-center gap-2">
          <img
            src={adBannerGraphic}
            alt="Ad icon"
            className="w-10 h-10 rounded-lg object-cover border border-amber-500/40"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-amber-300">酒吧尊享红包</span>
            <span className="text-[10px] text-stone-400">每日免费领取金币</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-1 rounded bg-amber-500 text-stone-950 font-black text-[11px] shadow-xs cursor-pointer hover:bg-amber-400">
            打开
          </span>
          <button
            onClick={() => setClosed(true)}
            className="w-4 h-4 rounded text-stone-500 hover:text-stone-300 flex items-center justify-center text-[10px]"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
