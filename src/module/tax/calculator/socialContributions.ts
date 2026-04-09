import { IPP_2026 } from '../constants'
import type {
  SelfEmployedStatus,
  SocialContributionsBreakdown,
  TaxOnboardingValues,
} from '../types'
import { clampNonNegative, roundToCents } from './money'

export function socialFundFeeRate(fund: TaxOnboardingValues['socialInsuranceFund']): number {
  const rates = IPP_2026.socialContributions.fundFeeRates
  return rates[fund] ?? rates.other
}

/** Legal annual contribution before fund fees: 20.5% up to b2, 14.16% from b2 to b3 (capped). */
function standardTwoBandLegal(income: number): number {
  const { b2, b3 } = IPP_2026.socialContributions.boundaries
  const { rateMain, rateHighBand } = IPP_2026.socialContributions.rates
  const inc = roundToCents(clampNonNegative(income))
  if (inc <= b2) return roundToCents(inc * rateMain)
  const first = b2 * rateMain
  const second = clampNonNegative(Math.min(inc, b3) - b2) * rateHighBand
  return roundToCents(first + second)
}

/**
 * Main self-employed (Partena-style): minimum base only while income ≤ b1; above b1 up to b2,
 * full income × 20.5% (no max against minimum — see Partena table).
 */
function legalMainSelfEmployed(income: number): number {
  const { b1, b2 } = IPP_2026.socialContributions.boundaries
  const { rateMain } = IPP_2026.socialContributions.rates
  const m = IPP_2026.socialContributions.minimumBaseAnnual
  const inc = roundToCents(clampNonNegative(income))
  if (inc <= b1) return m.main
  if (inc <= b2) return roundToCents(inc * rateMain)
  return standardTwoBandLegal(inc)
}

/** Secondary: minimum only while income ≤ b0; then same proportional rules as main up to b2. */
function legalSecondarySelfEmployed(income: number): number {
  const { b0, b2 } = IPP_2026.socialContributions.boundaries
  const { rateMain } = IPP_2026.socialContributions.rates
  const m = IPP_2026.socialContributions.minimumBaseAnnual
  const inc = roundToCents(clampNonNegative(income))
  if (inc <= b0) return m.secondary
  if (inc <= b2) return roundToCents(inc * rateMain)
  return standardTwoBandLegal(inc)
}

function legalAssistingSpouseMaxi(income: number): number {
  const { b2, assistingSpouseMaxiUpToIncome } = IPP_2026.socialContributions.boundaries
  const { rateMain } = IPP_2026.socialContributions.rates
  const m = IPP_2026.socialContributions.minimumBaseAnnual
  const inc = roundToCents(clampNonNegative(income))
  if (inc <= assistingSpouseMaxiUpToIncome) return m.assistingSpouseMaxi
  if (inc <= b2) return roundToCents(inc * rateMain)
  return standardTwoBandLegal(inc)
}

function pensionerLegal(income: number): number {
  const { b2, b3 } = IPP_2026.socialContributions.boundaries
  const { pensionerLow, pensionerHigh } = IPP_2026.socialContributions.rates
  const inc = roundToCents(clampNonNegative(income))
  if (inc <= b2) return roundToCents(inc * pensionerLow)
  const first = b2 * pensionerLow
  const second = clampNonNegative(Math.min(inc, b3) - b2) * pensionerHigh
  return roundToCents(first + second)
}

function assistingSpouseMiniLegal(income: number): number {
  const { b3 } = IPP_2026.socialContributions.boundaries
  const { assistingSpouseMiniFirstBandEnd, assistingSpouseMiniSecondBandStart } =
    IPP_2026.socialContributions.boundaries
  const { assistingSpouseMiniLow, assistingSpouseMiniHigh } = IPP_2026.socialContributions.rates
  const inc = roundToCents(clampNonNegative(income))
  if (inc <= assistingSpouseMiniFirstBandEnd) {
    return roundToCents(inc * assistingSpouseMiniLow)
  }
  const first = assistingSpouseMiniFirstBandEnd * assistingSpouseMiniLow
  const second =
    clampNonNegative(Math.min(inc, b3) - assistingSpouseMiniSecondBandStart) *
    assistingSpouseMiniHigh
  return roundToCents(first + second)
}

