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
    { from: 0, to: 17374.08, rate: 0.25 },
    { from: 17374.08, to: 75024.54, rate: 0.4 },
    { from: 75024.54, to: 110562.42, rate: 0.45 },
    // As specified in the provided logic document.
    { from: 110562.42, to: null, rate: 0.0 },
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
  socialContributions: {
    managementFeeRate: 0.042,
    boundaries: {
      b0: 1922.16,
      b1: 17374.08,
      b2: 75024.54,
      b3: 110562.42,
      article37Switch: 9101.26,
      assistingSpouseMinBand: 7632.44,
    },
    rates: {
      rateMain: 0.205,
      rateHighBand: 0.1416,
      activeRetiredRateFirst: 0.147,
      activeRetiredRateHighBand: 0.1416,
    },
    minimumsPerQuarter: {
      main: 917.58,
      secondary: 102.65,
      article37: 102.65,
      assistingSpouseMaxi: 391.16,
      activeRetired: 0,
      student: 102.65,
    },
  },
} as const
