import { useTaxOnboardingStore } from "../store";
import type { TaxSubject } from "../types";
import { Field } from "../ui/Field";
import { Select } from "../ui/Select";

export function Step1TaxSubject() {
  const taxSubject = useTaxOnboardingStore((s) => s.values.taxSubject);
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  return (
    <div className="space-y-5">
      <Field
        label="How are you taxed?"
        hint="Choose the tax engine to launch the correct onboarding flow."
      >
        <Select
          value={taxSubject}
          onChange={(e) =>
            setValues({ taxSubject: e.target.value as TaxSubject })
          }
        >
          <option value="self-employed">Self-employed (IPP)</option>
          <option value="company">Company (ISOC)</option>
        </Select>
      </Field>
    </div>
  );
}
