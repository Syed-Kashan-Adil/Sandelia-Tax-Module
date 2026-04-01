import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step3CompanyFinancials() {
  const values = useTaxOnboardingStore((s) => s.values);
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Revenue (annual)">
        <Input
          type="number"
          min={0}
          value={values.companyRevenue}
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
          onChange={(e) =>
            setValues({ companyExpenses: Number(e.target.value || 0) })
          }
        />
      </Field>
      <Field label="DNA (non-deductible expenses)">
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
