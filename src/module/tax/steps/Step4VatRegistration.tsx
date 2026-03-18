import { cn } from '../../../lib/utils'
import { useTaxOnboardingStore } from '../store'

export function Step4VatRegistration() {
  const vatRegime = useTaxOnboardingStore((s) => s.values.vatRegime)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        This helps us tailor your tax simulation and invoicing advice.
      </div>

      <div className="grid gap-3">
        <VatOption
          title="Yes — Monthly VAT filings"
          description="You submit a VAT return every month."
          selected={vatRegime === 'yes-monthly'}
          onSelect={() => setValues({ vatRegime: 'yes-monthly' })}
        />
        <VatOption
          title="Yes — Quarterly VAT filings"
          description="You submit a VAT return every quarter."
          selected={vatRegime === 'yes-quarterly'}
          onSelect={() => setValues({ vatRegime: 'yes-quarterly' })}
        />
        <VatOption
          title="Mixed regime"
          description="Some activities follow different VAT reporting rules."
          selected={vatRegime === 'mixed'}
          onSelect={() => setValues({ vatRegime: 'mixed' })}
        />
        <VatOption
          title="VAT exemption (Small business regime)"
          description="You do not charge VAT because your annual turnover is below the legal threshold."
          selected={vatRegime === 'exemption-small-business'}
          onSelect={() => setValues({ vatRegime: 'exemption-small-business' })}
        />
        <VatOption
          title="No — Not subject to VAT"
          description="Your activity is legally exempt from VAT, so you do not charge VAT or file VAT returns."
          selected={vatRegime === 'no-not-subject'}
          onSelect={() => setValues({ vatRegime: 'no-not-subject' })}
        />
      </div>
    </div>
  )
}

function VatOption(props: {
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
