import { Component, computed, inject } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { formatClock } from '../format-time';
import { FrequencyStream } from '../frequency-stream';
import { NOMINAL_HZ, getFrequencyStatus } from '../frequency-status';
import { getFrequencyTrend } from '../frequency-trend';
import { StatusIcon } from '../status-icon/status-icon';

const signed = (mHz: number) => `${mHz < 0 ? '−' : '+'}${Math.abs(mHz)}`;

/** The status band: value, status and trend, readable at a glance. Tints when something is wrong. */
@Component({
  selector: 'app-frequency-gauge',
  imports: [StatusIcon],
  template: `
    <section
      class="rounded-xl border px-6 py-7 transition-colors duration-300 motion-reduce:transition-none sm:px-8"
      [class]="view().band"
      aria-labelledby="gauge-title"
    >
      <h2 id="gauge-title" class="sr-only">Current frequency</h2>

      <div class="grid items-center gap-x-12 gap-y-6 lg:grid-cols-[auto_1fr]">
        <div [class.opacity-50]="!live()">
          @if (latest(); as sample) {
            <p class="flex items-baseline gap-3 tabular-nums">
              <span class="text-6xl leading-none font-semibold sm:text-8xl">{{ sample.hz.toFixed(2) }}</span>
              <span class="text-2xl text-muted">Hz</span>
            </p>
            <p class="mt-3 text-lg text-muted tabular-nums">{{ deviation() }} mHz from {{ nominal }} Hz</p>
          } @else {
            <p class="text-6xl leading-none font-semibold text-muted sm:text-8xl" aria-hidden="true">--.--</p>
            <p class="mt-3 text-lg text-muted">Waiting for the first sample</p>
          }
        </div>

        <dl class="flex flex-wrap gap-x-14 gap-y-6 lg:justify-end">
          <div>
            <dt class="text-sm text-muted">Status</dt>
            <dd class="mt-2 flex items-center gap-3" [class]="view().text">
              <app-status-icon class="size-9" [status]="view().icon" />
              <!-- role="status" is only announced when its text changes, i.e. when the status changes. -->
              <span role="status" class="text-2xl font-semibold">{{ view().label }}</span>
            </dd>
            @if (!live() && latest()) {
              <dd class="mt-1 text-sm text-muted tabular-nums">Last sample {{ lastSampleTime() }}</dd>
            }
          </div>

          <div [class.opacity-50]="!live()">
            <dt class="text-sm text-muted">Trend, last 10 s</dt>
            @if (trend(); as t) {
              <dd class="mt-2 flex items-center gap-3">
                <svg viewBox="0 0 24 24" class="size-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  @switch (t.direction) {
                    @case ('rising') { <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" /> }
                    @case ('falling') { <path d="M12 5v14M5.5 12.5 12 19l6.5-6.5" /> }
                    @default { <path d="M5 12h14M13 6l6 6-6 6" /> }
                  }
                </svg>
                <span>
                  <span class="block text-2xl font-semibold">{{ trendLabel() }}</span>
                  <span class="block text-sm text-muted tabular-nums">{{ trendRate() }} mHz / 10 s</span>
                </span>
              </dd>
            } @else {
              <dd class="mt-2 text-2xl font-semibold text-muted">Collecting data</dd>
            }
          </div>
        </dl>
      </div>
    </section>
  `,
})
export class FrequencyGauge {
  private readonly stream = inject(FrequencyStream);
  private readonly thresholds = inject(AlarmSettings).thresholds;

  protected readonly nominal = NOMINAL_HZ.toFixed(2);
  protected readonly latest = this.stream.latest;
  protected readonly live = computed(() => this.stream.status() === 'connected');

  /** Derived from the latest sample and the thresholds; null until the first sample arrives. */
  protected readonly status = computed(() => {
    const sample = this.latest();
    return sample ? getFrequencyStatus(sample.hz, this.thresholds()) : null;
  });

  protected readonly trend = computed(() => getFrequencyTrend(this.stream.recent()));
  protected readonly trendLabel = computed(() => {
    const direction = this.trend()?.direction;
    return direction === 'rising' ? 'Rising' : direction === 'falling' ? 'Falling' : 'Steady';
  });
  protected readonly trendRate = computed(() => signed(this.trend()?.mHzPer10s ?? 0));

  protected readonly deviation = computed(() => signed(Math.round(((this.latest()?.hz ?? NOMINAL_HZ) - NOMINAL_HZ) * 1000)));
  protected readonly lastSampleTime = computed(() => {
    const sample = this.latest();
    return sample ? formatClock(sample.timestamp) : '';
  });

  /** How the status looks. Quiet when normal, louder (tinted band, strong colour) when not. */
  protected readonly view = computed(() => {
    if (!this.live() && this.latest()) {
      return { label: 'No live data', icon: null, text: 'text-warn', band: 'border-warn bg-warn/10' };
    }
    switch (this.status()) {
      case 'normal':
        return { label: 'Normal', icon: 'normal' as const, text: 'text-ok', band: 'border-line bg-panel' };
      case 'outside':
        return { label: 'Outside normal band', icon: 'outside' as const, text: 'text-warn', band: 'border-warn bg-warn/10' };
      case 'critical':
        return { label: 'Critical', icon: 'critical' as const, text: 'text-crit', band: 'border-crit bg-crit/10' };
      default:
        return { label: 'Waiting for data', icon: null, text: 'text-muted', band: 'border-line bg-panel' };
    }
  });
}
