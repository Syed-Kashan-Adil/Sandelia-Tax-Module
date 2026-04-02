# Company (ISOC) Flow Implementation Notes

## Summary

This update adds a dedicated **Company (ISOC)** onboarding flow that runs **separately from the existing Self-employed (IPP)** flow. Step 1 lets the user pick the engine:

- `self-employed` → existing IPP flow (unchanged)
- `company` → new ISOC flow with company-specific screens and summary

The ISOC engine implements the calculation order and business assumptions you provided, and supports **multiple company directors**. Social contributions are calculated per director using:
`monthlySalary * 12 + expectedDividend`

## What Was Added/Changed

### 1. Wizard routing (Engine selection)

Updated the wizard to render company steps only when `values.taxSubject === 'company'`.

File:

- `src/module/tax/TaxWizard.tsx`

Changes:

- Subject-aware step titles
- Subject-aware total steps and progress bar
- Conditional rendering of the correct step component set
- Company-specific back/next skip logic for partner-dependent steps

### 2. New Company UI Screens

New step components were added under `src/module/tax/steps/` to match the longer company onboarding flow (including marital/dependents-related pages and social contribution pages).

Added/Used steps:

- `Step2CompanyFiscalYearInfo.tsx` (fiscal year info + regime selection UI)
- `Step3CompanyEstimatedProfit.tsx` (manual estimated taxable profit toggle)
- `Step2CompanyProfile.tsx` (SME + eligibility profile: SME flag, director remuneration condition, financial company flag, company age)
- `Step3CompanyFinancials.tsx` (revenue, expenses, DNA, carried-forward losses)
- `Step4CompanyDirectors.tsx` (multiple directors; salary + expected dividend; optional social contribution override)
- `Step4MaritalStatus.tsx` (marital status page reused from IPP-style flow)
- `Step5PartnerIncome.tsx` (partner income page reused from IPP-style flow; conditional)
- `Step6Dependents.tsx` (dependent children and other dependents page reused)
- `Step7DateOfBirth.tsx` (DOB page reused)
- `Step8Municipality.tsx` (municipality page reused)
- `Step10CompanyAdditionalIncome.tsx` (connects/keeps IPP-style “additional personal income” pages for personal tax side)
- `Step11CompanySocialContributions.tsx` (company social contribution preview)
- `Step5CompanyAdvancePayments.tsx` (VAI1..VAI4 fields)
- `Step6CompanySummary.tsx` (final ISOC + increase summary)

### 3. Data model extensions

Extended onboarding state (`TaxOnboardingValues`) to include all company inputs required by ISOC + director social contributions.

File:

- `src/module/tax/types.ts`

Added:

- `CompanyDirectorInput`
- Company fields:
  - `companyRevenue`, `companyExpenses`, `companyDna`, `companyCarriedForwardLoss`
  - fiscal/regime/estimated profit:
    - `companyFiscalYearEndDate`
    - `companyTaxRegime: 'sme-reduced' | 'standard'`
    - `companyEstimatedTaxableProfitMode: 'manual' | 'detailed'`
    - `companyEstimatedTaxableProfit`
  - reduced rate eligibility flags:
    - `companyIsSme`
    - `companyDirectorRemunerationEligible`
    - `companyIsFinancialCompany`
  - `companyAgeYears`
  - `companyAdvancePayments.vai1..vai4`
  - `companyDirectors: CompanyDirectorInput[]`

### 4. Store actions for multiple directors

Added Zustand store methods for directors list:

- `addCompanyDirector`
- `removeCompanyDirector`

File:

- `src/module/tax/store.ts`

Also added default company values so IPP flow persistence remains safe.

### 5. ISOC calculation engine

New calculation module:

- `src/module/tax/calculator/companySummary.ts`

Engine highlights:

1. Accounting result: `accountingResult = revenue - expenses`
2. Add DNA: `taxResultBeforeLosses = accountingResult + companyDna`
3. Loss deduction:
   - `carriedForwardLossUsed = min(lossCarryForward, max(0, taxResultBeforeLosses))`
   - `taxableProfit = max(0, taxResultBeforeLosses - carriedForwardLossUsed)`
4. ISOC rate:
   - Reduced rate eligible → `20%` first `€100,000`, `25%` remainder
   - Otherwise → flat `25%`
5. Increase (theoretical):
   - `theoreticalIncrease = grossIsoc * 6.75%`
   - Starter exemption: first 3 years (based on `companyAgeYears`) when `companyTaxRegime` is SME reduced.
6. VAI reduction credit:
   - `vaiReductionCredit = vai1*9% + vai2*7.5% + vai3*6% + vai4*4.5%`
   - `finalIncrease = max(0, theoreticalIncrease - vaiReductionCredit)`
7. Final payable:
   - `finalTaxPayable = (grossIsoc + finalIncrease) - (vai1+vai2+vai3+vai4)`

### 6. Director social contributions (multi-director support)

Social contribution per director is computed using the existing self-employed contribution utility:

- per director annual base: `annualIncomeBase = monthlySalary * 12 + expectedDividend`
- annual + quarterly social are computed (and aggregated for total)

This is shown in the company social contribution step and summary.

### 7. Export/Integration wiring

Updated calculator exports:

- `src/module/tax/calculator/index.ts`

New company summary export:

- `calculateCompanyTaxSummary`

### 8. Verification / Scenario runner

Added a local scenario verification helper for Hypothesis 6/7 checks:

- `src/module/tax/calculator/hypothesisVerification.ts`

This script runs the calculator and prints computed results for comparison.

## Files Added (Quick List)

- `COMPANY_FLOW_IMPLEMENTATION.md`
- `src/module/tax/calculator/companySummary.ts`
- `src/module/tax/calculator/companySummary.scenarios.ts`
- `src/module/tax/steps/Step2CompanyFiscalYearInfo.tsx`
- `src/module/tax/steps/Step2CompanyProfile.tsx`
- `src/module/tax/steps/Step3CompanyEstimatedProfit.tsx`
- `src/module/tax/steps/Step3CompanyFinancials.tsx`
- `src/module/tax/steps/Step4CompanyDirectors.tsx`
- `src/module/tax/steps/Step5CompanyAdvancePayments.tsx`
- `src/module/tax/steps/Step6CompanySummary.tsx`
- `src/module/tax/steps/Step10CompanyAdditionalIncome.tsx`
- `src/module/tax/steps/Step11CompanySocialContributions.tsx`

## Files Updated (Quick List)

- `src/module/tax/TaxWizard.tsx`
- `src/module/tax/types.ts`
- `src/module/tax/store.ts`
- `src/module/tax/stepLogic.ts`
- `src/module/tax/steps/Step1TaxSubject.tsx`
- `src/module/tax/calculator/index.ts`

## Notes / Known Follow-ups

- There may still be formatting/lint warnings depending on the project’s eslint/prettier rules (especially import ordering).
- Hypothesis 6/7 matching to your provided numeric details depends on exact mapping between your scenario assumptions and how the IPP-style allowance/treatment is modeled in this engine.
