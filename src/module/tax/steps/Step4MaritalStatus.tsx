import { useTaxOnboardingStore } from '../store'
import type { MaritalStatus } from '../types'
import { Field } from '../ui/Field'
import { Select } from '../ui/Select'

export function Step4MaritalStatus() {
  const maritalStatus = useTaxOnboardingStore((s) => s.values.maritalStatus)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-5">
      <Field
        label="Marital status"
        hint="Married and legally cohabiting are eligible for the marital quotient (income split)."
      >
        <Select
          value={maritalStatus}
          onChange={(e) => setValues({ maritalStatus: e.target.value as MaritalStatus })}
        >
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="legally-cohabiting">Legally cohabiting</option>
          <option value="de-facto-cohabiting">De facto cohabiting</option>
          <option value="divorced">Divorced</option>
          <option value="separated">Separated</option>
          <option value="widowed">Widowed</option>
        </Select>
      </Field>
    </div>
  )
}
