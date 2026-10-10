export type GameMode = 'QUICK' | 'FRIENDS' | 'RANKED' | 'PRACTICE';

export type GamePhase = 
  | 'LOBBY'
  | 'MATCHING'
  | 'ROOM'
  | 'ROLLING'
  | 'BIDDING'
  | 'REVEALING'
  | 'ROUND_RESULT'
  | 'SETTLEMENT';

export type DiceSkinId = 'classic_ivory' | 'obsidian_gold' | 'cyber_neon' | 'pure_gold';
export type CupSkinId = 'vintage_leather' | 'carved_mahogany' | 'midnight_metal';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isUser: boolean;
  hp: number; // Max 3
  dice: number[]; // 5 dice (1-6)
  isEliminated: boolean;
  hasRerolled: boolean;
  rankTitle: string;
  coins: number;
  personality?: 'bluffer' | 'cautious' | 'random' | 'smart';
  cupSkin?: CupSkinId;
}

export interface Bid {
  playerId: string;
  playerName: string;
  count: number; // e.g. 3
  pip: number;   // 1 to 6
  isWildOneActive: boolean; // True if 1 hasn't been called directly
}

export interface RoundResult {
  challengerId: string;
  bidderId: string;
  bid: Bid;
  totalMatchingDice: number;
  wildOnesCount: number;
  challengerLost: boolean;
  loserId: string;
}

export interface UserCharacter {
  id: string;
  name: string;
  avatar: string;
  title: string;
  personality: string;
  quote: string;
}

export interface WithdrawRecord {
  id: string;
  time: string;
  amount: number;
  type: 'wechat' | 'coins';
  status: string;
}

export interface UserStats {
  coins: number;
  redPackets: number;
  cupsWon: number; // 赢杯数量
  claimedRedPackets: number[]; // 已领取的红包档位ID列表
  redPacketCash: number; // 累计红包提现/兑换金额(元)
  winStreak: number;
  maxStreak: number;
  totalGames: number;
  totalWins: number;
  rankPoints: number;
  selectedDiceSkin: DiceSkinId;
  selectedCupSkin: CupSkinId;
  unlockedDiceSkins: DiceSkinId[];
  unlockedCupSkins: CupSkinId[];
  soundEnabled: boolean;
  bgmEnabled: boolean;
  quickMatchCount?: number; // 2, 3, 5人
  selectedCharacterId?: string;
  userName?: string;
  userAvatar?: string;
  withdrawRecords?: WithdrawRecord[];
}

export interface RedPacketTier {
  id: number;
  cupsRequired: number;
  amount: number;
  coinsBonus: number;
  title: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  winStreak: number;
  coins: number;
  tier: string;
}
