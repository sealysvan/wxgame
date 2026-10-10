/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Player,
  Bid,
  RoundResult,
  UserStats,
  GamePhase,
  GameMode,
  CupSkinId,
} from './types/game';
import { sound } from './utils/audio';
import { getBotDecision } from './utils/aiBot';
import { checkStraight } from './utils/diceRules';
import { BarScene } from './components/BarScene';
import { ActionControls } from './components/ActionControls';
import { ChallengeRevealModal } from './components/ChallengeRevealModal';
import { SettlementModal } from './components/SettlementModal';
import { LobbyView } from './components/LobbyView';
import { MatchingView } from './components/MatchingView';
import { SkinShopModal } from './components/SkinShopModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PrivateRoomModal } from './components/PrivateRoomModal';
import { RankedModal } from './components/RankedModal';
import { RewardedAdModal, InterstitialAdModal } from './components/AdModal';
import { RedPacketModal } from './components/RedPacketModal';
import { CharacterSelectModal, BAR_CHARACTERS } from './components/CharacterSelectModal';
import { SoloDiceCupModal } from './components/SoloDiceCupModal';
import { LogOut } from 'lucide-react';

const BOT_PRESETS: Omit<Player, 'id' | 'hp' | 'dice' | 'isEliminated' | 'hasRerolled'>[] = [
  {
    name: '稳健老刘',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    isUser: false,
    rankTitle: '黄金博豪',
    coins: 14200,
    personality: 'cautious',
  },
  {
    name: '狂吹阿豪',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    isUser: false,
    rankTitle: '白银酒客',
    coins: 9800,
    personality: 'bluffer',
  },
  {
    name: '工体骰仙',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    isUser: false,
    rankTitle: '铂金骰霸',
    coins: 31500,
    personality: 'smart',
  },
  {
    name: '九街小醉',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    isUser: false,
    rankTitle: '青铜酒徒',
    coins: 4600,
    personality: 'random',
  },
  {
    name: '三里屯阿杰',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face',
    isUser: false,
    rankTitle: '黄金博豪',
    coins: 18500,
    personality: 'cautious',
  },
];

const INITIAL_STATS: UserStats = {
  coins: 3200,
  redPackets: 5,
  cupsWon: 6,
  claimedRedPackets: [],
  redPacketCash: 0,
  winStreak: 3,
  maxStreak: 5,
  totalGames: 12,
  totalWins: 9,
  rankPoints: 1250,
  selectedDiceSkin: 'classic_ivory',
  selectedCupSkin: 'vintage_leather',
  unlockedDiceSkins: ['classic_ivory'],
  unlockedCupSkins: ['vintage_leather'],
  soundEnabled: true,
  bgmEnabled: true,
  quickMatchCount: 3,
  selectedCharacterId: 'char_jiuxian',
  userName: '摇骰酒仙',
  userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  withdrawRecords: [],
};

