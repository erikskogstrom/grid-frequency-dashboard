import { TestBed } from '@angular/core/testing';
import { FakeFrequencyStream } from '../testing/fake-frequency-stream';
import { App } from './app';
import { FrequencyStream } from './frequency-stream';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FrequencyStream, useClass: FakeFrequencyStream }],
    });
  });

  it('renders the dashboard', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Nordic grid frequency');
    expect(el.querySelector('app-frequency-gauge')).not.toBeNull();
  });
});
