import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from './components';
import { fft } from './utility';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [FormsModule, ChartComponent],
})
export class AppComponent {
  readonly timeReal = signal<string>('');
  readonly timeImag = signal<string>('');

  readonly timeData = computed(() => {
    const real =
      (this.timeReal().trimEnd() || undefined)?.split('\n').map(Number) ?? [];
    const imag =
      (this.timeImag().trimEnd() || undefined)?.split('\n').map(Number) ?? [];

    return new Array(Math.max(real.length, imag.length))
      .fill(0)
      .map((_, i) => [real[i] ?? 0, imag[i] ?? 0]);
  });

  readonly timeMagn = computed(() =>
    this.timeData().map(([r, i]) => Math.sqrt(r ** 2 + i ** 2)),
  );

  readonly freqData = computed(() => {
    const timeData = this.timeData();
    if (!timeData.length) {
      return [];
    }

    const n = 2 ** Math.ceil(Math.log2(timeData.length));

    return fft(timeData, n).map(x => [x[0] / n, x[1] / n]);
  });

  readonly freqReal = computed(() => this.freqData().map(x => x[0]));
  readonly freqImag = computed(() => this.freqData().map(x => x[1]));

  readonly freqMagn = computed(() =>
    this.freqData().map(x => Math.sqrt(x[0] ** 2 + x[1] ** 2)),
  );

  readonly cursor = signal<number | undefined>(undefined);

  constructor() {
    effect(() => console.log(this.cursor()));
  }
}
