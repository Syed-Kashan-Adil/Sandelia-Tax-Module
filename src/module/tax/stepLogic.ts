export type StepSourceRef = {
  doc: string
  ref: string // e.g. "Screen 13" or "Section: Management fees"
}

export type StepLogicInfo = {
  title: string
  bullets: string[]
  sources: StepSourceRef[]
}

export const TAX_WIZARD_STEP_LOGIC: Record<number, StepLogicInfo> = {
  1: {
    title: 'Engine selection (IPP vs ISOC)',
    bullets: [
      'Selects the engine (we currently run the IPP self-employed flow).',
      'Determines which questions appear and what gets calculated.',
    ],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 1 — How are you taxed?' }],
  },
  2: {
    title: 'Self-employed status → contribution regime',
    bullets: [
      'Status selects the social contribution regime (rates + minimums).',
      'Feeds the social contributions estimate later in the flow.',
    ],
    sources: [
      { doc: 'Taxes Logic calculation .docx', ref: 'Screen 2 — Self-Employed Status' },
      { doc: 'Social Contributions Calculation logic.docx', ref: 'Supported Status Types / Rate table' },
    ],
  },
  3: {
    title: 'Activity start date → annualization context',
    bullets: [
      'Used for “automatic extrapolation” when you input year-to-date income.',
      'Also impacts whether the activity covers a full year or a partial year.',
    ],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 3 — Start Date of Activity' }],
  },
  4: {
    title: 'VAT regime → display guidance',
    bullets: [
      'VAT data is captured for profile completeness and payment guidance.',
      'It does not directly change IPP tax math in this simulation.',
    ],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Additional page — VAT' }],
  },
  5: {
    title: 'Marital status → marital quotient eligibility',
    bullets: [
      'If married / legally cohabiting, we can apply the marital quotient.',
      'Income transfer is 30% capped at €13,050 and applies to professional income after expenses.',
    ],
    sources: [
      { doc: 'Taxes Logic calculation .docx', ref: 'Screen 5 — Marital Status' },
      { doc: 'IPP Logic.docx', ref: 'Marital quotient + lump sum example' },
    ],
  },
  6: {
    title: 'Partner income → marital quotient result',
    bullets: [
      'Partner income determines whether (and how much) income can be transferred.',
      'Higher partner income generally reduces/neutralizes the quotient effect.',
    ],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 6 — Partner Income' }],
  },
  7: {
    title: 'Dependents → allowance increases',
    bullets: [
      'Children and other dependents increase the tax-free allowance.',
      'Disabled child counts as 2; child under 3 on 1 Jan adds +€720.',
      'Other dependents follow the 6-category table.',
    ],
    sources: [
      { doc: 'Taxes Logic calculation .docx', ref: 'Screen 7 — Dependents' },
      { doc: 'IPP Logic.docx', ref: 'Dependent children + other dependents table' },
    ],
  },
  8: {
    title: 'Date of birth → age-related allowance',
    bullets: ['Age can increase the tax-free allowance (age-related benefits).'],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 8 — Date of Birth' }],
  },
  9: {
    title: 'Municipality → municipal surcharge',
    bullets: ['Municipal tax is a % surcharge applied to the federal tax amount.'],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 9 — Municipality' }],
  },
  10: {
    title: 'Salaried income → taxable base + withholding credit',
    bullets: [
      'Salaried income adds to taxable income.',
      'Withholding tax is treated as a credit reducing final balance due.',
    ],
    sources: [
      { doc: 'Taxes Logic calculation .docx', ref: 'Screen 10 — Salaried Income' },
      { doc: 'Taxes Logic calculation .docx', ref: 'Screen 11 — Salaried Income Details' },
      { doc: 'IPP Logic.docx', ref: 'Form 281.10 codes (1250/2250, 1286/2286)' },
    ],
  },
  11: {
    title: 'Estimated professional income → net taxable base',
    bullets: [
      'Estimate annual professional income and expenses.',
      'Net income (= income − expenses) is used for social contributions and taxable base.',
    ],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 12 — Estimated Self-Employed Profit' }],
  },
  12: {
    title: 'Social contributions → automatic estimate (with override)',
    bullets: [
      'Calculated from net income using the status-specific rate bands + minimums.',
      'Management fees (4.20%) are applied on top of legal contribution.',
      'If exempt or a quarterly amount is provided, we use that as an override.',
    ],
    sources: [
      { doc: 'Taxes Logic calculation .docx', ref: 'Screen 13 — Social Contributions' },
      { doc: 'Social Contributions Calculation logic.docx', ref: 'Rates + management fee 4.20%' },
    ],
  },
  13: {
    title: 'Advance payments → reduce final balance / penalties',
    bullets: [
      'Advance tax payments are deducted from the final balance due.',
      'Used to reduce (or avoid) penalty interest on underpayment.',
    ],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 14 — Advance Tax Payments' }],
  },
  14: {
    title: 'Other income → additional taxable income',
    bullets: ['Selected additional income types are summed into total “other income” (annual).'],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Screen 15 — Other Income' }],
  },
  15: {
    title: 'Summary → order of computation',
    bullets: [
      'Gross federal tax is computed by brackets on quotient-adjusted income.',
      'Tax-free allowance is applied as a 25% tax reduction.',
      'Municipal surcharge is added, then withholding and advance payments are deducted.',
    ],
    sources: [{ doc: 'Taxes Logic calculation .docx', ref: 'Fundamental rule: calculation order' }],
  },
}

