import { Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../../../lib/utils'
import { useTaxOnboardingStore } from '../store'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step6Dependents() {
  const children = useTaxOnboardingStore((s) => s.values.children)
  const otherDependents = useTaxOnboardingStore((s) => s.values.otherDependents)
  const addChild = useTaxOnboardingStore((s) => s.addChild)
  const removeChild = useTaxOnboardingStore((s) => s.removeChild)
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  const hasChildren = children.length > 0
  const equivalentChildren = useMemo(
    () => children.reduce((acc, c) => acc + (c.isDisabled ? 2 : 1), 0),
    [children]
  )

  return (
    <div className="space-y-8">
      {/* Section 1: Children dependents */}
      <div className="space-y-4">
        <Field
          label="Do you have children financially dependent on you?"
          hint="Severe disability counts as 2 children. Each child under 3 on 1 Jan of the assessment year adds €720."
        >
          <div className="flex gap-4">
            <RadioOption
              label="Yes"
              checked={hasChildren}
              onChange={() => {
                if (!hasChildren) addChild()
              }}
            />
            <RadioOption
              label="No"
              checked={!hasChildren}
              onChange={() => setValues({ children: [] })}
            />
          </div>
        </Field>

        {hasChildren && (
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            {children.map((child, index) => (
              <div key={child.id} className="space-y-4 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Child {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeChild(child.id)}
                    aria-label="Remove child"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Date of birth">
                    <Input
                      type="date"
                      value={child.dateOfBirth}
                      onChange={(e) =>
                        setValues({
                          children: children.map((c) =>
                            c.id === child.id ? { ...c, dateOfBirth: e.target.value } : c
                          ),
                        })
                      }
                    />
                  </Field>
                  <Field label="Is the child officially recognized as disabled?">
                    <div className="flex gap-4 pt-2">
                      <RadioOption
                        label="Yes"
                        checked={child.isDisabled}
                        onChange={() =>
                          setValues({
                            children: children.map((c) =>
                              c.id === child.id ? { ...c, isDisabled: true } : c
                            ),
                          })
                        }
                      />
                      <RadioOption
                        label="No"
                        checked={!child.isDisabled}
                        onChange={() =>
                          setValues({
                            children: children.map((c) =>
                              c.id === child.id ? { ...c, isDisabled: false } : c
                            ),
                          })
                        }
                      />
                    </div>
                  </Field>
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={() => addChild()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add another child
            </Button>
            <p className="text-xs text-muted-foreground">
              Equivalent count for allowances: <strong>{equivalentChildren}</strong> (disabled = 2).
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Other dependents */}
      <div className="space-y-4 border-t border-border pt-6">
        <Field
          label="Do you have other financially dependent persons (e.g., elderly parents)?"
          hint="The increase depends on category (65+, disability, care, already dependent in 2021, etc.)."
        >
          <div className="text-sm text-muted-foreground">
            Enter the number of dependents per category (0 if none).
          </div>
        </Field>

        <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CountField
              label="65+ in dependency"
              value={otherDependents.age65InDependencyCount}
              onChange={(n) =>
                setValues({
                  otherDependents: { ...otherDependents, age65InDependencyCount: n },
                })
              }
            />
            <CountField
              label="65+ severe disability + care (dependent in 2021)"
              value={otherDependents.age65SevereDisabilityRequiringCareDependentIn2021Count}
              onChange={(n) =>
                setValues({
                  otherDependents: {
                    ...otherDependents,
                    age65SevereDisabilityRequiringCareDependentIn2021Count: n,
                  },
                })
              }
            />
            <CountField
              label="65+ not requiring care (dependent in 2021)"
              value={otherDependents.age65NotRequiringCareDependentIn2021Count}
              onChange={(n) =>
                setValues({
                  otherDependents: {
                    ...otherDependents,
                    age65NotRequiringCareDependentIn2021Count: n,
                  },
                })
              }
            />
            <CountField
              label="65+ not requiring care + severe disability (dependent in 2021)"
              value={otherDependents.age65NotRequiringCareDependentIn2021SevereDisabilityCount}
              onChange={(n) =>
                setValues({
                  otherDependents: {
                    ...otherDependents,
                    age65NotRequiringCareDependentIn2021SevereDisabilityCount: n,
                  },
                })
              }
            />
            <CountField
              label="Other dependents"
              value={otherDependents.otherCount}
              onChange={(n) =>
                setValues({ otherDependents: { ...otherDependents, otherCount: n } })
              }
            />
            <CountField
              label="Other dependents (severe disability)"
              value={otherDependents.otherSevereDisabilityCount}
              onChange={(n) =>
                setValues({
                  otherDependents: { ...otherDependents, otherSevereDisabilityCount: n },
                })
              }
            />
          </div>
          <Field label="Brief description (optional)">
            <Input
              type="text"
              value={otherDependents.description}
              onChange={(e) =>
                setValues({
                  otherDependents: { ...otherDependents, description: e.target.value },
                })
              }
              placeholder="e.g. elderly parents, disabled relative"
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

function CountField(props: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Field label={props.label}>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        max={99}
        value={props.value || ''}
        onChange={(e) => {
          const v = e.target.value
          const n = v === '' ? 0 : Math.max(0, parseInt(v, 10) || 0)
          props.onChange(n)
        }}
        placeholder="0"
      />
    </Field>
  )
}

function RadioOption({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition',
        checked
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background hover:border-muted-foreground/50'
      )}
    >
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={cn(
          'h-4 w-4 rounded-full border-2',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
      />
      {label}
    </label>
  )
}
