import React, { useState } from 'react';
import { UserStats, RedPacketTier, WithdrawRecord } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Gift,
  Check,
  Wallet,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface RedPacketModalProps {
  stats: UserStats;
  initialTab?: 'claim' | 'exchange';
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  onClose: () => void;
}

export const RED_PACKET_TIERS: RedPacketTier[] = [
  { id: 1, cupsRequired: 3, amount: 1.88, coinsBonus: 1000, title: '初入酒肆红包' },
  { id: 2, cupsRequired: 8, amount: 3.88, coinsBonus: 2880, title: '千杯初醒红包' },
  { id: 3, cupsRequired: 18, amount: 8.88, coinsBonus: 6880, title: '夜场骰豪红包' },
  { id: 4, cupsRequired: 38, amount: 18.88, coinsBonus: 16880, title: '工体酒仙红包' },
  { id: 5, cupsRequired: 68, amount: 38.88, coinsBonus: 38880, title: '九街霸王红包' },
  { id: 6, cupsRequired: 128, amount: 88.88, coinsBonus: 88880, title: '巅峰骰神特大红包' },
  { id: 7, cupsRequired: 200, amount: 188.88, coinsBonus: 188880, title: '绝世神豪至尊红包' },
];

const WITHDRAW_DENOMINATIONS = [1, 5, 10, 20, 50, 100];

