import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from './components';
import { SelectAllDirective } from './directives';
import { fft } from './utility';

const EPSILON = 1e-10;
const fix = (x: number): number => (x > -EPSILON && x < EPSILON ? 0 : x);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [SelectAllDirective, FormsModule, ChartComponent],
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

  readonly timeAmpl = computed(() =>
    this.timeData().map(([r, i]) => Math.sqrt(r ** 2 + i ** 2)),
  );

  readonly freqData = computed(() => {
    const timeData = this.timeData();
    if (!timeData.length) {
      return [];
    }

    const n = 2 ** Math.ceil(Math.log2(timeData.length));

    return fft(timeData, n).map(x => [fix(x[0] / n), fix(x[1] / n)]);
  });

  readonly freqReal = computed(() => this.freqData().map(x => x[0]));
  readonly freqImag = computed(() => this.freqData().map(x => x[1]));

  readonly freqAmpl = computed(() =>
    this.freqData().map(x => Math.sqrt(x[0] ** 2 + x[1] ** 2)),
  );
}
