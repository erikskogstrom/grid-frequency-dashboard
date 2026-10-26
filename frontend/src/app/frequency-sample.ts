/** One measurement, as sent by the backend (SignalR "sample" message and /api/history). */
export interface FrequencySample {
  /** ISO 8601 timestamp. */
  timestamp: string;
  hz: number;
}

/** The backend produces one sample every 500 ms. */
export const SAMPLE_INTERVAL_SECONDS = 0.5;
