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
    <section aria-labelledby="settings-title">
      <h2 id="settings-title" class="text-base font-semibold">Alarm thresholds</h2>
      <p class="mt-1 text-sm text-muted">Frequency outside this band is shown as outside the normal band. Critical limits are fixed at 49.50 and 50.50 Hz.</p>

      <form class="mt-5 grid grid-cols-2 gap-4" (submit)="save($event)">
        <div>
          <label for="low" class="block text-sm font-medium">Low (Hz)</label>
          <input
            id="low"
            type="number"
            step="0.01"
            class="field mt-1.5"
            [formField]="thresholdsForm.low"
            [attr.aria-invalid]="thresholdsForm.low().invalid()"
            aria-describedby="low-errors"
          />
          <ul id="low-errors" class="mt-1.5 text-sm text-crit">
            @if (thresholdsForm.low().touched()) {
              @for (error of thresholdsForm.low().errors(); track error.kind) {
                <li>{{ error.message }}</li>
              }
            }
          </ul>
        </div>

        <div>
          <label for="high" class="block text-sm font-medium">High (Hz)</label>
          <input
            id="high"
            type="number"
            step="0.01"
            class="field mt-1.5"
            [formField]="thresholdsForm.high"
            [attr.aria-invalid]="thresholdsForm.high().invalid()"
            aria-describedby="high-errors"
          />
          <ul id="high-errors" class="mt-1.5 text-sm text-crit">
            @if (thresholdsForm.high().touched()) {
              @for (error of thresholdsForm.high().errors(); track error.kind) {
                <li>{{ error.message }}</li>
              }
            }
          </ul>
        </div>

        <div class="col-span-2 flex flex-wrap items-center gap-3">
          <button type="submit" class="btn btn-primary" [disabled]="thresholdsForm().invalid()">Apply thresholds</button>
          <p role="status" class="text-sm text-muted">{{ applied() ? 'Thresholds applied' : 'Changes not applied yet' }}</p>
        </div>
      </form>

      <h2 class="mt-10 text-base font-semibold">Simulation</h2>
      <p class="mt-1 text-sm text-muted">
        Cause a sudden loss of generation. The frequency falls towards 49.4 Hz, then recovers within about 30 seconds.
      </p>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" class="btn btn-secondary" [disabled]="disturbance() === 'sending'" (click)="triggerDisturbance()">
          {{ disturbance() === 'sending' ? 'Triggering…' : 'Trigger disturbance' }}
        </button>
        <p role="status" class="text-sm">
          @switch (disturbance()) {
            @case ('sent') { <span class="text-muted">Disturbance triggered. Watch the chart.</span> }
            @case ('error') { <span class="text-crit">Could not reach the backend. Is it running?</span> }
          }
        </p>
      </div>
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
