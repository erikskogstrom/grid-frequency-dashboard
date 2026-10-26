import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { FrequencySample } from '../frequency-sample';

@Component({
  selector: 'app-history',
  template: `
    <section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-labelledby="history-title">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 id="history-title" class="text-sm font-medium text-slate-600">History</h2>

        <div role="group" aria-label="Time range" class="flex gap-1">
          @for (option of options; track option) {
            <button
              type="button"
              class="rounded-md px-3 py-1 text-sm font-medium ring-1 ring-slate-300 aria-pressed:bg-sky-700 aria-pressed:text-white aria-pressed:ring-sky-700"
              [attr.aria-pressed]="minutes() === option"
              (click)="minutes.set(option)"
            >
              {{ option }} min
            </button>
          }
        </div>
      </div>

      <div class="mt-4" aria-live="polite">
        @if (history.isLoading()) {
          <p class="text-sm text-slate-600">Loading history…</p>
        } @else if (history.error()) {
          <p class="text-sm text-red-800">Could not load history.</p>
          <button type="button" class="mt-2 rounded-md px-3 py-1 text-sm font-medium ring-1 ring-slate-300" (click)="history.reload()">
            Try again
          </button>
        } @else if (stats(); as s) {
          <dl class="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div><dt class="text-xs text-slate-600">Samples</dt><dd class="text-lg font-semibold tabular-nums">{{ s.count }}</dd></div>
            <div><dt class="text-xs text-slate-600">Min</dt><dd class="text-lg font-semibold tabular-nums">{{ s.min.toFixed(2) }} Hz</dd></div>
            <div><dt class="text-xs text-slate-600">Max</dt><dd class="text-lg font-semibold tabular-nums">{{ s.max.toFixed(2) }} Hz</dd></div>
            <div><dt class="text-xs text-slate-600">Mean</dt><dd class="text-lg font-semibold tabular-nums">{{ s.mean.toFixed(2) }} Hz</dd></div>
            <div><dt class="text-xs text-slate-600">Outside band</dt><dd class="text-lg font-semibold tabular-nums">{{ s.outside }}</dd></div>
          </dl>
        } @else {
          <p class="text-sm text-slate-600">No samples yet.</p>
        }
      </div>
    </section>
  `,
})
export class History {
  private readonly thresholds = inject(AlarmSettings).thresholds;

  protected readonly options = [1, 5, 15];
  protected readonly minutes = signal(5);

  // Re-requests automatically whenever minutes() changes and cancels a request still in flight.
  protected readonly history = httpResource<FrequencySample[]>(() => ({
    url: '/api/history',
    params: { minutes: this.minutes() },
  }));

  protected readonly stats = computed(() => {
    // value() throws while the resource is in the error state, so guard it.
    if (!this.history.hasValue()) {
      return null;
    }
    const hz = this.history.value().map((sample) => sample.hz);
    if (hz.length === 0) {
      return null;
    }
    const { low, high } = this.thresholds();
    return {
      count: hz.length,
      min: Math.min(...hz),
      max: Math.max(...hz),
      mean: hz.reduce((sum, value) => sum + value, 0) / hz.length,
      outside: hz.filter((value) => value < low || value > high).length,
    };
  });
}
