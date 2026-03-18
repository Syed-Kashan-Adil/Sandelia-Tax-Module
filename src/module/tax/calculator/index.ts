import { IPP_2026 } from '../constants'
import { resolveMunicipalRate } from '../municipalRates'
import type { TaxOnboardingValues, TaxSummary } from '../types'
import { computeHouseholdAllowance } from './allowance'
import { computeFederalTax } from './federalTax'
import { applyMaritalQuotient } from './maritalQuotient'
import { clampNonNegative, roundToCents } from './money'
import { computeEstimatedAnnualProfessionalIncome } from './profitEstimation'
import { computeSocialContributions } from './socialContributions'

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

  const estimatedAnnualProfessionalIncome = computeEstimatedAnnualProfessionalIncome(values)

  // Professional income is used for marital quotient in the document example.
  const userProfessionalIncome = roundToCents(
    userSalaryAfterExpenses + clampNonNegative(estimatedAnnualProfessionalIncome)
  )

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

  // Document method: compute gross tax on income by brackets, then subtract a 25% tax reduction
  // based on the (increased) tax-free allowance.
  const baseIncomeUserForFederalTax = roundToCents(
    clampNonNegative(maritalQuotient.after.userIncome + clampNonNegative(values.otherIncome))
  )
  const baseIncomePartnerForFederalTax = roundToCents(
    clampNonNegative(maritalQuotient.after.partnerIncome)
  )

  const federalGrossTaxUser = computeFederalTax({ taxableIncome: baseIncomeUserForFederalTax })
  const federalGrossTaxPartner = computeFederalTax({
    taxableIncome: baseIncomePartnerForFederalTax,
  })
  const federalGrossTaxTotal = roundToCents(
    federalGrossTaxUser.total + federalGrossTaxPartner.total
  )

  const federalTaxReductionFromAllowances = roundToCents(allowance.totalAllowanceHousehold * 0.25)
  const federalTaxTotal = roundToCents(
    clampNonNegative(federalGrossTaxTotal - federalTaxReductionFromAllowances)
  )

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

  const socialContributions = computeSocialContributions({
    status: values.selfEmployedStatus,
    annualNetIncome:
      clampNonNegative(estimatedAnnualProfessionalIncome) -
      clampNonNegative(values.estimatedProfessionalExpenses),
    overrideAnnualAmount: values.isSocialContributionsExempt
      ? 0
      : values.currentQuarterlySocialContribution > 0
        ? values.currentQuarterlySocialContribution * 4
        : values.socialContributionsOverride,
  })

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
    selfEmployedProfit: roundToCents(clampNonNegative(estimatedAnnualProfessionalIncome)),
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
