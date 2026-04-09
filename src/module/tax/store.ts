import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  CompanyDirectorInput,
  DependentChildInput,
  TaxOnboardingValues,
} from "./types";

export const TAX_WIZARD_TOTAL_STEPS = 15;

export interface TaxOnboardingState {
  step: number;
  values: TaxOnboardingValues;
  setValues: (partial: Partial<TaxOnboardingValues>) => void;
  goNext: () => void;
  goBack: () => void;
  goTo: (step: number) => void;
  reset: () => void;
  addChild: (child?: Partial<DependentChildInput>) => void;
  removeChild: (id: string) => void;
  addCompanyDirector: (director?: Partial<CompanyDirectorInput>) => void;
  removeCompanyDirector: (id: string) => void;
}

function todayIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const defaultTaxOnboardingValues: TaxOnboardingValues = {
  taxSubject: "self-employed",
  selfEmployedStatus: "main",
  activityStartDate: todayIsoDate(),
  activityType: "commercial",
  vatRegime: "yes-quarterly",
  maritalStatus: "single",
  partnerIncomeType: "employee",
  partnerIncome: 0,
  partnerHasSalariedIncome: false,
  partnerSalariedIncome: 0,
  partnerWithholdingTax: 0,
  partnerWithholdingTaxMode: "known",
  partnerApplyEmployeeProfessionalExpensesLumpSum: true,
  partnerEmployeeProfessionalExpensesLumpSumOverride: null,
  partnerHasSelfEmployedIncome: false,
  partnerEstimatedSelfEmployedIncome: 0,
  partnerEstimatedProfessionalExpenses: 0,
  partnerSocialContributionsAnnual: 0,
  partnerEmploymentIncomeForSecondaryActivity: 0,
  partnerCompanyDirectorRemuneration: 0,
  partnerCompanyDirectorSocialContributionsAnnual: 0,
  partnerAssistingSpouseStatus: "assisting-spouse-maxi",
  children: [],
  otherDependents: {
    age65InDependencyCount: 0,
    age65SevereDisabilityRequiringCareDependentIn2021Count: 0,
    age65NotRequiringCareDependentIn2021Count: 0,
    age65NotRequiringCareDependentIn2021SevereDisabilityCount: 0,
    otherCount: 0,
    otherSevereDisabilityCount: 0,
    description: "",
  },
  dateOfBirth: "1990-01-01",
  municipality: "",
  municipalityRateOverride: null,
  hasSalariedIncome: false,
  salariedIncome: 0,
  withholdingTax: 0,
  withholdingTaxMode: "known",
  applyEmployeeProfessionalExpensesLumpSum: true,
  employeeProfessionalExpensesLumpSumOverride: null,
  companyDirectorRemuneration: 0,
  companyDirectorSocialContributionsAnnual: 0,
  profitEstimationMode: "manual",
  estimatedSelfEmployedProfit: 0,
  estimatedProfessionalExpenses: 0,
  ytdProfessionalIncome: 0,
  isSocialContributionsExempt: false,
  socialInsuranceFund: "partena",
  currentQuarterlySocialContribution: 0,
  socialContributionsOverride: null,
  studentSocialExemption: false,
  advanceTaxPaymentsMode: "none",
  advanceTaxPayments: 0,
  otherIncomeSources: {
    rental: { enabled: false, annualAmount: 0 },
    dividends: { enabled: false, annualAmount: 0 },
    foreign: { enabled: false, annualAmount: 0 },
    alimonyReceived: { enabled: false, annualAmount: 0 },
    otherProfessional: { enabled: false, annualAmount: 0 },
  },
  otherIncome: 0,
  companyRevenue: 0,
  companyExpenses: 0,
  companyDna: 0,
  companyCarriedForwardLoss: 0,
  companyFiscalYearEndDate: todayIsoDate(),
  companyTaxRegime: "sme-reduced",
  companyEstimatedTaxableProfitMode: "detailed",
  companyEstimatedTaxableProfit: 0,
  companyIsSme: true,
  companyDirectorRemunerationEligible: true,
  companyIsFinancialCompany: false,
  companyAgeYears: 0,
  companyAdvancePayments: {
    vai1: 0,
    vai2: 0,
    vai3: 0,
    vai4: 0,
  },
  companyHasDirectorsOrActivePartners: true,
  companyPrimaryDirectorId: null,
  companyDirectors: [],
  companyPartnerGrossSalary: 0,
  companyPartnerWithholdingTax: 0,
  companyIsSocialContributionsExempt: false,
  companyCurrentQuarterlySocialContribution: 0,
  companySocialPaidBy: "personal",
  companySocialPaidAmount: 0,
};

