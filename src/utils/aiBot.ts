import { Bid, Player } from '../types/game';

export interface BotDecision {
  action: 'CHALLENGE' | 'BID';
  bid?: { count: number; pip: number };
}

/**
 * Calculates bot move given the current game state
 */
export function getBotDecision(
  bot: Player,
  activePlayers: Player[],
  currentBid: Bid | null,
  isWildActive: boolean
): BotDecision {
  const totalActivePlayers = activePlayers.length;
  const unknownDiceCount = (totalActivePlayers - 1) * 5;

  // Bot's own counts
  const dice = bot.dice;
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  dice.forEach(d => {
    counts[d] = (counts[d] || 0) + 1;
  });

  // Calculate bot's effective count for each pip (2-6: count + 1s if wild; 1: count of 1s only)
  const effectiveCounts: Record<number, number> = {};
  for (let pip = 1; pip <= 6; pip++) {
    if (pip === 1) {
      effectiveCounts[pip] = counts[1];
    } else {
      effectiveCounts[pip] = counts[pip] + (isWildActive ? counts[1] : 0);
    }
  }

  // Find bot's strongest pip
  let bestPip = 6;
  let maxCount = -1;
  for (let p = 2; p <= 6; p++) {
    if (effectiveCounts[p] > maxCount) {
      maxCount = effectiveCounts[p];
      bestPip = p;
    }
  }

  // First bid of the round (no current bid)
  if (!currentBid) {
    // Starting bid: standard opening is totalActivePlayers or totalActivePlayers + 1
    const openingCount = Math.max(
      Math.floor(totalActivePlayers * 0.8),
      bot.personality === 'bluffer' ? totalActivePlayers + 1 : totalActivePlayers
    );
    return {
      action: 'BID',
      bid: { count: openingCount, pip: bestPip },
    };
  }

  // Evaluate current bid credibility
  const { count: bidCount, pip: bidPip } = currentBid;
  const botOwnMatching = effectiveCounts[bidPip] || 0;
  
  // Probability of matching face in unknown dice
  const prob = (bidPip === 1 || !isWildActive) ? (1 / 6) : (1 / 3);
  const expectedUnknown = unknownDiceCount * prob;
  const expectedTotal = botOwnMatching + expectedUnknown;

  // Personality bias thresholds
  let challengeThreshold = expectedTotal + 1.2;
  if (bot.personality === 'cautious') {
    challengeThreshold = expectedTotal + 0.6;
  } else if (bot.personality === 'bluffer') {
    challengeThreshold = expectedTotal + 2.2;
  }

  // If the bid is absurdly high or exceeds threshold, challenge!
  if (bidCount > totalActivePlayers * 5 || bidCount >= challengeThreshold) {
    // Very high probability to challenge
    return { action: 'CHALLENGE' };
  }

  // Otherwise, formulate a valid higher bid
  // Valid higher bids:
  // 1. Same count, higher pip (if bidPip < 6)
  // 2. Higher count (bidCount + 1), any pip
  const candidates: { count: number; pip: number; score: number }[] = [];

  // Option 1: Raise pip with same count
  if (bidPip < 6) {
    for (let p = bidPip + 1; p <= 6; p++) {
      const own = effectiveCounts[p];
      const exp = own + unknownDiceCount * ((p === 1 || !isWildActive) ? (1 / 6) : (1 / 3));
      const diff = exp - bidCount;
      candidates.push({
        count: bidCount,
        pip: p,
        score: diff + (p === bestPip ? 1.5 : 0),
      });
    }
  }

  // Option 2: Raise count + 1 with best pips
  const nextCount = bidCount + 1;
  if (nextCount <= totalActivePlayers * 5) {
    for (let p = 2; p <= 6; p++) {
      const own = effectiveCounts[p];
      const exp = own + unknownDiceCount * (1 / 3);
      const diff = exp - nextCount;
      candidates.push({
        count: nextCount,
        pip: p,
        score: diff + (p === bestPip ? 2 : 0),
      });
    }

    // Also consider calling 1s (斋) if bot has plenty of 1s
    if (counts[1] >= 2) {
      const expOnes = counts[1] + unknownDiceCount * (1 / 6);
      candidates.push({
        count: nextCount,
        pip: 1,
        score: (expOnes - nextCount) + (bot.personality === 'bluffer' ? 1.5 : 0.5),
      });
    }
  }

  if (candidates.length === 0) {
    return { action: 'CHALLENGE' };
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  // If even the best candidate is heavily underwater and personality is cautious, challenge
  if (candidates[0].score < -1.8 && bot.personality !== 'bluffer') {
    return { action: 'CHALLENGE' };
  }

  const chosen = candidates[0];
  return {
    action: 'BID',
    bid: { count: chosen.count, pip: chosen.pip },
  };
}
