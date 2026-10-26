import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, required, submit, validate } from '@angular/forms/signals';
import { AlarmSettings, DEFAULT_THRESHOLDS } from '../alarm-settings';
import { NOMINAL_HZ } from '../frequency-status';
import { formatHz, parseHz } from '../parse-hz';

const RANGE_MIN = 49.0;
const RANGE_MAX = 51.0;

type Key = 'low' | 'high';

@Component({
  selector: 'app-settings',
  imports: [FormField],
  template: `
    <section aria-labelledby="settings-title">
      <h2 id="settings-title" class="text-base font-semibold">Normal band</h2>
      <p class="mt-1 text-sm text-muted">Frequency outside this band is shown as outside the normal band. Critical limits are fixed at 49.50 and 50.50 Hz.</p>

      <form class="mt-5 grid grid-cols-2 gap-4" (submit)="save($event)">
        <div>
          <label for="low" class="block text-sm font-medium">Low limit (Hz)</label>
          <input
            id="low"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            class="field mt-1.5"
            [formField]="thresholdsForm.low"
            [attr.aria-invalid]="thresholdsForm.low().invalid()"
            aria-describedby="low-errors"
            (blur)="format('low')"
          />
          <ul id="low-errors" class="mt-1.5 text-sm text-crit">
            @if (thresholdsForm.low().touched() || thresholdsForm.low().dirty()) {
              @for (error of thresholdsForm.low().errors(); track error.kind) {
                <li>{{ error.message }}</li>
              }
            }
          </ul>
        </div>

        <div>
          <label for="high" class="block text-sm font-medium">High limit (Hz)</label>
          <input
            id="high"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            class="field mt-1.5"
            [formField]="thresholdsForm.high"
            [attr.aria-invalid]="thresholdsForm.high().invalid()"
            aria-describedby="high-errors"
            (blur)="format('high')"
          />
          <ul id="high-errors" class="mt-1.5 text-sm text-crit">
            @if (thresholdsForm.high().touched() || thresholdsForm.high().dirty()) {
              @for (error of thresholdsForm.high().errors(); track error.kind) {
                <li>{{ error.message }}</li>
              }
            }
          </ul>
        </div>

        <div class="col-span-2 flex flex-wrap items-center gap-3">
          <button type="submit" class="btn btn-primary" [disabled]="thresholdsForm().invalid()">Apply band</button>
          <button type="button" class="btn btn-secondary" [disabled]="isDefault()" (click)="reset()">Reset to 49.90–50.10</button>
          <p role="status" class="text-sm text-muted">{{ applied() ? 'Band applied' : 'Changes not applied yet' }}</p>
        </div>
      </form>
    </section>
  `,
})
export class Settings {
  private readonly alarms = inject(AlarmSettings);

  // The form edits this local text model. Only valid values are parsed and copied to AlarmSettings on submit.
  private readonly model = signal({
    low: formatHz(this.alarms.thresholds().low),
    high: formatHz(this.alarms.thresholds().high),
  });

  protected readonly thresholdsForm = form(this.model, (path) => {
    required(path.low, { message: 'Enter a low limit, for example 49.90.' });
    validate(path.low, ({ value }) => this.check(value(), (hz) => (hz < NOMINAL_HZ ? null : `Must be below ${NOMINAL_HZ} Hz.`)));

    required(path.high, { message: 'Enter a high limit, for example 50.10.' });
    validate(path.high, ({ value }) => this.check(value(), (hz) => (hz > NOMINAL_HZ ? null : `Must be above ${NOMINAL_HZ} Hz.`)));
  });

  protected readonly applied = computed(() => {
    const { low, high } = this.alarms.thresholds();
    return parseHz(this.model().low) === low && parseHz(this.model().high) === high;
  });

  protected readonly isDefault = computed(
    () =>
      this.applied() &&
      this.alarms.thresholds().low === DEFAULT_THRESHOLDS.low &&
      this.alarms.thresholds().high === DEFAULT_THRESHOLDS.high,
  );

  /** Shared checks for both fields: a number, within 49.0 to 51.0 Hz, then the field's own rule. */
  private check(text: string, rule: (hz: number) => string | null) {
    if (text.trim() === '') {
      return null; // required() reports the empty field
    }
    const hz = parseHz(text);
    if (Number.isNaN(hz)) {
      return { kind: 'number', message: 'Enter a number in Hz, for example 49.90.' };
    }
    if (hz < RANGE_MIN || hz > RANGE_MAX) {
      return { kind: 'range', message: `Must be between ${RANGE_MIN.toFixed(1)} and ${RANGE_MAX.toFixed(1)} Hz.` };
    }
    const message = rule(hz);
    return message ? { kind: 'side', message } : null;
  }

  /** On blur, show a valid value as two decimals with a dot, whatever the user typed. */
  protected format(key: Key): void {
    const hz = parseHz(this.model()[key]);
    if (!Number.isNaN(hz)) {
      this.model.update((m) => ({ ...m, [key]: formatHz(hz) }));
    }
  }

  protected save(event: Event): void {
    event.preventDefault();
    // submit() marks all fields as touched (so errors show) and only runs the action if the form is valid.
    void submit(this.thresholdsForm, async () => {
      const { low, high } = this.model();
      this.alarms.apply({ low: parseHz(low), high: parseHz(high) });
      this.format('low');
      this.format('high');
    });
  }

  protected reset(): void {
    this.alarms.apply({ ...DEFAULT_THRESHOLDS });
    this.model.set({ low: formatHz(DEFAULT_THRESHOLDS.low), high: formatHz(DEFAULT_THRESHOLDS.high) });
  }
}
