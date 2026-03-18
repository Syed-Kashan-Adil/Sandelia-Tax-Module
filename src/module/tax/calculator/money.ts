export function clampNonNegative(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

export function roundToCents(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
