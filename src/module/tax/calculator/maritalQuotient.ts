import { IPP_2026 } from '../constants'
import type { MaritalQuotientBreakdown, MaritalStatus } from '../types'
import { clampNonNegative, roundToCents } from './money'

export function applyMaritalQuotient(params: {
  maritalStatus: MaritalStatus
  userIncome: number
  partnerIncome: number
}): MaritalQuotientBreakdown {
  const eligible = (IPP_2026.maritalQuotient.eligibleStatuses as readonly string[]).includes(
    params.maritalStatus
  )

  const before = {
    userIncome: clampNonNegative(params.userIncome),
    partnerIncome: clampNonNegative(params.partnerIncome),
  }

  if (!eligible) {
    return {
      applied: false,
      transferAmount: 0,
      cap: IPP_2026.maritalQuotient.cap,
      rate: IPP_2026.maritalQuotient.transferRate,
      before,
      after: before,
    }
  }

  const higherIsUser = before.userIncome >= before.partnerIncome
  const higher = higherIsUser ? before.userIncome : before.partnerIncome
  const lower = higherIsUser ? before.partnerIncome : before.userIncome

  const targetLowerIncome = IPP_2026.maritalQuotient.transferRate * (higher + lower)
  const neededTransfer = clampNonNegative(targetLowerIncome - lower)
  const transferAmount = roundToCents(
    Math.min(IPP_2026.maritalQuotient.cap, neededTransfer, higher)
  )

  const afterHigher = roundToCents(clampNonNegative(higher - transferAmount))
  const afterLower = roundToCents(clampNonNegative(lower + transferAmount))

  const after = higherIsUser
    ? { userIncome: afterHigher, partnerIncome: afterLower }
    : { userIncome: afterLower, partnerIncome: afterHigher }

  return {
    applied: transferAmount > 0,
    transferAmount,
    cap: IPP_2026.maritalQuotient.cap,
    rate: IPP_2026.maritalQuotient.transferRate,
    before,
    after,
  }
}
