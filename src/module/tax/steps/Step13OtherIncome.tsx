import { useMemo } from 'react'

import { cn } from '../../../lib/utils'
import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step13OtherIncome() {
  const sources = useTaxOnboardingStore((s) => s.values.otherIncomeSources)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  const total = useMemo(() => {
    const s = sources
    const sum =
      (s?.rental.enabled ? s.rental.annualAmount : 0) +
      (s?.dividends.enabled ? s.dividends.annualAmount : 0) +
      (s?.foreign.enabled ? s.foreign.annualAmount : 0) +
      (s?.alimonyReceived.enabled ? s.alimonyReceived.annualAmount : 0) +
      (s?.otherProfessional.enabled ? s.otherProfessional.annualAmount : 0)
    return Number.isFinite(sum) ? sum : 0
  }, [sources])

  const safeSources = sources ?? {
    rental: { enabled: false, annualAmount: 0 },
    dividends: { enabled: false, annualAmount: 0 },
    foreign: { enabled: false, annualAmount: 0 },
    alimonyReceived: { enabled: false, annualAmount: 0 },
    otherProfessional: { enabled: false, annualAmount: 0 },
  }

  function computeTotal(s: typeof safeSources) {
    const sum =
      (s.rental.enabled ? s.rental.annualAmount : 0) +
      (s.dividends.enabled ? s.dividends.annualAmount : 0) +
      (s.foreign.enabled ? s.foreign.annualAmount : 0) +
      (s.alimonyReceived.enabled ? s.alimonyReceived.annualAmount : 0) +
      (s.otherProfessional.enabled ? s.otherProfessional.annualAmount : 0)
    return Number.isFinite(sum) ? sum : 0
  }

  function setEnabled(key: keyof typeof safeSources, enabled: boolean) {
    const nextSources = {
      ...safeSources,
      [key]: {
        ...safeSources[key],
        enabled,
        annualAmount: enabled ? safeSources[key].annualAmount : 0,
      },
    }
    setValues({ otherIncomeSources: nextSources, otherIncome: computeTotal(nextSources) })
  }

  function setAmount(key: keyof typeof safeSources, amount: number) {
    const nextSources = {
      ...safeSources,
      [key]: { ...safeSources[key], annualAmount: amount },
    }
    setValues({ otherIncomeSources: nextSources, otherIncome: computeTotal(nextSources) })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <IncomeRow
          label="Rental income"
          selected={safeSources.rental.enabled}
          onToggle={() => setEnabled('rental', !safeSources.rental.enabled)}
        />
        {safeSources.rental.enabled ? (
          <Field label="Annual amount (€)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={safeSources.rental.annualAmount}
              onChange={(e) => setAmount('rental', Number(e.target.value || 0))}
            />
          </Field>
        ) : null}

        <IncomeRow
          label="Dividends"
          selected={safeSources.dividends.enabled}
          onToggle={() => setEnabled('dividends', !safeSources.dividends.enabled)}
        />
        {safeSources.dividends.enabled ? (
          <Field label="Annual amount (€)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={safeSources.dividends.annualAmount}
              onChange={(e) => setAmount('dividends', Number(e.target.value || 0))}
            />
          </Field>
        ) : null}

        <IncomeRow
          label="Foreign income"
          selected={safeSources.foreign.enabled}
          onToggle={() => setEnabled('foreign', !safeSources.foreign.enabled)}
        />
        {safeSources.foreign.enabled ? (
          <Field label="Annual amount (€)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={safeSources.foreign.annualAmount}
              onChange={(e) => setAmount('foreign', Number(e.target.value || 0))}
            />
          </Field>
        ) : null}

        <IncomeRow
          label="Alimony received"
          selected={safeSources.alimonyReceived.enabled}
          onToggle={() => setEnabled('alimonyReceived', !safeSources.alimonyReceived.enabled)}
        />
        {safeSources.alimonyReceived.enabled ? (
          <Field label="Annual amount (€)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={safeSources.alimonyReceived.annualAmount}
              onChange={(e) => setAmount('alimonyReceived', Number(e.target.value || 0))}
            />
          </Field>
        ) : null}

        <IncomeRow
          label="Other professional income"
          selected={safeSources.otherProfessional.enabled}
          onToggle={() => setEnabled('otherProfessional', !safeSources.otherProfessional.enabled)}
        />
        {safeSources.otherProfessional.enabled ? (
          <Field label="Annual amount (€)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={safeSources.otherProfessional.annualAmount}
              onChange={(e) => setAmount('otherProfessional', Number(e.target.value || 0))}
            />
          </Field>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-secondary/50 p-4">
        <div className="text-sm font-medium text-foreground">Total other income (annual)</div>
        <div className="mt-1 text-sm text-muted-foreground">€ {total.toFixed(2)}</div>
      </div>
    </div>
  )
}

function IncomeRow(props: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onToggle}
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition',
        props.selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-muted-foreground/50'
      )}
    >
      <div className="text-sm font-semibold text-foreground">{props.label}</div>
      <span
        className={cn(
          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
          props.selected ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
        aria-hidden
      >
        {props.selected ? <span className="h-2 w-2 rounded-sm bg-white" /> : null}
      </span>
    </button>
  )
}
