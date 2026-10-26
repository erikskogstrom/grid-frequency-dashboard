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
    <div class="mx-auto max-w-5xl p-4 sm:p-8">
      <header class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Nordic grid frequency</h1>
          <p class="text-sm text-slate-600">Simulated data, nominal 50 Hz</p>
        </div>
        <p role="status" class="text-sm text-slate-700">Connection: {{ connection() }}</p>
      </header>

      <main class="grid gap-4 lg:grid-cols-3">
        <app-frequency-gauge />

        <div class="lg:col-span-2">
          @defer (on idle) {
            <app-frequency-chart />
          } @placeholder {
            <div class="h-72 rounded-xl bg-white p-6 text-sm text-slate-600 ring-1 ring-slate-200">Loading chart…</div>
          }
        </div>

        <div class="lg:col-span-2"><app-history /></div>
        <app-settings />
      </main>
    </div>
  `,
})
export class Dashboard {
  protected readonly connection = inject(FrequencyStream).status;
}
