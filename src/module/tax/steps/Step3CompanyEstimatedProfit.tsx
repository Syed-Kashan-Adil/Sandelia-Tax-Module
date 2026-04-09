import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step3CompanyEstimatedProfit() {
  const values = useTaxOnboardingStore((s) => s.values);
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  return (
    <div className="space-y-5">
      <Field label="Estimated net taxable profit">
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={values.companyEstimatedTaxableProfitMode}
          onChange={(e) =>
            setValues({
              companyEstimatedTaxableProfitMode: e.target.value as
                | "manual"
                | "detailed",
            })
          }
        >
          <option value="manual">Manual amount</option>
          <option value="detailed">Use detailed accounting inputs</option>
        </select>
      </Field>
      <Field
        label="Enter manual amount"
        hint="Accounting result entered manually. DNA is added back and carried-forward losses are deducted before ISOC rates are applied."
      >
        <Input
          type="number"
          min={0}
          disabled={values.companyEstimatedTaxableProfitMode !== "manual"}
          value={values.companyEstimatedTaxableProfit}
          onChange={(e) =>
            setValues({
              companyEstimatedTaxableProfit: Number(e.target.value || 0),
            })
          }
        />
      </Field>
      <div className="rounded-lg border border-primary/30 bg-primary/5 space-y-2 p-3 text-sm">
        <p>
          <span className="font-medium">Use detailed accounting inputs</span>{" "}
          uses revenue, accounting expenses, DNA, and carried-forward loss from
          the Company financials step to derive taxable profit (accounting
          result + DNA − losses).
        </p>
        <p>
          SME reduced rate: 20% on the first EUR 100,000 of taxable profit, then
          25% on the remainder (when eligibility rules are met).
        </p>
      </div>
    </div>
  );
}
