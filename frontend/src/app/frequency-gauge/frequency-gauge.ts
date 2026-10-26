import { Component, computed, inject } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { FrequencyStream } from '../frequency-stream';
import { getFrequencyStatus } from '../frequency-status';

@Component({
  selector: 'app-frequency-gauge',
  template: `
    <section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-labelledby="gauge-title">
      <h2 id="gauge-title" class="text-sm font-medium text-slate-600">Current frequency</h2>

      @if (latest(); as sample) {
        <p class="mt-2 text-6xl font-semibold tabular-nums text-slate-900">
          {{ sample.hz.toFixed(2) }}<span class="ml-2 text-2xl font-normal text-slate-600">Hz</span>
        </p>
      } @else {
        <p class="mt-2 text-6xl font-semibold text-slate-400">--.--</p>
      }

      <!-- role="status" is only announced when its text changes, i.e. when the status changes. -->
      <p role="status" class="mt-4">
        @switch (status()) {
          @case ('normal') {
            <span class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-900">Normal</span>
          }
          @case ('outside') {
            <span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">Outside normal band</span>
          }
          @case ('critical') {
            <span class="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-900">Critical</span>
          }
          @default {
            <span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Waiting for data</span>
          }
        }
      </p>

      <p class="mt-4 text-sm text-slate-600">
        Normal band {{ thresholds().low.toFixed(2) }}–{{ thresholds().high.toFixed(2) }} Hz
      </p>
    </section>
  `,
})
export class FrequencyGauge {
  private readonly stream = inject(FrequencyStream);
  protected readonly thresholds = inject(AlarmSettings).thresholds;

  protected readonly latest = this.stream.latest;

  /** Derived from the latest sample and the thresholds; null until the first sample arrives. */
  protected readonly status = computed(() => {
    const sample = this.latest();
    return sample ? getFrequencyStatus(sample.hz, this.thresholds()) : null;
  });
}
