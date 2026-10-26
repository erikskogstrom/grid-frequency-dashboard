import { Component, computed, inject } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { FrequencyStream } from '../frequency-stream';
import { CRITICAL_HIGH_HZ, CRITICAL_LOW_HZ, NOMINAL_HZ } from '../frequency-status';

const WINDOW_MS = 120_000;
const Y_MIN = 49.5;
const Y_MAX = 50.5;
const TICKS = [50.4, 50.2, 50.0, 49.8, 49.6];

/** Maps a frequency to a vertical position in percent (0 = top, 100 = bottom), clamped to the plot. */
function yPercent(hz: number): number {
  const clamped = Math.min(Y_MAX, Math.max(Y_MIN, hz));
  return ((Y_MAX - clamped) / (Y_MAX - Y_MIN)) * 100;
}

/**
 * The plot is an SVG that stretches to its box (viewBox 0..100 on both axes, non-scaling strokes).
 * Axis labels and the end marker are plain HTML on top, so text stays readable at any width.
 */
@Component({
  selector: 'app-frequency-chart',
  template: `
    <section class="flex flex-col gap-3 p-6" aria-labelledby="chart-title">
      <h2 id="chart-title" class="text-sm font-medium text-muted">Last 2 minutes</h2>

      <div class="grid grid-cols-[2.25rem_1fr] gap-x-3">
        <div class="relative" aria-hidden="true">
          @for (tick of ticks; track tick.label) {
            <span class="absolute right-0 -translate-y-1/2 text-xs text-muted tabular-nums" [style.top.%]="tick.y">{{ tick.label }}</span>
          }
        </div>

        <div class="relative h-64 sm:h-72" role="img" [attr.aria-label]="description()">
          <svg class="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" width="100" [attr.y]="0" [attr.height]="criticalHighY" class="fill-crit/15" />
            <rect x="0" width="100" [attr.y]="criticalLowY" [attr.height]="100 - criticalLowY" class="fill-crit/15" />
            <rect x="0" width="100" [attr.y]="band().top" [attr.height]="band().height" class="fill-ok/10" />

            @for (tick of ticks; track tick.label) {
              <line x1="0" x2="100" [attr.y1]="tick.y" [attr.y2]="tick.y" class="stroke-line" vector-effect="non-scaling-stroke" />
            }

            @if (path()) {
              <path [attr.d]="path()" fill="none" class="stroke-accent" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
            }
          </svg>

          @if (marker(); as m) {
            <span class="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-panel" [style.left.%]="m.x" [style.top.%]="m.y"></span>
          } @else {
            <p class="absolute inset-0 flex items-center justify-center text-sm text-muted">Waiting for the first samples…</p>
          }
        </div>

        <div></div>
        <div class="mt-2 flex justify-between text-xs text-muted" aria-hidden="true">
          <span>−2 min</span><span>−1 min</span><span>now</span>
        </div>
      </div>

      <ul class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
        <li class="flex items-center gap-2"><span class="h-0.5 w-4 bg-accent" aria-hidden="true"></span>Frequency</li>
        <li class="flex items-center gap-2">
          <span class="size-3 rounded-xs bg-ok/20" aria-hidden="true"></span>Alarm band {{ thresholds().low.toFixed(2) }}–{{ thresholds().high.toFixed(2) }} Hz
        </li>
        <li class="flex items-center gap-2">
          <span class="size-3 rounded-xs bg-crit/25" aria-hidden="true"></span>Critical ≤ {{ criticalLow }} or ≥ {{ criticalHigh }} Hz
        </li>
      </ul>
    </section>
  `,
})
export class FrequencyChart {
  private readonly recent = inject(FrequencyStream).recent;
  protected readonly thresholds = inject(AlarmSettings).thresholds;

  protected readonly ticks = TICKS.map((hz) => ({ y: yPercent(hz), label: hz.toFixed(1) }));
  protected readonly criticalHighY = yPercent(CRITICAL_HIGH_HZ);
  protected readonly criticalLowY = yPercent(CRITICAL_LOW_HZ);
  protected readonly criticalLow = CRITICAL_LOW_HZ.toFixed(2);
  protected readonly criticalHigh = CRITICAL_HIGH_HZ.toFixed(2);

  protected readonly band = computed(() => {
    const top = yPercent(this.thresholds().high);
    return { top, height: yPercent(this.thresholds().low) - top };
  });

  /** Points as [x%, y%]. The newest sample is always at the right edge, so the line scrolls left. */
  private readonly points = computed(() => {
    const samples = this.recent();
    if (samples.length === 0) {
      return [];
    }
    const newest = Date.parse(samples[samples.length - 1].timestamp);
    return samples.map((sample) => ({
      x: ((Date.parse(sample.timestamp) - (newest - WINDOW_MS)) / WINDOW_MS) * 100,
      y: yPercent(sample.hz),
    }));
  });

  /** SVG path ("M x y L x y ...") for the samples. */
  protected readonly path = computed(() => {
    const points = this.points();
    if (points.length < 2) {
      return '';
    }
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  });

  protected readonly marker = computed(() => this.points().at(-1) ?? null);

  protected readonly description = computed(() => {
    const samples = this.recent();
    if (samples.length === 0) {
      return 'Frequency chart, waiting for data';
    }
    const hz = samples.map((s) => s.hz);
    return (
      `Frequency over the last 2 minutes, nominal ${NOMINAL_HZ} Hz. ` +
      `Latest ${hz[hz.length - 1].toFixed(2)} Hz, lowest ${Math.min(...hz).toFixed(2)} Hz, highest ${Math.max(...hz).toFixed(2)} Hz.`
    );
  });
}
