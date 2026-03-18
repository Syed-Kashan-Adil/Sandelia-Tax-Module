import { IPP_2026 } from '../constants'
import type { SelfEmployedStatus, SocialContributionsBreakdown } from '../types'
import { clampNonNegative, roundToCents } from './money'

function minPerQuarterForStatus(status: SelfEmployedStatus): number {
  const m = IPP_2026.socialContributions.minimumsPerQuarter
  if (status === 'main') return m.main
  if (status === 'complementary') return m.secondary
  if (status === 'article37') return m.article37
  if (status === 'assisting-spouse-maxi') return m.assistingSpouseMaxi
  if (status === 'active-pensioner') return m.activeRetired
  if (status === 'student') return m.student
  return m.secondary
}

function applyManagementFee(legalAnnual: number): number {
  const rate = IPP_2026.socialContributions.managementFeeRate ?? 0
  return roundToCents(clampNonNegative(legalAnnual) * (1 + rate))
}

function computeLegalAnnualContribution(params: {
  status: SelfEmployedStatus
  annualNetIncome: number
}): number {
  const income = roundToCents(clampNonNegative(params.annualNetIncome))
  const { boundaries, rates } = IPP_2026.socialContributions

  // Active retired: 0 up to b0, then 14.70% then 14.16%
  if (params.status === 'active-pensioner') {
    if (income <= boundaries.b0) return 0
    const band1 = clampNonNegative(Math.min(income, boundaries.b2) - boundaries.b0)
    const band2 = clampNonNegative(Math.min(income, boundaries.b3) - boundaries.b2)
    return roundToCents(
      band1 * rates.activeRetiredRateFirst + band2 * rates.activeRetiredRateHighBand
    )
  }

  // Article 37: min up to b0; 20.50% between b0 and switch; above switch -> principal
  if (params.status === 'article37') {
    if (income <= boundaries.b0) {
      return roundToCents(minPerQuarterForStatus('article37') * 4)
    }
    if (income > boundaries.article37Switch) {
      return computeLegalAnnualContribution({ status: 'main', annualNetIncome: income })
    }
    const taxable = clampNonNegative(income - boundaries.b0)
    const legal = taxable * rates.rateMain
    const minAnnual = minPerQuarterForStatus('article37') * 4
    return roundToCents(Math.max(minAnnual, legal))
  }

  // Assisting spouse maxi: min up to assistingSpouseMinBand, then 20.50% up to b2 and 14.16% up to b3
  if (params.status === 'assisting-spouse-maxi') {
    if (income <= boundaries.assistingSpouseMinBand) {
      return roundToCents(minPerQuarterForStatus('assisting-spouse-maxi') * 4)
    }
    const band1 = clampNonNegative(
      Math.min(income, boundaries.b2) - boundaries.assistingSpouseMinBand
    )
    const band2 = clampNonNegative(Math.min(income, boundaries.b3) - boundaries.b2)
    const legal = band1 * rates.rateMain + band2 * rates.rateHighBand
    const minAnnual = minPerQuarterForStatus('assisting-spouse-maxi') * 4
    return roundToCents(Math.max(minAnnual, legal))
  }

  // Principal vs Secondary/Student
  const minThreshold = params.status === 'main' ? boundaries.b1 : boundaries.b0

  const minAnnual = minPerQuarterForStatus(params.status) * 4

  if (income <= minThreshold) return roundToCents(minAnnual)

  const band1From = minThreshold
  const band1 = clampNonNegative(Math.min(income, boundaries.b2) - band1From)
  const band2 = clampNonNegative(Math.min(income, boundaries.b3) - boundaries.b2)
  const legal = band1 * rates.rateMain + band2 * rates.rateHighBand

  return roundToCents(Math.max(minAnnual, legal))
}

export function computeSocialContributions(params: {
  status: SelfEmployedStatus
  annualNetIncome: number
  overrideAnnualAmount: number | null
}): SocialContributionsBreakdown {
  const baseIncome = roundToCents(clampNonNegative(params.annualNetIncome))

  if (
    typeof params.overrideAnnualAmount === 'number' &&
    Number.isFinite(params.overrideAnnualAmount)
  ) {
    const annualAmount = roundToCents(clampNonNegative(params.overrideAnnualAmount))
    return {
      status: params.status,
      baseIncome,
      annualAmount,
      quarterlyAmount: roundToCents(annualAmount / 4),
      method: 'override',
    }
  }

  const legalAnnual = computeLegalAnnualContribution({
    status: params.status,
    annualNetIncome: baseIncome,
  })
  const annualAmount = applyManagementFee(legalAnnual)
  return {
    status: params.status,
    baseIncome,
    annualAmount,
    quarterlyAmount: roundToCents(annualAmount / 4),
    method: 'calculated',
  }
}
