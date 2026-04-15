import type {
  CompanySocialContributionBreakdown,
  CompanyTaxSummary,
  TaxOnboardingValues,
} from '../types'
import { clampNonNegative, roundToCents } from './money'
import { computeSocialContributions } from './socialContributions'

const REDUCED_RATE_LIMIT = 100000
const REDUCED_RATE = 0.2
const STANDARD_RATE = 0.25
const THEORETICAL_INCREASE_RATE = 0.0675

function getAdvancePayments(values: TaxOnboardingValues) {
  const annual = roundToCents(clampNonNegative(values.advanceTaxPayments))
  if (annual <= 0 || values.advanceTaxPaymentsMode === 'none') {
    return { vai1: 0, vai2: 0, vai3: 0, vai4: 0 }
  }

  if (values.advanceTaxPaymentsMode === 'spread') {
    const q = roundToCents(annual / 4)
    const diff = roundToCents(annual - (q + q + q + q))
    return {
      vai1: roundToCents(q + diff),
      vai2: q,
      vai3: q,
      vai4: q,
    }
  }

  // optimize
  return { vai1: annual, vai2: 0, vai3: 0, vai4: 0 }
}

function computeDirectorSocial(values: TaxOnboardingValues): {
  rows: CompanySocialContributionBreakdown[]
  total: number
} {
  const rows = values.companyDirectors.map((director) => {
    const annualIncomeBase = roundToCents(
      clampNonNegative(director.monthlySalary) * 12 + clampNonNegative(director.expectedDividend)
    )
    const social = computeSocialContributions({
      status: 'main',
      annualNetIncome: annualIncomeBase,
      overrideAnnualAmount: director.socialContributionOverrideAnnual,
      socialInsuranceFund: values.socialInsuranceFund,
      studentSocialExemption: false,
    })
    return {
      directorId: director.id,
      directorName: director.name.trim() || 'Director',
      annualIncomeBase,
      annualContribution: social.annualAmount,
      quarterlyContribution: social.quarterlyAmount,
    }
  })

  return {
    rows,
    total: roundToCents(rows.reduce((sum, row) => sum + row.annualContribution, 0)),
  }
}

export function calculateCompanyTaxSummary(values: TaxOnboardingValues): CompanyTaxSummary {
  const revenue = roundToCents(clampNonNegative(values.companyRevenue))
  const expenses = roundToCents(clampNonNegative(values.companyExpenses))
  const dna = roundToCents(clampNonNegative(values.companyDna))
  const lossCarryForward = roundToCents(clampNonNegative(values.companyCarriedForwardLoss))
  const isSme = values.companyTaxRegime === 'sme-reduced' && values.companyIsSme
  const hasDirectorRemunerationCondition = values.companyDirectorRemunerationEligible
  const isFinancialCompany = values.companyIsFinancialCompany
  const reducedRateEligible = isSme && hasDirectorRemunerationCondition && !isFinancialCompany

  const detailedAccountingResult = roundToCents(revenue - expenses)
  const accountingResult =
    values.companyEstimatedTaxableProfitMode === 'manual'
      ? roundToCents(clampNonNegative(values.companyEstimatedTaxableProfit))
      : detailedAccountingResult
  const taxResultBeforeLosses = roundToCents(accountingResult + dna)
  const carriedForwardLossUsed = roundToCents(
    taxResultBeforeLosses > 0 ? Math.min(lossCarryForward, taxResultBeforeLosses) : 0
  )
  const carriedForwardLossRemaining = roundToCents(lossCarryForward - carriedForwardLossUsed)
  const taxableProfit = roundToCents(Math.max(0, taxResultBeforeLosses - carriedForwardLossUsed))

  let isocAt20 = 0
  let isocAt25 = 0

  if (reducedRateEligible) {
    const firstBand = Math.min(taxableProfit, REDUCED_RATE_LIMIT)
    const secondBand = Math.max(0, taxableProfit - REDUCED_RATE_LIMIT)
    isocAt20 = roundToCents(firstBand * REDUCED_RATE)
    isocAt25 = roundToCents(secondBand * STANDARD_RATE)
  } else {
    isocAt25 = roundToCents(taxableProfit * STANDARD_RATE)
  }

  const grossIsoc = roundToCents(isocAt20 + isocAt25)
  const advance = getAdvancePayments(values)
  const advancePaymentsTotal = roundToCents(
    advance.vai1 + advance.vai2 + advance.vai3 + advance.vai4
  )
  const isIncreaseExempt = values.companyAgeYears < 3
  const hasAnyAdvancePayment = advancePaymentsTotal > 0
  const noIncreaseReason =
    taxableProfit <= 0
      ? 'No taxable profit'
      : isIncreaseExempt
        ? 'Starter SME (first 3 years)'
        : hasAnyAdvancePayment
          ? 'Advance payments were made'
          : null

  const theoreticalIncrease = noIncreaseReason
    ? 0
    : roundToCents(grossIsoc * THEORETICAL_INCREASE_RATE)
  const vaiReductionCredit = roundToCents(
    advance.vai1 * 0.09 + advance.vai2 * 0.075 + advance.vai3 * 0.06 + advance.vai4 * 0.045
  )
  const finalIncrease = roundToCents(Math.max(0, theoreticalIncrease - vaiReductionCredit))
  const totalTaxBeforeAdvanceDeduction = roundToCents(grossIsoc + finalIncrease)
  const finalTaxPayable = roundToCents(totalTaxBeforeAdvanceDeduction - advancePaymentsTotal)

  const social = computeDirectorSocial(values)

  return {
    revenue,
    deductibleExpenses: expenses,
    accountingResult,
    dnaAddBack: dna,
    taxResultBeforeLosses,
    carriedForwardLossUsed,
    carriedForwardLossRemaining,
    taxableProfit,
    reducedRateEligible,
    isocAt20,
    isocAt25,
    grossIsoc,
    theoreticalIncrease,
    vaiReductionCredit,
    finalIncrease,
    totalTaxBeforeAdvanceDeduction,
    advancePaymentsTotal,
    finalTaxPayable,
    noIncreaseReason,
    directorsSocial: social.rows,
    totalDirectorsSocialContribution: social.total,
  }
}
