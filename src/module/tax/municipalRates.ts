export const MUNICIPAL_SURCHARGE_RATES: Record<string, number> = {
  // Example explicitly referenced in the provided document.
  overijse: 0.073,

  // A few common municipalities (illustrative). Extend with your real table/API.
  brussels: 0.07,
  antwerp: 0.075,
  gent: 0.075,
  leuven: 0.075,
}

export function normalizeMunicipalityName(input: string): string {
  return input.trim().toLowerCase()
}

export function resolveMunicipalRate(params: { municipality: string; override: number | null }): {
  rate: number
  source: 'override' | 'lookup' | 'default'
} {
  if (typeof params.override === 'number' && Number.isFinite(params.override)) {
    return { rate: params.override, source: 'override' }
  }

  const key = normalizeMunicipalityName(params.municipality)
  const rate = MUNICIPAL_SURCHARGE_RATES[key]
  if (typeof rate === 'number') return { rate, source: 'lookup' }

  // Reasonable fallback so the summary can still compute; UI will surface that it's a default.
  return { rate: 0.07, source: 'default' }
}
