
export function formatCount(count: number): string {
  if (count <= 1000) {
    return count.toString();
  }
  const step = Math.max(1000, Math.pow(10, Math.floor(Math.log10(count)) - 1));
  const rounded = Math.floor(count / step) * step;
  if (rounded < count) {
    return `${rounded}+`;
  }
  return rounded.toString();
}

export function formatSize(size: number): string {
  let units = ["B", "KB", "MB", "GB", "TB"];
  let degree = 0;
  while (size > 1024) {
    size /= 1024;
    degree++;
  }
  let formated = size.toFixed(2);
  return `${formated} ${units[degree]}`;
}

export function formatHits(hits: number): string {
  let units = ["", "K", "M", "B", "T"];
  let degree = 0;
  while (hits > 1000) {
    hits /= 1000;
    degree++;
  }
  let unit = units[degree];
  if (!unit.length) {
    return hits.toString();
  }
  let formated = hits.toFixed(1);
  return `${formated}${unit}`;
}

