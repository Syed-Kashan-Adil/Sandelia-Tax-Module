import { Step9SalariedIncome } from "./Step9SalariedIncome";
import { Step13OtherIncome } from "./Step13OtherIncome";

export function Step10CompanyAdditionalIncome() {
  return (
    <div className="space-y-6">
      <Step9SalariedIncome />
      <Step13OtherIncome />
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
        Company remuneration (director salary and dividends) is handled through
        company director inputs. Personal salaried and other income entered here
        are added to the personal tax side.
      </div>
    </div>
  );
}
