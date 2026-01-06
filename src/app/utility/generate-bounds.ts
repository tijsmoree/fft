export function generateBounds(
  data: number[],
  maxTicks = 10,
): { min: number; max: number; ticks: number[] } {
  let min = Infinity;
  let max = -Infinity;
  for (const d of data) {
    min = d < min ? d : min;
    max = d > max ? d : max;
  }
  max = max + 0.01 * (max - min);

  const rangeRaw = max - min;

  if (rangeRaw === 0) {
    return { min: min - 1, max: max + 1, ticks: [] };
  }

  const rawSpacing = rangeRaw / (maxTicks - 1);

  const exponent = Math.floor(Math.log10(rawSpacing));
  const fraction = rawSpacing / 10 ** exponent;

  const niceFraction =
    fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;

  const niceSpacing = niceFraction * 10 ** exponent;

  const niceMin = Math.floor(min / niceSpacing) * niceSpacing;
  const niceMax = Math.ceil(max / niceSpacing) * niceSpacing;

  return {
    min: niceMin,
    max: niceMax,
    ticks: new Array(Math.round((niceMax - niceMin) / niceSpacing) - 1)
      .fill(0)
      .map((_, i) => niceMin + (i + 1) * niceSpacing),
  };
}

export function generateLogarithmicBounds(
  data: number[],
  maxTicks = 5,
): {
  min: number;
  max: number;
  ticks: number[];
} {
  let min = Infinity;
  let max = -Infinity;
  for (const d of data) {
    min = d > 0 && d < min ? d : min;
    max = d > 0 && d > max ? d : max;
  }

  const niceMax = 10 ** Math.ceil(Math.log10(max));

  const factor = Math.min(maxTicks, Math.ceil(Math.log10(max / min)));

  return {
    max: niceMax,
    min: niceMax / 10 ** factor,
    ticks: new Array(factor)
      .fill(0)
      .flatMap((_, i) => [1, 0.5].map(x => niceMax * x * 10 ** -i)),
  };
}
