import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step3CompanyFinancials() {
  const values = useTaxOnboardingStore((s) => s.values);
  const setValues = useTaxOnboardingStore((s) => s.setValues);
  const isManualTaxableProfitMode =
    values.companyEstimatedTaxableProfitMode === "manual";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {isManualTaxableProfitMode ? (
        <div className="md:col-span-2 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
          You selected manual estimated taxable profit. Revenue and accounting
          expenses are disabled because the simulator uses your manual amount as
          the accounting result in this mode.
        </div>
      ) : null}
      <Field label="Revenue (annual)">
        <Input
          type="number"
          min={0}
          value={values.companyRevenue}
          disabled={isManualTaxableProfitMode}
          onChange={(e) =>
            setValues({ companyRevenue: Number(e.target.value || 0) })
          }
        />
      </Field>
      <Field label="Accounting expenses">
        <Input
          type="number"
          min={0}
          value={values.companyExpenses}
          disabled={isManualTaxableProfitMode}
          onChange={(e) =>
            setValues({ companyExpenses: Number(e.target.value || 0) })
          }
        />
      </Field>
      <Field
        label="DNA (non-deductible expenses)"
        hint="Portion of booked expenses that is not tax-deductible. It is added back on top of the accounting result to compute the ISOC base (when you use detailed accounting inputs)."
      >
        <Input
          type="number"
          min={0}
          value={values.companyDna}
          onChange={(e) =>
            setValues({ companyDna: Number(e.target.value || 0) })
          }
        />
      </Field>
      <Field label="Carried-forward loss">
        <Input
          type="number"
          min={0}
          value={values.companyCarriedForwardLoss}
          onChange={(e) =>
            setValues({
              companyCarriedForwardLoss: Number(e.target.value || 0),
            })
          }
        />
      </Field>
    </div>
  );
}
