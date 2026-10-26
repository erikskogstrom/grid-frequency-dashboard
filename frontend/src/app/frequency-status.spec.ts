import { findLastStatusChange, getFrequencyStatus } from './frequency-status';

describe('getFrequencyStatus', () => {
  const thresholds = { low: 49.9, high: 50.1 };

  it.each([49.9, 50, 50.1])('is normal at %f Hz (band edges are inclusive)', (hz) => {
    expect(getFrequencyStatus(hz, thresholds)).toBe('normal');
  });

  it.each([49.85, 50.15, 49.6, 50.4])('is outside the normal band at %f Hz', (hz) => {
    expect(getFrequencyStatus(hz, thresholds)).toBe('outside');
  });

  it.each([49.5, 49.4, 50.5, 50.6])('is critical at %f Hz', (hz) => {
    expect(getFrequencyStatus(hz, thresholds)).toBe('critical');
  });

  it('follows custom thresholds', () => {
    expect(getFrequencyStatus(49.95, { low: 49.98, high: 50.02 })).toBe('outside');
  });

  it('critical wins over a wide alarm band', () => {
    expect(getFrequencyStatus(49.4, { low: 49.0, high: 51.0 })).toBe('critical');
  });
});

describe('findLastStatusChange', () => {
  const thresholds = { low: 49.9, high: 50.1 };
  const at = (...hz: number[]) => hz.map((value) => ({ hz: value }));

  it('is null when the status never changed', () => {
    expect(findLastStatusChange(at(50, 50.02, 49.98), thresholds)).toBeNull();
    expect(findLastStatusChange([], thresholds)).toBeNull();
  });

  it('finds where the current status began', () => {
    expect(findLastStatusChange(at(50, 50, 49.8, 49.7, 49.6), thresholds)).toEqual({ index: 2, status: 'outside' });
  });

  it('reports the latest change only', () => {
    expect(findLastStatusChange(at(50, 49.8, 49.4, 49.45), thresholds)).toEqual({ index: 2, status: 'critical' });
  });
});
