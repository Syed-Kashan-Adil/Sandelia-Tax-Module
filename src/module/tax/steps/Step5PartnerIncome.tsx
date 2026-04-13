import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export function Step5PartnerIncome() {
  const maritalStatus = useTaxOnboardingStore((s) => s.values.maritalStatus)
  const values = useTaxOnboardingStore((s) => s.values)
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

      <Field label="What type of income does your partner have?">
        <Select
          value={values.partnerIncomeType}
          onChange={(e) =>
            setValues({ partnerIncomeType: e.target.value as typeof values.partnerIncomeType })
          }
          disabled={!enabled}
        >
          <option value="employee">Employee</option>
          <option value="self-employed-main">Self-employed (main activity)</option>
          <option value="self-employed-secondary">Self-employed (secondary activity)</option>
          <option value="company-director">Company director</option>
          <option value="assisting-spouse">Assisting spouse</option>
        </Select>
      </Field>

      {values.partnerIncomeType === 'employee' ? (
        <>
          <Field label="Partner gross taxable income (Form 281.10)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={values.partnerSalariedIncome}
              onChange={(e) =>
                setValues({
                  partnerSalariedIncome: Number(e.target.value || 0),
                  partnerIncome: Number(e.target.value || 0),
                  partnerHasSalariedIncome: true,
                  partnerHasSelfEmployedIncome: false,
                })
              }
              disabled={!enabled}
            />
          </Field>
        </>
      ) : null}

      {values.partnerIncomeType === 'self-employed-main' ? (
        <>
          <Field label="Partner self-employed income">
            <Input
              type="number"
              min={0}
              value={values.partnerEstimatedSelfEmployedIncome}
              onChange={(e) =>
                setValues({
                  partnerEstimatedSelfEmployedIncome: Number(e.target.value || 0),
                  partnerHasSelfEmployedIncome: true,
                  partnerHasSalariedIncome: false,
                })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner professional expenses">
            <Input
              type="number"
              min={0}
              value={values.partnerEstimatedProfessionalExpenses}
              onChange={(e) =>
                setValues({ partnerEstimatedProfessionalExpenses: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner social contributions paid (manual input, annual)">
            <Input
              type="number"
              min={0}
              value={values.partnerSocialContributionsAnnual}
              onChange={(e) =>
                setValues({ partnerSocialContributionsAnnual: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
        </>
      ) : null}

      {values.partnerIncomeType === 'self-employed-secondary' ? (
        <>
          <Field label="Partner employment income">
            <Input
              type="number"
              min={0}
              value={values.partnerEmploymentIncomeForSecondaryActivity}
              onChange={(e) =>
                setValues({
                  partnerEmploymentIncomeForSecondaryActivity: Number(e.target.value || 0),
                  partnerHasSalariedIncome: true,
                })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner self-employed income">
            <Input
              type="number"
              min={0}
              value={values.partnerEstimatedSelfEmployedIncome}
              onChange={(e) =>
                setValues({
                  partnerEstimatedSelfEmployedIncome: Number(e.target.value || 0),
                  partnerHasSelfEmployedIncome: true,
                })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner professional expenses">
            <Input
              type="number"
              min={0}
              value={values.partnerEstimatedProfessionalExpenses}
              onChange={(e) =>
                setValues({ partnerEstimatedProfessionalExpenses: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner social contributions paid (manual input, annual)">
            <Input
              type="number"
              min={0}
              value={values.partnerSocialContributionsAnnual}
              onChange={(e) =>
                setValues({ partnerSocialContributionsAnnual: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
        </>
      ) : null}

      {values.partnerIncomeType === 'company-director' ? (
        <>
          <Field label="Partner director remuneration">
            <Input
              type="number"
              min={0}
              value={values.partnerCompanyDirectorRemuneration}
              onChange={(e) =>
                setValues({ partnerCompanyDirectorRemuneration: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner social contributions paid (manual input, annual)">
            <Input
              type="number"
              min={0}
              value={values.partnerCompanyDirectorSocialContributionsAnnual}
              onChange={(e) =>
                setValues({
                  partnerCompanyDirectorSocialContributionsAnnual: Number(
                    e.target.value || 0,
                  ),
                })
              }
              disabled={!enabled}
            />
          </Field>
        </>
      ) : null}

      {values.partnerIncomeType === 'assisting-spouse' ? (
        <>
          <Field label="Assisting spouse regime">
            <Select
              value={values.partnerAssistingSpouseStatus}
              onChange={(e) =>
                setValues({
                  partnerAssistingSpouseStatus: e.target.value as typeof values.partnerAssistingSpouseStatus,
                })
              }
              disabled={!enabled}
            >
              <option value="assisting-spouse-maxi">Assisting spouse (maxi)</option>
              <option value="assisting-spouse-mini">Assisting spouse (mini)</option>
            </Select>
          </Field>
          <Field label="Partner assisting spouse income">
            <Input
              type="number"
              min={0}
              value={values.partnerEstimatedSelfEmployedIncome}
              onChange={(e) =>
                setValues({ partnerEstimatedSelfEmployedIncome: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner professional expenses">
            <Input
              type="number"
              min={0}
              value={values.partnerEstimatedProfessionalExpenses}
              onChange={(e) =>
                setValues({ partnerEstimatedProfessionalExpenses: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
          <Field label="Partner social contributions paid (manual input, annual)">
            <Input
              type="number"
              min={0}
              value={values.partnerSocialContributionsAnnual}
              onChange={(e) =>
                setValues({ partnerSocialContributionsAnnual: Number(e.target.value || 0) })
              }
              disabled={!enabled}
            />
          </Field>
        </>
      ) : null}

      <Field label="Partner withholding tax amount (€)">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={values.partnerWithholdingTax}
          onChange={(e) =>
            setValues({
              partnerWithholdingTax: Number(e.target.value || 0),
              partnerWithholdingTaxMode: Number(e.target.value || 0) > 0 ? 'known' : 'unknown',
            })
          }
          disabled={!enabled}
        />
      </Field>
    </div>
  )
}
