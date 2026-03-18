import { useTaxOnboardingStore } from '../store'
import type { TaxSubject } from '../types'
import { Field } from '../ui/Field'
import { Select } from '../ui/Select'

export function Step1TaxSubject() {
  const taxSubject = useTaxOnboardingStore((s) => s.values.taxSubject)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-5">
      <Field
        label="How are you taxed?"
        hint="Self-employed uses the IPP engine. Company flow (ISOC) is planned next."
      >
        <Select
          value={taxSubject}
          onChange={(e) => setValues({ taxSubject: e.target.value as TaxSubject })}
        >
          <option value="self-employed">Self-employed (IPP)</option>
          <option value="company">Company (ISOC)</option>
        </Select>
      </Field>

      {taxSubject === 'company' ? (
        <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm">
          Company taxation (ISOC) isn’t implemented yet in this module. Switch to “Self-employed
          (IPP)” to continue.
        </div>
      ) : null}
    </div>
  )
}
