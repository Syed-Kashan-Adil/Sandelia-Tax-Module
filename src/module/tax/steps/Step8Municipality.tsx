import { useMemo } from 'react'

import { MUNICIPAL_SURCHARGE_RATES, resolveMunicipalRate } from '../municipalRates'
import { useTaxOnboardingStore } from '../store'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

const MUNICIPALITY_SUGGESTIONS = [
  'Antwerp',
  'Charleroi',
  'Namur',
  'Aalst',
  'La Louvière',
  'Hasselt',
  'Brussels',
  'Gent',
  'Leuven',
  'Overijse',
]

export function Step8Municipality() {
  const municipality = useTaxOnboardingStore((s) => s.values.municipality)
  const municipalityRateOverride = useTaxOnboardingStore((s) => s.values.municipalityRateOverride)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  const resolved = useMemo(
    () =>
      resolveMunicipalRate({
        municipality,
        override: municipalityRateOverride,
      }),
    [municipality, municipalityRateOverride]
  )

  return (
    <div className="space-y-6">
      <Field
        label="What is your municipality of residence?"
        hint="Start typing to search and select your municipality."
      >
        <Input
          value={municipality}
          placeholder="Search municipality…"
          list="municipality-suggestions"
          onChange={(e) => setValues({ municipality: e.target.value })}
        />
        <datalist id="municipality-suggestions">
          {Array.from(
            new Set([
              ...MUNICIPALITY_SUGGESTIONS,
              ...Object.keys(MUNICIPAL_SURCHARGE_RATES).map((k) =>
                k.replace(/\b\w/g, (c) => c.toUpperCase())
              ),
            ])
          )
            .sort()
            .map((name) => (
              <option key={name} value={name} />
            ))}
        </datalist>
      </Field>

      <details className="rounded-lg border border-border bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Municipal surcharge rate details
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Detected municipal rate" hint={`Source: ${resolved.source}`}>
            <Input value={(resolved.rate * 100).toFixed(2) + '%'} disabled />
          </Field>

          <Field
            label="Override rate (optional)"
            hint="Enter a percentage, e.g. 7.30. Leave blank to use detected/default rate."
          >
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={
                typeof municipalityRateOverride === 'number'
                  ? String(municipalityRateOverride * 100)
                  : ''
              }
              placeholder="7.30"
              onChange={(e) => {
                const raw = e.target.value
                if (raw.trim() === '') return setValues({ municipalityRateOverride: null })
                const pct = Number(raw)
                setValues({ municipalityRateOverride: Number.isFinite(pct) ? pct / 100 : null })
              }}
            />
          </Field>
        </div>
      </details>
    </div>
  )
}
