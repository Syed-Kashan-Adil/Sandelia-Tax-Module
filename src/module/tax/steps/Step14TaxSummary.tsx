import { Check } from 'lucide-react'

import type { TaxSummary } from '../types'
import { Button } from '../ui/Button'

function eur(n: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)
}

export function Step14TaxSummary(props: { summary: TaxSummary }) {
  const s = props.summary

  const totalTaxableIncome = s.salariedIncome + s.selfEmployedProfit + s.otherIncome
  const totalToSpread = s.finalBalance > 0 ? s.finalBalance + s.socialContributions.annualAmount : 0

  const quarterlyRecommendation = totalToSpread > 0 ? Math.round(totalToSpread / 4) : 0
  const monthlyRecommendation = totalToSpread > 0 ? Math.round(totalToSpread / 12) : 0

  return (
    <div className="space-y-6">
      {/* Profile Complete */}
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-5 w-5" />
        </span>
        <div>
          <div className="font-semibold">Profile complete!</div>
          <div className="text-sm opacity-90">Your tax profile has been set up successfully.</div>
        </div>
      </div>

      {/* Income Overview */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Income overview</h3>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          {s.salariedIncome > 0 ? (
            <SummaryRow label="Salaried income" value={eur(s.salariedIncome)} />
          ) : null}
          {s.selfEmployedProfit > 0 ? (
            <SummaryRow label="Self-employed profit" value={eur(s.selfEmployedProfit)} />
          ) : null}
          {s.otherIncome > 0 ? (
            <SummaryRow label="Other income" value={eur(s.otherIncome)} />
          ) : null}
          {s.salariedIncome === 0 && s.selfEmployedProfit === 0 && s.otherIncome === 0 ? (
            <SummaryRow label="Total taxable income" value={eur(0)} highlight />
          ) : (
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-medium text-foreground">Total taxable income</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {eur(totalTaxableIncome)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tax Calculation */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Tax calculation</h3>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <SummaryRow
            label="Social contributions (annual)"
            value={eur(s.socialContributions.annualAmount)}
          />
          <SummaryRow label="Estimated personal income tax (IPP)" value={eur(s.federalTaxTotal)} />
          <SummaryRow
            label={`Municipal surcharge (${(s.municipalSurcharge.rate * 100).toFixed(1)}%)`}
            value={eur(s.municipalSurcharge.amount)}
          />
          <SummaryRow
            label="Withholding tax already paid"
            value={eur(-s.withholdingTax)}
            highlight={s.withholdingTax > 0}
            highlightGreen
          />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-medium text-foreground">Estimated balance due</span>
            <span
              className={`font-semibold ${
                s.finalBalance > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {eur(s.finalBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Advance Payment Recommendation */}
      {totalToSpread > 0 ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
          <div className="text-sm font-semibold">Advance payment recommendation</div>
          {s.vatRegime === 'yes-monthly' ? (
            <p className="mt-1 text-sm">
              Based on your VAT filing frequency (monthly), we recommend:{' '}
              <strong>{eur(monthlyRecommendation)} per month</strong>
            </p>
          ) : s.vatRegime === 'mixed' ? (
            <div className="mt-2 space-y-1 text-sm">
              <div>
                Monthly option: <strong>{eur(monthlyRecommendation)} per month</strong>
              </div>
              <div>
                Quarterly option: <strong>{eur(quarterlyRecommendation)} per quarter</strong>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm">
              Based on your VAT filing frequency (quarterly), we recommend:{' '}
              <strong>{eur(quarterlyRecommendation)} per quarter</strong>
            </p>
          )}
        </div>
      ) : null}

      {/* Family Situation Benefits */}
      {s.childrenCount > 0 || s.otherDependentsCount > 0 ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200">
          <div className="text-sm font-semibold">Family situation benefits</div>
          <p className="mt-1 text-sm">
            You have{' '}
            {s.childrenCount === 1 ? '1 dependent child' : `${s.childrenCount} dependent children`}.
            {s.otherDependentsCount > 0
              ? ` You also have ${s.otherDependentsCount} other dependent${s.otherDependentsCount === 1 ? '' : 's'}.`
              : ''}{' '}
            This may qualify you for additional tax deductions.
          </p>
        </div>
      ) : null}

      {/* Get Started */}
      <div className="pt-2">
        <Button type="button" className="w-full gap-2" size="md">
          <Check className="h-4 w-4" />
          Get started
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  highlight,
  highlightGreen,
}: {
  label: string
  value: string
  highlight?: boolean
  highlightGreen?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className={highlight ? 'font-medium text-foreground' : 'text-muted-foreground'}>
        {label}
      </span>
      <span
        className={
          highlightGreen
            ? 'font-medium text-green-600 dark:text-green-400'
            : highlight
              ? 'font-semibold'
              : ''
        }
      >
        {value}
      </span>
    </div>
  )
}