export const RedPacketModal: React.FC<RedPacketModalProps> = ({
  stats,
  initialTab = 'claim',
  onUpdateStats,
  onClose,
}) => {
  const [tab, setTab] = useState<'claim' | 'exchange'>(initialTab);
  const [openingTier, setOpeningTier] = useState<RedPacketTier | null>(null);
  const [isOpeningAnim, setIsOpeningAnim] = useState<boolean>(false);
  const [openedResult, setOpenedResult] = useState<RedPacketTier | null>(null);
  const [wechatSuccessNotice, setWechatSuccessNotice] = useState<number | null>(null);
  const [coinsSuccessNotice, setCoinsSuccessNotice] = useState<number | null>(null);

  const redPacketCash = typeof stats?.redPacketCash === 'number' ? stats.redPacketCash : 0;
  const cupsWon = typeof stats?.cupsWon === 'number' ? stats.cupsWon : 0;
  const claimedRedPackets = Array.isArray(stats?.claimedRedPackets) ? stats.claimedRedPackets : [];
  const records = Array.isArray(stats?.withdrawRecords) ? stats.withdrawRecords : [];

  // Claim milestone red packet
  const handleClaim = (tier: RedPacketTier) => {
    sound.playTap();
    setOpeningTier(tier);
    setIsOpeningAnim(true);

    setTimeout(() => {
      sound.playCoin();
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff'],
      });
      setIsOpeningAnim(false);
      setOpenedResult(tier);

      // Add cash and coins, mark tier as claimed
      onUpdateStats(prev => ({
        ...prev,
        redPacketCash: +((typeof prev.redPacketCash === 'number' ? prev.redPacketCash : 0) + tier.amount).toFixed(2),
        coins: (prev.coins || 0) + tier.coinsBonus,
        claimedRedPackets: [...(prev.claimedRedPackets || []), tier.id],
      }));
    }, 1100);
  };

  // Convert cash to coins (1元 = 1000金币)
  const handleExchangeToCoins = (amount?: number) => {
    const exchangeAmt = amount || redPacketCash;
    if (exchangeAmt <= 0 || redPacketCash < exchangeAmt) return;
    sound.playCoin();
    const addCoins = Math.round(exchangeAmt * 1000);
    const newRecord: WithdrawRecord = {
      id: `coins_${Date.now()}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      amount: exchangeAmt,
      type: 'coins',
      status: `已兑换 +${addCoins}金币`,
    };

    onUpdateStats(prev => ({
      ...prev,
      coins: (prev.coins || 0) + addCoins,
      redPacketCash: +((typeof prev.redPacketCash === 'number' ? prev.redPacketCash : 0) - exchangeAmt).toFixed(2),
      withdrawRecords: [newRecord, ...(prev.withdrawRecords || [])],
    }));

    setCoinsSuccessNotice(addCoins);
    setTimeout(() => setCoinsSuccessNotice(null), 2500);
  };

  // WeChat withdrawal simulation
  const handleWithdrawWeChat = (amount: number) => {
    if (amount <= 0 || redPacketCash < amount) return;
    sound.playVictoryFanfare();
    confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 } });

    const newRecord: WithdrawRecord = {
      id: `wx_${Date.now()}`,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      amount: amount,
      type: 'wechat',
      status: '微信零钱秒到账',
    };

    onUpdateStats(prev => ({
      ...prev,
      redPacketCash: +((typeof prev.redPacketCash === 'number' ? prev.redPacketCash : 0) - amount).toFixed(2),
      withdrawRecords: [newRecord, ...(prev.withdrawRecords || [])],
    }));

    setWechatSuccessNotice(amount);
    setTimeout(() => setWechatSuccessNotice(null), 3200);
  };

  // Withdraw all balance
  const handleWithdrawAll = () => {
    if (redPacketCash <= 0) return;
    handleWithdrawWeChat(redPacketCash);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-b from-red-950 via-stone-950 to-black border-2 border-red-500/50 rounded-3xl p-4.5 shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex flex-col relative max-h-[92vh]">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-2.5 border-b border-red-900/50">
          <div className="flex items-center gap-1.5 text-amber-300 font-black text-lg">
            <span className="text-xl">🧧</span>
            <span>酒吧红包福利</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-300 bg-red-950/90 px-2 py-0.5 rounded-lg border border-amber-500/40">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>¥{redPacketCash.toFixed(2)}</span>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: 领取红包 vs 红包兑换 */}
        <div className="grid grid-cols-2 gap-1.5 my-2.5 p-1 bg-stone-900/80 rounded-2xl border border-red-900/40">
          <button
            onClick={() => {
              sound.playTap();
              setTab('claim');
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tab === 'claim'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>领取红包</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setTab('exchange');
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              tab === 'exchange'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>红包兑换/提现</span>
          </button>
        </div>

        {/* Current Cups Summary Ribbon */}
        <div className="mb-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-red-900/50 via-stone-900 to-amber-950/50 border border-amber-500/40 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-lg shadow-xs">
              🍺
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-stone-300 font-medium">累计赢酒杯数</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black font-mono text-amber-300">{cupsWon}</span>
                <span className="text-[11px] text-stone-400">杯 (每赢对手罚酒1杯)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setTab(tab === 'claim' ? 'exchange' : 'claim')}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-black flex items-center gap-1 shadow-md hover:bg-amber-400 transition-colors"
          >
            <span>{tab === 'claim' ? '去提现' : '去领杯'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Tab 1: 领取红包 (Milestone Claim) */}
        {tab === 'claim' && (
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {RED_PACKET_TIERS.map(tier => {
              const isClaimed = claimedRedPackets.includes(tier.id);
              const canClaim = cupsWon >= tier.cupsRequired && !isClaimed;
              const remaining = Math.max(0, tier.cupsRequired - cupsWon);

              return (
                <div
                  key={tier.id}
                  className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isClaimed
                      ? 'bg-stone-900/40 border-stone-800 opacity-60'
                      : canClaim
                      ? 'bg-gradient-to-r from-red-950/90 to-amber-950/70 border-amber-400/90 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/60'
                      : 'bg-stone-900/60 border-stone-800'
                  }`}
                >
                  {/* Left Icon & Info */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-11 h-12 rounded-xl flex flex-col items-center justify-center border font-mono font-black ${
                        isClaimed
                          ? 'bg-stone-800 border-stone-700 text-stone-500'
                          : canClaim
                          ? 'bg-gradient-to-b from-red-600 to-red-800 border-amber-300 text-amber-200 shadow-md animate-pulse'
                          : 'bg-stone-900 border-stone-700 text-stone-400'
                      }`}
                    >
                      <span className="text-[10px] scale-90">¥</span>
                      <span className="text-xs -mt-1 font-black">{tier.amount}</span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-stone-100">{tier.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                        <span className="text-amber-400 font-bold">需赢 {tier.cupsRequired} 杯</span>
                        <span>·</span>
                        <span className="text-amber-300 font-mono">+{tier.coinsBonus}金币</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Button */}
                  <div>
                    {isClaimed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-500 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 已领
                      </span>
                    ) : canClaim ? (
                      <button
                        onClick={() => handleClaim(tier)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-stone-950 text-xs font-black shadow-[0_2px_10px_rgba(245,158,11,0.6)] animate-bounce hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>開红包</span>
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-stone-900/90 border border-stone-800 text-stone-400 text-[11px] font-mono">
                        差 {remaining} 杯
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: 红包兑换 / 提现界面 (Exchange Center) */}
        {tab === 'exchange' && (
          <div className="flex-1 overflow-y-auto flex flex-col pr-1">
            {/* Balance Card */}
            <div className="w-full p-3.5 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-red-500/40 flex flex-col items-center text-center mb-3 shadow-md">
              <span className="text-[11px] text-stone-400">红包可兑换/提现余额</span>
              <div className="text-3xl font-mono font-black text-amber-300 my-1">
                ¥{redPacketCash.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>微信支付已官方实名认证 · 提现秒到零钱</span>
              </div>
            </div>

            {/* Notification Alerts */}
            {wechatSuccessNotice !== null && (
              <div className="w-full mb-2.5 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>提现成功！¥{wechatSuccessNotice.toFixed(2)} 已转入微信零钱！</span>
              </div>
            )}

            {coinsSuccessNotice !== null && (
              <div className="w-full mb-2.5 p-2.5 rounded-xl bg-amber-950/90 border border-amber-400 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>兑换成功！已获得 +{coinsSuccessNotice} 游戏金币！</span>
              </div>
            )}

            {/* WeChat Pay Quick Withdraw Tiers */}
            <span className="text-[11px] font-bold text-stone-300 mb-1.5 flex items-center gap-1">
              <span>微信零钱快捷提现</span>
              <span className="text-[10px] text-stone-500">(单笔秒到账)</span>
            </span>

            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {WITHDRAW_DENOMINATIONS.map(amt => {
                const canWithdraw = redPacketCash >= amt;
                return (
                  <button
                    key={amt}
                    onClick={() => handleWithdrawWeChat(amt)}
                    disabled={!canWithdraw}
                    className={`py-2 px-1 rounded-xl text-xs font-black border transition-all flex flex-col items-center justify-center ${
                      canWithdraw
                        ? 'bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 border-emerald-500/70 text-emerald-300 hover:border-emerald-400 hover:scale-102 active:scale-95 shadow-xs'
                        : 'bg-stone-900/40 border-stone-800 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    <span>¥{amt} 元</span>
                    <span className="text-[9px] font-normal opacity-80">提现到微信</span>
                  </button>
                );
              })}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleWithdrawAll}
                disabled={redPacketCash <= 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md border border-emerald-400 disabled:opacity-40 disabled:pointer-events-none hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <span>全部提现到微信钱包</span>
              </button>

              <button
                onClick={() => handleExchangeToCoins()}
                disabled={redPacketCash <= 0}
                className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs border border-amber-500/40 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>兑换为金币 (1元 = 1000金币)</span>
              </button>
            </div>

            {/* Withdrawal History */}
            {records.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-stone-800">
                <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 mb-1.5">
                  <Clock className="w-3 h-3" />
                  <span>近期兑换/提现记录</span>
                </span>
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                  {records.slice(0, 5).map(rec => (
                    <div
                      key={rec.id}
                      className="px-2 py-1 rounded-lg bg-stone-900/70 text-[10px] flex items-center justify-between text-stone-300"
                    >
                      <span className="text-stone-400">{rec.time}</span>
                      <span className="font-mono text-amber-300 font-bold">¥{rec.amount}</span>
                      <span className="text-emerald-400 font-medium">{rec.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Red Packet Opening Animation Overlay */}
        {(isOpeningAnim || openedResult) && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="w-72 rounded-3xl bg-gradient-to-b from-red-600 via-red-700 to-red-900 border-2 border-amber-400 p-6 flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.8)] relative animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200 flex items-center justify-center text-2xl font-black text-red-950 shadow-lg -mt-12 mb-3">
                開
              </div>

              {isOpeningAnim ? (
                <div className="py-8 flex flex-col items-center">
                  <span className="text-3xl animate-spin">🧧</span>
                  <span className="text-sm font-black text-amber-200 mt-3 animate-pulse">
                    正在开启红包...
                  </span>
                </div>
              ) : openedResult ? (
                <div className="py-2 flex flex-col items-center animate-in zoom-in-90">
                  <span className="text-xs text-amber-200/90 font-medium">恭喜获得现金红包</span>
                  <div className="text-4xl font-mono font-black text-amber-300 my-2 drop-shadow-md">
                    ¥{openedResult.amount}
                  </div>
                  <span className="text-xs font-bold text-amber-200 mb-4">
                    额外赠送 +{openedResult.coinsBonus} 金币
                  </span>

                  <div className="w-full flex flex-col gap-2">
                    <button
                      onClick={() => {
                        sound.playTap();
                        setOpenedResult(null);
                        setTab('exchange');
                      }}
                      className="w-full py-2 rounded-xl bg-amber-400 text-red-950 font-black text-xs shadow-md hover:bg-amber-300 transition-all"
                    >
                      立即去提现
                    </button>
                    <button
                      onClick={() => {
                        sound.playTap();
                        setOpenedResult(null);
                      }}
                      className="w-full py-1.5 rounded-xl bg-red-950 text-amber-200 text-xs font-medium border border-amber-500/40"
                    >
                      继续开红包
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
