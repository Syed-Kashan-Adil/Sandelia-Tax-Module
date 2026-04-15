import { IPP_2026 } from "../constants";
import type { TaxSummary } from "../types";
import { Button } from "../ui/Button";

function eur(n: number): string {
  return new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function BracketLines(props: { breakdown: TaxSummary["federalGrossTaxUser"] }) {
  const rows = props.breakdown.brackets.filter((b) => b.amountTaxed > 0);
  if (rows.length === 0) return null;
  return (
    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
      {rows.map((b, idx) => (
        <div
          key={`${b.from}-${b.to ?? "inf"}-${idx}`}
          className="flex justify-between gap-4"
        >
          <span>
            {eur(b.from)} → {b.to === null ? "∞" : eur(b.to)} @{" "}
            {(b.rate * 100).toFixed(0)}%
          </span>
          <span className="font-medium text-foreground">
            {eur(b.amountTaxed)} → {eur(b.tax)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Step14TaxSummary(props: {
  summary: TaxSummary;
  showCta?: boolean;
}) {
  const s = props.summary;
  const showCta = props.showCta ?? true;

  const netTaxableIncome =
    s.federalGrossTaxUser.taxableIncome +
    s.federalGrossTaxPartner.taxableIncome;

  const totalBeforeCredits =
    s.taxTotalIncludingMunicipalAndCsss + s.advancePaymentPenalty;
  const isCouple = s.allowance.baseAllowancePartner > 0;
  const userAllowanceAllocated =
    s.allowance.totalAllowanceHousehold - s.allowance.baseAllowancePartner;
  const partnerAllowanceAllocated = s.allowance.baseAllowancePartner;

  const userSalaryNet =
    s.salariedIncome > 0
      ? round2(s.salariedIncome - s.userEmployeeLumpSumDeduction)
      : 0;
  const hasEmploymentAndSelfEmployedIncome =
    s.salariedIncome > 0 && s.selfEmployedProfit > 0;
  const isPrimaryCompanyDirector =
    s.socialContributions.status === "company-director";
  const companyDirectorRemunerationGross = isPrimaryCompanyDirector
    ? s.socialContributions.baseIncome
    : 0;
  const companyDirectorFlatRateDeduction = isPrimaryCompanyDirector
    ? round2(
      Math.max(0, companyDirectorRemunerationGross - s.selfEmployedProfit),
    )
    : 0;
  const totalTaxableProfessionalIncome = round2(
    userSalaryNet + s.selfEmployedNetForIpp,
  );
  const partnerSalaryNet =
    s.partnerSalariedIncomeGross > 0
      ? round2(s.partnerSalariedIncomeGross - s.partnerEmployeeLumpSumDeduction)
      : 0;

  const federalAfterWithholding = round2(
    s.federalTaxTotal - s.userWithholdingTax - s.partnerWithholdingTax,
  );
  const quarterlyFinalBalance = buildQuarterSplit(s.finalBalance);
  const quarterlyAdvance = buildAdvanceQuarterPlan({
    annualTotal: s.advanceTaxPayments,
    mode: s.advanceTaxPaymentsMode,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Income overview
        </h3>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          {s.salariedIncome > 0 ? (
            <SummaryRow
              label="Your salaried income (gross)"
              value={eur(s.salariedIncome)}
            />
          ) : null}
          {s.userEmployeeLumpSumDeduction > 0 ? (
            <SummaryRow
              label="Your employee lump-sum professional expenses"
              value={eur(-s.userEmployeeLumpSumDeduction)}
            />
          ) : null}
          {isPrimaryCompanyDirector ? (
            <SummaryRow
              label="Your company director remuneration (gross)"
              value={eur(companyDirectorRemunerationGross)}
            />
          ) : null}
          {isPrimaryCompanyDirector && s.companyDirectorAtnSocialContributions > 0 ? (
            <>
              <SummaryRow
                label="ATN – social contributions paid by the company"
                value={eur(s.companyDirectorAtnSocialContributions)}
              />
              <SummaryRow
                label="Your company director taxable gross (remuneration + ATN)"
                value={eur(s.companyDirectorTaxableGross)}
              />
              <SummaryRow
                label="Your company director base after contributions (taxable gross - social contributions)"
                value={eur(
                  Math.max(
                    0,
                    s.companyDirectorTaxableGross - s.socialContributions.annualAmount,
                  ),
                )}
              />
            </>
          ) : null}
          {isPrimaryCompanyDirector && companyDirectorFlatRateDeduction > 0 ? (
            <SummaryRow
              label="Company director lump-sum deduction (3%, max €3,200; applied after social contributions)"
              value={eur(-companyDirectorFlatRateDeduction)}
            />
          ) : null}
          {s.selfEmployedProfit > 0 && !isPrimaryCompanyDirector ? (
            <SummaryRow
              label="Your self-employed profit (after business expenses)"
              value={eur(s.selfEmployedProfit)}
            />
          ) : null}
          {s.socialContributions.annualAmount > 0 ? (
            <SummaryRow
              label="Your social contributions (deducted for IPP)"
              value={eur(-s.socialContributions.annualAmount)}
            />
          ) : null}
          {s.currentQuarterlySocialContributionInput > 0 ? (
            <SummaryRow
              label="Your current social contributions paid (manual input, annual)"
              value={eur(-s.currentAnnualSocialContributionInput)}
            />
          ) : null}
          {s.currentQuarterlySocialContributionInput > 0 ? (
            <SummaryRow
              label="Difference: current paid vs simulator estimate (annual)"
              value={eur(
                -(
                  s.currentAnnualSocialContributionInput -
                  s.socialContributions.annualAmount
                ),
              )}
            />
          ) : null}
          {s.socialContributions.quarterlyAmount > 0 ? (
            <SummaryRow
              label="Your social contributions (per quarter)"
              value={eur(-s.socialContributions.quarterlyAmount)}
            />
          ) : null}
          {s.selfEmployedNetForIpp > 0 ? (
            <SummaryRow
              label={
                isPrimaryCompanyDirector
                  ? "Your company director net remuneration for IPP (after social contributions)"
                  : "Your self-employed net for IPP"
              }
              value={eur(s.selfEmployedNetForIpp)}
            />
          ) : null}
          {isCouple && s.partnerSalariedIncomeGross > 0 ? (
            <SummaryRow
              label="Partner salaried income (gross)"
              value={eur(s.partnerSalariedIncomeGross)}
            />
          ) : null}
          {isCouple && s.partnerIncomeType === "company-director" ? (
            <>
              <SummaryRow
                label="Partner company director remuneration"
                value={eur(s.partnerCompanyDirectorRemuneration)}
              />
              {s.partnerCompanyDirectorAtnSocialContributions > 0 ? (
                <>
                  <SummaryRow
                    label="ATN – social contributions paid by the company (partner)"
                    value={eur(s.partnerCompanyDirectorAtnSocialContributions)}
                  />
                  <SummaryRow
                    label="Partner company director taxable gross (remuneration + ATN)"
                    value={eur(s.partnerCompanyDirectorTaxableGross)}
                  />
                  <SummaryRow
                    label="Partner company director base after contributions (taxable gross - social contributions)"
                    value={eur(
                      Math.max(
                        0,
                        s.partnerCompanyDirectorTaxableGross -
                          s.partnerCompanyDirectorSocialContributions,
                      ),
                    )}
                  />
                </>
              ) : null}
              <SummaryRow
                label="Partner company director social contributions (auto-calculated, used for IPP)"
                value={eur(-s.partnerCompanyDirectorSocialContributions)}
              />
              <SummaryRow
                label="Partner company director social contributions (auto-calculated, per quarter)"
                value={eur(-round2(s.partnerCompanyDirectorSocialContributions / 4))}
              />
              {s.partnerCompanyDirectorSocialContributionsManualInput > 0 ? (
                <>
                  <SummaryRow
                    label="Partner company director social contributions paid (manual input, comparison only)"
                    value={eur(-s.partnerCompanyDirectorSocialContributionsManualInput)}
                  />
                  <SummaryRow
                    label="Partner company director social contributions paid (manual input, per quarter)"
                    value={eur(-round2(s.partnerCompanyDirectorSocialContributionsManualInput / 4))}
                  />
                </>
              ) : null}
              {s.partnerCompanyDirectorFlatRateDeduction > 0 ? (
                <SummaryRow
                  label="Partner company director lump-sum deduction (3%, max €3,200; after social contributions)"
                  value={eur(-s.partnerCompanyDirectorFlatRateDeduction)}
                />
              ) : null}
              <SummaryRow
                label="Partner company director net for IPP"
                value={eur(s.partnerCompanyDirectorNetForIpp)}
              />
            </>
          ) : null}
          {isCouple && s.partnerEmployeeLumpSumDeduction > 0 ? (
            <SummaryRow
              label="Partner employee lump-sum professional expenses"
              value={eur(-s.partnerEmployeeLumpSumDeduction)}
            />
          ) : null}
          {isCouple && s.partnerSelfEmployedGross > 0 ? (
            <>
              <SummaryRow
                label="Partner self-employed gross"
                value={eur(s.partnerSelfEmployedGross)}
              />
              <SummaryRow
                label="Partner professional expenses"
                value={eur(-s.partnerSelfEmployedExpenses)}
              />
              <SummaryRow
                label="Partner social contributions (auto-calculated, used for IPP)"
                value={eur(-s.partnerSelfEmployedSocialContributions)}
              />
              <SummaryRow
                label="Partner social contributions (auto-calculated, per quarter)"
                value={eur(-round2(s.partnerSelfEmployedSocialContributions / 4))}
              />
              {s.partnerSelfEmployedSocialContributionsManualInput > 0 ? (
                <>
                  <SummaryRow
                    label="Partner social contributions paid (manual input, comparison only)"
                    value={eur(-s.partnerSelfEmployedSocialContributionsManualInput)}
                  />
                  <SummaryRow
                    label="Partner social contributions paid (manual input, per quarter)"
                    value={eur(-round2(s.partnerSelfEmployedSocialContributionsManualInput / 4))}
                  />
                </>
              ) : null}
              <SummaryRow
                label="Partner self-employed net for IPP"
                value={eur(s.partnerSelfEmployedNetForIpp)}
              />
            </>
          ) : null}
          {s.otherIncome > 0 ? (
            <SummaryRow label="Other income (you)" value={eur(s.otherIncome)} />
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Detailed calculation (2026)
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          In this wizard, <b>you</b> are the primary taxpayer (e.g. Mr in worked
          examples); <b>partner</b> is the spouse (e.g. Mrs).
        </p>

        {isCouple ? (
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                1. Your net taxable professional income (before marital
                splitting)
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {s.salariedIncome > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>Salary after lump sum</span>
                    <span className="font-medium text-foreground">
                      {eur(userSalaryNet)}
                    </span>
                  </div>
                ) : null}
                {s.selfEmployedNetForIpp > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>Self-employed net (after social)</span>
                    <span className="font-medium text-foreground">
                      {eur(s.selfEmployedNetForIpp)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 border-t border-border/50 pt-2 font-medium text-foreground">
                  <span>Total (professional, before splitting)</span>
                  <span>{eur(s.maritalQuotient.before.userIncome)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                2. Partner net taxable professional income (before marital
                splitting)
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                {s.partnerSalariedIncomeGross > 0 ? (
                  s.partnerEmployeeLumpSumDeduction > 0 ? (
                    <>
                      <div className="flex justify-between gap-4">
                        <span>Gross salary</span>
                        <span className="font-medium text-foreground">
                          {eur(s.partnerSalariedIncomeGross)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>
                          Lump-sum professional expenses (max €
                          {IPP_2026.professionalExpenses.employeeLumpSum.toLocaleString(
                            "en-BE",
                          )}{" "}
                          where applicable)
                        </span>
                        <span className="font-medium text-foreground">
                          {eur(-s.partnerEmployeeLumpSumDeduction)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Salary net of lump sum</span>
                        <span className="font-medium text-foreground">
                          {eur(partnerSalaryNet)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <span>Partner income used for splitting</span>
                      <span className="font-medium text-foreground">
                        {eur(s.partnerSalariedIncomeGross)}
                      </span>
                    </div>
                  )
                ) : null}
                {s.partnerSelfEmployedGross > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>
                      Self-employed net (gross − expenses − contributions)
                    </span>
                    <span className="font-medium text-foreground">
                      {eur(s.partnerSelfEmployedNetForIpp)}
                    </span>
                  </div>
                ) : null}
                {s.partnerIncomeType === "company-director" ? (
                  <div className="flex justify-between gap-4">
                    <span>
                      Company director net (after social contributions)
                    </span>
                    <span className="font-medium text-foreground">
                      {eur(s.partnerCompanyDirectorNetForIpp)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 border-t border-border/50 pt-2 font-medium text-foreground">
                  <span>Total (professional, before splitting)</span>
                  <span>{eur(s.maritalQuotient.before.partnerIncome)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                3. Marital income splitting
              </span>
              <p className="mt-2">{s.maritalSplittingNote}</p>
              {s.maritalQuotient.applied ? (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between gap-4">
                    <span>Your income after splitting</span>
                    <span className="font-medium text-foreground">
                      {eur(s.maritalQuotient.after.userIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Partner income after splitting</span>
                    <span className="font-medium text-foreground">
                      {eur(s.maritalQuotient.after.partnerIncome)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                4. Tax-free allowances used
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>You (allocated share)</span>
                  <span className="font-medium text-foreground">
                    {eur(userAllowanceAllocated)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>Partner (base)</span>
                  <span className="font-medium text-foreground">
                    {eur(partnerAllowanceAllocated)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-border/50 pt-2 font-medium text-foreground">
                  <span>Household total</span>
                  <span>{eur(s.allowance.totalAllowanceHousehold)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                5. Your gross federal tax (on income after splitting)
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {eur(s.federalGrossTaxUser.total)}
              </div>
              <BracketLines breakdown={s.federalGrossTaxUser} />
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                6. Your net federal tax
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <span>Allowance reduction (brackets on your share)</span>
                  <span className="font-medium text-foreground">
                    {eur(-s.federalTaxReductionFromAllowancesUser)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 font-medium text-foreground">
                  <span>Net federal tax</span>
                  <span>{eur(s.federalNetTaxUser)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                7. Partner gross federal tax (on income after splitting)
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">
                {eur(s.federalGrossTaxPartner.total)}
              </div>
              <BracketLines breakdown={s.federalGrossTaxPartner} />
            </div>

            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                8. Partner net federal tax
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <span>Allowance reduction (brackets on partner share)</span>
                  <span className="font-medium text-foreground">
                    {eur(-s.federalTaxReductionFromAllowancesPartner)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 font-medium text-foreground">
                  <span>Net federal tax</span>
                  <span>{eur(s.federalNetTaxPartner)}</span>
                </div>
              </div>
            </div>

            <SummaryRow
              label="9. Household federal tax (after allowances)"
              value={eur(s.federalTaxTotal)}
            />
            <SummaryRow
              label="10. After withholding taxes (yours + partner)"
              value={eur(federalAfterWithholding)}
            />
            <SummaryRow
              label={`11. Municipal tax (${(s.municipalSurcharge.rate * 100).toFixed(1)}% on federal after allowances)`}
              value={eur(s.municipalSurcharge.amount)}
            />
            <SummaryRow
              label="12. Special social security contribution (estimated)"
              value={eur(s.specialSocialSecurityContribution)}
            />
            <SummaryRow
              label="13. Total tax (federal + municipal + CSSS)"
              value={eur(s.taxTotalIncludingMunicipalAndCsss)}
            />

            <div className="my-2 border-t border-border" />

            <SummaryRow
              label="Advance payment penalty"
              value={eur(s.advancePaymentPenalty)}
            />
            <SummaryRow
              label="Your withholding tax (credit)"
              value={eur(-s.userWithholdingTax)}
              highlightGreen
            />
            <SummaryRow
              label="Partner withholding tax (credit)"
              value={eur(-s.partnerWithholdingTax)}
              highlightGreen
            />
            <SummaryRow
              label="Advance tax payments"
              value={eur(-s.advanceTaxPayments)}
              highlightGreen
            />
            <SummaryRow
              label="Total before credits"
              value={eur(totalBeforeCredits)}
            />

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-medium text-foreground">
                Estimated balance due
              </span>
              <span
                className={`font-semibold ${s.finalBalance > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                  }`}
              >
                {eur(s.finalBalance)}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 rounded-lg border border-border bg-card p-4">
            {hasEmploymentAndSelfEmployedIncome ? (
              <>
                <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                  <div className="text-xs font-semibold text-foreground">
                    1. Net taxable employment income
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between gap-4">
                      <span>Gross salary</span>
                      <span className="font-medium text-foreground">
                        {eur(s.salariedIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Lump-sum employee expenses retained</span>
                      <span className="font-medium text-foreground">
                        {eur(-s.userEmployeeLumpSumDeduction)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-border/50 pt-2 font-medium text-foreground">
                      <span>Net taxable employment income</span>
                      <span>{eur(userSalaryNet)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                  <div className="text-xs font-semibold text-foreground">
                    {isPrimaryCompanyDirector
                      ? "2. Net company director income"
                      : "2. Net self-employed secondary income"}
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between gap-4">
                      <span>
                        {isPrimaryCompanyDirector
                          ? "Gross remuneration"
                          : "Gross profit"}
                      </span>
                      <span className="font-medium text-foreground">
                        {eur(
                          isPrimaryCompanyDirector
                            ? companyDirectorRemunerationGross
                            : s.selfEmployedProfit +
                            s.selfEmployedProfessionalExpenses,
                        )}
                      </span>
                    </div>
                    {isPrimaryCompanyDirector &&
                      companyDirectorFlatRateDeduction > 0 ? (
                      <div className="flex justify-between gap-4">
                        <span>
                          Lump-sum director deduction (3%, max €3,200; after
                          social contributions)
                        </span>
                        <span className="font-medium text-foreground">
                          {eur(-companyDirectorFlatRateDeduction)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4">
                      <span>
                        Social contributions
                        {s.currentQuarterlySocialContributionInput > 0
                          ? ' (manual current-paid input shown in comparison rows)'
                          : ''}
                      </span>
                      <span className="font-medium text-foreground">
                        {eur(-s.socialContributions.annualAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Social contributions (per quarter)</span>
                      <span className="font-medium text-foreground">
                        {eur(-s.socialContributions.quarterlyAmount)}
                      </span>
                    </div>
                    {!isPrimaryCompanyDirector ? (
                      <div className="flex justify-between gap-4">
                        <span>Professional expenses</span>
                        <span className="font-medium text-foreground">
                          {eur(-s.selfEmployedProfessionalExpenses)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 border-t border-border/50 pt-2 font-medium text-foreground">
                      <span>
                        {isPrimaryCompanyDirector
                          ? "Net taxable company director income"
                          : "Net taxable self-employed income"}
                      </span>
                      <span>{eur(s.selfEmployedNetForIpp)}</span>
                    </div>
                  </div>
                </div>

                <SummaryRow
                  label="3. Total taxable professional income"
                  value={eur(totalTaxableProfessionalIncome)}
                />
              </>
            ) : (
              <SummaryRow
                label="1. Net taxable income"
                value={eur(netTaxableIncome)}
              />
            )}
            <SummaryRow
              label="2. Tax-free allowance used"
              value={eur(s.allowance.totalAllowanceHousehold)}
            />
            <div className="mt-2 rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                Tax-free allowance breakdown
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <span>Base allowance (self)</span>
                  <span className="font-medium text-foreground">
                    {eur(s.allowance.baseAllowanceSelf)}
                  </span>
                </div>
                {s.allowance.dependentsAllowance > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>Dependent child allowance</span>
                    <span className="font-medium text-foreground">
                      {eur(s.allowance.dependentsAllowance)}
                    </span>
                  </div>
                ) : null}
                {s.allowance.youngChildrenAllowance > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>Child under 3 allowance</span>
                    <span className="font-medium text-foreground">
                      {eur(s.allowance.youngChildrenAllowance)}
                    </span>
                  </div>
                ) : null}
                {s.allowance.singleParentAllowance > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>Single parent allowance</span>
                    <span className="font-medium text-foreground">
                      {eur(s.allowance.singleParentAllowance)}
                    </span>
                  </div>
                ) : null}
                {s.allowance.otherDependentsAllowance > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>Other dependents allowance</span>
                    <span className="font-medium text-foreground">
                      {eur(s.allowance.otherDependentsAllowance)}
                    </span>
                  </div>
                ) : null}
                {s.allowance.ageAllowanceSelf > 0 ? (
                  <div className="flex justify-between gap-4">
                    <span>Age allowance</span>
                    <span className="font-medium text-foreground">
                      {eur(s.allowance.ageAllowanceSelf)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            <SummaryRow
              label="3. Gross tax by brackets"
              value={eur(s.federalGrossTaxTotal)}
            />
            <div className="mt-2 rounded-lg border border-border/60 bg-secondary/30 p-3">
              <div className="text-xs font-semibold text-foreground">
                Gross tax by brackets
              </div>
              <BracketLines breakdown={s.federalGrossTaxUser} />
            </div>
            <SummaryRow
              label="4. Tax-free allowance reduction (progressive brackets)"
              value={eur(-s.federalTaxReductionFromAllowances)}
            />
            <SummaryRow
              label="5. Net tax before withholding tax"
              value={eur(s.federalTaxTotal)}
            />
            <SummaryRow
              label="6. Set-off of withholding tax"
              value={eur(-s.withholdingTax)}
              highlightGreen
            />
            <SummaryRow
              label="After set-off of withholding tax"
              value={eur(federalAfterWithholding)}
            />
            <SummaryRow
              label={`7. Municipal tax (${(s.municipalSurcharge.rate * 100).toFixed(1)}% on net tax before withholding)`}
              value={eur(s.municipalSurcharge.amount)}
            />
            <SummaryRow
              label="8. Special social security contribution retained on an estimated basis"
              value={eur(s.specialSocialSecurityContribution)}
            />
            {s.advancePaymentPenalty > 0 ? (
              <SummaryRow
                label="Advance payment penalty"
                value={eur(s.advancePaymentPenalty)}
              />
            ) : null}
            {s.advanceTaxPayments > 0 ? (
              <SummaryRow
                label="Advance tax payments"
                value={eur(-s.advanceTaxPayments)}
                highlightGreen
              />
            ) : null}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="font-medium text-foreground">
                9. Estimated final result
              </span>
              <span
                className={`font-semibold ${s.finalBalance > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                  }`}
              >
                {eur(s.finalBalance)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Quarter-wise breakdown
        </h3>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4 text-sm">
          {quarterlyFinalBalance.map((q, idx) => {
            const advance = quarterlyAdvance[idx].amount;
            return (
              <div
                key={q.label}
                className="grid grid-cols-1 gap-1 rounded-lg border border-border/70 bg-secondary/30 p-3 md:grid-cols-4 md:items-center"
              >
                <div className="font-medium text-foreground">{q.label}</div>
                <div className="text-muted-foreground">
                  Estimated final result share: {eur(q.amount)}
                </div>
                <div className="text-muted-foreground">
                  Planned advance: {eur(-advance)}
                </div>
                <div className="font-medium text-foreground">
                  {q.amount > 0 ? "Payable" : "In your favour"}: {eur(q.amount)}
                </div>
              </div>
            );
          })}
          <div className="text-xs text-muted-foreground">
            Quarter shares are computed from the final result (
            {eur(s.finalBalance)}), not from pre-credit tax totals. Advance
            payment mode: <b>{s.advanceTaxPaymentsMode}</b>.
          </div>
        </div>
      </div>

      {showCta ? (
        <div className="pt-2">
          <Button type="button" className="w-full" size="md">
            Get started
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildQuarterSplit(
  totalAmount: number,
): Array<{ label: "Q1" | "Q2" | "Q3" | "Q4"; amount: number }> {
  const total = round2(totalAmount);
  const per = round2(total / 4);
  const q2 = per;
  const q3 = per;
  const q4 = per;
  const q1 = round2(total - q2 - q3 - q4);
  return [
    { label: "Q1", amount: q1 },
    { label: "Q2", amount: q2 },
    { label: "Q3", amount: q3 },
    { label: "Q4", amount: q4 },
  ];
}

function buildAdvanceQuarterPlan(params: {
  annualTotal: number;
  mode: TaxSummary["advanceTaxPaymentsMode"];
}): Array<{ label: "Q1" | "Q2" | "Q3" | "Q4"; amount: number }> {
  const total = round2(Math.max(0, params.annualTotal));
  if (total <= 0 || params.mode === "none") {
    return [
      { label: "Q1", amount: 0 },
      { label: "Q2", amount: 0 },
      { label: "Q3", amount: 0 },
      { label: "Q4", amount: 0 },
    ];
  }
  if (params.mode === "optimize") {
    return [
      { label: "Q1", amount: total },
      { label: "Q2", amount: 0 },
      { label: "Q3", amount: 0 },
      { label: "Q4", amount: 0 },
    ];
  }
  const per = round2(total / 4);
  const q2 = per;
  const q3 = per;
  const q4 = per;
  const q1 = round2(total - q2 - q3 - q4);
  return [
    { label: "Q1", amount: q1 },
    { label: "Q2", amount: q2 },
    { label: "Q3", amount: q3 },
    { label: "Q4", amount: q4 },
  ];
}

function SummaryRow({
  label,
  value,
  highlightGreen,
}: {
  label: string;
  value: string;
  highlightGreen?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          highlightGreen ? "font-medium text-green-600 dark:text-green-400" : ""
        }
      >
        {value}
      </span>
    </div>
  );
}
