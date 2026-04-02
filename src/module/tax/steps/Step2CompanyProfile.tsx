import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step2CompanyProfile() {
  const values = useTaxOnboardingStore((s) => s.values);
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  return (
    <div className="space-y-6">
      <Field
        label="Company age (years)"
        hint="Used to determine first 3-year increase exemption."
      >
        <Input
          type="number"
          min={0}
          value={values.companyAgeYears}
          onChange={(e) =>
            setValues({ companyAgeYears: Number(e.target.value || 0) })
          }
        />
      </Field>

      {/* <Field label="Is this company an SME?">
        <div className="flex gap-3">
          <Toggle
            label="Yes"
            active={values.companyIsSme}
            onClick={() => setValues({ companyIsSme: true })}
          />
          <Toggle
            label="No"
            active={!values.companyIsSme}
            onClick={() => setValues({ companyIsSme: false })}
          />
        </div>
      </Field>

      <Field label="Director remuneration condition met?">
        <div className="flex gap-3">
          <Toggle
            label="Yes"
            active={values.companyDirectorRemunerationEligible}
            onClick={() =>
              setValues({ companyDirectorRemunerationEligible: true })
            }
          />
          <Toggle
            label="No"
            active={!values.companyDirectorRemunerationEligible}
            onClick={() =>
              setValues({ companyDirectorRemunerationEligible: false })
            }
          />
        </div>
      </Field>

      <Field label="Is this a financial company?">
        <div className="flex gap-3">
          <Toggle
            label="No"
            active={!values.companyIsFinancialCompany}
            onClick={() => setValues({ companyIsFinancialCompany: false })}
          />
          <Toggle
            label="Yes"
            active={values.companyIsFinancialCompany}
            onClick={() => setValues({ companyIsFinancialCompany: true })}
          />
        </div>
      </Field> */}
    </div>
  );
}
