import { IPP_2026 } from "../constants";
import { clampNonNegative, roundToCents } from "./money";

/**
 * Employee professional expenses under the lump-sum system: deduct up to the legal cap,
 * never more than gross salary (income cannot go negative).
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
    return roundToCents(
      clampNonNegative(Math.min(params.overrideEuro, gross)),
    );
  }
  const cap = IPP_2026.professionalExpenses.employeeLumpSum;
  return roundToCents(clampNonNegative(Math.min(cap, gross)));
}
