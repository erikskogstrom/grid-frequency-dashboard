import { Component, input } from '@angular/core';
import { FrequencyStatus } from '../frequency-status';

/**
 * Status as a shape, so it never depends on colour alone (signage grammar):
 * circle with check = normal, triangle = outside the normal band, octagon = critical.
 * No status yet is a dashed circle. Size it from the outside; colour comes from currentColor.
 */
@Component({
  selector: 'app-status-icon',
  host: { class: 'inline-block' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-full">
      @switch (status()) {
        @case ('normal') {
          <circle cx="12" cy="12" r="9.5" />
          <path d="M7.5 12.5l3 3 6-6.5" />
        }
        @case ('outside') {
          <path d="M12 3.5 22 20.5H2z" />
          <path d="M12 10v4.5M12 17.5v.01" />
        }
        @case ('critical') {
          <path d="M8.2 2.5h7.6l5.7 5.7v7.6l-5.7 5.7H8.2L2.5 15.8V8.2z" fill="currentColor" />
          <path d="M12 7v6.5M12 16.8v.01" class="stroke-panel" />
        }
        @default {
          <circle cx="12" cy="12" r="9.5" stroke-dasharray="3 3.5" />
        }
      }
    </svg>
  `,
})
export class StatusIcon {
  readonly status = input.required<FrequencyStatus | null>();
}
