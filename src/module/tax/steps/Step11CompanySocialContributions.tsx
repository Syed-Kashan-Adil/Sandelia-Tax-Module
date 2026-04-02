import { cn } from "../../../lib/utils";
import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step11CompanySocialContributions() {
  const isExempt = useTaxOnboardingStore(
    (s) => s.values.companyIsSocialContributionsExempt,
  );
  const fund = useTaxOnboardingStore((s) => s.values.socialInsuranceFund);
  const quarterly = useTaxOnboardingStore(
    (s) => s.values.companyCurrentQuarterlySocialContribution,
  );
  const paidBy = useTaxOnboardingStore((s) => s.values.companySocialPaidBy);
  const paidAmount = useTaxOnboardingStore(
    (s) => s.values.companySocialPaidAmount,
  );
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  return (
    <div className="space-y-6">
      <Field label="Are you exempt from paying social contributions?">
        <div className="flex gap-4">
          <ToggleOption
            label="Yes"
            checked={isExempt}
            onChange={() =>
              setValues({
                companyIsSocialContributionsExempt: true,
                companyCurrentQuarterlySocialContribution: 0,
              })
            }
          />
          <ToggleOption
            label="No"
            checked={!isExempt}
            onChange={() =>
              setValues({ companyIsSocialContributionsExempt: false })
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

      <Field label="How much do you currently pay per quarter? (€)">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={quarterly}
          disabled={isExempt}
          onChange={(e) =>
            setValues({
              companyCurrentQuarterlySocialContribution: Number(
                e.target.value || 0,
              ),
            })
          }
        />
      </Field>

      <Field label="Are your social contributions paid by you personally or by the company?">
        <div className="space-y-3">
          <OptionCard
            title="Paid personally"
            description="I pay my social contributions from my personal account"
            selected={paidBy === "personal"}
            onSelect={() => setValues({ companySocialPaidBy: "personal" })}
          />
          <OptionCard
            title="Paid by the company"
            description="The company pays my social contributions (activates ATN calculation)"
            selected={paidBy === "company"}
            onSelect={() => setValues({ companySocialPaidBy: "company" })}
          />
        </div>
      </Field>

      <Field
        label={
          paidBy === "company"
            ? "Amount paid by company (€)"
            : "Amount paid personally (€)"
        }
        hint="Enter the annual amount for the selected option."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={paidAmount}
          onChange={(e) =>
            setValues({ companySocialPaidAmount: Number(e.target.value || 0) })
          }
        />
      </Field>
    </div>
  );
}

function ToggleOption(props: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition",
        props.checked
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:border-muted-foreground/50",
      )}
    >
      <input
        type="radio"
        checked={props.checked}
        onChange={props.onChange}
        className="sr-only"
      />
      <span
        className={cn(
          "h-4 w-4 rounded border-2",
          props.checked
            ? "border-primary bg-primary"
            : "border-muted-foreground",
        )}
        aria-hidden
      />
      {props.label}
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

function OptionCard(props: {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onSelect}
      className={cn(
        "flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition",
        props.selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-muted-foreground/50",
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">
          {props.title}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {props.description}
        </div>
      </div>
      <span
        className={cn(
          "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
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
