/**
 * Bar Dice (吹牛/大话骰) rule evaluation utilities
 */

export interface StraightEvaluation {
  isStraight: boolean;
  type: 'small' | 'big' | 'distinct' | null;
  label: string;
}

/**
 * Checks if 5 dice form a straight (顺子).
 * Classic Bar Dice rules:
 * - 小顺子: 1-2-3-4-5
 * - 大顺子: 2-3-4-5-6
 * - 散牌/全单: 5 个点全不相同 (5 distinct dice, no pairs)
 * In bar rules, rolling a straight (or 5 distinct) entitles the player to a free reroll (顺子重摇).
 */
export function checkStraight(dice: number[]): StraightEvaluation {
  if (!dice || dice.length !== 5) {
    return { isStraight: false, type: null, label: '' };
  }

  const sorted = [...dice].sort((a, b) => a - b);
  const sortedStr = sorted.join('');

  if (sortedStr === '12345') {
    return {
      isStraight: true,
      type: 'small',
      label: '小顺子 (1-2-3-4-5)',
    };
  }

  if (sortedStr === '23456') {
    return {
      isStraight: true,
      type: 'big',
      label: '大顺子 (2-3-4-5-6)',
    };
  }

  // 5 distinct numbers (全单/散牌)
  if (new Set(dice).size === 5) {
    return {
      isStraight: true,
      type: 'distinct',
      label: `顺子散牌 (${sorted.join('-')})`,
    };
  }

  return {
    isStraight: false,
    type: null,
    label: '',
  };
}
