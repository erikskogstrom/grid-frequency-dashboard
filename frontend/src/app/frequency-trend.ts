export type TrendDirection = 'rising' | 'steady' | 'falling';

export interface FrequencyTrend {
  direction: TrendDirection;
  /** Change over the last 10 seconds, in mHz (signed, rounded). */
  mHzPer10s: number;
}

// Samples arrive every 500 ms. Averaging 10 samples (5 s) smooths the random walk, and the
// comparison point is 10 s (20 samples) earlier.
const SMOOTHING_SAMPLES = 10;
const LAG_SAMPLES = 20;
/** Below this change per 10 s the frequency counts as steady. */
const STEADY_BELOW_MHZ = 20;

const mean = (values: readonly number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/** Which way the frequency is heading. Null until there is enough history (about 15 s). */
export function getFrequencyTrend(samples: readonly { hz: number }[]): FrequencyTrend | null {
  if (samples.length < SMOOTHING_SAMPLES + LAG_SAMPLES) {
    return null;
  }
  const hz = samples.map((sample) => sample.hz);
  const recent = mean(hz.slice(-SMOOTHING_SAMPLES));
  const earlier = mean(hz.slice(-SMOOTHING_SAMPLES - LAG_SAMPLES, -LAG_SAMPLES));
  const mHzPer10s = Math.round((recent - earlier) * 1000);

  if (Math.abs(mHzPer10s) < STEADY_BELOW_MHZ) {
    return { direction: 'steady', mHzPer10s };
  }
  return { direction: mHzPer10s > 0 ? 'rising' : 'falling', mHzPer10s };
}
