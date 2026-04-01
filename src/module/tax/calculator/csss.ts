import type { MaritalStatus, TaxOnboardingValues } from "../types";
import { clampNonNegative, roundToCents } from "./money";

type CsssStatus = "isolated" | "joint";

function mapCsssStatus(maritalStatus: MaritalStatus): CsssStatus {
  return maritalStatus === "married" || maritalStatus === "legally-cohabiting"
    ? "joint"
    : "isolated";
}

export function shouldApplyCsss(values: TaxOnboardingValues): boolean {
  const isJoint =
    values.maritalStatus === "married" ||
    values.maritalStatus === "legally-cohabiting";
  const hasSelfEmployedProfessionalIncome =
    clampNonNegative(values.estimatedSelfEmployedProfit) > 0;

  return (
    values.hasSalariedIncome ||
    hasSelfEmployedProfessionalIncome ||
    values.taxSubject === "company" ||
    (isJoint && clampNonNegative(values.partnerIncome) > 0)
  );
}

export function computeCsss(params: {
  annualNetTaxableIncome: number;
  maritalStatus: MaritalStatus;
}): number {
  const income = roundToCents(clampNonNegative(params.annualNetTaxableIncome));
  const status = mapCsssStatus(params.maritalStatus);
  let result = 0;

  if (status === "isolated") {
    if (income <= 18592.02) result = 0;
    else if (income <= 21070.96) result = 0.05 * (income - 18592.02);
    else if (income <= 37344.0) result = 123.95 + 0.013 * (income - 21070.96);
    else if (income <= 40977.26) result = 335.5 + 0.04009 * (income - 37344.0);
    else if (income <= 60181.95)
      result = 481.96 + 0.012996 * (income - 40977.26);
    else result = 731.28;
  } else {
    if (income <= 18592.02) result = 0;
    else if (income <= 21070.96) result = 0.05 * (income - 18592.02);
    else if (income <= 60181.95) result = 123.95 + 0.013 * (income - 21070.96);
    else if (income <= 74688.0) result = 632.39;
    else if (income <= 81944.0) result = 632.39 + 0.013629 * (income - 74688.0);
    else result = 731.28;
  }

  return roundToCents(Math.min(result, 731.28));
}
