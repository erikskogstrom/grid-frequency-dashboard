import { TestBed } from '@angular/core/testing';
import { AlarmSettings } from '../alarm-settings';
import { Settings } from './settings';

describe('Settings', () => {
  async function render() {
    const fixture = TestBed.createComponent(Settings);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = (id: string) => el.querySelector<HTMLInputElement>('#' + id)!;
    const type = async (id: string, text: string) => {
      input(id).value = text;
      input(id).dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };
    const blur = async (id: string) => {
      input(id).dispatchEvent(new Event('blur'));
      await fixture.whenStable();
    };
    const click = async (label: string) => {
      [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(label))!.click();
      await fixture.whenStable();
    };
    return { el, input, type, blur, click };
  }

  it('shows the current band as two-decimal Hz', async () => {
    const { input } = await render();
    expect(input('low').value).toBe('49.90');
    expect(input('high').value).toBe('50.10');
  });

  it('accepts a comma, formats on blur and applies the band', async () => {
    const { input, type, blur, click } = await render();
    await type('low', '49,95');
    await blur('low');
    expect(input('low').value).toBe('49.95');

    await click('Apply band');
    expect(TestBed.inject(AlarmSettings).thresholds()).toEqual({ low: 49.95, high: 50.1 });
  });

  it('explains an invalid value and does not apply it', async () => {
    const { el, type, blur, click } = await render();
    await type('low', '50.5');
    await blur('low');
    expect(el.querySelector('#low-errors')?.textContent).toContain('Must be below 50 Hz.');
    expect(el.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);

    await click('Apply band');
    expect(TestBed.inject(AlarmSettings).thresholds().low).toBe(49.9);
  });

  it('resets to the defaults', async () => {
    const { input, type, click } = await render();
    await type('high', '50.2');
    await click('Apply band');
    await click('Reset to');
    expect(TestBed.inject(AlarmSettings).thresholds()).toEqual({ low: 49.9, high: 50.1 });
    expect(input('high').value).toBe('50.10');
  });
});
