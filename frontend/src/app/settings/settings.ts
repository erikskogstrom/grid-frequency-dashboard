import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, max, min, required, submit, validate } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AlarmSettings } from '../alarm-settings';
import { NOMINAL_HZ } from '../frequency-status';

const RANGE_MIN = 49.0;
const RANGE_MAX = 51.0;

@Component({
  selector: 'app-settings',
  imports: [FormField],
  template: `
    <section class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200" aria-labelledby="settings-title">
      <h2 id="settings-title" class="text-sm font-medium text-slate-600">Settings</h2>

      <form class="mt-4 grid gap-4 sm:grid-cols-2" (submit)="save($event)">
        <div>
          <label for="low" class="block text-sm font-medium text-slate-900">Low alarm (Hz)</label>
          <input
            id="low"
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-slate-400"
            [formField]="thresholdsForm.low"
            [attr.aria-invalid]="thresholdsForm.low().invalid()"
            aria-describedby="low-errors"
          />
          <ul id="low-errors" class="mt-1 text-sm text-red-800">
            @if (thresholdsForm.low().touched()) {
              @for (error of thresholdsForm.low().errors(); track error.kind) {
                <li>{{ error.message }}</li>
              }
            }
          </ul>
        </div>

        <div>
          <label for="high" class="block text-sm font-medium text-slate-900">High alarm (Hz)</label>
          <input
            id="high"
            type="number"
            step="0.01"
            class="mt-1 w-full rounded-md px-3 py-2 ring-1 ring-slate-400"
            [formField]="thresholdsForm.high"
            [attr.aria-invalid]="thresholdsForm.high().invalid()"
            aria-describedby="high-errors"
          />
          <ul id="high-errors" class="mt-1 text-sm text-red-800">
            @if (thresholdsForm.high().touched()) {
              @for (error of thresholdsForm.high().errors(); track error.kind) {
                <li>{{ error.message }}</li>
              }
            }
          </ul>
        </div>

        <div class="flex items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            class="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300 disabled:text-slate-700"
            [disabled]="thresholdsForm().invalid()"
          >
            Apply thresholds
          </button>
          <p role="status" class="text-sm text-slate-600">{{ applied() ? 'Applied' : 'Not applied yet' }}</p>
        </div>
      </form>

      <hr class="my-6 border-slate-200" />

      <p class="text-sm text-slate-600">Simulate a sudden loss of generation. The frequency drops towards 49.6 Hz and recovers within about 30 seconds.</p>
      <button
        type="button"
        class="mt-3 rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-300 disabled:text-slate-700"
        [disabled]="disturbance() === 'sending'"
        (click)="triggerDisturbance()"
      >
        Trigger disturbance
      </button>
      <p role="status" class="mt-2 text-sm text-slate-600">
        @switch (disturbance()) {
          @case ('sent') { Disturbance triggered. }
          @case ('error') { <span class="text-red-800">Could not reach the backend.</span> }
        }
      </p>
    </section>
  `,
})
export class Settings {
  private readonly http = inject(HttpClient);
  private readonly alarms = inject(AlarmSettings);

  // The form edits this local model. Only valid values are copied to AlarmSettings on submit.
  private readonly model = signal({ ...this.alarms.thresholds() });

  protected readonly thresholdsForm = form(this.model, (path) => {
    required(path.low, { message: 'Enter a low threshold.' });
    min(path.low, RANGE_MIN, { message: `Must be at least ${RANGE_MIN.toFixed(1)} Hz.` });
    validate(path.low, ({ value }) =>
      value() < NOMINAL_HZ ? null : { kind: 'belowNominal', message: `Must be below ${NOMINAL_HZ} Hz.` },
    );

    required(path.high, { message: 'Enter a high threshold.' });
    max(path.high, RANGE_MAX, { message: `Must be at most ${RANGE_MAX.toFixed(1)} Hz.` });
    validate(path.high, ({ value }) =>
      value() > NOMINAL_HZ ? null : { kind: 'aboveNominal', message: `Must be above ${NOMINAL_HZ} Hz.` },
    );
  });

  protected readonly applied = computed(() => {
    const { low, high } = this.alarms.thresholds();
    return this.model().low === low && this.model().high === high;
  });

  protected readonly disturbance = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');

  protected save(event: Event): void {
    event.preventDefault();
    // submit() marks all fields as touched (so errors show) and only runs the action if the form is valid.
    void submit(this.thresholdsForm, async () => {
      this.alarms.apply({ ...this.model() });
    });
  }

  protected async triggerDisturbance(): Promise<void> {
    this.disturbance.set('sending');
    try {
      await firstValueFrom(this.http.post('/api/disturbance', null));
      this.disturbance.set('sent');
    } catch {
      this.disturbance.set('error');
    }
  }
}
