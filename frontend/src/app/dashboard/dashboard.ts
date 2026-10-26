import { Component, inject } from '@angular/core';
import { FrequencyChart } from '../frequency-chart/frequency-chart';
import { FrequencyGauge } from '../frequency-gauge/frequency-gauge';
import { FrequencyStream } from '../frequency-stream';
import { History } from '../history/history';
import { Settings } from '../settings/settings';

@Component({
  selector: 'app-dashboard',
  imports: [FrequencyGauge, FrequencyChart, History, Settings],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
      <header class="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
        <div>
          <h1 class="text-xl font-semibold">Nordic grid frequency</h1>
          <p class="text-sm text-muted">Demonstration only, not for operational use</p>
        </div>

        <dl class="flex gap-x-8 text-sm">
          <div>
            <dt class="text-muted">Source</dt>
            <dd class="mt-0.5 font-medium">Simulated</dd>
          </div>
          <div>
            <dt class="text-muted">Connection</dt>
            <dd role="status" class="mt-0.5 flex items-center gap-2 font-medium" [class]="connection().text">
              @switch (connection().shape) {
                @case ('solid') { <span class="size-2.5 rounded-full bg-current" aria-hidden="true"></span> }
                @case ('ring') { <span class="size-2.5 rounded-full border-2 border-current" aria-hidden="true"></span> }
                @default { <span class="size-2.5 rounded-xs bg-current" aria-hidden="true"></span> }
              }
              {{ connection().label }}
            </dd>
          </div>
        </dl>
      </header>

      <main class="mt-6 flex flex-col gap-10">
        <app-frequency-gauge />

        @defer (on idle) {
          <app-frequency-chart />
        } @placeholder {
          <div class="flex h-72 items-center justify-center text-sm text-muted">Loading chart…</div>
        }

        <div class="grid gap-10 border-t border-line pt-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
          <app-history />
          <app-settings />
        </div>
      </main>
    </div>
  `,
})
export class Dashboard {
  private readonly status = inject(FrequencyStream).status;

  /** Connection state: a text label always, plus a shape (solid, ring, square) so colour is never the only signal. */
  protected readonly connection = () => {
    switch (this.status()) {
      case 'connected':
        return { label: 'Connected', text: 'text-ink', shape: 'solid' };
      case 'connecting':
        return { label: 'Connecting', text: 'text-warn', shape: 'ring' };
      case 'reconnecting':
        return { label: 'Reconnecting', text: 'text-warn', shape: 'ring' };
      case 'disconnected':
        return { label: 'Disconnected', text: 'text-crit', shape: 'square' };
    }
  };
}
