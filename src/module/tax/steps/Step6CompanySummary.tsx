import type { CompanyTaxSummary } from "../types";
import { Button } from "../ui/Button";

function eur(n: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function Step6CompanySummary(props: { summary: CompanyTaxSummary }) {
  const s = props.summary;
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold">ISOC calculation</h3>
        <div className="space-y-2 text-sm">
          <Row label="Accounting result" value={eur(s.accountingResult)} />
          <Row
            label="Tax result before losses"
            value={eur(s.taxResultBeforeLosses)}
          />
          <Row
            label="Carried-forward loss used"
            value={eur(-s.carriedForwardLossUsed)}
          />
          <Row label="Taxable profit" value={eur(s.taxableProfit)} />
          <Row label="ISOC @20%" value={eur(s.isocAt20)} />
          <Row label="ISOC @25%" value={eur(s.isocAt25)} />
          <Row label="Gross ISOC" value={eur(s.grossIsoc)} />
          <Row
            label="Theoretical increase"
            value={eur(s.theoreticalIncrease)}
          />
          <Row
            label="VAI reduction credit"
            value={eur(-s.vaiReductionCredit)}
          />
          <Row label="Final increase" value={eur(s.finalIncrease)} />
          <Row
            label="Advance payments total"
            value={eur(-s.advancePaymentsTotal)}
          />
          <Row
            label="Final tax payable"
            value={eur(s.finalTaxPayable)}
            strong
          />
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold">
          Directors social contribution
        </h3>
        <div className="space-y-2 text-sm">
          {s.directorsSocial.map((d) => (
            <Row
              key={d.directorId}
              label={`${d.directorName} (annual)`}
              value={eur(d.annualContribution)}
            />
          ))}
          <Row
            label="Total directors social contribution"
            value={eur(s.totalDirectorsSocialContribution)}
            strong
          />
        </div>
      </div>

      <Button type="button" className="w-full">
        Get started
      </Button>
    </div>
  );
}

function Row(props: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{props.label}</span>
      <span className={props.strong ? "font-semibold text-foreground" : ""}>
        {props.value}
      </span>
    </div>
  );
}
