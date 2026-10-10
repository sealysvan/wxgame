import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CupSkinId, DiceSkinId } from '../types/game';
import { Dice3D } from './Dice3D';
import { checkStraight } from '../utils/diceRules';
import { sound } from '../utils/audio';
import {
  X,
  Smartphone,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface SoloDiceCupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCupSkin: CupSkinId;
  selectedDiceSkin: DiceSkinId;
  onChangeCupSkin?: (skin: CupSkinId) => void;
  onChangeDiceSkin?: (skin: DiceSkinId) => void;
}

export const SoloDiceCupModal: React.FC<SoloDiceCupModalProps> = ({
  isOpen,
  onClose,
  selectedCupSkin,
  selectedDiceSkin,
  onChangeCupSkin,
  onChangeDiceSkin,
}) => {
  // 5 dice values
  const [dice, setDice] = useState<number[]>([1, 2, 3, 4, 5]);
  // Cup opened state (lifted/peeking)
  const [isCupOpen, setIsCupOpen] = useState<boolean>(false);
  // Is currently shaking
  const [isShaking, setIsShaking] = useState<boolean>(false);
  // Has completed at least one roll
  const [hasRolledOnce, setHasRolledOnce] = useState<boolean>(false);
  // Guard dialog: whether to ask confirm when shaking again
  const [showRerollConfirm, setShowRerollConfirm] = useState<boolean>(false);
  // Motion support & permission status
  const [motionSupported, setMotionSupported] = useState<boolean>(false);
  const [motionPermissionGranted, setMotionPermissionGranted] = useState<boolean>(false);
  const [shakeIntensity, setShakeIntensity] = useState<number>(0);
  const [lastShakeTimestamp, setLastShakeTimestamp] = useState<number>(0);
  const [showRuleTips, setShowRuleTips] = useState<boolean>(false);

  const isShakingRef = useRef(isShaking);
  isShakingRef.current = isShaking;

  const hasRolledOnceRef = useRef(hasRolledOnce);
  hasRolledOnceRef.current = hasRolledOnce;

  const showRerollConfirmRef = useRef(showRerollConfirm);
  showRerollConfirmRef.current = showRerollConfirm;

  // Dice skin styles
  const getCupSkinStyles = () => {
    switch (selectedCupSkin) {
      case 'carved_mahogany':
        return {
          trayBg:
            'bg-gradient-to-br from-amber-950 via-amber-900 to-stone-950 border-amber-700/80 shadow-[0_16px_36px_rgba(0,0,0,0.9)]',
          cupBg: 'bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 border-amber-600/70',
          ribbonColor:
            'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-amber-500/80',
          knobColor: 'bg-gradient-to-b from-amber-800 to-amber-950 border-amber-600',
          gloss: 'from-amber-200/30 via-white/10 to-transparent',
        };
      case 'midnight_metal':
        return {
          trayBg:
            'bg-gradient-to-br from-slate-900 via-slate-950 to-black border-cyan-500/60 shadow-[0_16px_36px_rgba(0,0,0,0.9)]',
          cupBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 border-cyan-500/50',
          ribbonColor: 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-cyan-600 border-cyan-300',
          knobColor: 'bg-gradient-to-b from-slate-700 to-slate-900 border-cyan-400',
          gloss: 'from-cyan-300/30 via-white/10 to-transparent',
        };
      case 'vintage_leather':
      default:
        // Classic Bar Amber/Orange Glossy Resin Cup
        return {
          trayBg:
            'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-amber-300 shadow-[0_18px_40px_rgba(217,119,6,0.7),inset_0_3px_8px_rgba(255,255,255,0.5)]',
          cupBg: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 border-amber-300',
          ribbonColor: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 border-amber-200',
          knobColor: 'bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 border-amber-300',
          gloss: 'from-white/50 via-white/20 to-transparent',
        };
    }
  };

  const skin = getCupSkinStyles();
  const straight = checkStraight(dice);

  // Perform the actual roll execution
  const executeRoll = useCallback(() => {
    setIsShaking(true);
    setIsCupOpen(false); // Close cup during shake
    setShowRerollConfirm(false);
    sound.startShakeLoop();
    sound.vibrate([60, 40, 60, 40, 90]);

    setTimeout(() => {
      sound.stopShakeLoop();
      sound.playCupSlam();
      sound.vibrate([150]);

      // Generate 5 random dice
      const newDice = Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
      setDice(newDice);
      setIsShaking(false);
      setHasRolledOnce(true);
      setLastShakeTimestamp(Date.now());
    }, 1100);
  }, []);

  // When user attempts to roll (via manual button or shaking)
  const handleTriggerRoll = useCallback(() => {
    if (isShakingRef.current) return;

    if (hasRolledOnceRef.current) {
      // Guard: ask for confirmation to prevent accidental re-rolls
      setShowRerollConfirm(true);
      sound.playTap();
    } else {
      executeRoll();
    }
  }, [executeRoll]);

  // Request DeviceMotion permission (e.g., iOS 13+ requires user gesture)
  const requestMotionPermission = async () => {
    sound.playTap();
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      try {
        const response = await (
          DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (response === 'granted') {
          setMotionPermissionGranted(true);
        }
      } catch (err) {
        console.error('Error requesting motion permission:', err);
      }
    } else {
      // Non-iOS or older browsers allow motion by default
      setMotionPermissionGranted(true);
    }
  };

  // Device Motion Shake Detection (晃动手机摇骰)
  useEffect(() => {
    if (!isOpen) return;

    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let lastUpdate = 0;
    const SHAKE_THRESHOLD = 18; // Acceleration threshold
    const COOLDOWN_MS = 1200; // Debounce between shakes

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current || current.x === null || current.y === null || current.z === null) return;

      const now = Date.now();
      if (now - lastUpdate > 100) {
        const diffTime = now - lastUpdate;
        lastUpdate = now;

        if (lastX !== null && lastY !== null && lastZ !== null) {
          const deltaX = Math.abs(current.x - lastX);
          const deltaY = Math.abs(current.y - lastY);
          const deltaZ = Math.abs(current.z - lastZ);
          const speed = ((deltaX + deltaY + deltaZ) / diffTime) * 10000;

          setShakeIntensity(Math.min(100, Math.round(speed / 2)));

          // Detect strong shake
          if (speed > SHAKE_THRESHOLD * 50) {
            if (now - lastShakeTimestamp < COOLDOWN_MS) return;
            if (isShakingRef.current) return;
            if (showRerollConfirmRef.current) return; // Wait for user decision

            // Trigger roll or prompt confirmation
            if (hasRolledOnceRef.current) {
              setShowRerollConfirm(true);
              sound.playTap();
              sound.vibrate([80, 50, 80]);
            } else {
              executeRoll();
            }
          }
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setMotionSupported(true);
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isOpen, executeRoll, lastShakeTimestamp]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md h-[95vh] max-h-[740px] bg-gradient-to-b from-stone-900 via-stone-950 to-black border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-32 bg-radial from-amber-500/20 via-transparent to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 px-4 py-3 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center shadow-xs">
              <span className="text-base">🎲</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-300 tracking-wide flex items-center gap-1.5">
                <span>实景单人骰盅</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded-full">
                  酒桌神器
                </span>
              </h2>
              <p className="text-[10px] text-stone-400">
                代替实体骰盅 · 晃手机摇骰 · 防误触保护
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowRuleTips(!showRuleTips)}
              className="p-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
              title="使用说明"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions Banner or Motion Permission Tip */}
        <div className="relative z-10 px-4 pt-2">
          {motionSupported && !motionPermissionGranted && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-xs text-amber-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                <span>开启手机摇晃感应，体验真实手感</span>
              </div>
              <button
                onClick={requestMotionPermission}
                className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black rounded-lg text-[11px] shadow-xs active:scale-95"
              >
                允许摇晃
              </button>
            </div>
          )}

          {showRuleTips && (
            <div className="mt-1 p-2.5 rounded-xl bg-stone-900/90 border border-stone-700 text-[11px] text-stone-300 space-y-1">
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <Info className="w-3.5 h-3.5" />
                <span>玩法与防误触提示</span>
              </div>
              <p>• 点击下方「用力摇骰」或直接晃动手机即可模拟摇骰盅。</p>
              <p>• 点击骰盅或底盘可随时掀开偷看点数或盖上保密。</p>
              <p>• 摇过一次后，再次晃动手机会弹出防误触提示，防止碰落手机改变点数。</p>
            </div>
          )}
        </div>

        {/* Central Arena: 3D Dice Cup & Base Dish */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          {/* Shake Status / Intensity Indicator */}
          <div className="h-8 flex items-center justify-center mb-1">
            {isShaking ? (
              <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black flex items-center gap-2 shadow-lg animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>咣当咣当！骰盅摇晃中...</span>
              </div>
            ) : hasRolledOnce ? (
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isCupOpen ? '已揭盅看点（点击盖上保密）' : '已摇定！点击骰盅可看点'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-400/90 font-medium">
                <Smartphone className="w-3.5 h-3.5 animate-pulse" />
                <span>晃动手机或点下方按钮开始摇骰</span>
              </div>
            )}
          </div>

          {/* Straight Detection Notification Banner */}
          {straight.isStraight && isCupOpen && !isShaking && (
            <div className="mb-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs shadow-[0_0_20px_rgba(251,191,36,0.9)] border-2 border-yellow-200 animate-bounce flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
              <span>{straight.label}！酒桌规矩可直接重摇一次</span>
            </div>
          )}

          {/* Authentic Bar Dice Cup & Base Dish Assembly */}
          <div className="relative w-full max-w-xs h-64 flex flex-col items-center justify-end select-none">
            {/* 1. Base Dish Tray (底盘) */}
            <div
              onClick={() => {
                if (!isShaking) {
                  sound.playTap();
                  setIsCupOpen(!isCupOpen);
                }
              }}
              className={`relative w-76 h-36 rounded-[50%] border-4 flex items-center justify-center transition-transform cursor-pointer ${
                skin.trayBg
              } ${isShaking ? 'animate-table-rumble scale-95' : 'scale-100 hover:scale-102'}`}
              style={{
                boxShadow:
                  '0 18px 40px rgba(0,0,0,0.9), inset 0 4px 12px rgba(0,0,0,0.35)',
              }}
            >
              {/* Inner Rim Lip */}
              <div className="absolute inset-1.5 rounded-[50%] border border-black/20 pointer-events-none" />

              {/* 2. Five Large High-Contrast Dice */}
              <div
                className={`relative z-10 flex items-center justify-center gap-2 transition-all duration-300 ${
                  isCupOpen && !isShaking
                    ? 'opacity-100 scale-100 translate-y-1'
                    : 'opacity-0 scale-75 pointer-events-none'
                }`}
              >
                {dice.map((dieVal, idx) => (
                  <Dice3D
                    key={idx}
                    value={dieVal}
                    size={46}
                    isRolling={false}
                    skin={selectedDiceSkin}
                    isWildOne={true}
                  />
                ))}
              </div>

              {/* Secret peek cue when closed */}
              {!isCupOpen && !isShaking && hasRolledOnce && (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs font-bold pointer-events-none">
                  <span>点击掀盅看点</span>
                </div>
              )}
            </div>

            {/* 3. The 3D Dice Cup Cover (盅身) */}
            <div
              onClick={() => {
                if (!isShaking) {
                  sound.playTap();
                  setIsCupOpen(!isCupOpen);
                }
              }}
              className={`absolute z-20 cursor-pointer transition-all duration-300 ease-out origin-bottom-right ${
                isShaking
                  ? 'bottom-12 animate-cup-vigorous-shake'
                  : isCupOpen
                  ? 'bottom-16 translate-x-28 -translate-y-14 rotate-[44deg] scale-95 shadow-[0_25px_45px_rgba(0,0,0,0.85)]'
                  : 'bottom-5 translate-x-0 translate-y-0 rotate-0 shadow-[0_16px_30px_rgba(0,0,0,0.9)] hover:-translate-y-1'
              }`}
            >
              {/* Outer Cup Container */}
              <div className="relative flex flex-col items-center">
                {/* A. Top Handle Knob */}
                <div
                  className={`w-15 h-6.5 rounded-t-xl rounded-b-md border-t border-x relative overflow-hidden shadow-md ${skin.knobColor}`}
                >
                  <div
                    className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-b ${skin.gloss}`}
                  />
                </div>

                {/* Knob Neck Connector */}
                <div className="w-11 h-2 bg-black/35" />

                {/* B. Upper Cup Dome */}
                <div
                  className={`w-34 h-15 rounded-t-2xl border-t border-x relative overflow-hidden shadow-inner ${skin.cupBg}`}
                >
                  <div
                    className={`absolute inset-y-0 left-5 w-4.5 bg-gradient-to-r ${skin.gloss}`}
                  />
                </div>

                {/* C. Middle Ribbed Ring */}
                <div
                  className={`w-38 h-3.5 rounded-full border-y shadow-sm relative overflow-hidden -my-0.5 z-10 ${skin.ribbonColor}`}
                >
                  <div
                    className={`absolute inset-y-0 left-6 w-3.5 bg-gradient-to-r ${skin.gloss}`}
                  />
                </div>

                {/* D. Lower Cup Barrel */}
                <div
                  className={`w-36 h-20 rounded-b-xl border-b border-x relative overflow-hidden shadow-lg ${skin.cupBg}`}
                >
                  <div
                    className={`absolute inset-y-0 left-6 w-5.5 bg-gradient-to-r ${skin.gloss}`}
                  />
                  <div className="absolute bottom-0 inset-x-0 h-2.5 bg-black/45" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Dice Value Summary when open */}
          <div className="h-10 mt-2 flex items-center justify-center">
            {isCupOpen && !isShaking && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-900/80 rounded-xl border border-stone-800 text-xs font-mono text-stone-300">
                <span className="text-amber-400 font-bold">点数:</span>
                <span>[{dice.slice().sort((a, b) => a - b).join(', ')}]</span>
                {dice.every(d => d === dice[0]) && (
                  <span className="text-rose-400 font-black ml-1">豹子(通杀)!</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skin Quick Swapper Bar */}
        <div className="relative z-10 px-4 py-2 bg-stone-950/80 border-t border-stone-800/80">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>更换骰盅皮肤</span>
            </span>
            <div className="flex gap-1.5">
              {(
                [
                  { id: 'vintage_leather', label: '琥珀树脂' },
                  { id: 'carved_mahogany', label: '紫檀雕花' },
                  { id: 'midnight_metal', label: '暗夜霓虹' },
                ] as const
              ).map(item => (
                <button
                  key={item.id}
                  onClick={() => onChangeCupSkin?.(item.id)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                    selectedCupSkin === item.id
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Interactive Controls */}
        <div className="relative z-10 px-4 py-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2.5">
          {/* Peek / Cover Cup Toggle Button */}
          <button
            onClick={() => {
              sound.playTap();
              setIsCupOpen(!isCupOpen);
            }}
            disabled={isShaking}
            className={`flex-1 py-3 px-3 rounded-2xl border font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              isCupOpen
                ? 'bg-stone-900 border-stone-700 text-stone-300 hover:text-white'
                : 'bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-amber-500/40 text-amber-300 hover:border-amber-400'
            }`}
          >
            {isCupOpen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-amber-400" />}
            <span>{isCupOpen ? '盖上骰盅' : '掀盅看点'}</span>
          </button>

          {/* Main Shake / Roll Button */}
          <button
            onClick={handleTriggerRoll}
            disabled={isShaking}
            className="flex-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-black text-sm shadow-[0_6px_20px_rgba(245,158,11,0.5)] border-2 border-amber-300 hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${isShaking ? 'animate-spin' : ''}`} />
            <span>{hasRolledOnce ? '重新摇骰' : '用力摇骰'}</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* Anti-Accidental Reroll Modal Guard (防误动手机改变点数提示) */}
        {/* ========================================================= */}
        {showRerollConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-xs bg-stone-900 border-2 border-amber-500/70 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 mb-3 shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>

              <h3 className="text-base font-black text-amber-300">
                感应到晃动，是否重新摇骰？
              </h3>

              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                当前已有摇定点数。为防止酒桌碰触或误晃手机改变点数，请确认是否重新洗骰？
              </p>

              {/* Current dice peek in dialog */}
              <div className="my-3 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center gap-2">
                <span className="text-[11px] text-stone-400 font-bold">当前点数:</span>
                <div className="flex gap-1">
                  {dice.map((d, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded bg-amber-500/20 text-amber-300 font-mono font-black text-xs flex items-center justify-center border border-amber-500/40"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
                {/* Cancel - Keep current dice */}
                <button
                  onClick={() => {
                    sound.playTap();
                    setShowRerollConfirm(false);
                  }}
                  className="py-2.5 rounded-xl bg-stone-800 text-stone-300 font-bold text-xs hover:bg-stone-700 active:scale-95 transition-all border border-stone-700"
                >
                  保持当前点数
                </button>

                {/* Confirm Reroll */}
                <button
                  onClick={() => {
                    executeRoll();
                  }}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all border border-amber-300 shadow-md"
                >
                  确定重新摇
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
