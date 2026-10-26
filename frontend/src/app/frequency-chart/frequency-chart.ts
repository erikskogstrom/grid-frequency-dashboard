import { Component, computed, inject } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { FrequencyStream } from '../frequency-stream';
import { NOMINAL_HZ } from '../frequency-status';

const WIDTH = 600;
const HEIGHT = 240;
const PAD = { left: 48, right: 12, top: 12, bottom: 28 };
const WINDOW_MS = 120_000;
const Y_MIN = 49.5;
const Y_MAX = 50.5;
const TICKS = [49.6, 49.8, 50.0, 50.2, 50.4];

/** Maps a frequency to a y coordinate in the SVG, clamped to the plot area. */
function yFor(hz: number): number {
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const clamped = Math.min(Y_MAX, Math.max(Y_MIN, hz));
  return PAD.top + ((Y_MAX - clamped) / (Y_MAX - Y_MIN)) * plotHeight;
}

@Component({
  selector: 'app-frequency-chart',
  template: `
    <section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-labelledby="chart-title">
      <h2 id="chart-title" class="text-sm font-medium text-slate-600">Last 2 minutes</h2>

      <svg
        class="mt-3 w-full"
        [attr.viewBox]="'0 0 ' + width + ' ' + height"
        role="img"
        [attr.aria-label]="description()"
      >
        @for (tick of ticks; track tick) {
          <line [attr.x1]="left" [attr.x2]="right" [attr.y1]="tick.y" [attr.y2]="tick.y" class="stroke-slate-200" />
          <text [attr.x]="left - 6" [attr.y]="tick.y" text-anchor="end" dominant-baseline="middle" class="fill-slate-600 text-[11px]">
            {{ tick.label }}
          </text>
        }

        @for (line of alarmLines(); track line.label) {
          <line [attr.x1]="left" [attr.x2]="right" [attr.y1]="line.y" [attr.y2]="line.y" class="stroke-amber-600" stroke-dasharray="6 4" />
        }

        @if (path()) {
          <path [attr.d]="path()" fill="none" class="stroke-sky-700" stroke-width="2" stroke-linejoin="round" />
        }

        <text [attr.x]="left" [attr.y]="height - 8" class="fill-slate-600 text-[11px]">-2 min</text>
        <text [attr.x]="right" [attr.y]="height - 8" text-anchor="end" class="fill-slate-600 text-[11px]">now</text>
      </svg>

      <p class="mt-2 text-xs text-slate-600">Dashed lines mark the alarm thresholds.</p>
    </section>
  `,
})
export class FrequencyChart {
  private readonly recent = inject(FrequencyStream).recent;
  private readonly thresholds = inject(AlarmSettings).thresholds;

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly left = PAD.left;
  protected readonly right = WIDTH - PAD.right;

  protected readonly ticks = TICKS.map((hz) => ({ y: yFor(hz), label: hz.toFixed(1) }));

  protected readonly alarmLines = computed(() => [
    { label: 'low', y: yFor(this.thresholds().low) },
    { label: 'high', y: yFor(this.thresholds().high) },
  ]);

  /** SVG path ("M x y L x y ...") for the samples. The newest sample is always at the right edge. */
  protected readonly path = computed(() => {
    const samples = this.recent();
    if (samples.length < 2) {
      return '';
    }
    const newest = Date.parse(samples[samples.length - 1].timestamp);
    const plotWidth = WIDTH - PAD.left - PAD.right;
    return samples
      .map((sample, i) => {
        const x = PAD.left + ((Date.parse(sample.timestamp) - (newest - WINDOW_MS)) / WINDOW_MS) * plotWidth;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${yFor(sample.hz).toFixed(1)}`;
      })
      .join(' ');
  });

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
