import { getFrequencyTrend } from './frequency-trend';

/** n samples starting at `start` Hz, changing by `step` Hz per sample. */
const ramp = (n: number, start: number, step: number) =>
  Array.from({ length: n }, (_, i) => ({ hz: start + i * step }));

describe('getFrequencyTrend', () => {
  it('needs about 15 s of data', () => {
    expect(getFrequencyTrend(ramp(29, 50, 0))).toBeNull();
    expect(getFrequencyTrend(ramp(30, 50, 0))).not.toBeNull();
  });

  it('is steady on a flat line', () => {
    expect(getFrequencyTrend(ramp(60, 50, 0))).toEqual({ direction: 'steady', mHzPer10s: 0 });
  });

  it('is falling when the frequency drops', () => {
    // -0.002 Hz per sample = -40 mHz per 10 s
    const trend = getFrequencyTrend(ramp(60, 50, -0.002));
    expect(trend?.direction).toBe('falling');
    expect(trend?.mHzPer10s).toBe(-40);
  });

  it('is rising when the frequency climbs', () => {
    expect(getFrequencyTrend(ramp(60, 49.8, 0.002))?.direction).toBe('rising');
  });

  it('ignores small drift below 20 mHz per 10 s', () => {
    expect(getFrequencyTrend(ramp(60, 50, 0.0005))?.direction).toBe('steady');
  });
});
