import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step2CompanyFiscalYearInfo() {
  const values = useTaxOnboardingStore((s) => s.values);
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  return (
    <div className="space-y-5">
      <Field label="Fiscal year start date">
        <Input
          type="date"
          value={values.activityStartDate}
          onChange={(e) => setValues({ activityStartDate: e.target.value })}
        />
      </Field>
      <Field label="Fiscal year end date">
        <Input
          type="date"
          value={values.companyFiscalYearEndDate}
          onChange={(e) =>
            setValues({ companyFiscalYearEndDate: e.target.value })
          }
        />
      </Field>
      <Field label="Which corporate tax regime applies?">
        <div className="grid gap-3">
          <button
            type="button"
            className={`rounded-lg border p-3 text-left ${
              values.companyTaxRegime === "sme-reduced"
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() =>
              setValues({ companyTaxRegime: "sme-reduced", companyIsSme: true })
            }
          >
            <div className="text-sm font-medium">SME reduced rate</div>
            <div className="text-xs text-muted-foreground">
              Lower tax rate for qualifying SMEs
            </div>
          </button>
          <button
            type="button"
            className={`rounded-lg border p-3 text-left ${
              values.companyTaxRegime === "standard"
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() =>
              setValues({ companyTaxRegime: "standard", companyIsSme: false })
            }
          >
            <div className="text-sm font-medium">Standard rate</div>
            <div className="text-xs text-muted-foreground">
              Applies to companies not meeting SME reduced conditions
            </div>
          </button>
        </div>
      </Field>
    </div>
  );
}
