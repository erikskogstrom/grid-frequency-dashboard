import { formatHz, parseHz } from './parse-hz';

describe('parseHz', () => {
  it.each([
    ['49.9', 49.9],
    ['49,9', 49.9],
    [' 50.10 ', 50.1],
  ])('parses %j', (text, expected) => {
    expect(parseHz(text)).toBe(expected);
  });

  it.each(['', '  ', 'abc', '49.9.1'])('is NaN for %j', (text) => {
    expect(parseHz(text)).toBeNaN();
  });

  it('formats with two decimals and a dot', () => {
    expect(formatHz(49.9)).toBe('49.90');
  });
});
