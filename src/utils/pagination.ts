// src/utils/pagination.ts
export function buildPageRange(
  current: number,
  total: number
): Array<number | "…"> {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let p = current - 1; p <= current + 1; p += 1) {
    if (p >= 1 && p <= total) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const p = sorted[i];
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  }
  return out;
}
