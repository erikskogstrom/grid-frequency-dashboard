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
      <header class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div>
          <h1 class="text-xl font-semibold">Nordic grid frequency</h1>
          <p class="text-sm text-muted">Simulated data · nominal 50 Hz</p>
        </div>

        <p role="status" class="flex items-center gap-2 text-sm">
          @switch (connection()) {
            @case ('connected') {
              <span class="size-2 rounded-full bg-ok" aria-hidden="true"></span> Live
            }
            @case ('connecting') {
              <span class="size-2 rounded-full bg-warn motion-safe:animate-pulse" aria-hidden="true"></span> Connecting…
            }
            @case ('reconnecting') {
              <span class="size-2 rounded-full bg-warn motion-safe:animate-pulse" aria-hidden="true"></span> Reconnecting…
            }
            @case ('disconnected') {
              <span class="size-2 rounded-full bg-crit" aria-hidden="true"></span> Disconnected
            }
          }
        </p>
      </header>

      <main class="mt-6 flex flex-col gap-8">
        <!-- The one framed surface: the live readout and its chart belong together. -->
        <div class="grid overflow-hidden rounded-xl border border-line bg-panel lg:grid-cols-[17rem_1fr]">
          <app-frequency-gauge class="border-b border-line lg:border-r lg:border-b-0" />

          @defer (on idle) {
            <app-frequency-chart />
          } @placeholder {
            <div class="flex min-h-80 items-center justify-center text-sm text-muted">Loading chart…</div>
          }
        </div>

        <div class="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-12">
          <app-history />
          <app-settings />
        </div>
      </main>
    </div>
  `,
})
export class Dashboard {
  protected readonly connection = inject(FrequencyStream).status;
}
