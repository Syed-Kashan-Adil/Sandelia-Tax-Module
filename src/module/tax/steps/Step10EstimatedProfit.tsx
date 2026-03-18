import { useMemo } from 'react'

import { cn } from '../../../lib/utils'
import {
  computeEstimatedAnnualProfessionalIncome,
  monthsSinceStart,
} from '../calculator/profitEstimation'
import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step10EstimatedProfit() {
  const activityStartDate = useTaxOnboardingStore((s) => s.values.activityStartDate)
  const profitEstimationMode = useTaxOnboardingStore((s) => s.values.profitEstimationMode)
  const estimatedSelfEmployedProfit = useTaxOnboardingStore(
    (s) => s.values.estimatedSelfEmployedProfit
  )
  const estimatedProfessionalExpenses = useTaxOnboardingStore(
    (s) => s.values.estimatedProfessionalExpenses
  )
  const ytdProfessionalIncome = useTaxOnboardingStore((s) => s.values.ytdProfessionalIncome)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  const months = useMemo(() => monthsSinceStart(activityStartDate), [activityStartDate])
  const annualIncome = useMemo(
    () =>
      computeEstimatedAnnualProfessionalIncome({
        ...useTaxOnboardingStore.getState().values,
        profitEstimationMode,
        estimatedSelfEmployedProfit,
        estimatedProfessionalExpenses,
        ytdProfessionalIncome,
      }),
    [
      estimatedProfessionalExpenses,
      estimatedSelfEmployedProfit,
      profitEstimationMode,
      ytdProfessionalIncome,
    ]
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <ModeOption
          title="Manual estimation"
          description="Enter your own estimated annual net profit"
          selected={profitEstimationMode === 'manual'}
          onSelect={() => setValues({ profitEstimationMode: 'manual' })}
        />
        <ModeOption
          title="Automatic extrapolation"
          description="Calculate based on year-to-date performance"
          selected={profitEstimationMode === 'automatic-extrapolation'}
          onSelect={() => setValues({ profitEstimationMode: 'automatic-extrapolation' })}
        />
        <ModeOption
          title="Conservative simulation"
          description="Use a cautious approach for your estimate"
          selected={profitEstimationMode === 'conservative'}
          onSelect={() => setValues({ profitEstimationMode: 'conservative' })}
        />
        <ModeOption
          title="I don’t know yet"
          description="Skip this for now and estimate later"
          selected={profitEstimationMode === 'unknown'}
          onSelect={() => setValues({ profitEstimationMode: 'unknown' })}
        />
      </div>

      <Field
        label={
          profitEstimationMode === 'automatic-extrapolation'
            ? `Year-to-date professional income (€)`
            : 'Estimated annual professional income (€)'
        }
        hint={
          profitEstimationMode === 'automatic-extrapolation'
            ? `We will extrapolate to 12 months using your start date (≈ ${months} month(s) so far).`
            : 'Used to estimate both federal tax and social contributions.'
        }
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={
            profitEstimationMode === 'automatic-extrapolation'
              ? ytdProfessionalIncome
              : estimatedSelfEmployedProfit
          }
          disabled={profitEstimationMode === 'unknown'}
          onChange={(e) => {
            const n = Number(e.target.value || 0)
            if (profitEstimationMode === 'automatic-extrapolation') {
              setValues({ ytdProfessionalIncome: n })
            } else {
              setValues({ estimatedSelfEmployedProfit: n })
            }
          }}
        />
      </Field>

      <Field
        label="Estimated professional expenses (annual)"
        hint="Used to estimate net income for social contributions: net = income − expenses."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={estimatedProfessionalExpenses}
          disabled={profitEstimationMode === 'unknown'}
          onChange={(e) =>
            setValues({ estimatedProfessionalExpenses: Number(e.target.value || 0) })
          }
        />
      </Field>

      <Field label="Estimated annual profit used in simulation">
        <Input value={annualIncome.toFixed(2)} disabled />
      </Field>
    </div>
  )
}

function ModeOption(props: {
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={cn(
        'flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition',
        props.selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-muted-foreground/50'
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{props.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{props.description}</div>
      </div>
      <span
        className={cn(
          'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
          props.selected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
        aria-hidden
      >
        {props.selected ? <span className="h-2 w-2 rounded-sm bg-white" /> : null}
      </span>
    </button>
  )
}
