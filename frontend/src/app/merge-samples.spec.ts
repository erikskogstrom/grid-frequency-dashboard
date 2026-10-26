import { mergeSamples } from './merge-samples';

const at = (second: number, hz = 50) => ({ timestamp: new Date(Date.UTC(2026, 0, 1, 0, 0, second)).toISOString(), hz });

describe('mergeSamples', () => {
  it('fills the gap before live samples and de-duplicates the overlap', () => {
    const history = [at(0), at(1), at(2), at(3)];
    const live = [at(3), at(4)];
    expect(mergeSamples(live, history, 10).map((s) => s.timestamp)).toEqual([0, 1, 2, 3, 4].map((s) => at(s).timestamp));
  });

  it('keeps only the newest samples', () => {
    const all = [at(0), at(1), at(2), at(3)];
    expect(mergeSamples([], all, 2)).toEqual([at(2), at(3)]);
  });
});
