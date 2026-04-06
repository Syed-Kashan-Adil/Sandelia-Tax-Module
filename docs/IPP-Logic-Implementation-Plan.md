# IPP Logic (Word document) – Implementation Plan

This plan is based on the **IPP Logic.docx** you shared. It compares the document’s rules with the current code and lists concrete implementation steps.

---

## 1. Document summary vs current implementation

| Topic | In document | Current implementation | Action |
|-------|-------------|------------------------|--------|
| **Tax-free allowance (base)** | €10,910 per person | ✅ €10,910 in constants | None |
| **Allowance as tax reduction** | Allowance converted to tax reduction at **25%** (e.g. €10,910 × 25% = €2,727.50 deducted from gross tax) | We subtract allowance from income, then apply brackets (different result) | **Decide**: align with doc (tax on full income − 25% of total allowance) or keep current |
| **Tax brackets** | Example uses 15,200 / 26,830 / 41,020 (25% / 40% / 45%); doc says “table above” | We use 17,374.08 / 75,024.54 / 110,562.42 | Keep current brackets; doc example may be another year – make brackets configurable if needed |
| **Dependent children** | 1/2/3/4 and 5+ formula; severe disability = 2; under 3 on 1 Jan = +€720 | ✅ Implemented | None |
| **Dependents other than children** | **6 categories** with different amounts (see below) | Single “other dependents” count × €1,920 | **Extend** model and calculator |
| **Marital quotient** | 30%, max €13,050; **professional expenses lump sum €5,930** deducted from income before quotient | We apply quotient to raw income; no lump sum | **Add** professional expenses lump sum (configurable) and apply before quotient |
| **Municipal tax** | e.g. Overijse 7.3% of federal tax | ✅ Implemented | None |
| **Form 281.10 (employee)** | Taxable remuneration (1250/2250), withholding (1286/2286), BIK (250/2250) | We have salaried income + withholding | Optional: add BIK field and/or form code hints in UI |
| **Director income (281.20)** | Code 1400/2400; withholding 1450/2450; directors pay self-employed social contributions | Not modelled as separate “director” flow | Optional: add director remuneration as income source and document 281.20 |

---

## 2. Dependents other than children (document rules)

The document defines **six categories** with different allowance amounts. Right now we only support a single “other dependents” count at €1,920 each.

| Category | Amount (€) | Notes |
|----------|------------|--------|
| Parent/grandparent etc. **65+ and in dependency** | 5,770 | In situation of dependency |
| Parent etc. **65+**, severe disability, **requiring care**, dependent in 2021 | 7,700 | Already dependent in assessment year 2021 |
| Parent etc. **65+**, **not requiring care**, dependent in 2021 | 3,850 | |
| Parent etc. **65+**, not requiring care, dependent in 2021, **severe disability** | 7,700 | |
| **Other dependents** | 1,920 | Current “other” rate |
| **Other dependents with severe disability** | 3,840 | 2 × 1,920 |

**Implementation (recommended):**

- **Data model**
  - Replace (or complement) `otherDependentsCount` + `otherDependentsDescription` with a small list of “other dependents”:
    - Each item: type/category (enum), flags: 65+, severe disability, requiring care, dependent in 2021.
  - Or keep a simple count per category (e.g. `otherDependents_65_dependent`, `otherDependents_65_care`, etc.) if you prefer not to manage a list.
- **Constants**
  - Add the six amounts (5,770; 7,700; 3,850; 7,700; 1,920; 3,840) in `constants.ts` (e.g. under `dependentsAllowance` or a new `otherDependentsAllowance`).
- **Allowance calculator**
  - New function (e.g. `computeOtherDependentsAllowance`) that, for each category, multiplies count by the corresponding amount and sums. Replace or extend the current “other dependents” logic.
- **Step 6 (Dependents) UI**
  - For “other financially dependent persons”:
    - Either: “Add dependent” with type + checkboxes (65+, disabled, requiring care, dependent in 2021), or
    - Or: one number input per category with short labels (e.g. “65+ in dependency”, “65+ with care”, “Other”, “Other with disability”).
- **Step 14 (Summary)**
  - Show “Other dependents allowance” as a single total (and optionally a breakdown by category if you store per-category counts).

---

## 3. Professional expenses lump sum (marital quotient)

Document example:

- Spouse A professional income €60,000.
- **Deduction of employee professional expenses lump sum: €5,930.**
- 60,000 − 5,930 = **54,070** (base for quotient).
- 30% of 54,070 = €16,221, capped at **€13,050** transfer.

So the **marital quotient** is applied to income **after** deducting the professional expenses lump sum (and possibly other deductions), not to raw income.

**Implementation:**

