import { Component, computed, inject } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { formatClock } from '../format-time';
import { FrequencyStream } from '../frequency-stream';
import { CRITICAL_HIGH_HZ, CRITICAL_LOW_HZ, FrequencyStatus, NOMINAL_HZ, findLastStatusChange, getFrequencyStatus } from '../frequency-status';

const STATUS_LABEL: Record<FrequencyStatus, string> = { normal: 'Normal', outside: 'Outside normal band', critical: 'Critical' };
const WINDOW_MS = 120_000;
const Y_MIN = 49.3;
const Y_MAX = 50.7;
/** Minimum vertical gap between two reference labels, in percent of the plot height (about 14px at 288px). */
const LABEL_MIN_GAP_PERCENT = 5;
const GRID_HZ = [50.6, 50.4, 50.2, 50.0, 49.8, 49.6, 49.4];

/** Maps a frequency to a vertical position in percent (0 = top, 100 = bottom), clamped to the plot. */
function yPercent(hz: number): number {
  const clamped = Math.min(Y_MAX, Math.max(Y_MIN, hz));
  return ((Y_MAX - clamped) / (Y_MAX - Y_MIN)) * 100;
}

/**
 * The plot is an SVG that stretches to its box (viewBox 0..100 on both axes, non-scaling strokes).
 * Axis labels, reference-line labels and the end marker are plain HTML around it, so text stays
 * readable at any width. Reference lines: nominal, the normal band, and the critical limits.
 */
@Component({
  selector: 'app-frequency-chart',
  template: `
    <section aria-labelledby="chart-title">
      <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h2 id="chart-title" class="text-base font-semibold">Last 2 minutes</h2>
        <!-- Slot for controls that act on the chart, so cause and effect are visible together. -->
        <ng-content />
      </div>

      <div class="mt-4 grid grid-cols-[2.25rem_1fr_2.75rem] gap-x-3 sm:grid-cols-[2.25rem_1fr_7rem]">
        <div class="relative" aria-hidden="true">
          @for (tick of grid; track tick.label) {
            <span class="absolute right-0 -translate-y-1/2 text-xs text-muted tabular-nums" [style.top.%]="tick.y">{{ tick.label }}</span>
          }
        </div>

        <div class="relative h-72 sm:h-80" role="img" [attr.aria-label]="description()">
          <svg class="absolute inset-0 size-full" [class.opacity-50]="!live()" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" width="100" y="0" [attr.height]="criticalHighY" class="fill-crit/10" />
            <rect x="0" width="100" [attr.y]="criticalLowY" [attr.height]="100 - criticalLowY" class="fill-crit/10" />
            <rect x="0" width="100" [attr.y]="band().top" [attr.height]="band().height" class="fill-ok/10" />

            @for (tick of grid; track tick.label) {
              <line x1="0" x2="100" [attr.y1]="tick.y" [attr.y2]="tick.y" class="stroke-line" vector-effect="non-scaling-stroke" />
            }

            @for (ref of references(); track ref.name + ref.hz) {
              <line x1="0" x2="100" [attr.y1]="ref.y" [attr.y2]="ref.y" [class]="ref.line" [attr.stroke-dasharray]="ref.dash" stroke-width="1.5" vector-effect="non-scaling-stroke" />
            }

            @if (change(); as c) {
              <line [attr.x1]="c.x" [attr.x2]="c.x" y1="0" y2="100" class="stroke-muted" stroke-dasharray="2 3" vector-effect="non-scaling-stroke" />
            }

            @if (path()) {
              <path [attr.d]="path()" fill="none" class="stroke-ink" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
            }
          </svg>

          @if (change(); as c) {
            <span class="absolute top-1 bg-page px-1 text-xs whitespace-nowrap text-muted tabular-nums" [class.-translate-x-full]="c.x > 65" [style.left.%]="c.x">
              {{ c.label }} from {{ c.time }}
            </span>
          }

          @if (marker(); as m) {
            <span class="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-page" [class]="live() ? m.color : 'bg-muted'" [style.left.%]="m.x" [style.top.%]="m.y"></span>
          } @else {
            <p class="absolute inset-0 flex items-center justify-center text-sm text-muted">Waiting for the first samples…</p>
          }
        </div>

        <div class="relative" aria-hidden="true">
          @for (ref of references(); track ref.name + ref.hz) {
            @if (!ref.hidden) {
              <span class="absolute left-0 -translate-y-1/2 text-xs whitespace-nowrap tabular-nums" [class]="ref.text" [style.top.%]="ref.y">
                {{ ref.hz.toFixed(2) }}<span class="hidden sm:inline"> {{ ref.name }}</span>
              </span>
            }
          }
        </div>

        <div></div>
        <div class="mt-2 flex justify-between text-xs text-muted tabular-nums" aria-hidden="true">
          @for (time of times(); track $index) {
            <span>{{ time }}</span>
          }
        </div>
      </div>
    </section>
  `,
})
export class FrequencyChart {
  private readonly stream = inject(FrequencyStream);
  private readonly thresholds = inject(AlarmSettings).thresholds;
  private readonly recent = this.stream.recent;
  /** When the connection is lost the line and marker are dimmed: stale data must look stale. */
  protected readonly live = computed(() => this.stream.status() === 'connected');

