import { Check } from 'lucide-react'

import type { TaxSummary } from '../types'
import { Button } from '../ui/Button'

function eur(n: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)
}

export function Step14TaxSummary(props: { summary: TaxSummary }) {
  const s = props.summary

  const totalIncomeComponents = s.salariedIncome + s.selfEmployedProfit + s.otherIncome
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
            <SummaryRow
              label="Self-employed profit (after professional expenses)"
              value={eur(s.selfEmployedProfit)}
            />
          ) : null}
          {s.selfEmployedNetForIpp > 0 ? (
            <SummaryRow
              label="Self-employed net for IPP (after social contributions)"
              value={eur(s.selfEmployedNetForIpp)}
            />
          ) : null}
          {s.otherIncome > 0 ? (
            <SummaryRow label="Other income" value={eur(s.otherIncome)} />
          ) : null}
          {s.salariedIncome === 0 && s.selfEmployedProfit === 0 && s.otherIncome === 0 ? (
            <SummaryRow label="Total income components" value={eur(0)} highlight />
          ) : (
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-medium text-foreground">
                Total income components (salary + profit + other)
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {eur(totalIncomeComponents)}
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
          <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
            <span className="max-w-[70%]">
              Social base (annual net income): {eur(s.socialContributions.baseIncome)}
              {s.socialContributions.method === 'calculated' ? (
                <>
                  {' '}
                  · Legal annual before fund fee: {eur(
                    s.socialContributions.legalAnnualBeforeFees
                  )}{' '}
                  ({(s.socialContributions.fundFeeRate * 100).toFixed(2)}% fee)
                </>
              ) : null}
            </span>
            <span className="shrink-0">
              {s.socialContributions.method === 'override' ? 'Override' : 'Calculated'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
            <span className="max-w-[70%]">
              Social contributions (quarterly): {eur(s.socialContributions.quarterlyAmount)}
            </span>
          </div>

          <SummaryRow label="Estimated personal income tax (IPP)" value={eur(s.federalTaxTotal)} />

          <div className="mt-1 rounded-lg border border-border/60 bg-secondary/30 p-3">
            <div className="text-xs font-semibold text-foreground">Federal tax (detail)</div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-4">
                <span>Federal IPP (2026 brackets on taxable income after marital quotient)</span>
                <span className="font-medium text-foreground">{eur(s.federalGrossTaxTotal)}</span>
              </div>
              {s.federalTaxReductionFromAllowances > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <span>Tax-free allowance reduction (25%)</span>
                  <span className="font-medium text-foreground">
                    -{eur(s.federalTaxReductionFromAllowances)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
                <span className="font-medium text-foreground">Federal tax total</span>
                <span className="font-semibold text-foreground">{eur(s.federalTaxTotal)}</span>
              </div>
            </div>
          </div>

          <SummaryRow
            label={`Municipal surcharge (${(s.municipalSurcharge.rate * 100).toFixed(1)}%)`}
            value={eur(s.municipalSurcharge.amount)}
          />

          <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
            <span className="max-w-[70%]">
              Municipal surcharge base: federal tax total = {eur(s.federalTaxTotal)}
            </span>
          </div>

          <SummaryRow
            label="Withholding tax already paid"
            value={eur(-s.withholdingTax)}
            highlight={s.withholdingTax > 0}
            highlightGreen
          />
          <SummaryRow
            label="Advance tax payments"
            value={eur(-s.advanceTaxPayments)}
            highlight={s.advanceTaxPayments > 0}
            highlightGreen
          />
          <SummaryRow
            label="Advance payment penalty"
            value={eur(s.advancePaymentPenalty)}
            highlight={s.advancePaymentPenalty > 0}
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

      {/* Verification details (IPP math) */}
      <div className="space-y-3">
        <details open className="rounded-lg border border-border bg-secondary/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Allowances breakdown (tax-free)
          </summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <TinyKV label="Base allowance (self)" value={eur(s.allowance.baseAllowanceSelf)} />
            <TinyKV
              label="Base allowance (partner)"
              value={eur(s.allowance.baseAllowancePartner)}
            />
            <TinyKV
              label="Dependents allowance (children equivalent)"
              value={eur(s.allowance.dependentsAllowance)}
            />
            <TinyKV
              label="Young children allowance (under 3 on 1 Jan)"
              value={eur(s.allowance.youngChildrenAllowance)}
            />
            <TinyKV
              label="Other dependents allowance (6 categories)"
              value={eur(s.allowance.otherDependentsAllowance)}
            />
            <TinyKV
              label="Age-related allowance (self)"
              value={eur(s.allowance.ageAllowanceSelf)}
            />
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <TinyKV
              label="Total household tax-free allowance"
              value={eur(s.allowance.totalAllowanceHousehold)}
              strong
            />
            <div className="mt-1 text-xs text-muted-foreground">
              These amounts are{' '}
              <span className="font-medium text-foreground">converted into a tax reduction</span>{' '}
              equal to <span className="font-medium text-foreground">totalAllowance × 25%</span>.
            </div>
          </div>
        </details>

        <details open className="rounded-lg border border-border bg-secondary/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Marital quotient (30% cap €13,050)
          </summary>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
              <span>Applied</span>
              <span className="font-medium text-foreground">
                {s.maritalQuotient.applied ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
              <span>Transfer amount</span>
              <span className="font-medium text-foreground">
                {eur(s.maritalQuotient.transferAmount)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 text-xs text-muted-foreground">
              <span>Cap</span>
              <span className="font-medium text-foreground">{eur(s.maritalQuotient.cap)}</span>
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-3">
              <div className="text-xs font-semibold text-foreground">Income before → after</div>
              <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-4">
                  <span>User professional income</span>
                  <span className="font-medium text-foreground">
                    {eur(s.maritalQuotient.before.userIncome)} →{' '}
                    {eur(s.maritalQuotient.after.userIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Partner professional income</span>
                  <span className="font-medium text-foreground">
                    {eur(s.maritalQuotient.before.partnerIncome)} →{' '}
                    {eur(s.maritalQuotient.after.partnerIncome)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </details>

        <details open className="rounded-lg border border-border bg-secondary/30 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Federal tax by brackets (user + partner)
          </summary>

          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <BracketTable
              title={`User — taxable income ${eur(s.federalGrossTaxUser.taxableIncome)}`}
              brackets={s.federalGrossTaxUser.brackets}
            />
            <BracketTable
              title={`Partner — taxable income ${eur(s.federalGrossTaxPartner.taxableIncome)}`}
              brackets={s.federalGrossTaxPartner.brackets}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 border-t border-border pt-3 text-sm">
            <span className="font-medium text-foreground">Gross federal tax total</span>
            <span className="font-semibold text-foreground">{eur(s.federalGrossTaxTotal)}</span>
          </div>
        </details>
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

function TinyKV({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
      <span>{label}</span>
      <span className={strong ? 'font-semibold text-foreground' : 'font-medium text-foreground'}>
        {value}
      </span>
    </div>
  )
}

function BracketTable({
  title,
  brackets,
}: {
  title: string
  brackets: TaxSummary['federalGrossTaxUser']['brackets']
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-3">
      <div className="text-xs font-semibold text-foreground">{title}</div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[11px] text-muted-foreground">
              <th className="py-1 pr-2">From</th>
              <th className="py-1 pr-2">To</th>
              <th className="py-1 pr-2">Rate</th>
              <th className="py-1 pr-2">Taxed</th>
              <th className="py-1">Tax</th>
            </tr>
          </thead>
          <tbody>
            {brackets.map((b, idx) => (
              <tr key={`${b.from}-${b.to ?? 'inf'}-${idx}`} className="border-t border-border/40">
                <td className="py-1 pr-2 text-muted-foreground">{eur(b.from)}</td>
                <td className="py-1 pr-2 text-muted-foreground">
                  {b.to === null ? '∞' : eur(b.to)}
                </td>
                <td className="py-1 pr-2 text-muted-foreground">{(b.rate * 100).toFixed(0)}%</td>
                <td className="py-1 pr-2 text-muted-foreground">{eur(b.amountTaxed)}</td>
                <td className="py-1 font-medium text-foreground">{eur(b.tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
