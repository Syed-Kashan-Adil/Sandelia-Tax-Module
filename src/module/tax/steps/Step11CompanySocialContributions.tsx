import { useMemo } from "react";

import { calculateCompanyTaxSummary } from "../calculator";
import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

function eur(n: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function Step11CompanySocialContributions() {
  const values = useTaxOnboardingStore((s) => s.values);
  const setValues = useTaxOnboardingStore((s) => s.setValues);
  const summary = useMemo(() => calculateCompanyTaxSummary(values), [values]);

  return (
    <div className="space-y-5">
      <Field label="Social insurance fund">
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={values.socialInsuranceFund}
          onChange={(e) =>
            setValues({
              socialInsuranceFund: e.target
                .value as typeof values.socialInsuranceFund,
            })
          }
        >
          <option value="partena">Partena</option>
          <option value="securex">Securex</option>
          <option value="xerius">Xerius</option>
          <option value="liantis">Liantis</option>
          <option value="ucm">UCM</option>
          <option value="other">Other</option>
        </select>
      </Field>

      <div className="rounded-lg border border-border bg-secondary/40 p-4">
        <div className="mb-2 text-sm font-semibold">
          Directors social contribution preview
        </div>
        <div className="space-y-2 text-sm">
          {summary.directorsSocial.map((director) => (
            <div
              key={director.directorId}
              className="flex items-center justify-between gap-3"
            >
              <span>{director.directorName}</span>
              <span>{eur(director.annualContribution)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 border-t border-border pt-2 font-semibold">
            <span>Total annual</span>
            <span>{eur(summary.totalDirectorsSocialContribution)}</span>
          </div>
        </div>
      </div>

      <Field
        label="Total social contribution (annual)"
        hint="Auto-calculated from all directors"
      >
        <Input
          value={summary.totalDirectorsSocialContribution.toFixed(2)}
          disabled
        />
      </Field>
    </div>
  );
}
