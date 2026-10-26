import { TestBed } from '@angular/core/testing';
import { FakeFrequencyStream } from '../../testing/fake-frequency-stream';
import { AlarmSettings } from '../alarm-settings';
import { FrequencyStream } from '../frequency-stream';
import { FrequencyGauge } from './frequency-gauge';

describe('FrequencyGauge', () => {
  let stream: FakeFrequencyStream;

  async function render() {
    const fixture = TestBed.createComponent(FrequencyGauge);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const sample = (hz: number) => ({ timestamp: '2026-01-01T00:00:00Z', hz });

  beforeEach(() => {
    stream = new FakeFrequencyStream();
    TestBed.configureTestingModule({ providers: [{ provide: FrequencyStream, useValue: stream }] });
  });

  it('waits for data before the first sample', async () => {
    expect((await render()).textContent).toContain('Waiting for data');
  });

  it('shows the value and a normal status', async () => {
    stream.latest.set(sample(50.017));
    const el = await render();
    expect(el.textContent).toContain('50.02');
    expect(el.textContent).toContain('Normal');
  });

  it('updates the status when the frequency leaves the band', async () => {
    stream.latest.set(sample(50));
    const fixture = TestBed.createComponent(FrequencyGauge);
    await fixture.whenStable();

    stream.latest.set(sample(49.85));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Outside normal band');

    stream.latest.set(sample(49.62));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Critical');
  });

  it('uses the thresholds from AlarmSettings', async () => {
    stream.latest.set(sample(49.95));
    TestBed.inject(AlarmSettings).apply({ low: 49.98, high: 50.02 });
    expect((await render()).textContent).toContain('Outside normal band');
  });
});
