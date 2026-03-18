import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step7DateOfBirth() {
  const dateOfBirth = useTaxOnboardingStore((s) => s.values.dateOfBirth)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-5">
      <Field label="Your date of birth" hint="Used for age-based allowances (e.g. 65+).">
        <Input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setValues({ dateOfBirth: e.target.value })}
        />
      </Field>
    </div>
  )
}
