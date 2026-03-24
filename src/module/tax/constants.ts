export const IPP_2026 = {
  baseTaxFreeAllowance: 10910,
  professionalExpenses: {
    // Document example (employee professional expenses lump sum)
    employeeLumpSum: 5930,
  },
  maritalQuotient: {
    transferRate: 0.3,
    cap: 13050,
    eligibleStatuses: ['married', 'legally-cohabiting'] as const,
  },
  federalBrackets: [
    { from: 0, to: 16720, rate: 0.25 },
    { from: 16720, to: 29510, rate: 0.4 },
    { from: 29510, to: 51070, rate: 0.45 },
    { from: 51070, to: null, rate: 0.5 },
  ] as const,
  dependentsAllowance: {
    oneChild: 1920,
    twoChildren: 4950,
    threeChildren: 11090,
    fourChildren: 17940,
    extraPerChildBeyondFour: 6850,
    // For each child under 3 on 1 January of the assessment year (additional increase)
    youngChildAgeThreshold: 3,
    youngChildAdditionalAllowance: 720,
    otherDependents: {
      age65InDependency: 5770,
      age65SevereDisabilityRequiringCareDependentIn2021: 7700,
      age65NotRequiringCareDependentIn2021: 3850,
      age65NotRequiringCareDependentIn2021SevereDisability: 7700,
      other: 1920,
      otherSevereDisability: 3840,
    },
  },
  // Assessment year for "1 January of the assessment year" (e.g. young child rule)
  assessmentYear: 2026,
  ageAllowance: {
    seniorAge: 65,
    seniorAllowance: 5770,
  },
  // Social contributions: legal % on net professional income, compare to minimum BASE (no fund fee),
  // then apply fund fee. See Social contributions calculation logic-New.docx
  socialContributions: {
    boundaries: {
      b0: 1922.16,
      b1: 17374.08,
      b2: 75024.54,
      b3: 110562.42,
      article37Switch: 9101.26,
      /** Assisting spouse (maxi): income up to this uses minimum base annual only */
      assistingSpouseMaxiUpToIncome: 7632.44,
      /** Student self-employed: zone 1 upper bound (final €0; provisional minimum unless exempt) */
      studentZone1Max: 8687.03,
      /** Student: switch to standard main-style logic */
      studentZone2Max: 17374.08,
      /** Assisting spouse mini: first band ends here, second starts next cent */
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
    /** Minimum annual contribution before fund fees (€/year) */
    minimumBaseAnnual: {
      main: 3562.04,
      secondary: 394.04,
      article37: 394.04,
      assistingSpouseMaxi: 1564.64,
      student: 394.04,
    },
    /**
     * Partena published all-in total when main-activity **minimum** applies (income ≤ b1).
     * Slightly below legal × 1.042 due to official table rounding (927.82 €/quarter × 4).
     */
    publishedMainMinimumAnnualPartena: 3711.28,
    /** Fund fee applied to the legal annual amount after max(minimum, calculated) */
    fundFeeRates: {
      partena: 0.042,
      xerius: 0.0305,
      securex: 0.041,
      ucm: 0.0405,
      liantis: 0.0395,
      other: 0.042,
    } as const,
  },
} as const
