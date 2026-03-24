import { IPP_2026 } from '../constants'
import { resolveMunicipalRate } from '../municipalRates'
import type { TaxOnboardingValues, TaxSummary } from '../types'
import { computeHouseholdAllowance } from './allowance'
import { computeFederalTax } from './federalTax'
import { applyMaritalQuotient } from './maritalQuotient'
import { clampNonNegative, roundToCents } from './money'
import { computeEstimatedAnnualProfessionalIncome } from './profitEstimation'
import { computeSocialContributions } from './socialContributions'

/** Shared household allowances (children, young children, other dependents) split across taxpayers */
function ippAllowanceSharePerPartner(hasPartner: boolean, allowance: number): number {
  return roundToCents(hasPartner ? allowance / 2 : allowance)
}

export function calculateTaxSummary(values: TaxOnboardingValues): TaxSummary {
  const salariedIncome = values.hasSalariedIncome ? values.salariedIncome : 0
  const withholdingTax = values.hasSalariedIncome
    ? values.withholdingTaxMode === 'unknown'
      ? 0
      : values.withholdingTax
    : 0

  const lumpSum =
    values.hasSalariedIncome && values.applyEmployeeProfessionalExpensesLumpSum
      ? roundToCents(
          clampNonNegative(
            typeof values.employeeProfessionalExpensesLumpSumOverride === 'number'
              ? values.employeeProfessionalExpensesLumpSumOverride
              : IPP_2026.professionalExpenses.employeeLumpSum
          )
        )
      : 0

  const userSalaryAfterExpenses = roundToCents(
    clampNonNegative(clampNonNegative(salariedIncome) - lumpSum)
  )

  // 1. Professional income: turnover (or YTD extrapolation / manual entry) − expenses = profit
  const annualTurnoverOrProfessionalIncome = computeEstimatedAnnualProfessionalIncome(values)
  const professionalExpenses = roundToCents(clampNonNegative(values.estimatedProfessionalExpenses))
  const selfEmployedProfit = roundToCents(
    clampNonNegative(clampNonNegative(annualTurnoverOrProfessionalIncome) - professionalExpenses)
  )

  // 2. Social contributions on profit (fully deductible from taxable income for IPP)
  const socialContributions = computeSocialContributions({
    status: values.selfEmployedStatus,
    annualNetIncome: selfEmployedProfit,
    overrideAnnualAmount: values.isSocialContributionsExempt
      ? 0
      : values.currentQuarterlySocialContribution > 0
        ? values.currentQuarterlySocialContribution * 4
        : values.socialContributionsOverride,
    socialInsuranceFund: values.socialInsuranceFund,
    studentSocialExemption: values.studentSocialExemption,
  })

  const deductibleSocialAnnual = socialContributions.annualAmount

  // 3. Net taxable self-employed slice for IPP (before marital quotient)
  const selfEmployedNetForIpp = roundToCents(
    clampNonNegative(selfEmployedProfit - deductibleSocialAnnual)
  )

  // Salary is already reduced by lump-sum professional expenses where applicable.
  const userProfessionalIncome = roundToCents(userSalaryAfterExpenses + selfEmployedNetForIpp)

  const userIncome = roundToCents(userProfessionalIncome + clampNonNegative(values.otherIncome))

  const partnerIncome = roundToCents(clampNonNegative(values.partnerIncome))
  const householdIncome = roundToCents(userIncome + partnerIncome)

  const hasPartner =
    values.maritalStatus === 'married' || values.maritalStatus === 'legally-cohabiting'

  const maritalQuotient = applyMaritalQuotient({
    maritalStatus: values.maritalStatus,
    userIncome: userProfessionalIncome,
    partnerIncome,
  })

  const allowance = computeHouseholdAllowance({
    hasPartner,
    children: values.children,
    otherDependents: values.otherDependents,
    userDateOfBirthIso: values.dateOfBirth,
  })

  const sharedDependentsAllowance =
    allowance.dependentsAllowance +
    allowance.youngChildrenAllowance +
    allowance.otherDependentsAllowance
  const sharedPerPartner = ippAllowanceSharePerPartner(hasPartner, sharedDependentsAllowance)

  const allowanceUser = roundToCents(
    clampNonNegative(
      allowance.baseAllowanceSelf + allowance.ageAllowanceSelf + sharedPerPartner
    )
  )
  const allowancePartner = roundToCents(
    clampNonNegative(allowance.baseAllowancePartner + (hasPartner ? sharedPerPartner : 0))
  )

  // After marital quotient, other income stacks on the user; then subtract tax-free allowances.
  const baseIncomeUserBeforeAllowance = roundToCents(
    clampNonNegative(maritalQuotient.after.userIncome + clampNonNegative(values.otherIncome))
  )
  const baseIncomePartnerBeforeAllowance = roundToCents(
    clampNonNegative(maritalQuotient.after.partnerIncome)
  )

  const taxableIncomeUser = roundToCents(
    clampNonNegative(baseIncomeUserBeforeAllowance - allowanceUser)
  )
  const taxableIncomePartner = roundToCents(
    clampNonNegative(baseIncomePartnerBeforeAllowance - allowancePartner)
  )

  // 5–6. Brackets on post-allowance taxable income, then municipal surcharge on federal tax
  const federalGrossTaxUser = computeFederalTax({ taxableIncome: taxableIncomeUser })
  const federalGrossTaxPartner = computeFederalTax({
    taxableIncome: taxableIncomePartner,
  })
  const federalGrossTaxTotal = roundToCents(
    federalGrossTaxUser.total + federalGrossTaxPartner.total
  )

  const federalTaxReductionFromAllowances = 0
  const federalTaxTotal = federalGrossTaxTotal

  const { rate: municipalRate } = resolveMunicipalRate({
    municipality: values.municipality,
    override: values.municipalityRateOverride,
  })
  const municipalSurchargeAmount = roundToCents(federalTaxTotal * municipalRate)

  const municipalSurcharge = {
    municipality: values.municipality,
    rate: municipalRate,
    amount: municipalSurchargeAmount,
  }

  const taxTotalIncludingMunicipal = roundToCents(federalTaxTotal + municipalSurchargeAmount)

  const advanceTaxPayments = roundToCents(clampNonNegative(values.advanceTaxPayments))

  const finalBalance = roundToCents(
    taxTotalIncludingMunicipal - withholdingTax - advanceTaxPayments
  )

  const otherDependents = values.otherDependents ?? {
    age65InDependencyCount: 0,
    age65SevereDisabilityRequiringCareDependentIn2021Count: 0,
    age65NotRequiringCareDependentIn2021Count: 0,
    age65NotRequiringCareDependentIn2021SevereDisabilityCount: 0,
    otherCount: 0,
    otherSevereDisabilityCount: 0,
    description: '',
  }
  const otherDependentsCount =
    otherDependents.age65InDependencyCount +
    otherDependents.age65SevereDisabilityRequiringCareDependentIn2021Count +
    otherDependents.age65NotRequiringCareDependentIn2021Count +
    otherDependents.age65NotRequiringCareDependentIn2021SevereDisabilityCount +
    otherDependents.otherCount +
    otherDependents.otherSevereDisabilityCount

  return {
    householdIncome,
    userIncome,
    partnerIncome,
    vatRegime: values.vatRegime,
    salariedIncome: roundToCents(clampNonNegative(salariedIncome)),
    selfEmployedProfit,
    selfEmployedNetForIpp,
    otherIncome: roundToCents(clampNonNegative(values.otherIncome)),
    childrenCount: values.children?.length ?? 0,
    otherDependentsCount,
    allowance,
    maritalQuotient,
    federalGrossTaxUser,
    federalGrossTaxPartner,
    federalGrossTaxTotal,
    federalTaxReductionFromAllowances,
    federalTaxTotal,
    municipalSurcharge,
    taxTotalIncludingMunicipal,
    socialContributions,
    withholdingTax: roundToCents(clampNonNegative(withholdingTax)),
    advanceTaxPayments,
    finalBalance,
  }
}
