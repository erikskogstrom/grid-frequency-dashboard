import { signal } from '@angular/core';
import { ConnectionStatus } from '../app/frequency-stream';
import { FrequencySample } from '../app/frequency-sample';

/** Stand-in for FrequencyStream in tests: no SignalR, the test sets the signals directly. */
export class FakeFrequencyStream {
  readonly latest = signal<FrequencySample | null>(null);
  readonly recent = signal<readonly FrequencySample[]>([]);
  readonly status = signal<ConnectionStatus>('connected');
}
