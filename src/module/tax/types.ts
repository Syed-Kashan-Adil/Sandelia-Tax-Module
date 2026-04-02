export type TaxSubject = "self-employed" | "company";

export type SelfEmployedStatus =
  | "main"
  | "complementary"
  | "article37"
  | "assisting-spouse-maxi"
  | "assisting-spouse-mini"
  | "active-pensioner"
  | "student";

export type MaritalStatus =
  | "single"
  | "married"
  | "legally-cohabiting"
  | "de-facto-cohabiting"
  | "divorced"
  | "separated"
  | "widowed";

export interface DependentChildInput {
  id: string;
  dateOfBirth: string; // ISO date (yyyy-mm-dd)
  isDisabled: boolean;
}

export interface TaxOnboardingValues {
  // Step 1
  taxSubject: TaxSubject;

  // Step 2
  selfEmployedStatus: SelfEmployedStatus;

  // Step 3
  activityStartDate: string; // ISO date
  activityType: "commercial" | "liberal";

  // Step 4 – VAT registration
  vatRegime:
    | "yes-monthly"
    | "yes-quarterly"
    | "mixed"
    | "exemption-small-business"
    | "no-not-subject";

  // Step 4
  maritalStatus: MaritalStatus;

  // Step 5
  partnerIncome: number;
  partnerHasSalariedIncome: boolean;
  partnerSalariedIncome: number;
  partnerWithholdingTax: number;
  partnerWithholdingTaxMode: "known" | "unknown";
  partnerApplyEmployeeProfessionalExpensesLumpSum: boolean;
  partnerEmployeeProfessionalExpensesLumpSumOverride: number | null;
  partnerHasSelfEmployedIncome: boolean;
  partnerEstimatedSelfEmployedIncome: number;
  partnerEstimatedProfessionalExpenses: number;
  partnerSocialContributionsAnnual: number;

  // Step 6 – Children
  children: DependentChildInput[];
  // Step 6 – Other dependents (e.g. elderly parents)
  otherDependents: {
    // parent/grandparent etc. 65+ and in a situation of dependency
    age65InDependencyCount: number;
    // 65+, severe disability, requiring care, already dependent in assessment year 2021
    age65SevereDisabilityRequiringCareDependentIn2021Count: number;
    // 65+, not requiring care, already dependent in assessment year 2021
    age65NotRequiringCareDependentIn2021Count: number;
    // 65+, not requiring care, already dependent in assessment year 2021, severe disability
    age65NotRequiringCareDependentIn2021SevereDisabilityCount: number;
    // other dependents
    otherCount: number;
    // other dependents with a severe disability
    otherSevereDisabilityCount: number;
    description: string;
  };

  // Step 7
  dateOfBirth: string; // ISO date

  // Step 8
  municipality: string;
  municipalityRateOverride: number | null; // e.g. 0.073 for 7.3%

  // Step 9
  hasSalariedIncome: boolean;
  salariedIncome: number;
  withholdingTax: number;
  withholdingTaxMode: "known" | "unknown";
  applyEmployeeProfessionalExpensesLumpSum: boolean;
  employeeProfessionalExpensesLumpSumOverride: number | null;

  // Step 10
  profitEstimationMode:
    | "manual"
    | "automatic-extrapolation"
    | "conservative"
    | "unknown";
  estimatedSelfEmployedProfit: number;
  estimatedProfessionalExpenses: number;
  ytdProfessionalIncome: number;

  // Step 11
  isSocialContributionsExempt: boolean;
  socialInsuranceFund:
    | "securex"
    | "xerius"
    | "liantis"
    | "ucm"
    | "partena"
    | "other";
  currentQuarterlySocialContribution: number;
  socialContributionsOverride: number | null;
  /** Student self-employed zone 1: if true, provisional contribution €0 instead of minimum */
  studentSocialExemption: boolean;

  // Step 12
  advanceTaxPaymentsMode: "none" | "spread" | "optimize";
  advanceTaxPayments: number;

  // Step 13
  otherIncomeSources: {
    rental: { enabled: boolean; annualAmount: number };
    dividends: { enabled: boolean; annualAmount: number };
    foreign: { enabled: boolean; annualAmount: number };
    alimonyReceived: { enabled: boolean; annualAmount: number };
    otherProfessional: { enabled: boolean; annualAmount: number };
  };
  otherIncome: number;
}

export interface SocialContributionsBreakdown {
  status: SelfEmployedStatus;
  baseIncome: number;
  /** Legal annual amount before social fund fee (after max vs minimum base) */
  legalAnnualBeforeFees: number;
  /** Fee rate applied to legal amount (0 if override / unknown split) */
  fundFeeRate: number;
  annualAmount: number;
  quarterlyAmount: number;
  method: "calculated" | "override";
}

export interface FederalTaxBreakdownBracket {
  from: number;
  to: number | null;
  rate: number;
  amountTaxed: number;
  tax: number;
}

export interface FederalTaxBreakdown {
  taxableIncome: number;
  brackets: FederalTaxBreakdownBracket[];
  total: number;
}

export interface AllowanceBreakdown {
  baseAllowanceSelf: number;
  baseAllowancePartner: number;
  dependentsAllowance: number;
  youngChildrenAllowance: number;
  singleParentAllowance: number;
  otherDependentsAllowance: number;
  ageAllowanceSelf: number;
  totalAllowanceHousehold: number;
}

export interface MaritalQuotientBreakdown {
  applied: boolean;
  transferAmount: number;
  cap: number;
  rate: number;
  before: { userIncome: number; partnerIncome: number };
  after: { userIncome: number; partnerIncome: number };
}

export interface MunicipalSurchargeBreakdown {
  municipality: string;
  rate: number;
  amount: number;
}

export interface TaxSummary {
  householdIncome: number;
  userIncome: number;
  partnerIncome: number;
  vatRegime: TaxOnboardingValues["vatRegime"];
  /** For display: income breakdown */
  salariedIncome: number;
  /** Turnover (or extrapolated/YTD income) minus professional expenses — before social contributions */
  selfEmployedProfit: number;
  /** Self-employed profit minus deductible social contributions (IPP input before marital quotient / allowances) */
  selfEmployedNetForIpp: number;
  otherIncome: number;
  /** For display: family situation */
  childrenCount: number;
  otherDependentsCount: number;

  allowance: AllowanceBreakdown;
  maritalQuotient: MaritalQuotientBreakdown;

  federalGrossTaxUser: FederalTaxBreakdown;
  federalGrossTaxPartner: FederalTaxBreakdown;
  federalGrossTaxTotal: number;
  federalTaxReductionFromAllowances: number;
  federalTaxTotal: number;

  municipalSurcharge: MunicipalSurchargeBreakdown;
  specialSocialSecurityContribution: number;
  taxTotalIncludingMunicipal: number;
  taxTotalIncludingMunicipalAndCsss: number;

  socialContributions: SocialContributionsBreakdown;

  withholdingTax: number;
  advanceTaxPayments: number;

  /** Advance payment penalty interest (self-employed) */
  advancePaymentPenalty: number;

  finalBalance: number;
}
