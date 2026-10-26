import { DestroyRef, Service, inject, signal } from '@angular/core';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { FrequencySample } from './frequency-sample';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

const RECENT_SAMPLE_COUNT = 240; // 2 minutes at one sample per 500 ms
const RETRY_DELAY_MS = 3000;

/**
 * The only place that knows about SignalR. Everything else reads the read-only signals below.
 */
@Service()
export class FrequencyStream {
  private readonly _latest = signal<FrequencySample | null>(null);
  private readonly _recent = signal<readonly FrequencySample[]>([]);
  private readonly _status = signal<ConnectionStatus>('connecting');
  private stopped = false;

  readonly latest = this._latest.asReadonly();
  readonly recent = this._recent.asReadonly();
  readonly status = this._status.asReadonly();

  private readonly connection = new HubConnectionBuilder()
    .withUrl('/hubs/frequency')
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  constructor() {
    this.connection.on('sample', (sample: FrequencySample) => {
      this._latest.set(sample);
      this._recent.update((recent) => [...recent.slice(-(RECENT_SAMPLE_COUNT - 1)), sample]);
    });
    this.connection.onreconnecting(() => this._status.set('reconnecting'));
    this.connection.onreconnected(() => this._status.set('connected'));
    // Automatic reconnect gives up after a few attempts; then we start over ourselves.
    this.connection.onclose(() => {
      this._status.set('disconnected');
      void this.start();
    });

    inject(DestroyRef).onDestroy(() => {
      this.stopped = true;
      void this.connection.stop();
    });

    void this.start();
  }

  /** Retries until the first connection succeeds (automatic reconnect only covers lost connections). */
  private async start(): Promise<void> {
    while (!this.stopped) {
      try {
        this._status.set('connecting');
        await this.connection.start();
        this._status.set('connected');
        return;
      } catch {
        this._status.set('disconnected');
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
}
