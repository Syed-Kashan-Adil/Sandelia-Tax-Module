import { defaultTaxOnboardingValues } from '../store'
import type { TaxOnboardingValues } from '../types'
import { calculateCompanyTaxSummary } from './companySummary'

type Scenario = {
  name: string
  input: Partial<TaxOnboardingValues>
  expected: {
    taxableProfit: number
    grossIsoc: number
    finalTaxPayable: number
  }
}

const BASE_COMPANY_INPUT: TaxOnboardingValues = {
  ...defaultTaxOnboardingValues,
  taxSubject: 'company',
}

export const companyScenarioCases: Scenario[] = [
  {
    name: 'Reduced rate below 100k',
    input: {
      companyRevenue: 80000,
      companyExpenses: 40000,
      companyDna: 10000,
      companyCarriedForwardLoss: 0,
      companyIsSme: true,
      companyDirectorRemunerationEligible: true,
      companyIsFinancialCompany: false,
    },
    expected: {
      taxableProfit: 50000,
      grossIsoc: 10000,
      finalTaxPayable: 10000,
    },
  },
  {
    name: 'Reduced rate split 20 and 25',
    input: {
      companyRevenue: 150000,
      companyExpenses: 30000,
      companyDna: 10000,
      companyCarriedForwardLoss: 20000,
      companyIsSme: true,
      companyDirectorRemunerationEligible: true,
      companyIsFinancialCompany: false,
    },
    expected: {
      taxableProfit: 110000,
      grossIsoc: 22500,
      finalTaxPayable: 22500,
    },
  },
  {
    name: 'Standard rate with no VAI',
    input: {
      companyRevenue: 150000,
      companyExpenses: 30000,
      companyDna: 10000,
      companyCarriedForwardLoss: 20000,
      companyIsSme: true,
      companyDirectorRemunerationEligible: false,
      companyIsFinancialCompany: false,
      companyAgeYears: 5,
    },
    expected: {
      taxableProfit: 110000,
      grossIsoc: 27500,
      finalTaxPayable: 29356.25,
    },
  },
]

export function runCompanyScenarioChecks(): string[] {
  return companyScenarioCases.flatMap((scenario) => {
    const summary = calculateCompanyTaxSummary({
      ...BASE_COMPANY_INPUT,
      ...scenario.input,
    })
    const errors: string[] = []
    if (summary.taxableProfit !== scenario.expected.taxableProfit) {
      errors.push(
        `${scenario.name}: taxableProfit expected ${scenario.expected.taxableProfit}, got ${summary.taxableProfit}`
      )
    }
    if (summary.grossIsoc !== scenario.expected.grossIsoc) {
      errors.push(
        `${scenario.name}: grossIsoc expected ${scenario.expected.grossIsoc}, got ${summary.grossIsoc}`
      )
    }
    if (summary.finalTaxPayable !== scenario.expected.finalTaxPayable) {
      errors.push(
        `${scenario.name}: finalTaxPayable expected ${scenario.expected.finalTaxPayable}, got ${summary.finalTaxPayable}`
      )
    }
    return errors
  })
}
