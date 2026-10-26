import { getFrequencyStatus } from './frequency-status';

describe('getFrequencyStatus', () => {
  const thresholds = { low: 49.9, high: 50.1 };

  it.each([49.9, 50, 50.1])('is normal at %f Hz (band edges are inclusive)', (hz) => {
    expect(getFrequencyStatus(hz, thresholds)).toBe('normal');
  });

  it.each([49.85, 50.15])('is outside the normal band at %f Hz', (hz) => {
    expect(getFrequencyStatus(hz, thresholds)).toBe('outside');
  });

  it.each([49.7, 49.6, 50.3, 50.5])('is critical at %f Hz', (hz) => {
    expect(getFrequencyStatus(hz, thresholds)).toBe('critical');
  });

  it('follows custom thresholds', () => {
    expect(getFrequencyStatus(49.95, { low: 49.98, high: 50.02 })).toBe('outside');
  });

  it('critical wins over a wide alarm band', () => {
    expect(getFrequencyStatus(49.6, { low: 49.0, high: 51.0 })).toBe('critical');
  });
});
