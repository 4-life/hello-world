import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calcAvailableDays, countUsedDays } from './vacationDays';

describe('countUsedDays', () => {
  it('returns 0 for no vacations taken', () => {
    expect(countUsedDays([])).toBe(0);
  });

  it('counts a single day (same start and end)', () => {
    expect(countUsedDays([{ startDate: '2024-01-01', endDate: '2024-01-01' }])).toBe(1);
  });

  it('counts days inclusively', () => {
    expect(countUsedDays([{ startDate: '2024-01-01', endDate: '2024-01-05' }])).toBe(5);
  });

  it('sums multiple vacation ranges', () => {
    expect(
      countUsedDays([
        { startDate: '2024-01-01', endDate: '2024-01-03' }, // 3 days
        { startDate: '2024-06-10', endDate: '2024-06-14' }, // 5 days
      ]),
    ).toBe(8);
  });
});

describe('calcAvailableDays', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when startWorkDate is null', () => {
    expect(calcAvailableDays(null, [])).toBeNull();
  });

  it('returns null when startWorkDate is undefined', () => {
    expect(calcAvailableDays(undefined, [])).toBeNull();
  });

  it('returns 0 when just started (same month) with no vacations', () => {
    vi.setSystemTime(new Date('2024-06-15'));
    expect(calcAvailableDays('2024-06-01', [])).toBe(0);
  });

  it('for empty vacations returns worked months since hired * 2.33', () => {
    vi.setSystemTime(new Date('2024-07-01'));
    // 1 worked month → ceil(1 * 2.33) = 3
    expect(calcAvailableDays('2024-06-01', [])).toBe(3);
  });

  it('accrues correctly over 12 months', () => {
    vi.setSystemTime(new Date('2025-06-01'));
    // 12 months → ceil(12 * 2.33) = ceil(27.96) = 28
    expect(calcAvailableDays('2024-06-01', [])).toBe(28);
  });

  it('subtracts used vacation days', () => {
    vi.setSystemTime(new Date('2024-09-01'));
    // 3 months → ceil(3 * 2.33) = ceil(6.99) = 7, minus 3 used = 4
    expect(
      calcAvailableDays('2024-06-01', [
        { startDate: '2024-07-01', endDate: '2024-07-03' },
      ]),
    ).toBe(4);
  });

  it('accepts Date objects as well as strings', () => {
    vi.setSystemTime(new Date('2024-07-01'));
    expect(calcAvailableDays(new Date('2024-06-01'), [])).toBe(3);
  });

  it('does not go below 0 months worked if start date is in the future', () => {
    vi.setSystemTime(new Date('2024-06-01'));
    expect(calcAvailableDays('2025-01-01', [])).toBe(0);
  });
});
