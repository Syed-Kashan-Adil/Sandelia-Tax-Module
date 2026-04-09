import { IPP_2026 } from '../constants'
import type { AllowanceBreakdown, DependentChildInput, TaxOnboardingValues } from '../types'
import { clampNonNegative, roundToCents } from './money'

function computeEquivalentChildrenCount(children: DependentChildInput[]): number {
  return children.reduce((acc, child) => acc + (child.isDisabled ? 2 : 1), 0)
}

function computeDependentsAllowance(children: DependentChildInput[]): number {
  const n = computeEquivalentChildrenCount(children)
  if (n <= 0) return 0

  const { oneChild, twoChildren, threeChildren, fourChildren, extraPerChildBeyondFour } =
    IPP_2026.dependentsAllowance

  if (n === 1) return oneChild
  if (n === 2) return twoChildren
  if (n === 3) return threeChildren
  if (n === 4) return fourChildren

  return fourChildren + (n - 4) * extraPerChildBeyondFour
}

/**
 * For each child under 3 years old on 1 January of the assessment year,
 * there is an additional increase (e.g. €720).
 */
function computeYoungChildrenAllowance(
  children: DependentChildInput[],
  assessmentYear: number
): number {
  const cutoff = `${assessmentYear - 3}-01-01`
  const perChild = IPP_2026.dependentsAllowance.youngChildAdditionalAllowance ?? 720
  const count = children.filter((c) => c.dateOfBirth > cutoff).length
  return roundToCents(clampNonNegative(count * perChild))
}

const DEFAULT_OTHER_DEPENDENTS: TaxOnboardingValues['otherDependents'] = {
  age65InDependencyCount: 0,
  age65SevereDisabilityRequiringCareDependentIn2021Count: 0,
  age65NotRequiringCareDependentIn2021Count: 0,
  age65NotRequiringCareDependentIn2021SevereDisabilityCount: 0,
  otherCount: 0,
  otherSevereDisabilityCount: 0,
  description: '',
}

function computeOtherDependentsAllowance(
  other: TaxOnboardingValues['otherDependents'] | undefined
): number {
  const o = other ?? DEFAULT_OTHER_DEPENDENTS
  const amounts = IPP_2026.dependentsAllowance.otherDependents

  const sum =
    clampNonNegative(o.age65InDependencyCount) * amounts.age65InDependency +
    clampNonNegative(o.age65SevereDisabilityRequiringCareDependentIn2021Count) *
      amounts.age65SevereDisabilityRequiringCareDependentIn2021 +
    clampNonNegative(o.age65NotRequiringCareDependentIn2021Count) *
      amounts.age65NotRequiringCareDependentIn2021 +
    clampNonNegative(o.age65NotRequiringCareDependentIn2021SevereDisabilityCount) *
      amounts.age65NotRequiringCareDependentIn2021SevereDisability +
    clampNonNegative(o.otherCount) * amounts.other +
    clampNonNegative(o.otherSevereDisabilityCount) * amounts.otherSevereDisability

  return roundToCents(clampNonNegative(sum))
}

function computeAgeAllowance(dateOfBirthIso: string): number {
  const { seniorAge, seniorAllowance } = IPP_2026.ageAllowance
  const dob = new Date(dateOfBirthIso)
  if (Number.isNaN(dob.getTime())) return 0

  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1

  return age >= seniorAge ? seniorAllowance : 0
}

export function computeHouseholdAllowance(params: {
  hasPartner: boolean
  children: DependentChildInput[]
  otherDependents: TaxOnboardingValues['otherDependents']
  userDateOfBirthIso: string
}): AllowanceBreakdown {
  const assessmentYear = IPP_2026.assessmentYear ?? new Date().getFullYear()
  const baseAllowanceSelf = IPP_2026.baseTaxFreeAllowance
  const baseAllowancePartner = params.hasPartner ? IPP_2026.baseTaxFreeAllowance : 0
  const dependentsAllowance = computeDependentsAllowance(params.children)
  const youngChildrenAllowance = computeYoungChildrenAllowance(params.children, assessmentYear)
  const singleParentAllowance =
    !params.hasPartner && params.children.length > 0
      ? (IPP_2026.dependentsAllowance.singleParentWithDependentChild ?? 0)
      : 0
  const otherDependentsAllowance = computeOtherDependentsAllowance(params.otherDependents)
  // Temporarily disabled: age allowance is under review and should not affect simulation totals.
  // Keep code path in place for easy re-enable once legal conditions are finalized.
  const ENABLE_AGE_ALLOWANCE = false
  const ageAllowanceSelf = ENABLE_AGE_ALLOWANCE ? computeAgeAllowance(params.userDateOfBirthIso) : 0

  const totalAllowanceHousehold = roundToCents(
    clampNonNegative(
      baseAllowanceSelf +
        baseAllowancePartner +
        dependentsAllowance +
        youngChildrenAllowance +
        singleParentAllowance +
        otherDependentsAllowance +
        ageAllowanceSelf
    )
  )

  return {
    baseAllowanceSelf,
    baseAllowancePartner,
    dependentsAllowance,
    youngChildrenAllowance,
    singleParentAllowance,
    otherDependentsAllowance,
    ageAllowanceSelf,
    totalAllowanceHousehold,
  }
}
