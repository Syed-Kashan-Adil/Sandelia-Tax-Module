import { useMemo } from 'react'

import { cn } from '../../../lib/utils'
import { computeEstimatedAnnualProfessionalIncome } from '../calculator/profitEstimation'
import { computeSocialContributions } from '../calculator/socialContributions'
import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step11SocialContributions() {
  const status = useTaxOnboardingStore((s) => s.values.selfEmployedStatus)
  const values = useTaxOnboardingStore((s) => s.values)
  const annualExpenses = useTaxOnboardingStore((s) => s.values.estimatedProfessionalExpenses)
  const isExempt = useTaxOnboardingStore((s) => s.values.isSocialContributionsExempt)
  const studentSocialExemption = useTaxOnboardingStore((s) => s.values.studentSocialExemption)
  const fund = useTaxOnboardingStore((s) => s.values.socialInsuranceFund)
  const currentQuarterly = useTaxOnboardingStore((s) => s.values.currentQuarterlySocialContribution)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  const annualProfit = useMemo(() => computeEstimatedAnnualProfessionalIncome(values), [values])

  const netIncome = useMemo(
    () => Math.max(0, annualProfit - annualExpenses),
    [annualProfit, annualExpenses]
  )

  // Manual override (if user provides current quarterly payment)
  const overrideAnnualAmount = useMemo(() => {
    if (isExempt) return 0
    if (currentQuarterly > 0) return currentQuarterly * 4
    return null
  }, [currentQuarterly, isExempt])

  const calculated = useMemo(
    () =>
      computeSocialContributions({
        status,
        annualNetIncome: netIncome,
        overrideAnnualAmount,
        socialInsuranceFund: fund,
        studentSocialExemption,
      }),
    [status, netIncome, overrideAnnualAmount, fund, studentSocialExemption]
  )

  if (status === 'company-director') {
    const annual = Math.max(0, values.companyDirectorSocialContributionsAnnual)
    const quarterly = annual / 4
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
          Company director mode uses the annual director social contributions entered in the
          previous step.
        </div>
        <Field label="Director social contributions (annual)">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            value={annual}
            onChange={(e) =>
              setValues({ companyDirectorSocialContributionsAnnual: Number(e.target.value || 0) })
            }
          />
        </Field>
        <Field label="Director social contributions (quarterly)">
          <Input value={quarterly.toFixed(2)} disabled />
        </Field>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {status === 'student' ? (
        <Field
          label="Student: exemption from provisional contribution (zone 1)?"
          hint="If exempt, zone 1 income uses €0 provisional contribution instead of the minimum base."
        >
          <div className="flex gap-4">
            <ToggleOption
              label="Exempt"
              checked={studentSocialExemption}
              onChange={() => setValues({ studentSocialExemption: true })}
            />
            <ToggleOption
              label="Not exempt (provisional minimum applies)"
              checked={!studentSocialExemption}
              onChange={() => setValues({ studentSocialExemption: false })}
            />
          </div>
        </Field>
      ) : null}

      <Field label="Are you exempt from paying social contributions?">
        <div className="flex gap-4">
          <ToggleOption
            label="Yes"
            checked={isExempt}
            onChange={() =>
              setValues({
                isSocialContributionsExempt: true,
                currentQuarterlySocialContribution: 0,
                socialContributionsOverride: 0,
              })
            }
          />
          <ToggleOption
            label="No"
            checked={!isExempt}
            onChange={() =>
              setValues({
                isSocialContributionsExempt: false,
                socialContributionsOverride: null,
              })
            }
          />
        </div>
      </Field>

      <Field label="Which social insurance fund are you affiliated with?">
        <div className="grid gap-3 md:grid-cols-2">
          <FundOption
            label="Securex"
            selected={fund === 'securex'}
            onSelect={() => setValues({ socialInsuranceFund: 'securex' })}
          />
          <FundOption
            label="Xerius"
            selected={fund === 'xerius'}
            onSelect={() => setValues({ socialInsuranceFund: 'xerius' })}
          />
          <FundOption
            label="Liantis"
            selected={fund === 'liantis'}
            onSelect={() => setValues({ socialInsuranceFund: 'liantis' })}
          />
          <FundOption
            label="UCM"
            selected={fund === 'ucm'}
            onSelect={() => setValues({ socialInsuranceFund: 'ucm' })}
          />
          <FundOption
            label="Partena"
            selected={fund === 'partena'}
            onSelect={() => setValues({ socialInsuranceFund: 'partena' })}
          />
          <FundOption
            label="Other"
            selected={fund === 'other'}
            onSelect={() => setValues({ socialInsuranceFund: 'other' })}
          />
        </div>
      </Field>

      <Field
        label="How much do you currently pay per quarter? (€)"
        hint="Leave 0 to use the automatic estimate."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={currentQuarterly}
          disabled={isExempt}
          onChange={(e) =>
            setValues({
              currentQuarterlySocialContribution: Number(e.target.value || 0),
              socialContributionsOverride:
                Number(e.target.value || 0) > 0 ? Number(e.target.value || 0) * 4 : null,
            })
          }
        />
      </Field>

      <div className="rounded-lg border border-border bg-secondary/50 p-4">
        <div className="text-sm font-medium">Automatic estimate</div>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <Field label="Net income (annual)" hint="Net = income − expenses">
            <Input value={netIncome.toFixed(2)} disabled />
          </Field>
          <Field label="Annual contributions">
            <Input value={calculated.annualAmount.toFixed(2)} disabled />
          </Field>
          <Field label="Quarterly contributions">
            <Input value={calculated.quarterlyAmount.toFixed(2)} disabled />
          </Field>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          If you entered a current quarterly payment, it is used as an override (quarterly × 4).
          {fund === 'partena' ? (
            <> Partena published scales are quarterly; annual is displayed as quarterly × 4.</>
          ) : null}
          {calculated.method === 'calculated' ? (
            <>
              {' '}
              Legal annual (before {fund} fee): €{calculated.legalAnnualBeforeFees.toFixed(2)}; fee{' '}
              {(calculated.fundFeeRate * 100).toFixed(2)}%.
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition',
        checked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background hover:border-muted-foreground/50'
      )}
    >
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={cn(
          'h-4 w-4 rounded border-2',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
        aria-hidden
      />
      {label}
    </label>
  )
}

function FundOption(props: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={cn(
        'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition',
        props.selected
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-card hover:border-muted-foreground/50'
      )}
    >
      <span>{props.label}</span>
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center rounded border-2',
          props.selected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
        aria-hidden
      >
        {props.selected ? <span className="h-2 w-2 rounded-sm bg-white" /> : null}
      </span>
    </button>
  )
}
