export type TaxSubject = "self-employed" | "company";

export type SelfEmployedStatus =
  | "main"
  | "complementary"
  | "article37"
  | "active-pensioner"
  | "student"
  | "company-director"
  // Kept for backward compatibility in persisted state/migration.
  | "assisting-spouse-maxi"
  | "assisting-spouse-mini";

export type PartnerIncomeType =
  | "employee"
  | "self-employed-main"
  | "self-employed-secondary"
  | "company-director"
  | "assisting-spouse";

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

export interface CompanyDirectorInput {
  id: string;
  name: string;
  role: "administrator" | "managing-director" | "active-partner";
  monthlySalary: number;
  expectedDividend: number;
  socialContributionOverrideAnnual: number | null;
  lumpSumExpensesAnnual: number;
  withholdingTaxAnnual: number;
  socialContributionsPaidByCompany: boolean;
  hasCompanyCar: boolean;
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
  partnerIncomeType: PartnerIncomeType;
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
  partnerUseSocialContributionsOverride: boolean;
  partnerSocialContributionsOverrideAnnual: number | null;
  partnerEmploymentIncomeForSecondaryActivity: number;
  partnerCompanyDirectorRemuneration: number;
  partnerCompanyDirectorSocialContributionsAnnual: number;
  partnerCompanyDirectorSocialContributionsPaidByCompany: boolean;
  partnerCompanyDirectorUseSocialContributionsOverride: boolean;
  partnerCompanyDirectorSocialContributionsOverrideAnnual: number | null;
  partnerAssistingSpouseStatus:
    | "assisting-spouse-maxi"
    | "assisting-spouse-mini";

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
  companyDirectorRemuneration: number;
  companyDirectorSocialContributionsAnnual: number;
  companyDirectorSocialContributionsPaidByCompany: boolean;

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

  // Company flow
  companyRevenue: number;
  companyExpenses: number;
  companyDna: number;
  companyCarriedForwardLoss: number;
  companyFiscalYearEndDate: string;
  companyTaxRegime: "sme-reduced" | "standard";
  companyEstimatedTaxableProfitMode: "manual" | "detailed";
  companyEstimatedTaxableProfit: number;
  companyIsSme: boolean;
  companyDirectorRemunerationEligible: boolean;
  companyIsFinancialCompany: boolean;
  companyAgeYears: number;
  companyAdvancePayments: {
    vai1: number;
    vai2: number;
    vai3: number;
    vai4: number;
  };
  companyHasDirectorsOrActivePartners: boolean;
  companyPrimaryDirectorId: string | null;
  companyDirectors: CompanyDirectorInput[];
  companyPartnerGrossSalary: number;
  companyPartnerWithholdingTax: number;

  // Company flow – social contributions screen inputs
  companyIsSocialContributionsExempt: boolean;
  companyCurrentQuarterlySocialContribution: number;
  companySocialPaidBy: "personal" | "company";
  companySocialPaidAmount: number;
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
  /** Professional expenses deducted from self-employed gross income to reach selfEmployedProfit. */
  selfEmployedProfessionalExpenses: number;
  /** Self-employed profit minus deductible social contributions (IPP input before marital quotient / allowances) */
  selfEmployedNetForIpp: number;
  otherIncome: number;
  /** For display: family situation */
  childrenCount: number;
  otherDependentsCount: number;

  allowance: AllowanceBreakdown;
  maritalQuotient: MaritalQuotientBreakdown;
  /** Short explanation for summary (e.g. Hypothesis 5 style when splitting does not apply) */
  maritalSplittingNote: string;

  federalGrossTaxUser: FederalTaxBreakdown;
  federalGrossTaxPartner: FederalTaxBreakdown;
  federalGrossTaxTotal: number;
  federalTaxReductionFromAllowances: number;
  /** Tax-free allowance applied as federal tax reduction, split per spouse (progressive brackets on each share) */
  federalTaxReductionFromAllowancesUser: number;
  federalTaxReductionFromAllowancesPartner: number;
  /** Federal tax after allowance, per person (gross − that person’s allowance reduction) */
  federalNetTaxUser: number;
  federalNetTaxPartner: number;
  federalTaxTotal: number;

  municipalSurcharge: MunicipalSurchargeBreakdown;
  specialSocialSecurityContribution: number;
  taxTotalIncludingMunicipal: number;
  taxTotalIncludingMunicipalAndCsss: number;

  socialContributions: SocialContributionsBreakdown;
  /** User-entered current social contribution paid per quarter (comparison input). */
  currentQuarterlySocialContributionInput: number;
  /** User-entered current social contribution paid per year (comparison input). */
  currentAnnualSocialContributionInput: number;

  withholdingTax: number;
  /** Primary taxpayer withholding only (partner withheld separately for household breakdown) */
  userWithholdingTax: number;
  partnerWithholdingTax: number;
  /** Employee lump-sum professional expenses actually deducted (≤ gross, ≤ cap) */
  userEmployeeLumpSumDeduction: number;
  partnerEmployeeLumpSumDeduction: number;
  /** Whether partner detailed salaried inputs were used (not the legacy fallback `partnerIncome`). */
  partnerHasSalariedIncomeDetailed: boolean;
  /** Partner gross salary before lump sum (0 if none) */
  partnerSalariedIncomeGross: number;
  /** Partner self-employed slice (0 if none); for Mrs/Mr-style summary lines */
  partnerSelfEmployedGross: number;
  partnerSelfEmployedExpenses: number;
  partnerSelfEmployedSocialContributions: number;
  partnerSelfEmployedSocialContributionsManualInput: number;
  partnerSelfEmployedNetForIpp: number;
  partnerIncomeType: TaxOnboardingValues["partnerIncomeType"];
  partnerCompanyDirectorRemuneration: number;
  partnerCompanyDirectorSocialContributions: number;
  partnerCompanyDirectorSocialContributionsManualInput: number;
  partnerCompanyDirectorSocialContributionsPaidByCompany: boolean;
  partnerCompanyDirectorAtnSocialContributions: number;
  partnerCompanyDirectorTaxableGross: number;
  partnerCompanyDirectorFlatRateDeduction: number;
  partnerCompanyDirectorNetForIpp: number;
  companyDirectorSocialContributionsPaidByCompany: boolean;
  companyDirectorAtnSocialContributions: number;
  companyDirectorTaxableGross: number;

  advanceTaxPaymentsMode: TaxOnboardingValues["advanceTaxPaymentsMode"];
  advanceTaxPayments: number;

  /** Advance payment penalty interest (self-employed) */
  advancePaymentPenalty: number;

  finalBalance: number;
}

export interface CompanySocialContributionBreakdown {
  directorId: string;
  directorName: string;
  annualIncomeBase: number;
  annualContribution: number;
  quarterlyContribution: number;
}

export interface CompanyTaxSummary {
  revenue: number;
  deductibleExpenses: number;
  accountingResult: number;
  /** Non-deductible expenses (DNA) added back to the accounting result for tax. */
  dnaAddBack: number;
  taxResultBeforeLosses: number;
  carriedForwardLossUsed: number;
  carriedForwardLossRemaining: number;
  taxableProfit: number;
  reducedRateEligible: boolean;
  isocAt20: number;
  isocAt25: number;
  grossIsoc: number;
  theoreticalIncrease: number;
  vaiReductionCredit: number;
  finalIncrease: number;
  totalTaxBeforeAdvanceDeduction: number;
  advancePaymentsTotal: number;
  finalTaxPayable: number;
  noIncreaseReason: string | null;
  directorsSocial: CompanySocialContributionBreakdown[];
  totalDirectorsSocialContribution: number;
}
