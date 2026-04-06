import { IPP_2026 } from "../constants";
import { clampNonNegative, roundToCents } from "./money";

/**
 * Employee professional expenses under the lump-sum system:
 * estimate by rate on salary, capped by legal max, and never above gross salary.
 */
export function effectiveEmployeeLumpSumDeduction(params: {
  grossSalary: number;
  applyLumpSum: boolean;
  overrideEuro: number | null;
}): number {
  const gross = roundToCents(clampNonNegative(params.grossSalary));
  if (!params.applyLumpSum || gross <= 0) return 0;
  if (
    typeof params.overrideEuro === "number" &&
    Number.isFinite(params.overrideEuro)
  ) {
    return roundToCents(clampNonNegative(Math.min(params.overrideEuro, gross)));
  }
  const rate = IPP_2026.professionalExpenses.employeeLumpSumRate;
  const cap = IPP_2026.professionalExpenses.employeeLumpSum;
  const rateBased = gross * rate;
  return roundToCents(clampNonNegative(Math.min(cap, rateBased, gross)));
}