export default function App() {
  // Persistent stats
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('bar_dice_king_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATS,
          ...parsed,
          redPacketCash: typeof parsed?.redPacketCash === 'number' ? parsed.redPacketCash : 0,
          cupsWon: typeof parsed?.cupsWon === 'number' ? parsed.cupsWon : 6,
          claimedRedPackets: Array.isArray(parsed?.claimedRedPackets) ? parsed.claimedRedPackets : [],
          withdrawRecords: Array.isArray(parsed?.withdrawRecords) ? parsed.withdrawRecords : [],
          quickMatchCount: parsed?.quickMatchCount || 3,
        };
      }
      return INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bar_dice_king_stats', JSON.stringify(stats));
    } catch {}
    sound.setMuted(!stats.soundEnabled);
  }, [stats]);

  // Quick Match player count state (2, 3, or 5)
  const [quickMatchCount, setQuickMatchCount] = useState<number>(
    () => stats.quickMatchCount || 3
  );

  // Game Phases
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
  const [, setGameMode] = useState<GameMode>('QUICK');

  // Players & Active State
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [isWildOneActive, setIsWildOneActive] = useState<boolean>(true);
  const [turnCountdown, setTurnCountdown] = useState<number>(15);

  // User Actions
  const [isCupOpen, setIsCupOpen] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasFreeReroll, setHasFreeReroll] = useState<boolean>(true);
  const [straightNotice, setStraightNotice] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(3);
  const [selectedPip, setSelectedPip] = useState<number>(2);

  // Modals & Popups
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [isSkinShopOpen, setIsSkinShopOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isPrivateRoomOpen, setIsPrivateRoomOpen] = useState<boolean>(false);
  const [isRankedOpen, setIsRankedOpen] = useState<boolean>(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);
  const [isRedPacketOpen, setIsRedPacketOpen] = useState<boolean>(false);
  const [redPacketTab, setRedPacketTab] = useState<'claim' | 'exchange'>('claim');
  const [isCharacterSelectOpen, setIsCharacterSelectOpen] = useState<boolean>(false);
  const [isSoloCupOpen, setIsSoloCupOpen] = useState<boolean>(false);

  // IAA Ad States
  const [rewardedAdOpen, setRewardedAdOpen] = useState<boolean>(false);
  const [rewardedAdTitle, setRewardedAdTitle] = useState<string>('');
  const [onAdRewardAction, setOnAdRewardAction] = useState<(() => void) | null>(null);
  const [interstitialAdOpen, setInterstitialAdOpen] = useState<boolean>(false);
  const [gameCount, setGameCount] = useState<number>(0);

  // Settlement specific
  const [hasClaimedDouble, setHasClaimedDouble] = useState<boolean>(false);
  const [hasProtectedStreak, setHasProtectedStreak] = useState<boolean>(false);

  const turnTimerRef = useRef<number | null>(null);

  // Roll 5 dice
  const generateDice = (): number[] => {
    return Array.from({ length: 5 }, () => Math.floor(Math.random() * 6) + 1);
  };

  // Setup game with N players (2, 3, 4, max 5) and selected Character
  const initializePlayers = (count: number = 4) => {
    // Strictly cap player count at 5 max to prevent overcrowded UI and invisible dice
    const validCount = Math.min(5, Math.max(2, count));
    const userCharacter =
      BAR_CHARACTERS.find(c => c.id === stats.selectedCharacterId) || BAR_CHARACTERS[0];

    const cupSkinPool: CupSkinId[] = ['vintage_leather', 'carved_mahogany', 'midnight_metal'];

    const user: Player = {
      id: 'player_user',
      name: stats.userName || userCharacter.name,
      avatar: stats.userAvatar || userCharacter.avatar,
      isUser: true,
      hp: 3,
      dice: generateDice(),
      isEliminated: false,
      hasRerolled: false,
      rankTitle: userCharacter.title,
      coins: stats.coins,
      cupSkin: stats.selectedCupSkin,
    };

    const chosenBots = BOT_PRESETS.slice(0, validCount - 1).map((b, idx) => ({
      ...b,
      id: `bot_${idx}`,
      hp: 3,
      dice: generateDice(),
      isEliminated: false,
      hasRerolled: false,
      cupSkin: cupSkinPool[idx % cupSkinPool.length],
    }));

    return [user, ...chosenBots];
  };

  // Start Quick Match with user chosen count (2, 3, or 5)
  const handleQuickMatch = () => {
    sound.playTap();
    setGameMode('QUICK');
    const newPlayers = initializePlayers(quickMatchCount);
    setPlayers(newPlayers);
    setPhase('MATCHING');
  };

  const handleChangeQuickMatchCount = (count: number) => {
    sound.playTap();
    setQuickMatchCount(count);
    setStats(prev => ({ ...prev, quickMatchCount: count }));
  };

  // Start Ranked Match
  const handleStartRanked = () => {
    setIsRankedOpen(false);
    setGameMode('RANKED');
    const newPlayers = initializePlayers(4);
    setPlayers(newPlayers);
    setPhase('MATCHING');
  };

  // Start Practice Match
  const handlePracticeMatch = () => {
    sound.playTap();
    setGameMode('PRACTICE');
    const newPlayers = initializePlayers(2);
    setPlayers(newPlayers);
    setPhase('MATCHING');
  };

  // Start Private Room Game
  const handleStartRoomGame = (playerCount: number) => {
    setIsPrivateRoomOpen(false);
    setGameMode('FRIENDS');
    const newPlayers = initializePlayers(playerCount);
    setPlayers(newPlayers);
    setPhase('ROLLING');
    startRollingRound(newPlayers);
  };

  // Trigger Rolling animation
  const startRollingRound = useCallback((currentPlayersList?: Player[]) => {
    const activeList = currentPlayersList || players;
    // Clear previous round bid and results IMMEDIATELY so old result disappears right away
    setCurrentBid(null);
    setRoundResult(null);
    setIsRevealing(false);
    setIsRolling(true);
    setIsCupOpen(false); // Conceal dice inside so only the dice cup is shaking!
    sound.startShakeLoop();

    // Reroll everyone's dice
    setTimeout(() => {
      sound.stopShakeLoop();
      sound.playCupSlam();
      setIsRolling(false);
      setIsCupOpen(true); // Tilt open to reveal dice on the base dish

      const rolledPlayers = activeList.map(p =>
        p.isEliminated
          ? p
          : {
              ...p,
              dice: generateDice(),
              hasRerolled: false,
            }
      );

      setPlayers(rolledPlayers);
      setIsWildOneActive(true);
      setHasFreeReroll(true);

      // Check if user rolled a straight
      const userP = rolledPlayers.find(p => p.isUser);
      if (userP) {
        const uStraight = checkStraight(userP.dice);
        if (uStraight.isStraight) {
          setStraightNotice(`🎉 摇到【${uStraight.label}】！触发酒吧规矩，可重新摇一次！`);
          setTimeout(() => setStraightNotice(null), 4000);
        }
      }

      // Check if any bot rolled a straight; in bar rules, straight players can re-roll!
      rolledPlayers.forEach((bot, bIdx) => {
        if (!bot.isUser && !bot.isEliminated) {
          const bStraight = checkStraight(bot.dice);
          if (bStraight.isStraight) {
            setTimeout(() => {
              setStraightNotice(`🎲 ${bot.name} 摇到顺子，触发重摇规矩！`);
              setPlayers(prev =>
                prev.map((p, idx) =>
                  idx === bIdx ? { ...p, dice: generateDice(), hasRerolled: true } : p
                )
              );
              setTimeout(() => setStraightNotice(null), 3000);
            }, 800 + bIdx * 300);
          }
        }
      });

      // Default opening bid estimation
      const activeCount = activeList.filter(p => !p.isEliminated).length;
      setSelectedCount(Math.max(2, activeCount));
      setSelectedPip(2);

      // User or first non-eliminated player starts
      const firstActiveIdx = activeList.findIndex(p => !p.isEliminated);
      setActivePlayerIndex(firstActiveIdx >= 0 ? firstActiveIdx : 0);
      setPhase('BIDDING');
      setTurnCountdown(15);
    }, 1400);
  }, [players]);

  // Shake Phone Detection (DeviceMotionEvent)
  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;
    let lastZ: number | null = null;
    let lastTime = 0;

    const handleMotion = (e: DeviceMotionEvent) => {
      if (phase !== 'ROLLING' || isRolling) return;
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const now = Date.now();
      if (now - lastTime > 150) {
        if (lastX !== null && lastY !== null && lastZ !== null) {
          const delta =
            Math.abs(acc.x - lastX) +
            Math.abs(acc.y - lastY) +
            Math.abs(acc.z - lastZ);
          if (delta > 22) {
            startRollingRound();
          }
        }
        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
        lastTime = now;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [phase, isRolling, startRollingRound]);

  // Move turn to next active (non-eliminated) player
  const advanceTurn = useCallback((nextBid?: Bid) => {
    if (nextBid) {
      setCurrentBid(nextBid);
      if (nextBid.pip === 1) {
        setIsWildOneActive(false);
      }
      // Update user selectors for valid raise
      setSelectedCount(nextBid.count);
      setSelectedPip(Math.min(6, nextBid.pip < 6 ? nextBid.pip + 1 : nextBid.pip));
    }

    setPlayers(currentPlayers => {
      let nextIdx = (activePlayerIndex + 1) % currentPlayers.length;
      while (currentPlayers[nextIdx].isEliminated) {
        nextIdx = (nextIdx + 1) % currentPlayers.length;
      }
      setActivePlayerIndex(nextIdx);
      return currentPlayers;
    });

    setTurnCountdown(15);
  }, [activePlayerIndex]);

  // Bot Turn Automation
  useEffect(() => {
    if (phase !== 'BIDDING' || isRevealing || isRolling) return;

    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || activePlayer.isUser || activePlayer.isEliminated) return;

    // Bot decision thinking delay (1.2s - 2.2s)
    const delay = 1200 + Math.random() * 800;
    const timer = setTimeout(() => {
      const activePlayers = players.filter(p => !p.isEliminated);
      const decision = getBotDecision(activePlayer, activePlayers, currentBid, isWildOneActive);

      if (decision.action === 'CHALLENGE') {
        handleChallenge(activePlayer.id);
      } else if (decision.bid) {
        sound.playBidCall();
        const newBid: Bid = {
          playerId: activePlayer.id,
          playerName: activePlayer.name,
          count: decision.bid.count,
          pip: decision.bid.pip,
          isWildOneActive: decision.bid.pip !== 1 && isWildOneActive,
        };
        advanceTurn(newBid);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [phase, activePlayerIndex, players, currentBid, isWildOneActive, isRevealing, isRolling, advanceTurn]);

  // 15s Turn Countdown Timer
  useEffect(() => {
    if (phase !== 'BIDDING' || isRevealing) return;

    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    turnTimerRef.current = window.setInterval(() => {
      setTurnCountdown(prev => {
        if (prev <= 1) {
          // Timeout: auto action
          const activeP = players[activePlayerIndex];
          if (activeP?.isUser) {
            if (currentBid) {
              handleChallenge(activeP.id);
            } else {
              handleUserBid();
            }
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    };
  }, [phase, activePlayerIndex, isRevealing, currentBid, players]);

  // User Calls / Bids
  const handleUserBid = () => {
    const user = players.find(p => p.isUser);
    if (!user || activePlayerIndex !== players.indexOf(user)) return;

    sound.playBidCall();
    const newBid: Bid = {
      playerId: user.id,
      playerName: user.name,
      count: selectedCount,
      pip: selectedPip,
      isWildOneActive: selectedPip !== 1 && isWildOneActive,
    };
    advanceTurn(newBid);
  };

  // Challenge / "开!" Execution
  const handleChallenge = (challengerId: string) => {
    if (!currentBid) return;

    sound.playChallengeRiser();
    setIsRevealing(true);

    const activePlayers = players.filter(p => !p.isEliminated);
    const targetPip = currentBid.pip;
    const wildActive = currentBid.isWildOneActive && targetPip !== 1;

    let matchCount = 0;
    let wildCount = 0;

    activePlayers.forEach(p => {
      p.dice.forEach(d => {
        if (d === targetPip) {
          matchCount++;
        } else if (wildActive && d === 1) {
          matchCount++;
          wildCount++;
        }
      });
    });

    const challengerLost = matchCount >= currentBid.count;
    const loserId = challengerLost ? challengerId : currentBid.playerId;

    const res: RoundResult = {
      challengerId,
      bidderId: currentBid.playerId,
      bid: currentBid,
      totalMatchingDice: matchCount,
      wildOnesCount: wildCount,
      challengerLost,
      loserId,
    };

    setRoundResult(res);
  };

  // Proceed after reveal
  const handleNextRoundAfterReveal = () => {
    if (!roundResult) return;

    // Apply HP loss to loser
    const updatedPlayers = players.map(p => {
      if (p.id === roundResult.loserId) {
        const nextHp = Math.max(0, p.hp - 1);
        return {
          ...p,
          hp: nextHp,
          isEliminated: nextHp === 0,
        };
      }
      return p;
    });

    // If opponent lost this round and had to drink, user gains 1 cup!
    if (roundResult.loserId !== 'player_user') {
      setStats(prev => ({ ...prev, cupsWon: prev.cupsWon + 1 }));
    }

    setPlayers(updatedPlayers);
    setIsRevealing(false);
    setRoundResult(null);
    setCurrentBid(null);

    // Check game over
    const survivors = updatedPlayers.filter(p => !p.isEliminated);
    const user = updatedPlayers.find(p => p.isUser);

    if (survivors.length <= 1 || user?.isEliminated) {
      // Game Ends
      const isUserWinner = survivors.length === 1 && survivors[0].isUser;
      const winner = survivors[0] || updatedPlayers[0];

      setHasClaimedDouble(false);
      setHasProtectedStreak(false);

      if (isUserWinner) {
        setStats(prev => ({
          ...prev,
          coins: prev.coins + 500,
          cupsWon: prev.cupsWon + 3, // Bonus 3 cups for match victory
          winStreak: prev.winStreak + 1,
          maxStreak: Math.max(prev.maxStreak, prev.winStreak + 1),
          totalGames: prev.totalGames + 1,
          totalWins: prev.totalWins + 1,
          rankPoints: prev.rankPoints + 50,
        }));
      } else {
        setStats(prev => ({
          ...prev,
          coins: Math.max(0, prev.coins - 100),
          winStreak: 0,
          totalGames: prev.totalGames + 1,
          rankPoints: Math.max(0, prev.rankPoints - 25),
        }));
      }

      setPhase('SETTLEMENT');
    } else {
      // Start Next Round
      setPhase('ROLLING');
      startRollingRound(updatedPlayers);
    }
  };

  // User Rerolls dice
  const handleReroll = () => {
    const userStraight = checkStraight(userPlayer.dice);
    if (!hasFreeReroll && !userStraight.isStraight) return;

    setIsRolling(true);
    setIsCupOpen(false); // Close cup so only the cup is shaking
    sound.startShakeLoop();

    // If it's a straight reroll, do not consume normal free reroll
    if (!userStraight.isStraight) {
      setHasFreeReroll(false);
    }

    setTimeout(() => {
      sound.stopShakeLoop();
      sound.playCupSlam();
      setIsRolling(false);
      setIsCupOpen(true); // Tilt open after slam

      const newDice = generateDice();
      const newStraight = checkStraight(newDice);

      setPlayers(prev =>
        prev.map(p => (p.isUser ? { ...p, dice: newDice, hasRerolled: true } : p))
      );

      if (newStraight.isStraight) {
        setStraightNotice(`✨ 又摇到了【${newStraight.label}】！可继续重新摇一次！`);
        setTimeout(() => setStraightNotice(null), 4000);
      } else {
        setStraightNotice(null);
      }
    }, 1000);
  };

  // Ad triggers
  const triggerRewardedAd = (title: string, onReward: () => void) => {
    sound.playTap();
    setRewardedAdTitle(title);
    setOnAdRewardAction(() => onReward);
    setRewardedAdOpen(true);
  };

  const handleReturnLobby = () => {
    sound.playTap();
    const newCount = gameCount + 1;
    setGameCount(newCount);
    // Show interstitial ad every 2 games
    if (newCount % 2 === 0) {
      setInterstitialAdOpen(true);
    }
    setPhase('LOBBY');
  };

  const handleConfirmExit = () => {
    sound.playTap();
    sound.stopShakeLoop();
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    setIsRolling(false);
    setIsRevealing(false);
    setRoundResult(null);
    setIsExitConfirmOpen(false);
    setPhase('LOBBY');
  };

  const userPlayer = players.find(p => p.isUser) || {
    id: 'player_user',
    name: '我',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    isUser: true,
    hp: 3,
    dice: [2, 3, 4, 2, 5],
    isEliminated: false,
    hasRerolled: false,
    rankTitle: '白银酒客',
    coins: stats.coins,
  };

  const userStraight = checkStraight(userPlayer.dice);

  const isUserTurn =
    phase === 'BIDDING' &&
    players[activePlayerIndex]?.isUser &&
    !userPlayer.isEliminated;

  const minCount = currentBid ? currentBid.count : Math.max(2, players.filter(p => !p.isEliminated).length);
  const maxCount = players.filter(p => !p.isEliminated).length * 5;

  return (
    <div className="w-full h-screen bg-stone-950 text-stone-100 flex items-center justify-center overflow-hidden">
      {/* Vertical Mobile Screen Frame (750x1334 aspect ratio responsive viewport) */}
      <div className="relative w-full h-full max-w-md max-h-[920px] bg-stone-950 flex flex-col justify-between overflow-hidden shadow-2xl border-x border-stone-800/80">
        {/* Straight / Special Notice Float Toast */}
        {straightNotice && (
          <div className="absolute top-14 inset-x-4 z-50 flex justify-center pointer-events-none transition-all duration-300">
            <div className="bg-stone-950/95 border-2 border-amber-400 text-amber-300 font-black text-xs md:text-sm px-4 py-2 rounded-2xl shadow-[0_0_24px_rgba(251,191,36,0.85)] backdrop-blur-md flex items-center gap-2 animate-bounce">
              <span>🍺</span>
              <span>{straightNotice}</span>
            </div>
          </div>
        )}

        {/* Render View based on phase */}
        {phase === 'LOBBY' && (
          <LobbyView
            stats={stats}
            quickMatchCount={quickMatchCount}
            onChangeQuickMatchCount={handleChangeQuickMatchCount}
            onQuickMatch={handleQuickMatch}
            onOpenPrivateRoom={() => setIsPrivateRoomOpen(true)}
            onOpenRanked={() => setIsRankedOpen(true)}
            onPracticeMatch={handlePracticeMatch}
            onOpenSkinShop={() => setIsSkinShopOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenRedPacket={(tab) => {
              setRedPacketTab(tab || 'claim');
              setIsRedPacketOpen(true);
            }}
            onOpenCharacterSelect={() => setIsCharacterSelectOpen(true)}
            onOpenSoloCup={() => setIsSoloCupOpen(true)}
            onToggleSound={() =>
              setStats(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
            }
            onRequestAdCoin={() =>
              triggerRewardedAd('1000 金币', () => {
                setStats(prev => ({ ...prev, coins: prev.coins + 1000 }));
              })
            }
          />
        )}

        {(phase === 'ROLLING' || phase === 'BIDDING' || phase === 'ROUND_RESULT' || phase === 'SETTLEMENT') && (
          <div className="relative w-full h-full flex flex-col justify-between">
            {/* 3D Bar Table & Players Scene */}
            <div className="flex-1 relative overflow-hidden">
              <BarScene
                players={players}
                activePlayerIndex={activePlayerIndex}
                currentBid={currentBid}
                userPlayer={userPlayer}
                isRolling={isRolling}
                isCupOpen={isCupOpen}
                onToggleCup={() => {
                  sound.playCupLift();
                  setIsCupOpen(prev => !prev);
                }}
                onReroll={handleReroll}
                selectedCupSkin={stats.selectedCupSkin}
                selectedDiceSkin={stats.selectedDiceSkin}
                turnCountdown={turnCountdown}
                isRevealing={isRevealing}
                matchingPip={roundResult?.bid.pip}
                wildOnesActive={isWildOneActive}
                onExitMatch={() => setIsExitConfirmOpen(true)}
              />
            </div>

            {/* Bottom Controls */}
            <ActionControls
              phase={phase}
              isUserTurn={isUserTurn}
              currentBid={currentBid}
              minCount={minCount}
              maxCount={maxCount}
              selectedCount={selectedCount}
              selectedPip={selectedPip}
              onCountChange={setSelectedCount}
              onPipChange={setSelectedPip}
              onBid={handleUserBid}
              onChallenge={() => handleChallenge(userPlayer.id)}
              onReroll={handleReroll}
              onStartRoll={() => startRollingRound()}
              hasFreeReroll={hasFreeReroll}
              onRequestAdReroll={() =>
                triggerRewardedAd('重摇骰子 +1', () => {
                  setHasFreeReroll(true);
                  handleReroll();
                })
              }
              isRolling={isRolling}
              selectedDiceSkin={stats.selectedDiceSkin}
              isStraight={userStraight.isStraight}
              straightLabel={userStraight.label}
            />
          </div>
        )}

        {/* Matching Screen Overlay */}
        {phase === 'MATCHING' && (
          <MatchingView
            players={players}
            onMatchComplete={() => {
              setPhase('ROLLING');
              startRollingRound();
            }}
            onCancel={() => setPhase('LOBBY')}
          />
        )}

        {/* Challenge Reveal Modal */}
        {isRevealing && roundResult && (
          <ChallengeRevealModal
            roundResult={roundResult}
            players={players.filter(p => !p.isEliminated)}
            onNextRound={handleNextRoundAfterReveal}
            selectedDiceSkin={stats.selectedDiceSkin}
          />
        )}

        {/* Settlement Modal */}
        {phase === 'SETTLEMENT' && (
          <SettlementModal
            isWinner={players.filter(p => !p.isEliminated).length === 1 && !userPlayer.isEliminated}
            winner={players.filter(p => !p.isEliminated)[0] || userPlayer}
            coinsEarned={!userPlayer.isEliminated ? 500 : -100}
            cupsEarned={3}
            winStreak={stats.winStreak}
            onPlayAgain={() => {
              const newPlayers = initializePlayers(players.length);
              setPlayers(newPlayers);
              setPhase('ROLLING');
              startRollingRound(newPlayers);
            }}
            onReturnLobby={handleReturnLobby}
            onOpenRedPacket={() => {
              setRedPacketTab('claim');
              setIsRedPacketOpen(true);
            }}
            onWatchAdDouble={() =>
              triggerRewardedAd('双倍金币', () => {
                setStats(prev => ({ ...prev, coins: prev.coins + 500 }));
                setHasClaimedDouble(true);
              })
            }
            onWatchAdProtectStreak={() =>
              triggerRewardedAd('保护连胜', () => {
                setStats(prev => ({ ...prev, winStreak: prev.maxStreak }));
                setHasProtectedStreak(true);
              })
            }
            hasClaimedDouble={hasClaimedDouble}
            hasProtectedStreak={hasProtectedStreak}
          />
        )}

        {/* Red Packet Claim & Exchange Center Modal */}
        {isRedPacketOpen && (
          <RedPacketModal
            stats={stats}
            initialTab={redPacketTab}
            onUpdateStats={setStats}
            onClose={() => setIsRedPacketOpen(false)}
          />
        )}

        {/* Character Selection Modal */}
        {isCharacterSelectOpen && (
          <CharacterSelectModal
            currentStats={stats}
            onSelectCharacter={(char) => {
              setStats(prev => ({
                ...prev,
                selectedCharacterId: char.id,
                userName: char.name,
                userAvatar: char.avatar,
              }));
              setIsCharacterSelectOpen(false);
            }}
            onClose={() => setIsCharacterSelectOpen(false)}
          />
        )}

        {/* Secondary Modals */}
        {isSkinShopOpen && (
          <SkinShopModal
            stats={stats}
            onUpdateStats={setStats}
            onClose={() => setIsSkinShopOpen(false)}
          />
        )}

        {isLeaderboardOpen && (
          <LeaderboardModal
            userStreak={stats.winStreak}
            userCoins={stats.coins}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        )}

        {isPrivateRoomOpen && (
          <PrivateRoomModal
            onStartRoomGame={handleStartRoomGame}
            onClose={() => setIsPrivateRoomOpen(false)}
          />
        )}

        {isRankedOpen && (
          <RankedModal
            stats={stats}
            onStartRanked={handleStartRanked}
            onClose={() => setIsRankedOpen(false)}
          />
        )}

        {/* Solo Real Dice Cup Modal (酒桌实体替代/晃动手机摇骰/防误触保护) */}
        <SoloDiceCupModal
          isOpen={isSoloCupOpen}
          onClose={() => setIsSoloCupOpen(false)}
          selectedCupSkin={stats.selectedCupSkin}
          selectedDiceSkin={stats.selectedDiceSkin}
          onChangeCupSkin={(skin) =>
            setStats(prev => ({ ...prev, selectedCupSkin: skin }))
          }
          onChangeDiceSkin={(skin) =>
            setStats(prev => ({ ...prev, selectedDiceSkin: skin }))
          }
        />

        {/* Rewarded Ad Simulation Modal */}
        <RewardedAdModal
          isOpen={rewardedAdOpen}
          rewardTitle={rewardedAdTitle}
          onRewardGranted={() => {
            if (onAdRewardAction) onAdRewardAction();
          }}
          onClose={() => setRewardedAdOpen(false)}
        />

        {/* Interstitial Ad Popup */}
        <InterstitialAdModal
          isOpen={interstitialAdOpen}
          onClose={() => setInterstitialAdOpen(false)}
        />

        {/* Exit Game Confirmation Modal */}
        {isExitConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-xs bg-gradient-to-b from-stone-900 via-stone-950 to-black border border-rose-500/40 rounded-3xl p-5 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mb-3">
                <LogOut className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-black text-stone-100">退出对局</h3>
              <p className="text-xs text-stone-400 mt-1 mb-5">中途离桌将视为放弃本局并结算</p>
              <div className="w-full flex gap-2">
                <button
                  onClick={() => setIsExitConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 font-bold text-xs hover:bg-stone-800 transition-colors"
                >
                  继续对局
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs shadow-md border border-rose-400 hover:scale-102 active:scale-98 transition-all"
                >
                  确定退出
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
