import type { CompanyTaxSummary, TaxSummary } from '../types'
import { Button } from '../ui/Button'

function eur(n: number): string {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)
}

export function Step6CompanySummary(props: {
  summary: CompanyTaxSummary
  personalSummary: TaxSummary | null
}) {
  const s = props.summary
  // const p = props.personalSummary;

  // const perPerson = (() => {
  //   if (!p) return null
  //   const allowanceMr =
  //     p.allowance.baseAllowanceSelf +
  //     p.allowance.dependentsAllowance +
  //     p.allowance.youngChildrenAllowance +
  //     p.allowance.singleParentAllowance +
  //     p.allowance.otherDependentsAllowance +
  //     p.allowance.ageAllowanceSelf
  //   const allowanceMrs = p.allowance.baseAllowancePartner
  //   const reductionMr = taxOnAllowance(allowanceMr)
  //   const reductionMrs = taxOnAllowance(allowanceMrs)
  //   return {
  //     allowanceMr,
  //     allowanceMrs,
  //     reductionMr,
  //     reductionMrs,
  //     grossMr: p.federalGrossTaxUser.total,
  //     grossMrs: p.federalGrossTaxPartner.total,
  //     netMr: p.federalGrossTaxUser.total - reductionMr,
  //     netMrs: p.federalGrossTaxPartner.total - reductionMrs,
  //   }
  // })()

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
            <Row label="Accounting result" value={eur(s.accountingResult)} />
            <Row label="DNA add-back (non-deductible expenses)" value={eur(s.dnaAddBack)} />
            <Row label="Tax result before losses" value={eur(s.taxResultBeforeLosses)} />
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
              <Row
                key={d.directorId}
                label={`${d.directorName} (base ${eur(d.annualIncomeBase)})`}
                value={eur(d.annualContribution)}
              />
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

      {/* {p ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Personal tax calculation (IPP side)
          </h3>
          <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
            <Row label="Federal tax" value={eur(p.federalTaxTotal)} />
            <Row label="Municipal surcharge" value={eur(p.municipalSurcharge.amount)} />
            <Row label="CSSS" value={eur(p.specialSocialSecurityContribution)} />
            <Row label="Withholding tax credit" value={eur(-p.withholdingTax)} highlightGreen />
            <Row
              label="Advance payments credit"
              value={eur(-p.advanceTaxPayments)}
              highlightGreen
            />
            <div className="border-t border-border pt-2">
              <Row label="Estimated personal final balance" value={eur(p.finalBalance)} strong />
            </div>
          </div>
        </div>
      ) : null} */}

      {/* {p && perPerson ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Detailed calculation (2026)
          </h3>
          <div className="space-y-3 rounded-lg border border-border bg-card p-4 text-sm">
            <div className="space-y-2">
              <Row label="1. Mr gross tax (by brackets)" value={eur(perPerson.grossMr)} />
              <div className="rounded-md border border-border/70 bg-secondary/30 p-3 text-xs text-muted-foreground">
                {p.federalGrossTaxUser.brackets
                  .filter((b) => b.amountTaxed > 0)
                  .map(
                    (b) => `${eur(b.amountTaxed)} @ ${(b.rate * 100).toFixed(0)}% = ${eur(b.tax)}`
                  )
                  .join(' · ')}
              </div>
              <Row label="2. Mr allowance used" value={eur(perPerson.allowanceMr)} />
              <Row
                label="3. Mr allowance reduction"
                value={eur(-perPerson.reductionMr)}
                highlightGreen
              />
              <Row label="4. Mr net tax" value={eur(perPerson.netMr)} />
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <Row label="5. Mrs gross tax (by brackets)" value={eur(perPerson.grossMrs)} />
              <div className="rounded-md border border-border/70 bg-secondary/30 p-3 text-xs text-muted-foreground">
                {p.federalGrossTaxPartner.brackets
                  .filter((b) => b.amountTaxed > 0)
                  .map(
                    (b) => `${eur(b.amountTaxed)} @ ${(b.rate * 100).toFixed(0)}% = ${eur(b.tax)}`
                  )
                  .join(' · ')}
              </div>
              <Row label="6. Mrs allowance used" value={eur(perPerson.allowanceMrs)} />
              <Row
                label="7. Mrs allowance reduction"
                value={eur(-perPerson.reductionMrs)}
                highlightGreen
              />
              <Row label="8. Mrs net tax" value={eur(perPerson.netMrs)} />
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <Row
                label="9. Total household federal tax (after allowances)"
                value={eur(p.federalTaxTotal)}
              />
              <Row
                label="10. Withholding taxes set off"
                value={eur(-p.withholdingTax)}
                highlightGreen
              />
              <Row label="After set-off" value={eur(p.federalTaxTotal - p.withholdingTax)} />
              <Row
                label={`11. Municipal tax (${(p.municipalSurcharge.rate * 100).toFixed(1)}%)`}
                value={eur(p.municipalSurcharge.amount)}
              />
              <Row label="12. CSSS" value={eur(p.specialSocialSecurityContribution)} />
              <div className="border-t border-border pt-2">
                <Row label="13. Estimated final result" value={eur(p.finalBalance)} strong />
              </div>
              <div className="text-xs text-muted-foreground">
                Marital income splitting: {p.maritalQuotient.applied ? 'applied' : 'not applied'}
              </div>
            </div>
          </div>
        </div>
      ) : null} */}

      {/* {p ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="mb-2 text-sm font-semibold text-foreground">Combined impact</div>
          <Row
            label="Company tax payable + personal final balance"
            value={eur(s.finalTaxPayable + p.finalBalance)}
            strong
          />
        </div>
      ) : null} */}

      <Button type="button" className="w-full">
        Get started
      </Button>
    </div>
  )
}

// function taxOnAllowance(allowance: number): number {
//   const a = Math.max(0, allowance)
//   const brackets = [
//     { from: 0, to: 16320, rate: 0.25 },
//     { from: 16320, to: 28800, rate: 0.4 },
//     { from: 28800, to: 51070, rate: 0.45 },
//     { from: 51070, to: Infinity, rate: 0.5 },
//   ] as const
//   let remaining = a
//   let tax = 0
//   for (const b of brackets) {
//     if (remaining <= 0) break
//     const band = b.to - b.from
//     const amt = Math.min(remaining, band)
//     tax += amt * b.rate
//     remaining -= amt
//   }
//   return Math.round((tax + Number.EPSILON) * 100) / 100
// }

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
