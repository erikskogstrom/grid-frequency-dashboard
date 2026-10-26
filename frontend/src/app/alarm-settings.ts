import { Service, signal } from '@angular/core';
import { Thresholds } from './frequency-status';

/** The alarm thresholds currently in effect. Written by settings/, read by the gauge, chart and history. */
@Service()
export class AlarmSettings {
  private readonly _thresholds = signal<Thresholds>({ low: 49.9, high: 50.1 });

  readonly thresholds = this._thresholds.asReadonly();

  apply(thresholds: Thresholds): void {
    this._thresholds.set(thresholds);
  }
}
