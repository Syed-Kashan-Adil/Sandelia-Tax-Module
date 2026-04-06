/**
 * IPP parameters for simulations on **income year / framework 2026** (per product spec).
 * Indexed amounts for children, brackets, marital quotient cap, and employee lump-sum max follow
 * published tables (e.g. BDO “indexed amounts … assessment year 2026”); base tax-free amount €11,180
 * per internal confirmation (replacing legacy €10,910).
 */
export const IPP_2026 = {
  baseTaxFreeAllowance: 11180,
  professionalExpenses: {
    /**
     * Employee lump-sum professional expenses:
     * base estimate is `grossSalary * employeeLumpSumRate`, capped at `employeeLumpSum`.
     */
    employeeLumpSumRate: 0.3,
    employeeLumpSum: 5930,
  },
  maritalQuotient: {
    transferRate: 0.3,
    cap: 13460,
    eligibleStatuses: ["married", "legally-cohabiting"] as const,
  },
  federalBrackets: [
    { from: 0, to: 16320, rate: 0.25 },
    { from: 16320, to: 28800, rate: 0.4 },
    { from: 28800, to: 49840, rate: 0.45 },
    { from: 49840, to: null, rate: 0.5 },
  ] as const,
  dependentsAllowance: {
    oneChild: 2030,
    twoChildren: 5230,
    threeChildren: 11720,
    fourChildren: 18970,
    extraPerChildBeyondFour: 7240,
    youngChildAgeThreshold: 3,
    youngChildAdditionalAllowance: 760,
    singleParentWithDependentChild: 2029,
    otherDependents: {
      age65InDependency: 5913,
      age65SevereDisabilityRequiringCareDependentIn2021: 7890,
      age65NotRequiringCareDependentIn2021: 3945,
      age65NotRequiringCareDependentIn2021SevereDisability: 7890,
      other: 2029,
      otherSevereDisability: 3935,
    },
  },
  assessmentYear: 2026,
  ageAllowance: {
    seniorAge: 65,
    seniorAllowance: 5913,
  },
  /**
   * IPP: surcharge when advance tax payments are insufficient (self-employed flow).
   * First 36 months from activity start ≈ first 3 years → no surcharge (same policy intent as ISOC starter exemption for companies).
   * Rates are set annually (Royal Decree); adjust `surchargeRateOnAugmentedTax` / multipliers when official 2026+ figures change (~6–7% range).
   */
  advancePaymentPenalty: {
    exemptMaxMonthsExclusive: 36,
    minimumTaxTotalEuro: 1000,
    taxTotalAugmentationMultiplier: 1.06,
    surchargeRateOnAugmentedTax: 0.0675,
    quarterReductionRates: [0.09, 0.075, 0.06, 0.045] as const,
    finalMitigationFactor: 0.9,
  },
  socialContributions: {
    boundaries: {
      b0: 1922.16,
      b1: 17374.08,
      b2: 75024.54,
      b3: 110562.42,
      article37Switch: 9101.26,
      assistingSpouseMaxiUpToIncome: 7632.44,
      studentZone1Max: 8687.03,
      studentZone2Max: 17374.08,
      assistingSpouseMiniFirstBandEnd: 75024.53,
      assistingSpouseMiniSecondBandStart: 75024.54,
    },
    rates: {
      rateMain: 0.205,
      rateHighBand: 0.1416,
      pensionerLow: 0.03675,
      pensionerHigh: 0.0354,
      assistingSpouseMiniLow: 0.0079,
      assistingSpouseMiniHigh: 0.0051,
    },
    minimumBaseAnnual: {
      main: 3562.04,
      secondary: 394.04,
      article37: 394.04,
      assistingSpouseMaxi: 1564.64,
      student: 394.04,
    },
    publishedMainMinimumAnnualPartena: 3711.28,
    fundFeeRates: {
      partena: 0.042,
      xerius: 0.0305,
      securex: 0.041,
      ucm: 0.0405,
      liantis: 0.0395,
      other: 0.042,
    } as const,
  },
} as const;
