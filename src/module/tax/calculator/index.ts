import { IPP_2026 } from "../constants";
import { resolveMunicipalRate } from "../municipalRates";
import type { TaxOnboardingValues, TaxSummary } from "../types";
import { computeHouseholdAllowance } from "./allowance";
import { calculateCompanyTaxSummary } from "./companySummary";
import { computeCsss, shouldApplyCsss } from "./csss";
import { effectiveEmployeeLumpSumDeduction } from "./employeeLumpSum";
import { computeFederalTax } from "./federalTax";
import { applyMaritalQuotient } from "./maritalQuotient";
import { clampNonNegative, roundToCents } from "./money";
import { computeEstimatedAnnualProfessionalIncome } from "./profitEstimation";
import { computeSocialContributions } from "./socialContributions";

function buildMaritalSplittingNote(params: {
  hasPartner: boolean;
  maritalStatus: TaxOnboardingValues["maritalStatus"];
  quotient: ReturnType<typeof applyMaritalQuotient>;
}): string {
  const eligible = (
    IPP_2026.maritalQuotient.eligibleStatuses as readonly string[]
  ).includes(params.maritalStatus);
  if (!params.hasPartner || !eligible) {
    return "Marital income splitting does not apply for this marital status.";
  }
  const { before, applied, transferAmount, rate, cap } = params.quotient;
  const total = roundToCents(before.userIncome + before.partnerIncome);
  if (total <= 0) {
    return "No household professional income to split.";
  }
  const thirtyPct = roundToCents(rate * total);
  const higher = Math.max(before.userIncome, before.partnerIncome);
  const lower = Math.min(before.userIncome, before.partnerIncome);
  if (applied && transferAmount > 0) {
    return `Marital income splitting: €${transferAmount.toFixed(2)} transferred (30% target of household professional income, cap €${cap.toFixed(2)}).`;
  }
  if (higher >= thirtyPct - 0.005) {
    return "Marital income splitting does not apply: the higher earner's professional income already reaches or exceeds 30% of the household total.";
  }
  if (lower >= thirtyPct - 0.005) {
    return "Marital income splitting does not apply: the lower earner already reaches or exceeds 30% of household professional income.";
  }
  return "No marital income transfer calculated.";
}

function computeDirectorFlatRate(params: {
  grossIncome: number;
  socialContributionsAnnual: number;
}): number {
  const base = roundToCents(
    clampNonNegative(
      clampNonNegative(params.grossIncome) -
        clampNonNegative(params.socialContributionsAnnual),
    ),
  );
  return roundToCents(
    Math.min(
      base * 0.03,
      IPP_2026.professionalExpenses.companyDirectorLumpSumMax,
      base,
    ),
  );
}

