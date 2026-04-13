import { useMemo } from "react";

import { cn } from "../../../lib/utils";
import { computeEstimatedAnnualProfessionalIncome } from "../calculator/profitEstimation";
import { computeSocialContributions } from "../calculator/socialContributions";
import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step11SocialContributions() {
  const status = useTaxOnboardingStore((s) => s.values.selfEmployedStatus);
  const values = useTaxOnboardingStore((s) => s.values);
  const annualExpenses = useTaxOnboardingStore(
    (s) => s.values.estimatedProfessionalExpenses,
  );
  const isExempt = useTaxOnboardingStore(
    (s) => s.values.isSocialContributionsExempt,
  );
  const studentSocialExemption = useTaxOnboardingStore(
    (s) => s.values.studentSocialExemption,
  );
  const fund = useTaxOnboardingStore((s) => s.values.socialInsuranceFund);
  const currentQuarterly = useTaxOnboardingStore(
    (s) => s.values.currentQuarterlySocialContribution,
  );
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  const annualProfit = useMemo(
    () => computeEstimatedAnnualProfessionalIncome(values),
    [values],
  );

  const netIncome = useMemo(
    () =>
      status === "company-director"
        ? Math.max(0, values.companyDirectorRemuneration)
        : Math.max(0, annualProfit - annualExpenses),
    [annualProfit, annualExpenses, status, values.companyDirectorRemuneration],
  );

  // Calculation input override (separate from "currently paid" tracking field).
  const overrideAnnualAmount = useMemo(() => {
    if (isExempt) return 0;
    return values.socialContributionsOverride;
  }, [isExempt, values.socialContributionsOverride]);

  const calculated = useMemo(
    () =>
      computeSocialContributions({
        status,
        annualNetIncome: netIncome,
        overrideAnnualAmount,
        socialInsuranceFund: fund,
        studentSocialExemption,
      }),
    [status, netIncome, overrideAnnualAmount, fund, studentSocialExemption],
  );

  return (
    <div className="space-y-6">
      {status === "company-director" ? (
        <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
          Company director contributions are auto-calculated from your gross
          remuneration and social fund. If you currently pay contributions,
          enter your current quarterly amount below to override and compare.
        </div>
      ) : null}

      {status === "student" ? (
        <Field
          label="Student: exemption from provisional contribution (zone 1)?"
          hint="Student regime uses threshold-slice logic; this toggle is kept for compatibility with existing saved inputs."
        >
          <div className="flex gap-4">
            <ToggleOption
              label="Exempt"
              checked={studentSocialExemption}
              onChange={() => setValues({ studentSocialExemption: true })}
            />
            <ToggleOption
              label="Not exempt (provisional minimum applies)"
              checked={!studentSocialExemption}
              onChange={() => setValues({ studentSocialExemption: false })}
            />
          </div>
        </Field>
      ) : null}

      <Field label="Are you exempt from paying social contributions?">
        <div className="flex gap-4">
          <ToggleOption
            label="Yes"
            checked={isExempt}
            onChange={() =>
              setValues({
                isSocialContributionsExempt: true,
                currentQuarterlySocialContribution: 0,
                socialContributionsOverride: 0,
              })
            }
          />
          <ToggleOption
            label="No"
            checked={!isExempt}
            onChange={() =>
              setValues({
                isSocialContributionsExempt: false,
                socialContributionsOverride: null,
              })
            }
          />
        </div>
      </Field>

      <Field label="Which social insurance fund are you affiliated with?">
        <div className="grid gap-3 md:grid-cols-2">
          <FundOption
            label="Securex"
            selected={fund === "securex"}
            onSelect={() => setValues({ socialInsuranceFund: "securex" })}
          />
          <FundOption
            label="Xerius"
            selected={fund === "xerius"}
            onSelect={() => setValues({ socialInsuranceFund: "xerius" })}
          />
          <FundOption
            label="Liantis"
            selected={fund === "liantis"}
            onSelect={() => setValues({ socialInsuranceFund: "liantis" })}
          />
          <FundOption
            label="UCM"
            selected={fund === "ucm"}
            onSelect={() => setValues({ socialInsuranceFund: "ucm" })}
          />
          <FundOption
            label="Partena"
            selected={fund === "partena"}
            onSelect={() => setValues({ socialInsuranceFund: "partena" })}
          />
          <FundOption
            label="Other"
            selected={fund === "other"}
            onSelect={() => setValues({ socialInsuranceFund: "other" })}
          />
        </div>
      </Field>

      <Field
        label="How much do you currently pay per quarter? (€)"
        hint="Optional: used only for comparison against the automatic estimate."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={currentQuarterly}
          disabled={isExempt}
          onChange={(e) =>
            setValues({
              currentQuarterlySocialContribution: Number(e.target.value || 0),
            })
          }
        />
      </Field>

      <div className="rounded-lg border border-border bg-secondary/50 p-4">
        <div className="text-sm font-medium">Automatic estimate</div>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <Field label="Net income (annual)" hint="Net = income − expenses">
            <Input value={netIncome.toFixed(2)} disabled />
          </Field>
          <Field label="Annual contributions">
            <Input value={calculated.annualAmount.toFixed(2)} disabled />
          </Field>
          <Field label="Quarterly contributions">
            <Input value={calculated.quarterlyAmount.toFixed(2)} disabled />
          </Field>
        </div>
        {currentQuarterly > 0 ? (
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <Field label="Current quarterly paid (input)">
              <Input value={currentQuarterly.toFixed(2)} disabled />
            </Field>
            <Field label="Current annual paid (input)">
              <Input value={(currentQuarterly * 4).toFixed(2)} disabled />
            </Field>
            <Field label="Difference vs estimated annual">
              <Input
                value={(currentQuarterly * 4 - calculated.annualAmount).toFixed(
                  2,
                )}
                disabled
              />
            </Field>
          </div>
        ) : null}
        <div className="mt-2 text-xs text-muted-foreground">
          Current quarterly payment is shown for comparison only; estimate
          remains auto-calculated from your income base.
          {fund === "partena" ? (
            <>
              {" "}
              Partena published scales are quarterly; annual is displayed as
              quarterly × 4.
            </>
          ) : null}
          {calculated.method === "calculated" ? (
            <>
              {" "}
              Legal annual (before {fund} fee): €
              {calculated.legalAnnualBeforeFees.toFixed(2)}; fee{" "}
              {(calculated.fundFeeRate * 100).toFixed(2)}%.
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ToggleOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition",
        checked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:border-muted-foreground/50",
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          "h-4 w-4 rounded border-2",
          checked ? "border-primary bg-primary" : "border-muted-foreground",
        )}
        aria-hidden
      />
      {label}
    </label>
  );
}

function FundOption(props: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
        props.selected
          ? "border-primary bg-primary/5 text-foreground"
          : "border-border bg-card hover:border-muted-foreground/50",
      )}
    >
      <span>{props.label}</span>
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded border-2",
          props.selected
            ? "border-primary bg-primary"
            : "border-muted-foreground",
        )}
        aria-hidden
      >
        {props.selected ? (
          <span className="h-2 w-2 rounded-sm bg-white" />
        ) : null}
      </span>
    </button>
  );
}
