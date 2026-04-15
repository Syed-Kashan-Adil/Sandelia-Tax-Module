import type { CompanyTaxSummary, TaxSummary } from '../types'
import { Button } from '../ui/Button'
import { Step14TaxSummary } from './Step14TaxSummary'

function eur(n: number): string {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)
}

export function Step6CompanySummary(props: {
  summary: CompanyTaxSummary
  personalSummary: TaxSummary | null
  directorFlatRateDetails?: {
    grossProfessionalIncome: number
    socialContributionsDeducted: number
    rate: number
    cap: number
    flatRateApplied: number
  } | null
}) {
  const s = props.summary
  const p = props.personalSummary
  const d = props.directorFlatRateDetails

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="text-sm font-semibold text-foreground">Profile complete</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Company and personal simulation data has been processed.
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Company tax calculation (ISOC)
        </h3>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <div className="space-y-2 text-sm">
            <Row label="Revenue" value={eur(s.revenue)} />
            <Row label="Deductible expenses" value={eur(-s.deductibleExpenses)} />
            <Row label="Accounting result (revenue - deductible expenses)" value={eur(s.accountingResult)} />
            <Row label="DNA add-back (non-deductible expenses)" value={eur(s.dnaAddBack)} />
            <Row
              label="Tax result before losses (accounting result + DNA)"
              value={eur(s.taxResultBeforeLosses)}
            />
            <Row label="Carried-forward loss used" value={eur(-s.carriedForwardLossUsed)} />
            <Row
              label="Carried-forward loss remaining"
              value={eur(s.carriedForwardLossRemaining)}
            />
            <Row label="Taxable profit" value={eur(s.taxableProfit)} />
            <Row label="ISOC @20%" value={eur(s.isocAt20)} />
            <Row label="ISOC @25%" value={eur(s.isocAt25)} />
            <Row label="Gross ISOC" value={eur(s.grossIsoc)} />
            <Row label="Theoretical increase" value={eur(s.theoreticalIncrease)} />
            <Row label="VAI reduction credit" value={eur(-s.vaiReductionCredit)} />
            <Row label="Final increase" value={eur(s.finalIncrease)} />
            <Row
              label="Total tax before advance deduction"
              value={eur(s.totalTaxBeforeAdvanceDeduction)}
            />
            <Row
              label="Advance payments total"
              value={eur(-s.advancePaymentsTotal)}
              highlightGreen
            />
            <div className="border-t border-border pt-2">
              <Row label="Final company tax payable" value={eur(s.finalTaxPayable)} strong />
            </div>
            {s.noIncreaseReason ? (
              <div className="rounded-md border border-border/70 bg-secondary/30 p-3 text-xs text-muted-foreground">
                Increase rule note: {s.noIncreaseReason}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Directors social contributions
        </h3>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
          {s.directorsSocial.length === 0 ? (
            <div className="text-muted-foreground">No directors added.</div>
          ) : (
            s.directorsSocial.map((d) => (
              <div key={d.directorId} className="space-y-1">
                <Row
                  label={`${d.directorName} annual social contribution (base ${eur(d.annualIncomeBase)})`}
                  value={eur(d.annualContribution)}
                />
                <Row
                  label={`${d.directorName} quarterly social contribution`}
                  value={eur(d.quarterlyContribution)}
                />
              </div>
            ))
          )}
          <div className="border-t border-border pt-2">
            <Row
              label="Total directors social contribution"
              value={eur(s.totalDirectorsSocialContribution)}
              strong
            />
          </div>
        </div>
      </div>

      {p ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Personal tax calculation (IPP side)
          </h3>
          {d ? (
            <div className="mb-3 rounded-lg border border-border bg-secondary/30 p-3 text-sm">
              <div className="mb-2 font-medium text-foreground">
                Director flat-rate professional expenses (3% rule)
              </div>
              <div className="space-y-1">
                <Row label="Gross professional income" value={eur(d.grossProfessionalIncome)} />
                <Row
                  label="Social contributions deducted before 3%"
                  value={eur(-d.socialContributionsDeducted)}
                />
                <Row
                  label={`3% on net base (${(d.rate * 100).toFixed(0)}%)`}
                  value={eur(
                    Math.max(0, d.grossProfessionalIncome - d.socialContributionsDeducted) * d.rate
                  )}
                />
                <Row label="Legal cap" value={eur(d.cap)} />
                <div className="border-t border-border pt-2">
                  <Row
                    label="Flat-rate applied as professional expenses"
                    value={eur(-d.flatRateApplied)}
                    strong
                  />
                </div>
              </div>
            </div>
          ) : null}
          <div className="rounded-lg border border-border bg-card p-4">
            <Step14TaxSummary summary={p} showCta={false} />
          </div>
        </div>
      ) : null}

      {p ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="mb-2 text-sm font-semibold text-foreground">Combined impact</div>
          <Row
            label="Company tax payable + personal final balance"
            value={eur(s.finalTaxPayable + p.finalBalance)}
            strong
          />
        </div>
      ) : null}

      <Button type="button" className="w-full">
        Get started
      </Button>
    </div>
  )
}

function Row(props: { label: string; value: string; strong?: boolean; highlightGreen?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{props.label}</span>
      <span
        className={
          props.strong
            ? 'font-semibold text-foreground'
            : props.highlightGreen
              ? 'font-medium text-green-600 dark:text-green-400'
              : ''
        }
      >
        {props.value}
      </span>
    </div>
  )
}
