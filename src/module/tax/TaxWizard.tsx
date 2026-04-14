import { RotateCcw } from "lucide-react";
import { useMemo } from "react";

import { calculateCompanyTaxSummary, calculateTaxSummary } from "./calculator";
import { computeSocialContributions } from "./calculator/socialContributions";
import { IPP_2026 } from "./constants";
import { COMPANY_WIZARD_STEP_LOGIC, TAX_WIZARD_STEP_LOGIC } from "./stepLogic";
import { Step1TaxSubject } from "./steps/Step1TaxSubject";
import { Step2CompanyFiscalYearInfo } from "./steps/Step2CompanyFiscalYearInfo";
import { Step2CompanyProfile } from "./steps/Step2CompanyProfile";
import { Step2SelfEmployedStatus } from "./steps/Step2SelfEmployedStatus";
import { Step3ActivityStartDate } from "./steps/Step3ActivityStartDate";
import { Step3CompanyEstimatedProfit } from "./steps/Step3CompanyEstimatedProfit";
import { Step3CompanyFinancials } from "./steps/Step3CompanyFinancials";
import { Step4CompanyDirectors } from "./steps/Step4CompanyDirectors";
import { Step4MaritalStatus } from "./steps/Step4MaritalStatus";
import { Step4VatRegistration } from "./steps/Step4VatRegistration";
import { Step5PartnerIncome } from "./steps/Step5PartnerIncome";
import { Step6CompanySummary } from "./steps/Step6CompanySummary";
import { Step6Dependents } from "./steps/Step6Dependents";
import { Step7DateOfBirth } from "./steps/Step7DateOfBirth";
import { Step8Municipality } from "./steps/Step8Municipality";
import { Step9SalariedIncome } from "./steps/Step9SalariedIncome";
import { Step10CompanyAdditionalIncome } from "./steps/Step10CompanyAdditionalIncome";
import { Step10EstimatedProfit } from "./steps/Step10EstimatedProfit";
import { Step11CompanySocialContributions } from "./steps/Step11CompanySocialContributions";
import { Step11SocialContributions } from "./steps/Step11SocialContributions";
import { Step12AdvancePayments } from "./steps/Step12AdvancePayments";
import { Step13OtherIncome } from "./steps/Step13OtherIncome";
import { Step14TaxSummary } from "./steps/Step14TaxSummary";
import { TAX_WIZARD_TOTAL_STEPS, useTaxOnboardingStore } from "./store";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { StepLogicPanel } from "./ui/StepLogicPanel";

