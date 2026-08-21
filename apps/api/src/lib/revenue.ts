import type { AudienceSegmentCriteria } from "@openorg/contracts";

export function moneyToMinor(value: number) {
  if (!Number.isFinite(value)) throw new Error("Money must be finite.");
  return Math.round((value + Number.EPSILON) * 100);
}

export function moneyFromMinor(value: number) {
  return value / 100;
}

export function addMonths(from: Date, months: number) {
  const result = new Date(from);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

type SegmentMember = {
  status: string;
  unitId: string | null;
  customFields: Record<string, unknown>;
  entitlementKeys: string[];
};

export function matchSegmentCriteria(
  member: SegmentMember,
  criteria: AudienceSegmentCriteria,
) {
  if (
    criteria.membershipStatuses?.length &&
    !criteria.membershipStatuses.includes(member.status as never)
  )
    return false;
  const membershipType =
    typeof member.customFields.membershipType === "string"
      ? member.customFields.membershipType
      : "default";
  if (
    criteria.membershipTypes?.length &&
    !criteria.membershipTypes.includes(membershipType)
  )
    return false;
  if (
    criteria.unitIds?.length &&
    (!member.unitId || !criteria.unitIds.includes(member.unitId))
  )
    return false;
  if (
    criteria.hasEntitlement &&
    !member.entitlementKeys.includes(criteria.hasEntitlement)
  )
    return false;
  return true;
}
