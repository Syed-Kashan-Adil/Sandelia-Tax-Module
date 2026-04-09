import { useTaxOnboardingStore } from '../store'
import type { SelfEmployedStatus } from '../types'
import { Field } from '../ui/Field'
import { Select } from '../ui/Select'

export function Step2SelfEmployedStatus() {
  const status = useTaxOnboardingStore((s) => s.values.selfEmployedStatus)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-5">
      <Field
        label="Self-employed status"
        hint="This determines how social contributions are estimated."
      >
        <Select
          value={status}
          onChange={(e) => setValues({ selfEmployedStatus: e.target.value as SelfEmployedStatus })}
        >
          <option value="main">Main self-employed</option>
          <option value="complementary">Complementary self-employed</option>
          <option value="article37">Article 37</option>
          <option value="active-pensioner">Active pensioner</option>
          <option value="student">Student self-employed</option>
          <option value="company-director">Company director</option>
        </Select>
      </Field>
    </div>
  )
}
