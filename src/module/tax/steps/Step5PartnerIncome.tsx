import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step5PartnerIncome() {
  const taxSubject = useTaxOnboardingStore((s) => s.values.taxSubject);
  const maritalStatus = useTaxOnboardingStore((s) => s.values.maritalStatus);
  const partnerIncome = useTaxOnboardingStore((s) => s.values.partnerIncome);
  const partnerWithholdingTax = useTaxOnboardingStore(
    (s) => s.values.partnerWithholdingTax,
  );
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  const enabled =
    maritalStatus === "married" || maritalStatus === "legally-cohabiting";

  return (
    <div className="space-y-5">
      {!enabled ? (
        <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm">
          Partner income is only used for <b>married</b> or{" "}
          <b>legally cohabiting</b> couples (marital quotient). You can continue
          to the next step.
        </div>
      ) : null}

      <Field
        label="Partner income (annual gross salary)"
        hint="Married couples: this value is treated as salary under the lump-sum professional expenses system."
      >
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={partnerIncome}
          onChange={(e) =>
            setValues({ partnerIncome: Number(e.target.value || 0) })
          }
          disabled={!enabled}
        />
      </Field>

      {taxSubject === "company" ? (
        <Field
          label="Partner withholding tax (annual)"
          hint="Tax already deducted from partner salary (used in detailed company summary)."
        >
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            value={partnerWithholdingTax}
            onChange={(e) =>
              setValues({
                companyPartnerWithholdingTax: Number(e.target.value || 0),
              })
            }
            disabled={!enabled}
          />
        </Field>
      ) : null}
      <Field label="Partner withholding tax (€)">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          value={partnerWithholdingTax}
          onChange={(e) =>
            setValues({ partnerWithholdingTax: Number(e.target.value || 0) })
          }
          disabled={!enabled}
        />
      </Field>
    </div>
  );
}
