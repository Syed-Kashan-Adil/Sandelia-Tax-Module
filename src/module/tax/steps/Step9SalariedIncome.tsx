import { cn } from '../../../lib/utils'
import { IPP_2026 } from '../constants'
import { useTaxOnboardingStore } from '../store'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { Input } from '../ui/Input'

export function Step9SalariedIncome() {
  const hasSalariedIncome = useTaxOnboardingStore((s) => s.values.hasSalariedIncome)
  const salariedIncome = useTaxOnboardingStore((s) => s.values.salariedIncome)
  const withholdingTax = useTaxOnboardingStore((s) => s.values.withholdingTax)
  const withholdingTaxMode = useTaxOnboardingStore((s) => s.values.withholdingTaxMode)
  const applyLumpSum = useTaxOnboardingStore(
    (s) => s.values.applyEmployeeProfessionalExpensesLumpSum
  )
  const lumpSumOverride = useTaxOnboardingStore(
    (s) => s.values.employeeProfessionalExpensesLumpSumOverride
  )
  const setValues = useTaxOnboardingStore((s) => s.setValues)

  return (
    <div className="space-y-6">
      <Field label="Have you received salaried income during this year?">
        <div className="flex gap-4">
          <ToggleOption
            label="Yes"
            checked={hasSalariedIncome}
            onChange={() =>
              setValues({
                hasSalariedIncome: true,
                // overestimates net taxable employment income.
                applyEmployeeProfessionalExpensesLumpSum: true,
              })
            }
          />
          <ToggleOption
            label="No"
            checked={!hasSalariedIncome}
            onChange={() =>
              setValues({
                hasSalariedIncome: false,
                salariedIncome: 0,
                withholdingTax: 0,
                withholdingTaxMode: 'known',
                applyEmployeeProfessionalExpensesLumpSum: false,
                employeeProfessionalExpensesLumpSumOverride: null,
              })
            }
          />
        </div>
      </Field>

      <Field
        label="What is your taxable salaried income (form 281.10)? (€)"
        hint="Enter the taxable remuneration from your form (e.g. code 1250/2250)."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={salariedIncome}
          disabled={!hasSalariedIncome}
          onChange={(e) => setValues({ salariedIncome: Number(e.target.value || 0) })}
        />
      </Field>

      <Field label="What amount of tax has been withheld from your salary at source (precompte)?">
        <div className="space-y-3">
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition',
              hasSalariedIncome && withholdingTaxMode === 'known'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-muted-foreground/50'
            )}
            onClick={() => setValues({ withholdingTaxMode: 'known' })}
            disabled={!hasSalariedIncome}
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                I know the amount → Enter €
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                This amount reduces your final balance due.
              </div>
            </div>
            <div className="w-40">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={withholdingTax}
                disabled={!hasSalariedIncome || withholdingTaxMode !== 'known'}
                onChange={(e) => setValues({ withholdingTax: Number(e.target.value || 0) })}
              />
            </div>
          </button>

          <button
            type="button"
            className={cn(
              'flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition',
              hasSalariedIncome && withholdingTaxMode === 'unknown'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-muted-foreground/50'
            )}
            onClick={() => setValues({ withholdingTaxMode: 'unknown', withholdingTax: 0 })}
            disabled={!hasSalariedIncome}
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">I don’t know</div>
              <div className="mt-1 text-xs text-muted-foreground">
                We’ll estimate without withholding tax (treated as €0).
              </div>
            </div>
            <span
              className={cn(
                'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
                hasSalariedIncome && withholdingTaxMode === 'unknown'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground'
              )}
              aria-hidden
            >
              {hasSalariedIncome && withholdingTaxMode === 'unknown' ? (
                <span className="h-2 w-2 rounded-sm bg-white" />
              ) : null}
            </span>
          </button>
        </div>
      </Field>

      <div className="rounded-lg border border-border bg-secondary/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Employee professional expenses (lump sum)</div>
            <div className="text-xs text-muted-foreground">
              The document example deducts a lump sum (default €
              {IPP_2026.professionalExpenses.employeeLumpSum}) from salary before applying the
              marital quotient.
            </div>
          </div>
          <Button
            type="button"
            variant={applyLumpSum ? 'secondary' : 'primary'}
            onClick={() => setValues({ applyEmployeeProfessionalExpensesLumpSum: !applyLumpSum })}
            disabled={!hasSalariedIncome}
          >
            {applyLumpSum ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {applyLumpSum && hasSalariedIncome ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Override lump sum (optional)" hint="Leave blank to use the default.">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={typeof lumpSumOverride === 'number' ? lumpSumOverride : ''}
                placeholder={String(IPP_2026.professionalExpenses.employeeLumpSum)}
                disabled={!hasSalariedIncome}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw.trim() === '') {
                    setValues({ employeeProfessionalExpensesLumpSumOverride: null })
                    return
                  }
                  const n = Number(raw)
                  setValues({
                    employeeProfessionalExpensesLumpSumOverride: Number.isFinite(n) ? n : null,
                  })
                }}
              />
            </Field>
            <Field label="Effective lump sum">
              <Input
                value={String(
                  typeof lumpSumOverride === 'number'
                    ? lumpSumOverride
                    : IPP_2026.professionalExpenses.employeeLumpSum
                )}
                disabled
              />
            </Field>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ToggleOption({
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
          'h-4 w-4 rounded border-2',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground'
        )}
        aria-hidden
      />
      {label}
    </label>
  )
}