  protected readonly grid = GRID_HZ.map((hz) => ({ y: yPercent(hz), label: hz.toFixed(1) }));
  protected readonly criticalHighY = yPercent(CRITICAL_HIGH_HZ);
  protected readonly criticalLowY = yPercent(CRITICAL_LOW_HZ);

  protected readonly band = computed(() => {
    const top = yPercent(this.thresholds().high);
    return { top, height: yPercent(this.thresholds().low) - top };
  });

  /** The reference lines that make the trend readable without reading numbers. */
  protected readonly references = computed(() => {
    const { low, high } = this.thresholds();
    const band = { line: 'stroke-ok', text: 'text-ok', dash: '6 4' };
    const critical = { line: 'stroke-crit', text: 'text-crit', dash: '2 4' };
    const lines = [
      { hz: CRITICAL_HIGH_HZ, name: 'critical', ...critical },
      { hz: high, name: 'high', ...band },
      { hz: NOMINAL_HZ, name: 'nominal', line: 'stroke-ink', text: 'text-ink', dash: '' },
      { hz: low, name: 'low', ...band },
      { hz: CRITICAL_LOW_HZ, name: 'critical', ...critical },
    ].map((ref) => ({ ...ref, y: yPercent(ref.hz) }));
    // Labels are about 16px tall; hide a threshold label that would collide with the nominal one (the line stays).
    const nominalY = yPercent(NOMINAL_HZ);
    return lines.map((ref) => ({ ...ref, hidden: ref.name !== 'nominal' && Math.abs(ref.y - nominalY) < LABEL_MIN_GAP_PERCENT }));
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

  /** When the status last changed within the window: x position, new status and clock time. */
  protected readonly change = computed(() => {
    const samples = this.recent();
    const found = findLastStatusChange(samples, this.thresholds());
    const point = found ? this.points()[found.index] : null;
    if (!found || !point) {
      return null;
    }
    return { x: point.x, label: STATUS_LABEL[found.status], time: formatClock(samples[found.index].timestamp) };
  });

  /** End-of-line marker, coloured by the status of the latest sample. */
  protected readonly marker = computed(() => {
    const point = this.points().at(-1);
    const latest = this.stream.latest();
    if (!point || !latest) {
      return null;
    }
    const color = { normal: 'bg-ok', outside: 'bg-warn', critical: 'bg-crit' }[getFrequencyStatus(latest.hz, this.thresholds())];
    return { ...point, color };
  });

  /** Clock times (24 h, local) for the start, middle and end of the window. */
  protected readonly times = computed(() => {
    const latest = this.stream.latest();
    if (!latest) {
      return ['', '', ''];
    }
    const newest = Date.parse(latest.timestamp);
    return [newest - WINDOW_MS, newest - WINDOW_MS / 2, newest].map((t) => formatClock(t));
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
