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
