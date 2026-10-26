import { formatDuration } from './format-time';

describe('formatDuration', () => {
  it.each([
    [0, '0 s'],
    [4, '4 s'],
    [59.6, '1 min 00 s'],
    [65, '1 min 05 s'],
    [600, '10 min 00 s'],
  ])('formats %d s as %j', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});