- **Constants**
  - Add e.g. `professionalExpenses.employeeLumpSum: 6070` (income year 2026); director cap `companyDirectorLumpSumMax: 3200` when modelled.
- **Data model**
  - Add optional field(s), e.g.:
    - `professionalExpensesLumpSumUser` (number, optional)
    - `professionalExpensesLumpSumPartner` (number, optional)  
  Or a single `applyProfessionalExpensesLumpSum: boolean` and use the constant for both when true.
- **Calculator**
  - In `calculateTaxSummary`, **before** `applyMaritalQuotient`:
    - Deduct lump sum from salaried (and/or self-employed) income per person, then pass the reduced “professional income” to `applyMaritalQuotient`.
  - Document that the quotient applies to “professional income” (after lump sum).
- **UI**
  - One step or part of an existing step (e.g. “Salaried income” or “Income summary”): ask whether to apply the lump sum and, if needed, allow override (e.g. “Professional expenses lump sum (default €5,930)”).

---

## 4. Tax-free allowance: “25% tax reduction” vs “reduce taxable income”

Document wording:

- “The tax-free allowance is converted into a tax reduction at the rate of **25%**.”
- “Per person: 10,910 × 25% = €2,727.50.”
- Gross tax (on quotient‑split income) minus (total allowance × 25%) = federal tax.

So the **official** method in the doc is:

1. Compute **gross tax** on (quotient‑adjusted) income **without** subtracting the allowance from income.
2. Compute **tax reduction** = total allowance × 25%.
3. **Federal tax** = gross tax − tax reduction.

Currently we do:

1. Taxable income = quotient‑adjusted income − allowance(s).
2. Federal tax = tax on taxable income (by brackets).

These two can give different results (e.g. for Jean €38,000 the doc gives €10,484.50; our method would give a lower tax if we use “income − allowance” then bracket tax).

**Implementation options:**

- **Option A (align with document)**  
  - Change federal tax logic to:
    - `grossTaxUser` = tax on full quotient‑adjusted user income (no allowance deduction).
    - `grossTaxPartner` = same for partner.
    - `totalAllowance` = base + dependents + young children + other dependents + age (per person as in doc).
    - `taxReduction` = totalAllowance × 0.25 (or per‑person 10,910×0.25 + allowance increases×0.25, depending on how the doc is interpreted for “increases”).
    - Federal tax = grossTaxUser + grossTaxPartner − taxReduction.
  - Requires defining “total allowance” precisely (e.g. base 10,910 + all increases; then one 25% reduction on that total).
- **Option B (keep current)**  
  - Keep “taxable income = income − allowance” and bracket tax. Add a short comment in code and/or docs that the document describes a “25% tax reduction” method and that our method is an alternative formulation (and may differ slightly).

**Recommendation:** Implement **Option A** if you need to match the document and official Belgian practice; otherwise keep Option B and document the difference.

---

## 5. Form 281.10 / 281.20 and benefits in kind (optional)

- **281.10**: Taxable remuneration (1250/2250), withholding (1286/2286), benefits in kind (250/2250). We already have “salaried income” and “withholding tax”. You can add an optional “Benefits in kind” field and add it to taxable income, with hints: “Code 250/2250”.
- **281.20 (directors)**: Remuneration 1400/2400, withholding 1450/2450. You can add an optional “Director remuneration” (and withholding) and treat it as (self‑employed or salaried) income for IPP, with a note that directors pay self‑employed social contributions.

These can be Phase 2: extra fields + small UI hints, without changing core logic.

---

## 6. Suggested implementation order

1. **Professional expenses lump sum**  
   Constants + optional onboarding fields + deduct before marital quotient. Quick win and directly from the doc.

2. **Other dependents (6 categories)**  
   Data model (counts or list) + constants + allowance function + Step 6 UI + summary. Aligns “other dependents” with the document.

3. **Tax-free allowance method (25% reduction)**  
   Decide Option A vs B; if A, refactor federal tax to “gross tax − 25% of total allowance” and add tests (e.g. Jean €38,000, married example with €13,050 cap and lump sum).

4. **Bracket constants**  
   Keep current values; add a comment that the doc example uses different numbers (likely different year). If needed, make brackets configurable by assessment year.

5. **Optional**  
   BIK, director income, form code hints in UI.

---

## 7. Summary

- **Already aligned:** Base allowance €10,910, dependent children (including severe disability and under‑3), marital quotient 30% / €13,050, municipal tax %, other dependents at €1,920.
- **To add/change:**  
  - Professional expenses lump sum (€5,930) before quotient.  
  - Other dependents in 6 categories with correct amounts.  
  - Optional: federal tax via “25% tax reduction” (Option A) and optional BIK/director/form hints.

If you tell me your priority (e.g. “lump sum first” or “other dependents categories first”), I can outline the exact code changes (files and steps) next.