export function calculateTaxSummary(values: TaxOnboardingValues): TaxSummary {
  const salariedIncome = values.hasSalariedIncome ? values.salariedIncome : 0;
  const withholdingTax =
    values.withholdingTaxMode === "unknown" ? 0 : values.withholdingTax;

  const userEmployeeLumpSumDeduction = effectiveEmployeeLumpSumDeduction({
    grossSalary: salariedIncome,
    applyLumpSum:
      values.hasSalariedIncome &&
      values.applyEmployeeProfessionalExpensesLumpSum,
    overrideEuro: values.employeeProfessionalExpensesLumpSumOverride,
  });

  const userSalaryAfterExpenses = roundToCents(
    clampNonNegative(
      clampNonNegative(salariedIncome) - userEmployeeLumpSumDeduction,
    ),
  );

  const partnerWithholdingTax =
    values.partnerWithholdingTaxMode === "unknown"
      ? 0
      : values.partnerWithholdingTax;
  // 1) Primary taxpayer professional profile (same engine shape as partner).
  const annualTurnoverOrProfessionalIncome =
    computeEstimatedAnnualProfessionalIncome(values);
  const professionalExpenses = roundToCents(
    clampNonNegative(values.estimatedProfessionalExpenses),
  );
  const defaultSelfEmployedProfit = roundToCents(
    clampNonNegative(
      clampNonNegative(annualTurnoverOrProfessionalIncome) -
        professionalExpenses,
    ),
  );
  const isPrimaryDirector = values.selfEmployedStatus === "company-director";
  const primaryDirectorRemuneration = roundToCents(
    clampNonNegative(values.companyDirectorRemuneration),
  );
  const directorOverrideAnnual = values.isSocialContributionsExempt
    ? 0
    : values.socialContributionsOverride;
  const primaryDirectorSocialBreakdown = computeSocialContributions({
    status: "company-director",
    annualNetIncome: primaryDirectorRemuneration,
    overrideAnnualAmount: directorOverrideAnnual,
    socialInsuranceFund: values.socialInsuranceFund,
    studentSocialExemption: false,
  });
  const primaryDirectorSocial = roundToCents(
    primaryDirectorSocialBreakdown.annualAmount,
  );
  const primaryDirectorFlatRate = computeDirectorFlatRate({
    grossIncome: primaryDirectorRemuneration,
    socialContributionsAnnual: primaryDirectorSocial,
  });
  const selfEmployedProfit = isPrimaryDirector
    ? roundToCents(
        clampNonNegative(primaryDirectorRemuneration - primaryDirectorFlatRate),
      )
    : defaultSelfEmployedProfit;

  const socialContributions = isPrimaryDirector
    ? primaryDirectorSocialBreakdown
    : computeSocialContributions({
        status: values.selfEmployedStatus,
        annualNetIncome: selfEmployedProfit,
        overrideAnnualAmount: values.isSocialContributionsExempt
          ? 0
          : values.socialContributionsOverride,
        socialInsuranceFund: values.socialInsuranceFund,
        studentSocialExemption: values.studentSocialExemption,
      });

  const selfEmployedNetForIpp = isPrimaryDirector
    ? roundToCents(
        clampNonNegative(primaryDirectorRemuneration - primaryDirectorSocial),
      )
    : roundToCents(
        clampNonNegative(selfEmployedProfit - socialContributions.annualAmount),
      );

  const userProfessionalIncome = roundToCents(
    userSalaryAfterExpenses + selfEmployedNetForIpp,
  );

  // 2) Partner profile using same logic model.
  const partnerSalariedIncomeGross = roundToCents(
    clampNonNegative(
      values.partnerIncomeType === "employee"
        ? values.partnerSalariedIncome > 0
          ? values.partnerSalariedIncome
          : values.partnerIncome
        : values.partnerIncomeType === "self-employed-secondary"
          ? values.partnerEmploymentIncomeForSecondaryActivity
          : 0,
    ),
  );
  const partnerEmployeeLumpSumDeduction = effectiveEmployeeLumpSumDeduction({
    grossSalary: partnerSalariedIncomeGross,
    applyLumpSum:
      partnerSalariedIncomeGross > 0
        ? values.partnerApplyEmployeeProfessionalExpensesLumpSum
        : false,
    overrideEuro: values.partnerEmployeeProfessionalExpensesLumpSumOverride,
  });
  const partnerSalaryAfterExpenses = roundToCents(
    clampNonNegative(
      partnerSalariedIncomeGross - partnerEmployeeLumpSumDeduction,
    ),
  );

  const partnerSelfEmployedGross = roundToCents(
    clampNonNegative(
      values.partnerIncomeType === "self-employed-main" ||
        values.partnerIncomeType === "self-employed-secondary" ||
        values.partnerIncomeType === "assisting-spouse"
        ? values.partnerEstimatedSelfEmployedIncome
        : 0,
    ),
  );
  const partnerSelfEmployedExpenses = roundToCents(
    clampNonNegative(
      values.partnerIncomeType === "self-employed-main" ||
        values.partnerIncomeType === "self-employed-secondary" ||
        values.partnerIncomeType === "assisting-spouse"
        ? values.partnerEstimatedProfessionalExpenses
        : 0,
    ),
  );
  const partnerSelfEmployedSocialContributions = roundToCents(
    clampNonNegative(
      values.partnerIncomeType === "self-employed-main" ||
        values.partnerIncomeType === "self-employed-secondary" ||
        values.partnerIncomeType === "assisting-spouse"
        ? values.partnerSocialContributionsAnnual
        : 0,
    ),
  );
  const partnerSelfEmployedNetForIpp = roundToCents(
    clampNonNegative(
      partnerSelfEmployedGross -
        partnerSelfEmployedExpenses -
        partnerSelfEmployedSocialContributions,
    ),
  );
  const partnerCompanyDirectorRemuneration = roundToCents(
    clampNonNegative(values.partnerCompanyDirectorRemuneration),
  );
  const partnerCompanyDirectorSocialContributions = roundToCents(
    clampNonNegative(values.partnerCompanyDirectorSocialContributionsAnnual),
  );
  const partnerCompanyDirectorFlatRate = computeDirectorFlatRate({
    grossIncome: partnerCompanyDirectorRemuneration,
    socialContributionsAnnual: partnerCompanyDirectorSocialContributions,
  });
  const partnerCompanyDirectorNetForIpp = roundToCents(
    clampNonNegative(
      partnerCompanyDirectorRemuneration -
        partnerCompanyDirectorSocialContributions,
    ),
  );
  const partnerDirectorProfessionalIncome = roundToCents(
    clampNonNegative(
      partnerCompanyDirectorRemuneration - partnerCompanyDirectorFlatRate,
    ),
  );

  const userIncome = roundToCents(
    userProfessionalIncome + clampNonNegative(values.otherIncome),
  );

  const partnerIncome = roundToCents(
    values.partnerIncomeType === "company-director"
      ? partnerDirectorProfessionalIncome
      : partnerSalaryAfterExpenses + partnerSelfEmployedNetForIpp,
  );
  const householdIncome = roundToCents(userIncome + partnerIncome);

  const hasPartner =
    values.maritalStatus === "married" ||
    values.maritalStatus === "legally-cohabiting";

  const maritalQuotient = applyMaritalQuotient({
    maritalStatus: values.maritalStatus,
    userIncome: userProfessionalIncome,
    partnerIncome,
  });

  const maritalSplittingNote = buildMaritalSplittingNote({
    hasPartner,
    maritalStatus: values.maritalStatus,
    quotient: maritalQuotient,
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
  // Tax-free allowance reduction: progressive brackets on each spouse’s share of the allowance
  // (partner base on partner; remainder on primary taxpayer — matches per-person examples like Hypothesis 5).
  const userAllowanceShare = roundToCents(
    clampNonNegative(
      allowance.baseAllowanceSelf +
        allowance.dependentsAllowance +
        allowance.youngChildrenAllowance +
        allowance.singleParentAllowance +
        allowance.otherDependentsAllowance +
        allowance.ageAllowanceSelf,
    ),
  );
  const partnerAllowanceShare = roundToCents(
    clampNonNegative(allowance.baseAllowancePartner),
  );

  const federalTaxReductionFromAllowancesUser = roundToCents(
    computeFederalTax({ taxableIncome: userAllowanceShare }).total,
  );
  const federalTaxReductionFromAllowancesPartner = roundToCents(
    computeFederalTax({ taxableIncome: partnerAllowanceShare }).total,
  );
  const federalTaxReductionFromAllowances = roundToCents(
    federalTaxReductionFromAllowancesUser +
      federalTaxReductionFromAllowancesPartner,
  );
  const federalTaxTotal = roundToCents(
    clampNonNegative(federalGrossTaxTotal - federalTaxReductionFromAllowances),
  );

  const federalNetTaxUser = roundToCents(
    clampNonNegative(
      federalGrossTaxUser.total - federalTaxReductionFromAllowancesUser,
    ),
  );
  const federalNetTaxPartner = roundToCents(
    clampNonNegative(
      federalGrossTaxPartner.total - federalTaxReductionFromAllowancesPartner,
    ),
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
    return diffMonths < IPP_2026.advancePaymentPenalty.exemptMaxMonthsExclusive;
  })();

  // Advance payment penalty (self-employed IPP): after the first 3 years, insufficient advances → surcharge
  // (Royal Decree rates; see `IPP_2026.advancePaymentPenalty`). Companies (ISOC): same policy intent when that engine exists.
  let advancePaymentPenalty = 0;
  const apPen = IPP_2026.advancePaymentPenalty;
  if (
    values.taxSubject === "self-employed" &&
    !isStarterSelfEmployed &&
    taxTotalIncludingMunicipal >= apPen.minimumTaxTotalEuro
  ) {
    const taxTotal = taxTotalIncludingMunicipal;
    const penaltyBase = taxTotal * apPen.taxTotalAugmentationMultiplier;
    const penaltyGross = penaltyBase * apPen.surchargeRateOnAugmentedTax;

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

    const [r1, r2, r3, r4] = apPen.quarterReductionRates;
    const reduction = vaQ1 * r1 + vaQ2 * r2 + vaQ3 * r3 + vaQ4 * r4;

    const penaltyUnrounded =
      Math.max(0, penaltyGross - reduction) * apPen.finalMitigationFactor;
    advancePaymentPenalty = roundToCents(penaltyUnrounded);
  }

  const finalBalance = roundToCents(
    taxTotalIncludingMunicipalAndCsss +
      advancePaymentPenalty -
      withholdingTax -
      roundToCents(clampNonNegative(partnerWithholdingTax)) -
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
    selfEmployedProfessionalExpenses: professionalExpenses,
    selfEmployedNetForIpp,
    otherIncome: roundToCents(clampNonNegative(values.otherIncome)),
    childrenCount: values.children?.length ?? 0,
    otherDependentsCount,
    allowance,
    maritalQuotient,
    maritalSplittingNote,
    federalGrossTaxUser,
    federalGrossTaxPartner,
    federalGrossTaxTotal,
    federalTaxReductionFromAllowances,
    federalTaxReductionFromAllowancesUser,
    federalTaxReductionFromAllowancesPartner,
    federalNetTaxUser,
    federalNetTaxPartner,
    federalTaxTotal,
    municipalSurcharge,
    specialSocialSecurityContribution,
    taxTotalIncludingMunicipal,
    taxTotalIncludingMunicipalAndCsss,
    socialContributions,
    currentQuarterlySocialContributionInput: roundToCents(
      clampNonNegative(values.currentQuarterlySocialContribution),
    ),
    currentAnnualSocialContributionInput: roundToCents(
      clampNonNegative(values.currentQuarterlySocialContribution) * 4,
    ),
    withholdingTax: roundToCents(
      clampNonNegative(withholdingTax) +
        clampNonNegative(partnerWithholdingTax),
    ),
    userWithholdingTax: roundToCents(clampNonNegative(withholdingTax)),
    partnerWithholdingTax: roundToCents(
      clampNonNegative(partnerWithholdingTax),
    ),
    userEmployeeLumpSumDeduction,
    partnerEmployeeLumpSumDeduction,
    partnerHasSalariedIncomeDetailed:
      values.partnerIncomeType === "employee" ||
      values.partnerIncomeType === "self-employed-secondary",
    partnerIncomeType: values.partnerIncomeType,
    partnerSalariedIncomeGross: partnerSalariedIncomeGross,
    partnerSelfEmployedGross: partnerSelfEmployedGross,
    partnerSelfEmployedExpenses: partnerSelfEmployedExpenses,
    partnerSelfEmployedSocialContributions:
      partnerSelfEmployedSocialContributions,
    partnerSelfEmployedNetForIpp,
    partnerCompanyDirectorRemuneration,
    partnerCompanyDirectorSocialContributions,
    partnerCompanyDirectorNetForIpp,
    advanceTaxPaymentsMode: values.advanceTaxPaymentsMode,
    advanceTaxPayments,
    advancePaymentPenalty,
    finalBalance,
  };
}

export { calculateCompanyTaxSummary };
