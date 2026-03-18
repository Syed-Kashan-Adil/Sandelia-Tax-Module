import type { TaxOnboardingValues } from '../types'
import { clampNonNegative, roundToCents } from './money'

export type ProfitEstimationMode = 'manual' | 'automatic-extrapolation' | 'conservative' | 'unknown'

export function monthsSinceStart(activityStartDateIso: string): number {
  const start = new Date(activityStartDateIso)
  if (Number.isNaN(start.getTime())) return 12

  const now = new Date()
  const yearDiff = now.getFullYear() - start.getFullYear()
  const monthDiff = now.getMonth() - start.getMonth()
  const months = yearDiff * 12 + monthDiff + 1 // inclusive month count
  return Math.min(12, Math.max(1, months))
}

export function computeEstimatedAnnualProfessionalIncome(values: TaxOnboardingValues): number {
  const mode: ProfitEstimationMode = values.profitEstimationMode ?? 'manual'
  const manual = roundToCents(clampNonNegative(values.estimatedSelfEmployedProfit))

  if (mode === 'unknown') return 0

  if (mode === 'conservative') {
    // A cautious discount factor for simulation (can be made configurable later).
    return roundToCents(manual * 0.85)
  }

  if (mode === 'automatic-extrapolation') {
    const ytd = roundToCents(clampNonNegative(values.ytdProfessionalIncome))
    const months = monthsSinceStart(values.activityStartDate)
    return roundToCents((ytd * 12) / months)
  }

  return manual
}