export const useTaxOnboardingStore = create<TaxOnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      values: defaultTaxOnboardingValues,

      setValues: (partial) =>
        set((state) => ({
          values: { ...state.values, ...partial },
        })),

      goNext: () =>
        set((state) => ({
          step: Math.min(TAX_WIZARD_TOTAL_STEPS, state.step + 1),
        })),

      goBack: () =>
        set((state) => ({
          step: Math.max(1, state.step - 1),
        })),

      goTo: (step) =>
        set(() => ({
          step: Math.max(1, Math.min(TAX_WIZARD_TOTAL_STEPS, step)),
        })),

      reset: () =>
        set(() => ({
          step: 1,
          values: defaultTaxOnboardingValues,
        })),

      addChild: (child) =>
        set((state) => {
          const generatedId =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : String(Date.now());
          const newChild: DependentChildInput = {
            dateOfBirth: todayIsoDate(),
            isDisabled: false,
            ...child,
            id: child?.id ?? generatedId,
          };
          return {
            values: {
              ...state.values,
              children: [...state.values.children, newChild],
            },
          };
        }),

      removeChild: (id) =>
        set((state) => ({
          values: {
            ...state.values,
            children: state.values.children.filter((c) => c.id !== id),
          },
        })),

      addCompanyDirector: (director) =>
        set((state) => {
          const generatedId =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : String(Date.now());
          const newDirector: CompanyDirectorInput = {
            id: director?.id ?? generatedId,
            name: director?.name ?? "",
            role: director?.role ?? "managing-director",
            monthlySalary: director?.monthlySalary ?? 0,
            expectedDividend: director?.expectedDividend ?? 0,
            socialContributionOverrideAnnual:
              director?.socialContributionOverrideAnnual ?? null,
            lumpSumExpensesAnnual: director?.lumpSumExpensesAnnual ?? 0,
            withholdingTaxAnnual: director?.withholdingTaxAnnual ?? 0,
            socialContributionsPaidByCompany:
              director?.socialContributionsPaidByCompany ?? false,
            hasCompanyCar: director?.hasCompanyCar ?? false,
          };
          return {
            values: {
              ...state.values,
              companyDirectors: [...state.values.companyDirectors, newDirector],
              companyPrimaryDirectorId:
                state.values.companyPrimaryDirectorId ?? newDirector.id,
            },
          };
        }),

      removeCompanyDirector: (id) =>
        set((state) => ({
          values: {
            ...state.values,
            companyDirectors: state.values.companyDirectors.filter(
              (director) => director.id !== id,
            ),
            companyPrimaryDirectorId:
              state.values.companyPrimaryDirectorId === id
                ? null
                : state.values.companyPrimaryDirectorId,
          },
        })),
    }),
    {
      name: "tax-onboarding-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ step: state.step, values: state.values }),
      merge: (persisted, current) => {
        const p = persisted as
          | { step?: number; values?: Partial<TaxOnboardingValues> }
          | undefined;
        const c = current as TaxOnboardingState;
        if (!p?.values) return { ...c, ...p } as TaxOnboardingState;
        const values: TaxOnboardingValues = {
          ...defaultTaxOnboardingValues,
          ...p.values,
          otherDependents:
            p.values.otherDependents ??
            defaultTaxOnboardingValues.otherDependents,
          studentSocialExemption:
            p.values.studentSocialExemption ??
            defaultTaxOnboardingValues.studentSocialExemption,
          companyAdvancePayments:
            p.values.companyAdvancePayments ??
            defaultTaxOnboardingValues.companyAdvancePayments,
          companyDirectors:
            p.values.companyDirectors ??
            defaultTaxOnboardingValues.companyDirectors,
        };
        // Best-effort partner migration from legacy booleans/flat fields.
        if (!p.values.partnerIncomeType) {
          values.partnerIncomeType = p.values.partnerHasSelfEmployedIncome
            ? "self-employed-main"
            : "employee";
        }
        if (
          values.partnerIncomeType === "employee" &&
          values.partnerSalariedIncome <= 0 &&
          values.partnerIncome > 0
        ) {
          values.partnerSalariedIncome = values.partnerIncome;
          values.partnerHasSalariedIncome = true;
        }
        if (
          values.partnerIncomeType === "self-employed-main" &&
          values.partnerEstimatedSelfEmployedIncome <= 0 &&
          values.partnerIncome > 0
        ) {
          values.partnerEstimatedSelfEmployedIncome = values.partnerIncome;
          values.partnerHasSelfEmployedIncome = true;
        }
        return { ...c, step: p.step ?? c.step, values } as TaxOnboardingState;
      },
    },
  ),
);
