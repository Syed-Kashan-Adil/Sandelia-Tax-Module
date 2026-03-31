import { IPP_2026 } from "../constants";
import { resolveMunicipalRate } from "../municipalRates";
import type { TaxOnboardingValues, TaxSummary } from "../types";
import { computeHouseholdAllowance } from "./allowance";
import { computeCsss, shouldApplyCsss } from "./csss";
import { computeFederalTax } from "./federalTax";
import { applyMaritalQuotient } from "./maritalQuotient";
import { clampNonNegative, roundToCents } from "./money";
import { computeEstimatedAnnualProfessionalIncome } from "./profitEstimation";
import { computeSocialContributions } from "./socialContributions";

export function calculateTaxSummary(values: TaxOnboardingValues): TaxSummary {
  const salariedIncome = values.hasSalariedIncome ? values.salariedIncome : 0;
  const withholdingTax = values.hasSalariedIncome
    ? values.withholdingTaxMode === "unknown"
      ? 0
      : values.withholdingTax
    : 0;

  const lumpSum =
    values.hasSalariedIncome && values.applyEmployeeProfessionalExpensesLumpSum
      ? roundToCents(
          clampNonNegative(
            typeof values.employeeProfessionalExpensesLumpSumOverride ===
              "number"
              ? values.employeeProfessionalExpensesLumpSumOverride
              : IPP_2026.professionalExpenses.employeeLumpSum,
          ),
        )
      : 0;

  const userSalaryAfterExpenses = roundToCents(
    clampNonNegative(clampNonNegative(salariedIncome) - lumpSum),
  );

  // 1. Professional income: turnover (or YTD extrapolation / manual entry) − expenses = profit
  const annualTurnoverOrProfessionalIncome =
    computeEstimatedAnnualProfessionalIncome(values);
  const professionalExpenses = roundToCents(
    clampNonNegative(values.estimatedProfessionalExpenses),
  );
  const selfEmployedProfit = roundToCents(
    clampNonNegative(
      clampNonNegative(annualTurnoverOrProfessionalIncome) -
        professionalExpenses,
    ),
  );

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
  });

  const deductibleSocialAnnual = socialContributions.annualAmount;

  // 3. Net taxable self-employed slice for IPP (before marital quotient)
  const selfEmployedNetForIpp = roundToCents(
    clampNonNegative(selfEmployedProfit - deductibleSocialAnnual),
  );

  // Salary is already reduced by lump-sum professional expenses where applicable.
  const userProfessionalIncome = roundToCents(
    userSalaryAfterExpenses + selfEmployedNetForIpp,
  );

  const userIncome = roundToCents(
    userProfessionalIncome + clampNonNegative(values.otherIncome),
  );

  const partnerIncome = roundToCents(clampNonNegative(values.partnerIncome));
  const householdIncome = roundToCents(userIncome + partnerIncome);

  const hasPartner =
    values.maritalStatus === "married" ||
    values.maritalStatus === "legally-cohabiting";

  const maritalQuotient = applyMaritalQuotient({
    maritalStatus: values.maritalStatus,
    userIncome: userProfessionalIncome,
    partnerIncome,
  });

  const allowance = computeHouseholdAllowance({
    hasPartner,
    children: values.children,
    otherDependents: values.otherDependents,
    userDateOfBirthIso: values.dateOfBirth,
  });

  // After marital quotient, other income stacks on the user.
  const baseIncomeUserBeforeAllowance = roundToCents(
    clampNonNegative(
      maritalQuotient.after.userIncome + clampNonNegative(values.otherIncome),
    ),
  );
  const baseIncomePartnerBeforeAllowance = roundToCents(
    clampNonNegative(maritalQuotient.after.partnerIncome),
  );

  // 5–6. Brackets on income, then apply the tax-free allowance as a tax reduction.
  const federalGrossTaxUser = computeFederalTax({
    taxableIncome: baseIncomeUserBeforeAllowance,
  });
  const federalGrossTaxPartner = computeFederalTax({
    taxableIncome: baseIncomePartnerBeforeAllowance,
  });
  const federalGrossTaxTotal = roundToCents(
    federalGrossTaxUser.total + federalGrossTaxPartner.total,
  );

  // Tax-free allowance reduction is computed on bracket layers (not flat 25%).
  // Example: 16,320 @25% then remainder @40%, etc.
  const federalTaxReductionFromAllowances = roundToCents(
    computeFederalTax({ taxableIncome: allowance.totalAllowanceHousehold })
      .total,
  );
  const federalTaxTotal = roundToCents(
    clampNonNegative(federalGrossTaxTotal - federalTaxReductionFromAllowances),
  );

  const { rate: municipalRate } = resolveMunicipalRate({
    municipality: values.municipality,
    override: values.municipalityRateOverride,
  });
  const municipalSurchargeAmount = roundToCents(
    federalTaxTotal * municipalRate,
  );

  const municipalSurcharge = {
    municipality: values.municipality,
    rate: municipalRate,
    amount: municipalSurchargeAmount,
  };

  const netTaxableIncome =
    federalGrossTaxUser.taxableIncome + federalGrossTaxPartner.taxableIncome;
  const specialSocialSecurityContribution = shouldApplyCsss(values)
    ? computeCsss({
        annualNetTaxableIncome: netTaxableIncome,
        maritalStatus: values.maritalStatus,
      })
    : 0;

  const taxTotalIncludingMunicipal = roundToCents(
    federalTaxTotal + municipalSurchargeAmount,
  );
  const taxTotalIncludingMunicipalAndCsss = roundToCents(
    taxTotalIncludingMunicipal + specialSocialSecurityContribution,
  );

  const advanceTaxPayments = roundToCents(
    clampNonNegative(values.advanceTaxPayments),
  );

  const isStarterSelfEmployed = (() => {
    const assessmentYear = IPP_2026.assessmentYear ?? new Date().getFullYear();
    const start = new Date(values.activityStartDate);
    if (Number.isNaN(start.getTime())) return false;
    const end = new Date(`${assessmentYear}-12-31T00:00:00`);
    if (Number.isNaN(end.getTime())) return false;
    const diffMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return diffMonths < 36; // first 3 years
  })();

  // Advance payment penalty interest (self-employed only).
  // Uses annual advance payments and assumes a simplified quarter distribution based on mode.
  let advancePaymentPenalty = 0;
  if (
    values.taxSubject === "self-employed" &&
    !isStarterSelfEmployed &&
    taxTotalIncludingMunicipal >= 1000
  ) {
    const taxTotal = taxTotalIncludingMunicipal;
    const penaltyBase = taxTotal * 1.06;
    const penaltyGross = penaltyBase * 0.0675;

    const annualAdv = advanceTaxPayments;
    const mode = values.advanceTaxPaymentsMode;

    let vaQ1 = 0;
    let vaQ2 = 0;
    let vaQ3 = 0;
    let vaQ4 = 0;

    if (annualAdv > 0) {
      if (mode === "spread") {
        const q = annualAdv / 4;
        vaQ1 = roundToCents(q);
        vaQ2 = roundToCents(q);
        vaQ3 = roundToCents(q);
        vaQ4 = roundToCents(q);
        // Keep exact sum by adjusting the first quarter.
        const diff = roundToCents(annualAdv - (vaQ1 + vaQ2 + vaQ3 + vaQ4));
        vaQ1 = roundToCents(vaQ1 + diff);
      } else if (mode === "optimize") {
        // Simplification: pay everything as early as possible (best-case reduction).
        vaQ1 = annualAdv;
      } else {
        // 'none': worst-case assumption for unstructured input (last quarter).
        vaQ4 = annualAdv;
      }
    }

    const reduction = vaQ1 * 0.09 + vaQ2 * 0.075 + vaQ3 * 0.06 + vaQ4 * 0.045;

    const penaltyUnrounded = Math.max(0, penaltyGross - reduction) * 0.9;
    advancePaymentPenalty = roundToCents(penaltyUnrounded);
  }

  const finalBalance = roundToCents(
    taxTotalIncludingMunicipalAndCsss +
      advancePaymentPenalty -
      withholdingTax -
      advanceTaxPayments,
  );

  const otherDependents = values.otherDependents ?? {
    age65InDependencyCount: 0,
    age65SevereDisabilityRequiringCareDependentIn2021Count: 0,
    age65NotRequiringCareDependentIn2021Count: 0,
    age65NotRequiringCareDependentIn2021SevereDisabilityCount: 0,
    otherCount: 0,
    otherSevereDisabilityCount: 0,
    description: "",
  };
  const otherDependentsCount =
    otherDependents.age65InDependencyCount +
    otherDependents.age65SevereDisabilityRequiringCareDependentIn2021Count +
    otherDependents.age65NotRequiringCareDependentIn2021Count +
    otherDependents.age65NotRequiringCareDependentIn2021SevereDisabilityCount +
    otherDependents.otherCount +
    otherDependents.otherSevereDisabilityCount;

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
    specialSocialSecurityContribution,
    taxTotalIncludingMunicipal,
    taxTotalIncludingMunicipalAndCsss,
    socialContributions,
    withholdingTax: roundToCents(clampNonNegative(withholdingTax)),
    advanceTaxPayments,
    advancePaymentPenalty,
    finalBalance,
  };
}
