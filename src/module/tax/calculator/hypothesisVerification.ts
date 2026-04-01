import { defaultTaxOnboardingValues } from "../store";
import type { TaxOnboardingValues } from "../types";
import { calculateTaxSummary } from "./index";

function asMoney(value: number): string {
  return value.toFixed(2);
}

function runHypothesis(name: string, input: Partial<TaxOnboardingValues>) {
  const values: TaxOnboardingValues = {
    ...defaultTaxOnboardingValues,
    ...input,
  };
  const summary = calculateTaxSummary(values);
  return {
    name,
    federalTax: asMoney(summary.federalTaxTotal),
    municipalTax: asMoney(summary.municipalSurcharge.amount),
    csss: asMoney(summary.specialSocialSecurityContribution),
    withholding: asMoney(summary.withholdingTax),
    finalBalance: asMoney(summary.finalBalance),
  };
}

const hypothesis6 = runHypothesis("Hypothesis 6", {
  taxSubject: "self-employed",
  maritalStatus: "married",
  dateOfBirth: "1986-01-01",
  municipalityRateOverride: 0.073,
  hasSalariedIncome: false,
  withholdingTax: 32000,
  estimatedSelfEmployedProfit: 72816.6,
  estimatedProfessionalExpenses: 1800,
  currentQuarterlySocialContribution: 3204.15,
  socialContributionsOverride: 12816.6,
  children: [
    { id: "c1", dateOfBirth: "2020-01-01", isDisabled: false },
    { id: "c2", dateOfBirth: "2024-01-01", isDisabled: false },
  ],
  partnerIncome: 34250,
});

const hypothesis7 = runHypothesis("Hypothesis 7", {
  taxSubject: "self-employed",
  maritalStatus: "widowed",
  dateOfBirth: "1995-01-01",
  municipalityRateOverride: 0.073,
  hasSalariedIncome: false,
  withholdingTax: 20000,
  estimatedSelfEmployedProfit: 72816.6,
  estimatedProfessionalExpenses: 1800,
  currentQuarterlySocialContribution: 3204.15,
  socialContributionsOverride: 12816.6,
  children: [{ id: "c1", dateOfBirth: "2020-01-01", isDisabled: false }],
});

console.log(JSON.stringify([hypothesis6, hypothesis7], null, 2));
