/** One measurement, as sent by the backend (SignalR "sample" message and /api/history). */
export interface FrequencySample {
  /** ISO 8601 timestamp. */
  timestamp: string;
  hz: number;
}
