import { useTaxOnboardingStore } from "../store";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";

export function Step5CompanyAdvancePayments() {
  const advance = useTaxOnboardingStore((s) => s.values.companyAdvancePayments);
  const setValues = useTaxOnboardingStore((s) => s.setValues);

  const setQuarter = (key: "vai1" | "vai2" | "vai3" | "vai4", raw: string) => {
    setValues({
      companyAdvancePayments: {
        ...advance,
        [key]: Number(raw || 0),
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter quarter-wise advance payments (VAI1 to VAI4). These reduce
        increase and are deducted at final payable stage.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="VAI1">
          <Input
            type="number"
            min={0}
            value={advance.vai1}
            onChange={(e) => setQuarter("vai1", e.target.value)}
          />
        </Field>
        <Field label="VAI2">
          <Input
            type="number"
            min={0}
            value={advance.vai2}
            onChange={(e) => setQuarter("vai2", e.target.value)}
          />
        </Field>
        <Field label="VAI3">
          <Input
            type="number"
            min={0}
            value={advance.vai3}
            onChange={(e) => setQuarter("vai3", e.target.value)}
          />
        </Field>
        <Field label="VAI4">
          <Input
            type="number"
            min={0}
            value={advance.vai4}
            onChange={(e) => setQuarter("vai4", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}
