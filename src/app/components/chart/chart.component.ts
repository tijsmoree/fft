import { DecimalPipe } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  generateBounds,
  generateLogarithmicBounds,
  invlerp,
  lerp,
} from '@app/utility';

const BASE = 'white';
const INDICATOR = 'yellow';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  private readonly canvas =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  readonly INDICATOR = INDICATOR;

  readonly width = input.required<number>();
  readonly height = input.required<number>();

  readonly data = input.required<number[]>();

  readonly fourier = input(false, { transform: booleanAttribute });

  readonly selection = computed(() =>
    this.fourier()
      ? this.data()
          .slice(0, this.data().length / 2 + 1)
          .map((x, i) => (i === 0 || i === this.data().length / 2 ? 1 : 2) * x)
      : this.data(),
  );

  readonly bounds = computed(() =>
    this.fourier()
      ? generateLogarithmicBounds(this.selection())
      : generateBounds(this.selection()),
  );

  readonly cursor = signal<[number, number] | undefined>(undefined);

  readonly hovering = signal(false);

  constructor() {
    effect(() => {
      const canvas = this.canvas().nativeElement;

      canvas.width = this.width();
      canvas.height = this.height();

      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);

        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.strokeStyle = BASE;

        untracked(() => this.draw());
      }
    });

    effect(() => this.draw());
  }

  @HostListener('mouseenter')
  mouseenter(): void {
    this.hovering.set(true);
  }

  @HostListener('mouseleave')
  mouseleave(): void {
    this.hovering.set(false);
  }

  click(x: number, y: number): void {
    const { min, max } = this.bounds();

    const yFraction = invlerp(this.height(), 0, y);
    const xFraction = invlerp(0, this.width(), x);

    if (this.fourier()) {
      this.cursor.set([
        xFraction / 2,
        10 ** lerp(Math.log10(min), Math.log10(max), yFraction),
      ]);
    } else {
      this.cursor.set([xFraction, lerp(min, max, yFraction)]);
    }
  }

  private draw(): void {
    const ctx = this.canvas().nativeElement.getContext('2d');
    const data = this.selection();

    const cursor = this.cursor();
    const hovering = this.hovering();

    if (ctx) {
      const width = this.width();
      const height = this.height();

      ctx.clearRect(0, 0, width, height);

      if (data.length < 2) return;

      const { min, max, ticks } = this.bounds();

      const i2px = (i: number) =>
        lerp(0, width, invlerp(0, data.length - 1, i));
      const t2px = (t: number) =>
        lerp(0, this.fourier() ? 2 * width : width, t);
      const x2px = this.fourier()
        ? (x: number) =>
            x <= 0
              ? -height
              : lerp(
                  0,
                  height,
                  invlerp(Math.log(min), Math.log(max), Math.log(x)),
                )
        : (x: number) => lerp(0, height, invlerp(min, max, x));

      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      for (const tick of ticks) {
        ctx.moveTo(0, x2px(tick));
        ctx.lineTo(width, x2px(tick));
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        ctx.lineTo(i2px(i), x2px(data[i]));
      }
      ctx.stroke();

      if (hovering) {
        const radius = 5;

        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          ctx.moveTo(i2px(i) + radius, x2px(data[i]));
          ctx.arc(i2px(i), x2px(data[i]), radius, 0, 2 * Math.PI);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (cursor != null) {
        ctx.strokeStyle = INDICATOR;
        ctx.beginPath();
        ctx.moveTo(0, x2px(cursor[1]));
        ctx.lineTo(width, x2px(cursor[1]));
        ctx.moveTo(t2px(cursor[0]), 0);
        ctx.lineTo(t2px(cursor[0]), height);
        ctx.stroke();
        ctx.strokeStyle = BASE;
      }
    }
  }
}