export function TaxWizard() {
  const step = useTaxOnboardingStore((s) => s.step);
  const values = useTaxOnboardingStore((s) => s.values);
  const reset = useTaxOnboardingStore((s) => s.reset);
  const isCompany = values.taxSubject === "company";
  const totalSteps = isCompany ? 14 : TAX_WIZARD_TOTAL_STEPS;

  const stepTitle = useMemo(() => {
    const ippTitles: Record<number, string> = {
      1: "How are you taxed?",
      2: "Self-employed status",
      3: "Start date of activity",
      4: "Are you registered for VAT?",
      5: "Marital status",
      6: "Partner income",
      7: "Dependents",
      8: "Date of birth",
      9: "Municipality",
      10: "Salaried income",
      11: "Estimated professional income",
      12: "Social contributions",
      13: "Advance tax payments",
      14: "Other income",
      15: "Your Tax Profile Summary",
    };
    const companyTitles: Record<number, string> = {
      1: "How are you taxed?",
      2: "Fiscal year information",
      3: "Estimated taxable profit",
      4: "Company profile",
      5: "Company financials",
      6: "Directors",
      7: "Marital status",
      8: "Partner income",
      9: "Personal situation",
      10: "Additional personal income",
      11: "Social contributions",
      12: "Income tax prepayments",
      13: "Municipality",
      14: "Company summary",
    };
    const titles = isCompany ? companyTitles : ippTitles;
    return titles[step] ?? `Step ${step}`;
  }, [isCompany, step]);

  const progress = Math.round((Math.min(step, totalSteps) / totalSteps) * 100);
  const ippSummary = useMemo(
    () =>
      !isCompany && step === TAX_WIZARD_TOTAL_STEPS
        ? calculateTaxSummary(values)
        : null,
    [isCompany, step, values],
  );
  const companySummary = useMemo(
    () =>
      isCompany && step === totalSteps
        ? calculateCompanyTaxSummary(values)
        : null,
    [isCompany, step, totalSteps, values],
  );
  const companyPersonalSummary = useMemo(
    () =>
      isCompany && step === totalSteps
        ? (() => {
            const primary =
              values.companyDirectors.find(
                (d) => d.id === values.companyPrimaryDirectorId,
              ) ?? values.companyDirectors[0];
            const mrRemuneration =
              (primary ? primary.monthlySalary * 12 : 0) +
              (primary ? primary.expectedDividend : 0);
            const socialAnnualFromInputs =
              values.companyIsSocialContributionsExempt
                ? 0
                : Math.max(
                    0,
                    values.companySocialPaidAmount > 0
                      ? values.companySocialPaidAmount
                      : (primary?.socialContributionOverrideAnnual ??
                          computeSocialContributions({
                            status: "main",
                            annualNetIncome: mrRemuneration,
                            overrideAnnualAmount: null,
                            socialInsuranceFund: values.socialInsuranceFund,
                            studentSocialExemption: false,
                          }).annualAmount),
                  );
            const mrWithholding = primary ? primary.withholdingTaxAnnual : 0;
            const partnerGross = Math.max(
              0,
              values.partnerIncome > 0
                ? values.partnerIncome
                : values.companyPartnerGrossSalary,
            );
            const partnerWithholding = Math.max(
              0,
              Math.max(
                values.partnerWithholdingTax,
                values.companyPartnerWithholdingTax,
              ),
            );
            const socialAnnual = socialAnnualFromInputs;

            return calculateTaxSummary({
              ...values,
              taxSubject: "self-employed",
              selfEmployedStatus: "company-director",
              profitEstimationMode: "manual",
              companyDirectorRemuneration: mrRemuneration,
              companyDirectorSocialContributionsAnnual: socialAnnual,
              companyDirectorSocialContributionsPaidByCompany:
                values.companySocialPaidBy === "company",
              estimatedSelfEmployedProfit: 0,
              estimatedProfessionalExpenses: 0,
              isSocialContributionsExempt:
                values.companyIsSocialContributionsExempt,
              currentQuarterlySocialContribution:
                values.companyCurrentQuarterlySocialContribution > 0
                  ? values.companyCurrentQuarterlySocialContribution
                  : values.companySocialPaidAmount > 0
                    ? values.companySocialPaidAmount / 4
                    : 0,
              socialContributionsOverride: null,
              partnerIncome: partnerGross,
              partnerIncomeType: "employee",
              partnerSalariedIncome: partnerGross,
              partnerWithholdingTaxMode: "known",
              partnerWithholdingTax: partnerWithholding,
              withholdingTaxMode: "known",
              withholdingTax: mrWithholding,
              hasSalariedIncome: values.hasSalariedIncome,
              salariedIncome: values.salariedIncome,
              applyEmployeeProfessionalExpensesLumpSum:
                values.hasSalariedIncome &&
                values.applyEmployeeProfessionalExpensesLumpSum,
              employeeProfessionalExpensesLumpSumOverride:
                values.hasSalariedIncome
                  ? values.employeeProfessionalExpensesLumpSumOverride
                  : null,
            });
          })()
        : null,
    [isCompany, step, totalSteps, values],
  );
  const logicInfo = useMemo(
    () =>
      (isCompany
        ? COMPANY_WIZARD_STEP_LOGIC[step]
        : TAX_WIZARD_STEP_LOGIC[step]) ?? null,
    [isCompany, step],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">IPP onboarding</div>
          <div className="text-2xl font-semibold tracking-tight">
            {stepTitle}
          </div>
        </div>
        <Button variant="ghost" onClick={reset} type="button" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Step {Math.min(step, totalSteps)} of {totalSteps}
          </div>
          <div>{progress}%</div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>{stepTitle}</CardTitle>
            <CardDescription>
              Provide a quick estimate. You can go back and adjust anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? <Step1TaxSubject /> : null}
            {!isCompany && step === 2 ? <Step2SelfEmployedStatus /> : null}
            {!isCompany && step === 3 ? <Step3ActivityStartDate /> : null}
            {!isCompany && step === 4 ? <Step4VatRegistration /> : null}
            {!isCompany && step === 5 ? <Step4MaritalStatus /> : null}
            {!isCompany && step === 6 ? <Step5PartnerIncome /> : null}
            {!isCompany && step === 7 ? <Step6Dependents /> : null}
            {!isCompany && step === 8 ? <Step7DateOfBirth /> : null}
            {!isCompany && step === 9 ? <Step8Municipality /> : null}
            {!isCompany && step === 10 ? <Step9SalariedIncome /> : null}
            {!isCompany && step === 11 ? <Step10EstimatedProfit /> : null}
            {!isCompany && step === 12 ? <Step11SocialContributions /> : null}
            {!isCompany && step === 13 ? <Step12AdvancePayments /> : null}
            {!isCompany && step === 14 ? <Step13OtherIncome /> : null}
            {!isCompany && step === 15 && ippSummary ? (
              <Step14TaxSummary summary={ippSummary} />
            ) : null}

            {isCompany && step === 2 ? <Step2CompanyFiscalYearInfo /> : null}
            {isCompany && step === 3 ? <Step3CompanyEstimatedProfit /> : null}
            {isCompany && step === 4 ? <Step2CompanyProfile /> : null}
            {isCompany && step === 5 ? <Step3CompanyFinancials /> : null}
            {isCompany && step === 6 ? <Step4CompanyDirectors /> : null}
            {isCompany && step === 7 ? <Step4MaritalStatus /> : null}
            {isCompany && step === 8 ? <Step5PartnerIncome /> : null}
            {isCompany && step === 9 ? (
              <div className="space-y-6">
                <Step6Dependents />
                <Step7DateOfBirth />
              </div>
            ) : null}
            {isCompany && step === 10 ? (
              <Step10CompanyAdditionalIncome />
            ) : null}
            {isCompany && step === 11 ? (
              <Step11CompanySocialContributions />
            ) : null}
            {isCompany && step === 12 ? <Step12AdvancePayments /> : null}
            {isCompany && step === 13 ? <Step8Municipality /> : null}
            {isCompany && step === 14 && companySummary ? (
              <Step6CompanySummary
                summary={companySummary}
                personalSummary={companyPersonalSummary}
                directorFlatRateDetails={
                  companyPersonalSummary
                    ? {
                        grossProfessionalIncome: roundTo2(
                          (values.companyDirectors.find(
                            (d) => d.id === values.companyPrimaryDirectorId,
                          )?.monthlySalary ??
                            values.companyDirectors[0]?.monthlySalary ??
                            0) *
                            12 +
                            (values.companyDirectors.find(
                              (d) => d.id === values.companyPrimaryDirectorId,
                            )?.expectedDividend ??
                              values.companyDirectors[0]?.expectedDividend ??
                              0),
                        ),
                        socialContributionsDeducted: roundTo2(
                          values.companyIsSocialContributionsExempt
                            ? 0
                            : Math.max(
                                0,
                                values.companySocialPaidAmount > 0
                                  ? values.companySocialPaidAmount
                                  : (values.companyDirectors.find(
                                      (d) =>
                                        d.id ===
                                        values.companyPrimaryDirectorId,
                                    )?.socialContributionOverrideAnnual ??
                                      computeSocialContributions({
                                        status: "main",
                                        annualNetIncome:
                                          (values.companyDirectors.find(
                                            (d) =>
                                              d.id ===
                                              values.companyPrimaryDirectorId,
                                          )?.monthlySalary ??
                                            values.companyDirectors[0]
                                              ?.monthlySalary ??
                                            0) *
                                            12 +
                                          (values.companyDirectors.find(
                                            (d) =>
                                              d.id ===
                                              values.companyPrimaryDirectorId,
                                          )?.expectedDividend ??
                                            values.companyDirectors[0]
                                              ?.expectedDividend ??
                                            0),
                                        overrideAnnualAmount: null,
                                        socialInsuranceFund:
                                          values.socialInsuranceFund,
                                        studentSocialExemption: false,
                                      }).annualAmount),
                              ),
                        ),
                        rate: 0.03,
                        cap: IPP_2026.professionalExpenses
                          .companyDirectorLumpSumMax,
                        flatRateApplied: roundTo2(
                          companyPersonalSummary.selfEmployedProfessionalExpenses,
                        ),
                      }
                    : null
                }
              />
            ) : null}
          </CardContent>
          <CardFooter>
            <WizardFooter />
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <div className="lg:hidden">
            <details className="rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                Logic & Source
              </summary>
              <div className="mt-3">
                <StepLogicPanel
                  step={step}
                  info={logicInfo}
                  className="border-0 p-0"
                />
              </div>
            </details>
          </div>
          <StepLogicPanel
            step={step}
            info={logicInfo}
            className="hidden lg:block"
          />
        </div>
      </div>
    </div>
  );
}

