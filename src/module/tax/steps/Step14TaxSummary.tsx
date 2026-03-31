import type { TaxSummary } from "../types";
import { Button } from "../ui/Button";

function eur(n: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function Step14TaxSummary(props: { summary: TaxSummary }) {
  const s = props.summary;

  const netTaxableIncome =
    s.federalGrossTaxUser.taxableIncome +
    s.federalGrossTaxPartner.taxableIncome;
  const federalAfterAllowance = s.federalTaxTotal;
  const totalBeforeCredits =
    s.taxTotalIncludingMunicipalAndCsss + s.advancePaymentPenalty;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Income overview
        </h3>
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
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Detailed calculation (2026)
        </h3>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <SummaryRow
            label="1. Net taxable income"
            value={eur(netTaxableIncome)}
          />
          <SummaryRow
            label="2. Tax-free allowance used"
            value={eur(s.allowance.totalAllowanceHousehold)}
          />
          <div className="mt-2 rounded-lg border border-border/60 bg-secondary/30 p-3">
            <div className="text-xs font-semibold text-foreground">
              Tax-free allowance breakdown
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between gap-4">
                <span>Base allowance (self)</span>
                <span className="font-medium text-foreground">
                  {eur(s.allowance.baseAllowanceSelf)}
                </span>
              </div>
              {s.allowance.baseAllowancePartner > 0 ? (
                <div className="flex justify-between gap-4">
                  <span>Base allowance (partner)</span>
                  <span className="font-medium text-foreground">
                    {eur(s.allowance.baseAllowancePartner)}
                  </span>
                </div>
              ) : null}
              {s.allowance.dependentsAllowance > 0 ? (
                <div className="flex justify-between gap-4">
                  <span>Dependent child allowance</span>
                  <span className="font-medium text-foreground">
                    {eur(s.allowance.dependentsAllowance)}
                  </span>
                </div>
              ) : null}
              {s.allowance.youngChildrenAllowance > 0 ? (
                <div className="flex justify-between gap-4">
                  <span>Child under 3 allowance</span>
                  <span className="font-medium text-foreground">
                    {eur(s.allowance.youngChildrenAllowance)}
                  </span>
                </div>
              ) : null}
              {s.allowance.singleParentAllowance > 0 ? (
                <div className="flex justify-between gap-4">
                  <span>Single parent allowance</span>
                  <span className="font-medium text-foreground">
                    {eur(s.allowance.singleParentAllowance)}
                  </span>
                </div>
              ) : null}
              {s.allowance.otherDependentsAllowance > 0 ? (
                <div className="flex justify-between gap-4">
                  <span>Other dependents allowance</span>
                  <span className="font-medium text-foreground">
                    {eur(s.allowance.otherDependentsAllowance)}
                  </span>
                </div>
              ) : null}
              {s.allowance.ageAllowanceSelf > 0 ? (
                <div className="flex justify-between gap-4">
                  <span>Age allowance</span>
                  <span className="font-medium text-foreground">
                    {eur(s.allowance.ageAllowanceSelf)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <SummaryRow
            label="3. Gross tax by brackets"
            value={eur(s.federalGrossTaxTotal)}
          />
          <div className="mt-2 rounded-lg border border-border/60 bg-secondary/30 p-3">
            <div className="text-xs font-semibold text-foreground">
              Gross tax by brackets
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {[
                ...s.federalGrossTaxUser.brackets,
                ...s.federalGrossTaxPartner.brackets,
              ]
                .filter((b) => b.amountTaxed > 0)
                .map((b, idx) => (
                  <div
                    key={`${b.from}-${b.to ?? "inf"}-${idx}`}
                    className="flex justify-between gap-4"
                  >
                    <span>
                      {eur(b.from)} → {b.to === null ? "∞" : eur(b.to)} @{" "}
                      {(b.rate * 100).toFixed(0)}%
                    </span>
                    <span className="font-medium text-foreground">
                      {eur(b.amountTaxed)} → {eur(b.tax)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          <SummaryRow
            label="4. Tax-free allowance reduction (25%)"
            value={eur(-s.federalTaxReductionFromAllowances)}
          />
          <SummaryRow
            label="Federal tax after allowance"
            value={eur(federalAfterAllowance)}
          />
          <SummaryRow
            label={`5. Municipal tax (${(s.municipalSurcharge.rate * 100).toFixed(1)}%)`}
            value={eur(s.municipalSurcharge.amount)}
          />
          <SummaryRow
            label="6. Total tax (federal + municipal)"
            value={eur(s.taxTotalIncludingMunicipal)}
          />
          <SummaryRow
            label="Special social security contribution retained on an estimated basis"
            value={eur(s.specialSocialSecurityContribution)}
          />
          <SummaryRow
            label="7. Total tax (including CSSS)"
            value={eur(s.taxTotalIncludingMunicipalAndCsss)}
          />

          <div className="my-2 border-t border-border" />

          <SummaryRow
            label="Advance payment penalty"
            value={eur(s.advancePaymentPenalty)}
          />
          <SummaryRow
            label="Withholding tax already paid"
            value={eur(-s.withholdingTax)}
            highlightGreen
          />
          <SummaryRow
            label="Advance tax payments"
            value={eur(-s.advanceTaxPayments)}
            highlightGreen
          />
          <SummaryRow
            label="Total before credits"
            value={eur(totalBeforeCredits)}
          />

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="font-medium text-foreground">
              Estimated balance due
            </span>
            <span
              className={`font-semibold ${
                s.finalBalance > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {eur(s.finalBalance)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button type="button" className="w-full" size="md">
          Get started
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlightGreen,
}: {
  label: string;
  value: string;
  highlightGreen?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          highlightGreen ? "font-medium text-green-600 dark:text-green-400" : ""
        }
      >
        {value}
      </span>
    </div>
  );
}
