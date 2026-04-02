import { Trash2 } from "lucide-react";

import { cn } from "../../../lib/utils";
import { useTaxOnboardingStore } from "../store";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step4CompanyDirectors() {
  const hasDirectors = useTaxOnboardingStore(
    (s) => s.values.companyHasDirectorsOrActivePartners,
  );
  const directors = useTaxOnboardingStore((s) => s.values.companyDirectors);
  const primaryId = useTaxOnboardingStore(
    (s) => s.values.companyPrimaryDirectorId,
  );
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
      | "socialContributionOverrideAnnual"
      | "lumpSumExpensesAnnual"
      | "withholdingTaxAnnual"
      | "role",
    value: string,
  ) => {
    const next = directors.map((d) =>
      d.id === id
        ? {
            ...d,
            [key]:
              key === "name"
                ? value
                : key === "role"
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
      <Field label="Would you like to add company directors or active partners?">
        <div className="grid gap-3 md:grid-cols-2">
          <ToggleButton
            label="Yes"
            active={hasDirectors}
            onClick={() =>
              setValues({
                companyHasDirectorsOrActivePartners: true,
                companyDirectors:
                  directors.length > 0 ? directors : [makeDefaultDirector()],
              })
            }
          />
          <ToggleButton
            label="No"
            active={!hasDirectors}
            onClick={() =>
              setValues({
                companyHasDirectorsOrActivePartners: false,
                companyDirectors: [],
                companyPrimaryDirectorId: null,
              })
            }
          />
        </div>
      </Field>

      {!hasDirectors ? (
        <div className="rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          Directors/active partners are skipped for now.
        </div>
      ) : null}

      {hasDirectors ? (
        <>
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
              Add at least one director to calculate director social
              contributions.
            </div>
          ) : null}

          {directors.map((director, index) => (
            <div
              key={director.id}
              className="rounded-xl border border-border p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    Director {index + 1}
                  </div>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="radio"
                      name="primary-director"
                      checked={primaryId === director.id}
                      onChange={() =>
                        setValues({ companyPrimaryDirectorId: director.id })
                      }
                    />
                    This is me (used for Mr/Mrs personal tax calculation)
                  </label>
                </div>
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
                <Field label="Role">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <RoleButton
                      label="Administrator"
                      active={director.role === "administrator"}
                      onClick={() =>
                        updateDirector(director.id, "role", "administrator")
                      }
                    />
                    <RoleButton
                      label="Managing Director"
                      active={director.role === "managing-director"}
                      onClick={() =>
                        updateDirector(director.id, "role", "managing-director")
                      }
                    />
                    <RoleButton
                      label="Active Partner"
                      active={director.role === "active-partner"}
                      onClick={() =>
                        updateDirector(director.id, "role", "active-partner")
                      }
                    />
                  </div>
                </Field>
                <Field label="Monthly salary">
                  <Input
                    type="number"
                    min={0}
                    value={director.monthlySalary}
                    onChange={(e) =>
                      updateDirector(
                        director.id,
                        "monthlySalary",
                        e.target.value,
                      )
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
                <Field
                  label="Lump-sum expenses (annual)"
                  hint="Used in hypothesis-style IPP summary (e.g. €1,800)."
                >
                  <Input
                    type="number"
                    min={0}
                    value={director.lumpSumExpensesAnnual}
                    onChange={(e) =>
                      updateDirector(
                        director.id,
                        "lumpSumExpensesAnnual",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field
                  label="Withholding tax (annual)"
                  hint="Used in hypothesis-style IPP summary (e.g. €20,000)."
                >
                  <Input
                    type="number"
                    min={0}
                    value={director.withholdingTaxAnnual}
                    onChange={(e) =>
                      updateDirector(
                        director.id,
                        "withholdingTaxAnnual",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="Social contributions paid by company?">
                  <div className="flex gap-2">
                    <ToggleButton
                      label="Yes"
                      active={director.socialContributionsPaidByCompany}
                      onClick={() =>
                        setValues({
                          companyDirectors: directors.map((d) =>
                            d.id === director.id
                              ? { ...d, socialContributionsPaidByCompany: true }
                              : d,
                          ),
                        })
                      }
                    />
                    <ToggleButton
                      label="No"
                      active={!director.socialContributionsPaidByCompany}
                      onClick={() =>
                        setValues({
                          companyDirectors: directors.map((d) =>
                            d.id === director.id
                              ? {
                                  ...d,
                                  socialContributionsPaidByCompany: false,
                                }
                              : d,
                          ),
                        })
                      }
                    />
                  </div>
                </Field>
                <Field label="Company car?">
                  <div className="flex gap-2">
                    <ToggleButton
                      label="Yes"
                      active={director.hasCompanyCar}
                      onClick={() =>
                        setValues({
                          companyDirectors: directors.map((d) =>
                            d.id === director.id
                              ? { ...d, hasCompanyCar: true }
                              : d,
                          ),
                        })
                      }
                    />
                    <ToggleButton
                      label="No"
                      active={!director.hasCompanyCar}
                      onClick={() =>
                        setValues({
                          companyDirectors: directors.map((d) =>
                            d.id === director.id
                              ? { ...d, hasCompanyCar: false }
                              : d,
                          ),
                        })
                      }
                    />
                  </div>
                </Field>
              </div>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}

function makeDefaultDirector() {
  const generatedId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now());
  return {
    id: generatedId,
    name: "",
    role: "managing-director" as const,
    monthlySalary: 0,
    expectedDividend: 0,
    socialContributionOverrideAnnual: null,
    lumpSumExpensesAnnual: 0,
    withholdingTaxAnnual: 0,
    socialContributionsPaidByCompany: false,
    hasCompanyCar: false,
  };
}

function ToggleButton(props: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "flex-1 rounded-lg border px-4 py-2 text-left text-sm font-medium transition",
        props.active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-muted-foreground/50",
      )}
    >
      {props.label}
    </button>
  );
}

function RoleButton(props: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-left text-xs font-medium transition",
        props.active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card hover:border-muted-foreground/50",
      )}
    >
      {props.label}
    </button>
  );
}
