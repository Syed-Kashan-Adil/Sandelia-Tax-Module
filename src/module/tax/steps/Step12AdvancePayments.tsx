import { cn } from '../../../lib/utils'
import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step12AdvancePayments() {
  const advanceTaxPayments = useTaxOnboardingStore((s) => s.values.advanceTaxPayments)
  const mode = useTaxOnboardingStore((s) => s.values.advanceTaxPaymentsMode)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        <OptionRow
          title="No"
          description="I prefer not to make advance payments"
          selected={mode === 'none'}
          onSelect={() => setValues({ advanceTaxPaymentsMode: 'none', advanceTaxPayments: 0 })}
        />
        <OptionRow
          title="Yes — Spread throughout the year"
          description="Distribute payments evenly across quarters"
          selected={mode === 'spread'}
          onSelect={() => setValues({ advanceTaxPaymentsMode: 'spread' })}
        />
        <OptionRow
          title="Yes — Optimize for maximum tax reduction"
          description="Strategic payment schedule to minimize penalties"
          selected={mode === 'optimize'}
          onSelect={() => setValues({ advanceTaxPaymentsMode: 'optimize' })}
        />
      </div>

      <Field
        label="Advance tax payments (annual total)"
        hint="Optional: enter the total you plan to pay (or have already paid). This amount is deducted from the final tax due."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={advanceTaxPayments}
          disabled={mode === 'none'}
          onChange={(e) => setValues({ advanceTaxPayments: Number(e.target.value || 0) })}
        />
      </Field>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="text-sm font-semibold text-foreground">Why make advance payments?</div>
        <div className="mt-1 text-sm text-muted-foreground">
          Making advance tax payments can help you avoid a large tax bill at the end of the year and
          may reduce or eliminate penalty interest on unpaid taxes.
        </div>
      </div>
    </div>
  )
}

function OptionRow(props: {
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
        'flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition',
        props.selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-muted-foreground/50'
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{props.title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{props.description}</div>
      </div>
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
