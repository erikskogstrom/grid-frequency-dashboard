import { Component, computed, inject } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { FrequencyStream } from '../frequency-stream';
import { NOMINAL_HZ, getFrequencyStatus } from '../frequency-status';

@Component({
  selector: 'app-frequency-gauge',
  template: `
    <section class="flex flex-col gap-5 p-6" aria-labelledby="gauge-title">
      <h2 id="gauge-title" class="text-sm font-medium text-muted">Current frequency</h2>

      @if (latest(); as sample) {
        <p class="flex items-baseline gap-2 tabular-nums" [class.opacity-50]="!live()">
          <span class="text-6xl leading-none font-semibold" [class]="view().text">{{ sample.hz.toFixed(2) }}</span>
          <span class="text-xl text-muted">Hz</span>
        </p>
      } @else {
        <p class="text-6xl leading-none font-semibold text-muted" aria-hidden="true">--.--</p>
      }

      <!-- role="status" is only announced when its text changes, i.e. when the status changes. -->
      <p role="status" class="flex items-center gap-2 text-sm font-medium" [class]="view().text">
        <span class="size-2.5 rounded-full" [class]="view().dot" aria-hidden="true"></span>
        {{ view().label }}
      </p>

      <dl class="grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
        <div>
          <dt class="text-muted">Deviation</dt>
          <dd class="mt-0.5 tabular-nums">{{ deviation() }}</dd>
        </div>
        <div>
          <dt class="text-muted">Alarm band</dt>
          <dd class="mt-0.5 tabular-nums">{{ thresholds().low.toFixed(2) }}–{{ thresholds().high.toFixed(2) }}</dd>
        </div>
      </dl>
    </section>
  `,
})
export class FrequencyGauge {
  private readonly stream = inject(FrequencyStream);
  protected readonly thresholds = inject(AlarmSettings).thresholds;

  protected readonly latest = this.stream.latest;
  protected readonly live = computed(() => this.stream.status() === 'connected');

  /** Derived from the latest sample and the thresholds; null until the first sample arrives. */
  protected readonly status = computed(() => {
    const sample = this.latest();
    return sample ? getFrequencyStatus(sample.hz, this.thresholds()) : null;
  });

  /** How the status looks. Colour is never the only signal: the label always says it too. */
  protected readonly view = computed(() => {
    if (!this.live() && this.latest()) {
      return { label: 'No live data, showing last value', text: 'text-warn', dot: 'bg-warn' };
    }
    switch (this.status()) {
      case 'normal':
        return { label: 'Normal', text: 'text-ok', dot: 'bg-ok' };
      case 'outside':
        return { label: 'Outside normal band', text: 'text-warn', dot: 'bg-warn' };
      case 'critical':
        return { label: 'Critical', text: 'text-crit', dot: 'bg-crit' };
      default:
        return { label: 'Waiting for data', text: 'text-muted', dot: 'bg-muted' };
    }
  });

  protected readonly deviation = computed(() => {
    const sample = this.latest();
    if (!sample) {
      return '–';
    }
    const mHz = Math.round((sample.hz - NOMINAL_HZ) * 1000);
    return `${mHz < 0 ? '−' : '+'}${Math.abs(mHz)} mHz`;
  });
}
