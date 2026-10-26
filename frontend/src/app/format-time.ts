/** 24-hour local time with seconds, for example 14:32:07. */
const clock = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function formatClock(time: number | string | Date): string {
  return clock.format(typeof time === 'string' ? new Date(time) : time);
}

/** A duration in seconds as "12 s" or "1 min 05 s". */
export function formatDuration(seconds: number): string {
  const whole = Math.round(seconds);
  if (whole < 60) {
    return `${whole} s`;
  }
  return `${Math.floor(whole / 60)} min ${String(whole % 60).padStart(2, '0')} s`;
}
