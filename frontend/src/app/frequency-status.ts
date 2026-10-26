export const NOMINAL_HZ = 50;

/** Fixed emergency limits. They win over the user's alarm thresholds. */
export const CRITICAL_LOW_HZ = 49.5;
export const CRITICAL_HIGH_HZ = 50.5;

export interface Thresholds {
  low: number;
  high: number;
}

export type FrequencyStatus = 'normal' | 'outside' | 'critical';

/** Pure function, so the status rules can be unit tested without Angular. */
export function getFrequencyStatus(hz: number, thresholds: Thresholds): FrequencyStatus {
  if (hz <= CRITICAL_LOW_HZ || hz >= CRITICAL_HIGH_HZ) {
    return 'critical';
  }
  if (hz < thresholds.low || hz > thresholds.high) {
    return 'outside';
  }
  return 'normal';
}

export interface StatusChange {
  /** Index of the first sample with the new status. */
  index: number;
  status: FrequencyStatus;
}

/** The most recent moment the status changed, or null when it never changed in the given samples. */
export function findLastStatusChange(samples: readonly { hz: number }[], thresholds: Thresholds): StatusChange | null {
  let next = samples.length > 0 ? getFrequencyStatus(samples[samples.length - 1].hz, thresholds) : null;
  for (let i = samples.length - 2; i >= 0 && next !== null; i--) {
    const status = getFrequencyStatus(samples[i].hz, thresholds);
    if (status !== next) {
      return { index: i + 1, status: next };
    }
  }
  return null;
}
