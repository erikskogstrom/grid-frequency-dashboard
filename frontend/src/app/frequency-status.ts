export const NOMINAL_HZ = 50;

/** Fixed emergency limits. They win over the user's alarm thresholds. */
export const CRITICAL_LOW_HZ = 49.7;
export const CRITICAL_HIGH_HZ = 50.3;

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
