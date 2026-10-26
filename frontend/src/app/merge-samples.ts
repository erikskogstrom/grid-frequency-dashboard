import { FrequencySample } from './frequency-sample';

/** Union of two sample lists, de-duplicated by timestamp, oldest first, keeping the newest `max`. */
export function mergeSamples(
  a: readonly FrequencySample[],
  b: readonly FrequencySample[],
  max: number,
): FrequencySample[] {
  const byTimestamp = new Map<string, FrequencySample>();
  for (const sample of [...a, ...b]) {
    byTimestamp.set(sample.timestamp, sample);
  }
  return [...byTimestamp.values()]
    .sort((x, y) => Date.parse(x.timestamp) - Date.parse(y.timestamp))
    .slice(-max);
}
