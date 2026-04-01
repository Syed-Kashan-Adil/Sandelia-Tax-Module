import { Trash2 } from "lucide-react";

import { useTaxOnboardingStore } from "../store";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step4CompanyDirectors() {
  const directors = useTaxOnboardingStore((s) => s.values.companyDirectors);
  const setValues = useTaxOnboardingStore((s) => s.setValues);
  const addCompanyDirector = useTaxOnboardingStore((s) => s.addCompanyDirector);
  const removeCompanyDirector = useTaxOnboardingStore(
    (s) => s.removeCompanyDirector,
  );

  const updateDirector = (
    id: string,
    key:
      | "name"
      | "monthlySalary"
      | "expectedDividend"
      | "socialContributionOverrideAnnual",
    value: string,
  ) => {
    const next = directors.map((d) =>
      d.id === id
        ? {
            ...d,
            [key]:
              key === "name"
                ? value
                : key === "socialContributionOverrideAnnual"
                  ? value.trim() === ""
                    ? null
                    : Number(value || 0)
                  : Number(value || 0),
          }
        : d,
    );
    setValues({ companyDirectors: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Company directors</h3>
        <Button
          type="button"
          variant="secondary"
          onClick={() => addCompanyDirector({ name: "" })}
        >
          Add director
        </Button>
      </div>

      {directors.length === 0 ? (
        <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Add at least one director to calculate director social contributions.
        </div>
      ) : null}

      {directors.map((director, index) => (
        <div key={director.id} className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">Director {index + 1}</div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeCompanyDirector(director.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Name">
              <Input
                value={director.name}
                onChange={(e) =>
                  updateDirector(director.id, "name", e.target.value)
                }
              />
            </Field>
            <Field label="Monthly salary">
              <Input
                type="number"
                min={0}
                value={director.monthlySalary}
                onChange={(e) =>
                  updateDirector(director.id, "monthlySalary", e.target.value)
                }
              />
            </Field>
            <Field label="Expected dividend (annual)">
              <Input
                type="number"
                min={0}
                value={director.expectedDividend}
                onChange={(e) =>
                  updateDirector(
                    director.id,
                    "expectedDividend",
                    e.target.value,
                  )
                }
              />
            </Field>
            <Field
              label="Social contribution override (annual)"
              hint="Optional"
            >
              <Input
                type="number"
                min={0}
                value={director.socialContributionOverrideAnnual ?? ""}
                onChange={(e) =>
                  updateDirector(
                    director.id,
                    "socialContributionOverrideAnnual",
                    e.target.value,
                  )
                }
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}
