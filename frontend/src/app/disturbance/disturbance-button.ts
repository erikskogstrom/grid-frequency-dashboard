import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Triggers the simulated disturbance. Lives next to the chart, so the cause and its effect are visible together. */
@Component({
  selector: 'app-disturbance-button',
  template: `
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        class="btn btn-secondary"
        title="Simulates a sudden loss of generation"
        aria-describedby="disturbance-hint"
        [disabled]="state() === 'sending'"
        (click)="trigger()"
      >
        {{ state() === 'sending' ? 'Triggering…' : 'Trigger disturbance' }}
      </button>
      <p role="status" class="text-sm">
        @switch (state()) {
          @case ('sent') { <span class="text-muted">Disturbance triggered</span> }
          @case ('error') { <span class="text-crit">Could not reach the backend. Is it running?</span> }
        }
      </p>
    </div>
    <p id="disturbance-hint" class="sr-only">
      Simulates a sudden loss of generation. The frequency falls towards 49.4 Hz and recovers within about 30 seconds.
    </p>
  `,
})
export class DisturbanceButton {
  private readonly http = inject(HttpClient);

  protected readonly state = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');

  protected async trigger(): Promise<void> {
    this.state.set('sending');
    try {
      await firstValueFrom(this.http.post('/api/disturbance', null));
      this.state.set('sent');
    } catch {
      this.state.set('error');
    }
  }
}
