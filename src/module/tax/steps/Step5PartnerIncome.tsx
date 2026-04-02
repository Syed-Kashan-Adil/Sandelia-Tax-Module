import { useTaxOnboardingStore } from '../store'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step5PartnerIncome() {
  const maritalStatus = useTaxOnboardingStore((s) => s.values.maritalStatus)
  const partnerIncome = useTaxOnboardingStore((s) => s.values.partnerIncome)
  const partnerHasSalariedIncome = useTaxOnboardingStore((s) => s.values.partnerHasSalariedIncome)
  const partnerSalariedIncome = useTaxOnboardingStore((s) => s.values.partnerSalariedIncome)
  const partnerWithholdingTaxMode = useTaxOnboardingStore((s) => s.values.partnerWithholdingTaxMode)
  const partnerWithholdingTax = useTaxOnboardingStore((s) => s.values.partnerWithholdingTax)
  const partnerApplyLumpSum = useTaxOnboardingStore(
    (s) => s.values.partnerApplyEmployeeProfessionalExpensesLumpSum
  )
  const partnerLumpSumOverride = useTaxOnboardingStore(
    (s) => s.values.partnerEmployeeProfessionalExpensesLumpSumOverride
  )
  const partnerHasSelfEmployedIncome = useTaxOnboardingStore(
    (s) => s.values.partnerHasSelfEmployedIncome
  )
  const partnerEstimatedSelfEmployedIncome = useTaxOnboardingStore(
    (s) => s.values.partnerEstimatedSelfEmployedIncome
  )
  const partnerEstimatedProfessionalExpenses = useTaxOnboardingStore(
    (s) => s.values.partnerEstimatedProfessionalExpenses
  )
  const partnerSocialContributionsAnnual = useTaxOnboardingStore(
    (s) => s.values.partnerSocialContributionsAnnual
  )
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  const enabled = maritalStatus === 'married' || maritalStatus === 'legally-cohabiting'

  return (
    <div className="space-y-5">
      {!enabled ? (
        <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm">
          Partner income is only used for <b>married</b> or <b>legally cohabiting</b> couples
          (marital quotient). You can continue to the next step.
        </div>
      ) : null}

      <Field
        label="Partner income (fallback annual amount)"
        hint="Optional legacy fallback. If you fill partner salary/self-employed fields below, the calculator uses those detailed values instead."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={partnerIncome}
          onChange={(e) => setValues({ partnerIncome: Number(e.target.value || 0) })}
          disabled={!enabled}
        />
      </Field>

      {enabled ? (
        <>
          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
            <div className="text-sm font-medium">Partner salaried income</div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={partnerHasSalariedIncome ? 'primary' : 'secondary'}
                onClick={() => setValues({ partnerHasSalariedIncome: true })}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!partnerHasSalariedIncome ? 'primary' : 'secondary'}
                onClick={() =>
                  setValues({
                    partnerHasSalariedIncome: false,
                    partnerSalariedIncome: 0,
                    partnerWithholdingTaxMode: 'known',
                    partnerWithholdingTax: 0,
                    partnerApplyEmployeeProfessionalExpensesLumpSum: false,
                    partnerEmployeeProfessionalExpensesLumpSumOverride: null,
                  })
                }
              >
                No
              </Button>
            </div>

            <Field label="Partner taxable salary (annual €)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                disabled={!partnerHasSalariedIncome}
                value={partnerSalariedIncome}
                onChange={(e) => setValues({ partnerSalariedIncome: Number(e.target.value || 0) })}
              />
            </Field>

            <Field label="Partner withholding tax (€)">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={partnerWithholdingTaxMode === 'known' ? 'primary' : 'secondary'}
                  disabled={!partnerHasSalariedIncome}
                  onClick={() => setValues({ partnerWithholdingTaxMode: 'known' })}
                >
                  Known amount
                </Button>
                <Button
                  type="button"
                  variant={partnerWithholdingTaxMode === 'unknown' ? 'primary' : 'secondary'}
                  disabled={!partnerHasSalariedIncome}
                  onClick={() =>
                    setValues({
                      partnerWithholdingTaxMode: 'unknown',
                      partnerWithholdingTax: 0,
                    })
                  }
                >
                  I don&apos;t know
                </Button>
              </div>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                disabled={!partnerHasSalariedIncome || partnerWithholdingTaxMode !== 'known'}
                value={partnerWithholdingTax}
                onChange={(e) => setValues({ partnerWithholdingTax: Number(e.target.value || 0) })}
              />
            </Field>

            <Field label="Apply employee professional expenses lump sum?">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={partnerApplyLumpSum ? 'primary' : 'secondary'}
                  disabled={!partnerHasSalariedIncome}
                  onClick={() => setValues({ partnerApplyEmployeeProfessionalExpensesLumpSum: true })}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!partnerApplyLumpSum ? 'primary' : 'secondary'}
                  disabled={!partnerHasSalariedIncome}
                  onClick={() =>
                    setValues({
                      partnerApplyEmployeeProfessionalExpensesLumpSum: false,
                      partnerEmployeeProfessionalExpensesLumpSumOverride: null,
                    })
                  }
                >
                  No
                </Button>
              </div>
            </Field>
            <Field label="Partner lump sum override (optional €)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                disabled={!partnerHasSalariedIncome || !partnerApplyLumpSum}
                value={typeof partnerLumpSumOverride === 'number' ? partnerLumpSumOverride : ''}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw.trim() === '') {
                    setValues({ partnerEmployeeProfessionalExpensesLumpSumOverride: null })
                    return
                  }
                  const n = Number(raw)
                  setValues({
                    partnerEmployeeProfessionalExpensesLumpSumOverride: Number.isFinite(n) ? n : null,
                  })
                }}
              />
            </Field>
          </div>

          <div className="rounded-lg border border-border bg-secondary/40 p-4 space-y-4">
            <div className="text-sm font-medium">Partner self-employed income</div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={partnerHasSelfEmployedIncome ? 'primary' : 'secondary'}
                onClick={() => setValues({ partnerHasSelfEmployedIncome: true })}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!partnerHasSelfEmployedIncome ? 'primary' : 'secondary'}
                onClick={() =>
                  setValues({
                    partnerHasSelfEmployedIncome: false,
                    partnerEstimatedSelfEmployedIncome: 0,
                    partnerEstimatedProfessionalExpenses: 0,
                    partnerSocialContributionsAnnual: 0,
                  })
                }
              >
                No
              </Button>
            </div>
            <Field label="Partner gross self-employed income (annual €)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                disabled={!partnerHasSelfEmployedIncome}
                value={partnerEstimatedSelfEmployedIncome}
                onChange={(e) =>
                  setValues({ partnerEstimatedSelfEmployedIncome: Number(e.target.value || 0) })
                }
              />
            </Field>
            <Field label="Partner professional expenses (annual €)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                disabled={!partnerHasSelfEmployedIncome}
                value={partnerEstimatedProfessionalExpenses}
                onChange={(e) =>
                  setValues({ partnerEstimatedProfessionalExpenses: Number(e.target.value || 0) })
                }
              />
            </Field>
            <Field label="Partner social contributions (annual €)">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                disabled={!partnerHasSelfEmployedIncome}
                value={partnerSocialContributionsAnnual}
                onChange={(e) =>
                  setValues({ partnerSocialContributionsAnnual: Number(e.target.value || 0) })
                }
              />
            </Field>
          </div>
        </>
      ) : null}
    </div>
  )
}