function studentLegal(income: number, exempt: boolean): number {
  const m = IPP_2026.socialContributions.minimumBaseAnnual
  const { studentZone1Max, studentZone2Max } = IPP_2026.socialContributions.boundaries
  const { rateMain } = IPP_2026.socialContributions.rates
  const inc = roundToCents(clampNonNegative(income))
  if (inc <= studentZone1Max) {
    if (exempt) return 0
    return m.student
  }
  if (inc <= studentZone2Max) {
    const slice = clampNonNegative(inc - studentZone1Max)
    const calc = slice * rateMain
    return roundToCents(Math.max(calc, m.secondary))
  }
  return legalMainSelfEmployed(inc)
}

function computeLegalAnnualBeforeFees(params: {
  status: SelfEmployedStatus
  annualNetIncome: number
  studentExempt: boolean
}): number {
  const income = roundToCents(clampNonNegative(params.annualNetIncome))
  const { b0, article37Switch } = IPP_2026.socialContributions.boundaries
  const m = IPP_2026.socialContributions.minimumBaseAnnual

  switch (params.status) {
    case 'main':
      return legalMainSelfEmployed(income)
    case 'complementary':
      return legalSecondarySelfEmployed(income)
    case 'article37': {
      if (income <= b0) return m.article37
      if (income > article37Switch) return legalMainSelfEmployed(income)
      const { b2 } = IPP_2026.socialContributions.boundaries
      const { rateMain } = IPP_2026.socialContributions.rates
      if (income <= b2) return roundToCents(income * rateMain)
      return standardTwoBandLegal(income)
    }
    case 'assisting-spouse-maxi':
      return legalAssistingSpouseMaxi(income)
    case 'assisting-spouse-mini':
      return assistingSpouseMiniLegal(income)
    case 'active-pensioner':
      return pensionerLegal(income)
    case 'student':
      return studentLegal(income, params.studentExempt)
  }
}

export function computeSocialContributions(params: {
  status: SelfEmployedStatus
  annualNetIncome: number
  overrideAnnualAmount: number | null
  socialInsuranceFund: TaxOnboardingValues['socialInsuranceFund']
  studentSocialExemption?: boolean
}): SocialContributionsBreakdown {
  const baseIncome = roundToCents(clampNonNegative(params.annualNetIncome))
  const feeRate = socialFundFeeRate(params.socialInsuranceFund)
  const studentExempt = params.studentSocialExemption ?? false

  if (
    typeof params.overrideAnnualAmount === 'number' &&
    Number.isFinite(params.overrideAnnualAmount)
  ) {
    const annualAmount = roundToCents(clampNonNegative(params.overrideAnnualAmount))
    return {
      status: params.status,
      baseIncome,
      legalAnnualBeforeFees: annualAmount,
      fundFeeRate: 0,
      annualAmount,
      quarterlyAmount: roundToCents(annualAmount / 4),
      method: 'override',
    }
  }

  const legalAnnualBeforeFees = computeLegalAnnualBeforeFees({
    status: params.status,
    annualNetIncome: baseIncome,
    studentExempt,
  })

  const b1 = IPP_2026.socialContributions.boundaries.b1
  let annualAmount = roundToCents(legalAnnualBeforeFees * (1 + feeRate))
  let quarterlyAmount = roundToCents(annualAmount / 4)

  // Main minimum plateau: Partena table is 3,711.28 €/y (927.82 €/q), not exactly minBase × 1.042
  if (params.status === 'main' && baseIncome <= b1 && params.socialInsuranceFund === 'partena') {
    annualAmount = IPP_2026.socialContributions.publishedMainMinimumAnnualPartena
    quarterlyAmount = roundToCents(annualAmount / 4)
  }
  // Active pensioner minimum plateau (Partena) is published as a quarterly amount.
  // Keep that amount as quarterly and annualize by ×4.
  if (
    params.status === 'active-pensioner' &&
    baseIncome <= b1 &&
    params.socialInsuranceFund === 'partena'
  ) {
    quarterlyAmount = IPP_2026.socialContributions.publishedPensionerMinimumQuarterlyPartena
    annualAmount = roundToCents(quarterlyAmount * 4)
  }

  return {
    status: params.status,
    baseIncome,
    legalAnnualBeforeFees,
    fundFeeRate: feeRate,
    annualAmount,
    quarterlyAmount,
    method: 'calculated',
  }
}
