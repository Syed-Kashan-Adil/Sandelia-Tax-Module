import { cn } from '../../../lib/utils'
import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step12AdvancePayments() {
  const advanceTaxPayments = useTaxOnboardingStore((s) => s.values.advanceTaxPayments)
  const mode = useTaxOnboardingStore((s) => s.values.advanceTaxPaymentsMode)
  const taxSubject = useTaxOnboardingStore((s) => s.values.taxSubject)
  const fiscalYearStart = useTaxOnboardingStore((s) => s.values.activityStartDate)
  const fiscalYearEnd = useTaxOnboardingStore((s) => s.values.companyFiscalYearEndDate)
  const setValues = useTaxOnboardingStore((s) => s.setValues)
  const isCompany = taxSubject === 'company'

  const quarterPlan = buildQuarterPlan({
    annualTotal: advanceTaxPayments,
    mode,
  })
  const fiscalQuarterRanges = isCompany
    ? buildFiscalQuarterRanges({ startIso: fiscalYearStart, endIso: fiscalYearEnd })
    : null

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

      {mode !== 'none' && advanceTaxPayments > 0 ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-sm font-semibold text-foreground">
            Quarter-wise payment breakdown
          </div>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {quarterPlan.map((q, idx) => (
              <div key={q.label} className="rounded-lg border border-border/70 bg-secondary/30 p-3">
                <div className="text-xs font-medium text-foreground">
                  {q.label}
                  {isCompany && fiscalQuarterRanges ? (
                    <span className="ml-1 text-muted-foreground">
                      ({fiscalQuarterRanges[idx]})
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">{eur(q.amount)}</div>
              </div>
            ))}
          </div>
          {isCompany ? (
            <div className="mt-2 text-xs text-muted-foreground">
              Quarters are shown against your fiscal year dates.
            </div>
          ) : null}
        </div>
      ) : null}

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

function buildQuarterPlan(params: {
  annualTotal: number
  mode: 'none' | 'spread' | 'optimize'
}): Array<{ label: 'Q1' | 'Q2' | 'Q3' | 'Q4'; amount: number }> {
  const total = Math.max(0, params.annualTotal)
  if (total <= 0 || params.mode === 'none') {
    return [
      { label: 'Q1', amount: 0 },
      { label: 'Q2', amount: 0 },
      { label: 'Q3', amount: 0 },
      { label: 'Q4', amount: 0 },
    ]
  }
  if (params.mode === 'optimize') {
    return [
      { label: 'Q1', amount: round2(total) },
      { label: 'Q2', amount: 0 },
      { label: 'Q3', amount: 0 },
      { label: 'Q4', amount: 0 },
    ]
  }
  const perQuarter = round2(total / 4)
  const q2 = perQuarter
  const q3 = perQuarter
  const q4 = perQuarter
  const q1 = round2(total - q2 - q3 - q4)
  return [
    { label: 'Q1', amount: q1 },
    { label: 'Q2', amount: q2 },
    { label: 'Q3', amount: q3 },
    { label: 'Q4', amount: q4 },
  ]
}

function buildFiscalQuarterRanges(params: { startIso: string; endIso: string }): string[] {
  const start = new Date(params.startIso)
  const end = new Date(params.endIso)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return ['Q1', 'Q2', 'Q3', 'Q4']
  }
  const totalMs = end.getTime() - start.getTime() + 24 * 60 * 60 * 1000
  const qMs = totalMs / 4
  const ranges: string[] = []
  for (let i = 0; i < 4; i++) {
    const from = new Date(start.getTime() + qMs * i)
    const to =
      i === 3 ? end : new Date(Math.floor(start.getTime() + qMs * (i + 1)) - 24 * 60 * 60 * 1000)
    ranges.push(`${fmtDate(from)} - ${fmtDate(to)}`)
  }
  return ranges
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB')
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function eur(n: number): string {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)
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
