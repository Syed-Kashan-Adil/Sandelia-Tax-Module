import { RotateCcw } from 'lucide-react'
import { useMemo } from 'react'

import { calculateTaxSummary } from './calculator'
import { TAX_WIZARD_STEP_LOGIC } from './stepLogic'
import { Step1TaxSubject } from './steps/Step1TaxSubject'
import { Step2SelfEmployedStatus } from './steps/Step2SelfEmployedStatus'
import { Step3ActivityStartDate } from './steps/Step3ActivityStartDate'
import { Step4MaritalStatus } from './steps/Step4MaritalStatus'
import { Step4VatRegistration } from './steps/Step4VatRegistration'
import { Step5PartnerIncome } from './steps/Step5PartnerIncome'
import { Step6Dependents } from './steps/Step6Dependents'
import { Step7DateOfBirth } from './steps/Step7DateOfBirth'
import { Step8Municipality } from './steps/Step8Municipality'
import { Step9SalariedIncome } from './steps/Step9SalariedIncome'
import { Step10EstimatedProfit } from './steps/Step10EstimatedProfit'
import { Step11SocialContributions } from './steps/Step11SocialContributions'
import { Step12AdvancePayments } from './steps/Step12AdvancePayments'
import { Step13OtherIncome } from './steps/Step13OtherIncome'
import { Step14TaxSummary } from './steps/Step14TaxSummary'
import { TAX_WIZARD_TOTAL_STEPS, useTaxOnboardingStore } from './store'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card'
import { StepLogicPanel } from './ui/StepLogicPanel'

export function TaxWizard() {
  const step = useTaxOnboardingStore((s) => s.step)
  const values = useTaxOnboardingStore((s) => s.values)
  const reset = useTaxOnboardingStore((s) => s.reset)

  const stepTitle = useMemo(() => {
    const titles: Record<number, string> = {
      1: 'How are you taxed?',
      2: 'Self-employed status',
      3: 'Start date of activity',
      4: 'Are you registered for VAT?',
      5: 'Marital status',
      6: 'Partner income',
      7: 'Dependents',
      8: 'Date of birth',
      9: 'Municipality',
      10: 'Salaried income',
      11: 'Estimated professional income',
      12: 'Social contributions',
      13: 'Advance tax payments',
      14: 'Other income',
      15: 'Your Tax Profile Summary',
    }
    return titles[step] ?? `Step ${step}`
  }, [step])

  const progress = Math.round((step / TAX_WIZARD_TOTAL_STEPS) * 100)
  const summary = useMemo(() => (step === 15 ? calculateTaxSummary(values) : null), [step, values])
  const logicInfo = useMemo(() => TAX_WIZARD_STEP_LOGIC[step] ?? null, [step])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-muted-foreground">IPP onboarding</div>
          <div className="text-2xl font-semibold tracking-tight">{stepTitle}</div>
        </div>
        <Button variant="ghost" onClick={reset} type="button" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Step {step} of {TAX_WIZARD_TOTAL_STEPS}
          </div>
          <div>{progress}%</div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
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
            {step === 2 ? <Step2SelfEmployedStatus /> : null}
            {step === 3 ? <Step3ActivityStartDate /> : null}
            {step === 4 ? <Step4VatRegistration /> : null}
            {step === 5 ? <Step4MaritalStatus /> : null}
            {step === 6 ? <Step5PartnerIncome /> : null}
            {step === 7 ? <Step6Dependents /> : null}
            {step === 8 ? <Step7DateOfBirth /> : null}
            {step === 9 ? <Step8Municipality /> : null}
            {step === 10 ? <Step9SalariedIncome /> : null}
            {step === 11 ? <Step10EstimatedProfit /> : null}
            {step === 12 ? <Step11SocialContributions /> : null}
            {step === 13 ? <Step12AdvancePayments /> : null}
            {step === 14 ? <Step13OtherIncome /> : null}
            {step === 15 && summary ? <Step14TaxSummary summary={summary} /> : null}
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
                <StepLogicPanel step={step} info={logicInfo} className="border-0 p-0" />
              </div>
            </details>
          </div>
          <StepLogicPanel step={step} info={logicInfo} className="hidden lg:block" />
        </div>
      </div>
    </div>
  )
}

function WizardFooter() {
  const step = useTaxOnboardingStore((s) => s.step)
  const goBack = useTaxOnboardingStore((s) => s.goBack)
  const goNext = useTaxOnboardingStore((s) => s.goNext)
  const goTo = useTaxOnboardingStore((s) => s.goTo)
  const values = useTaxOnboardingStore((s) => s.values)

  const partnerStepVisible =
    values.maritalStatus === 'married' || values.maritalStatus === 'legally-cohabiting'

  const canGoBack = step > 1
  const canGoNext = step < TAX_WIZARD_TOTAL_STEPS

  const nextDisabled =
    (step === 1 && values.taxSubject === 'company') ||
    (step === 9 && values.municipality.trim() === '')

  const handleBack = () => {
    // Skip partner step if it isn't relevant.
    if (step === 7 && !partnerStepVisible) return goTo(5)
    goBack()
  }

  const handleNext = () => {
    // If marital status doesn't require partner income, skip step 5.
    if (step === 5 && !partnerStepVisible) return useTaxOnboardingStore.getState().goTo(7)
    goNext()
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={handleBack} disabled={!canGoBack}>
        Back
      </Button>
      <Button type="button" onClick={handleNext} disabled={!canGoNext || nextDisabled}>
        {step === TAX_WIZARD_TOTAL_STEPS - 1 ? 'View summary' : 'Next'}
      </Button>
    </>
  )
}