function roundTo2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function WizardFooter() {
  const step = useTaxOnboardingStore((s) => s.step);
  const goBack = useTaxOnboardingStore((s) => s.goBack);
  const goNext = useTaxOnboardingStore((s) => s.goNext);
  const goTo = useTaxOnboardingStore((s) => s.goTo);
  const values = useTaxOnboardingStore((s) => s.values);
  const isCompany = values.taxSubject === "company";
  const totalSteps = isCompany ? 14 : TAX_WIZARD_TOTAL_STEPS;

  const partnerStepVisible =
    values.maritalStatus === "married" ||
    values.maritalStatus === "legally-cohabiting";

  const canGoBack = step > 1;
  const canGoNext = step < totalSteps;

  const nextDisabled =
    (!isCompany && step === 9 && values.municipality.trim() === "") ||
    (isCompany &&
      step === 6 &&
      values.companyHasDirectorsOrActivePartners &&
      values.companyDirectors.length === 0) ||
    (isCompany && step === 13 && values.municipality.trim() === "");

  const handleBack = () => {
    if (isCompany) {
      if (step === 9 && !partnerStepVisible) return goTo(7);
      return goBack();
    }
    // Skip partner step if it isn't relevant.
    if (step === 7 && !partnerStepVisible) return goTo(5);
    goBack();
  };

  const handleNext = () => {
    if (isCompany) {
      if (step === 7 && !partnerStepVisible) return goTo(9);
      return goNext();
    }
    // If marital status doesn't require partner income, skip step 5.
    if (step === 5 && !partnerStepVisible)
      return useTaxOnboardingStore.getState().goTo(7);
    goNext();
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={handleBack}
        disabled={!canGoBack}
      >
        Back
      </Button>
      <Button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext || nextDisabled}
      >
        {step === totalSteps - 1 ? "View summary" : "Next"}
      </Button>
    </>
  );
}
