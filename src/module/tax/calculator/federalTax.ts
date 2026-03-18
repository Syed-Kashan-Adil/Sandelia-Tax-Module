import { IPP_2026 } from '../constants'
import type { FederalTaxBreakdown, FederalTaxBreakdownBracket } from '../types'
import { clampNonNegative, roundToCents } from './money'

function computeTaxForBracket(params: {
  taxableIncome: number
  from: number
  to: number | null
  rate: number
}): FederalTaxBreakdownBracket {
  const income = clampNonNegative(params.taxableIncome)
  const lower = Math.max(0, params.from)
  const upper = params.to === null ? Infinity : Math.max(params.to, lower)

  const amountTaxed = roundToCents(clampNonNegative(Math.min(income, upper) - lower))
  const tax = roundToCents(amountTaxed * params.rate)

  return {
    from: lower,
    to: params.to,
    rate: params.rate,
    amountTaxed,
    tax,
  }
}

export function computeFederalTax(params: { taxableIncome: number }): FederalTaxBreakdown {
  const taxableIncome = roundToCents(clampNonNegative(params.taxableIncome))
  const brackets: FederalTaxBreakdownBracket[] = IPP_2026.federalBrackets.map((b) =>
    computeTaxForBracket({
      taxableIncome,
      from: b.from,
      to: b.to,
      rate: b.rate,
    })
  )

  const total = roundToCents(brackets.reduce((sum, b) => sum + b.tax, 0))
  return { taxableIncome, brackets, total }
}
