const exponentCache: Record<number, number[]> = {};
function compExp(x: number): number[] {
  if (!(x in exponentCache)) {
    const c = -2 * Math.PI * x;

    exponentCache[x] = [Math.cos(c), Math.sin(c)];
  }
  return exponentCache[x];
}

export function fft(x: number[][], n: number): number[][] {
  if (n === 1) {
    return x;
  }

  const x0 = new Array<number[]>(n / 2);
  const x1 = new Array<number[]>(n / 2);
  for (let i = 0; i < n / 2; i++) {
    x0[i] = x[i * 2] ?? [0, 0];
    x1[i] = x[i * 2 + 1] ?? [0, 0];
  }

  const y0 = fft(x0, n / 2);
  const y1 = fft(x1, n / 2);

  const y = new Array<number[]>(n);
  for (let k = 0; k < n / 2; k++) {
    const a = y0[k];
    const b = y1[k];

    const r = compExp(k / n);

    const e = [r[0] * b[0] - r[1] * b[1], r[0] * b[1] + r[1] * b[0]];

    y[k] = [a[0] + e[0], a[1] + e[1]];
    y[k + n / 2] = [a[0] - e[0], a[1] - e[1]];
  }

  return y;
}
