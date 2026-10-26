import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { AlarmSettings } from '../alarm-settings';
import { FrequencySample } from '../frequency-sample';

@Component({
  selector: 'app-history',
  template: `
    <section aria-labelledby="history-title">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 id="history-title" class="text-base font-semibold">History</h2>

        <div role="group" aria-label="Time range" class="flex gap-2">
          @for (option of options; track option) {
            <button
              type="button"
              class="btn btn-secondary h-9 px-3 aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink"
              [attr.aria-pressed]="minutes() === option"
              (click)="minutes.set(option)"
            >
              {{ option }} min
            </button>
          }
        </div>
      </div>

      <div class="mt-5 min-h-24" aria-live="polite">
        @if (history.isLoading()) {
          <!-- Skeleton with the same shape as the result, so nothing jumps when data arrives. -->
          <div class="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5" aria-label="Loading history" role="status">
            @for (n of [1, 2, 3, 4, 5]; track n) {
              <div class="space-y-2">
                <div class="h-3 w-16 rounded-xs bg-line motion-safe:animate-pulse"></div>
                <div class="h-6 w-20 rounded-xs bg-line motion-safe:animate-pulse"></div>
              </div>
            }
          </div>
        } @else if (history.error()) {
          <div role="alert" class="flex flex-wrap items-center gap-3">
            <p class="text-sm text-crit">Could not load history. Is the backend running?</p>
            <button type="button" class="btn btn-secondary h-9 px-3" (click)="history.reload()">Try again</button>
          </div>
        } @else if (stats(); as s) {
          <dl class="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-5">
            <div><dt class="text-sm text-muted">Samples</dt><dd class="mt-1 text-xl font-semibold tabular-nums">{{ s.count }}</dd></div>
            <div><dt class="text-sm text-muted">Min</dt><dd class="mt-1 text-xl font-semibold tabular-nums">{{ s.min.toFixed(2) }} <span class="text-sm font-normal text-muted">Hz</span></dd></div>
            <div><dt class="text-sm text-muted">Max</dt><dd class="mt-1 text-xl font-semibold tabular-nums">{{ s.max.toFixed(2) }} <span class="text-sm font-normal text-muted">Hz</span></dd></div>
            <div><dt class="text-sm text-muted">Mean</dt><dd class="mt-1 text-xl font-semibold tabular-nums">{{ s.mean.toFixed(2) }} <span class="text-sm font-normal text-muted">Hz</span></dd></div>
            <div>
              <dt class="text-sm text-muted">Outside band</dt>
              <dd class="mt-1 text-xl font-semibold tabular-nums" [class.text-warn]="s.outside > 0">{{ s.outside }}</dd>
            </div>
          </dl>
        } @else {
          <p class="text-sm text-muted">No samples in this range yet. The backend keeps up to 15 minutes, so give it a moment after a restart.</p>
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
