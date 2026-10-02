import { describe, expect, it } from 'vitest';
import { describeOption, installmentOptions, installmentPlan, isEligible } from '../checkout/installments';
import { money } from '../src/money';

describe('installmentPlan', () => {
  it('splits into equal parts with the leftover cents first', () => {
    expect(installmentPlan(money(10_00), 3).map((part) => part.cents)).toEqual([334, 333, 333]);
  });

  it('rejects plans outside 2 to 12 installments', () => {
    expect(() => installmentPlan(money(100_00), 1)).toThrow(RangeError);
    expect(() => installmentPlan(money(100_00), 13)).toThrow(RangeError);
  });
});

describe('installmentOptions', () => {
  it('offers nothing below the minimum installment value', () => {
    expect(isEligible(money(9_99))).toBe(false);
    expect(installmentOptions(money(9_99))).toEqual([]);
  });

  it('marks plans up to 6x as interest free', () => {
    const options = installmentOptions(money(300_00));
    expect(options).toHaveLength(11);
    expect(describeOption(options[4])).toContain('6x');
    expect(options[4].interestFree).toBe(true);
    expect(options[5].interestFree).toBe(false);
  });
});
