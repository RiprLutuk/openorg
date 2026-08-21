export const verificationRank = {
  self_declared: 0,
  document_checked: 1,
  issuer_confirmed: 2,
  api_verified: 3,
  cryptographically_verified: 4,
} as const;

export type VerificationLevel = keyof typeof verificationRank;
export type RequirementRule = "required" | "one_of" | "optional";

export type ComplianceRequirement = {
  id: string;
  schemeId: string;
  rule: RequirementRule;
  groupKey: string | null;
  requiredVerificationLevel: VerificationLevel;
  gracePeriodDays: number;
  blocksApproval: boolean;
};

export type ComplianceCredential = {
  schemeId: string;
  status: string;
  verificationLevel: VerificationLevel;
  expiresAt: Date | null;
};

const DAY_IN_MILLISECONDS = 86_400_000;

export function meetsVerificationLevel(
  actual: VerificationLevel,
  required: VerificationLevel,
) {
  return verificationRank[actual] >= verificationRank[required];
}

export function credentialSatisfiesRequirement(
  requirement: ComplianceRequirement,
  credentials: ComplianceCredential[],
  now = new Date(),
) {
  return credentials.some((credential) => {
    if (
      credential.schemeId !== requirement.schemeId ||
      credential.status !== "verified" ||
      !meetsVerificationLevel(
        credential.verificationLevel,
        requirement.requiredVerificationLevel,
      )
    )
      return false;

    if (!credential.expiresAt) return true;
    const validUntil =
      credential.expiresAt.getTime() +
      requirement.gracePeriodDays * DAY_IN_MILLISECONDS;
    return validUntil >= now.getTime();
  });
}

function alternativeGroupKey(requirement: ComplianceRequirement) {
  return requirement.groupKey
    ? `one_of:${requirement.groupKey}`
    : `one_of:ungrouped:${requirement.id}`;
}

export function evaluateCredentialRequirements<
  TRequirement extends ComplianceRequirement,
>(
  requirements: TRequirement[],
  credentials: ComplianceCredential[],
  now = new Date(),
) {
  const directMatches = new Map(
    requirements.map((requirement) => [
      requirement.id,
      credentialSatisfiesRequirement(requirement, credentials, now),
    ]),
  );
  const alternativeGroups = new Map<string, boolean>();

  for (const requirement of requirements) {
    if (requirement.rule !== "one_of") continue;
    const groupKey = alternativeGroupKey(requirement);
    alternativeGroups.set(
      groupKey,
      (alternativeGroups.get(groupKey) ?? false) ||
        (directMatches.get(requirement.id) ?? false),
    );
  }

  const satisfiedById = Object.fromEntries(
    requirements.map((requirement) => [
      requirement.id,
      requirement.rule === "one_of"
        ? (alternativeGroups.get(alternativeGroupKey(requirement)) ?? false)
        : (directMatches.get(requirement.id) ?? false),
    ]),
  );
  const blockerKeys = new Set<string>();
  const blockers = requirements.filter((requirement) => {
    if (
      !requirement.blocksApproval ||
      requirement.rule === "optional" ||
      satisfiedById[requirement.id]
    )
      return false;
    const key =
      requirement.rule === "one_of"
        ? alternativeGroupKey(requirement)
        : requirement.id;
    if (blockerKeys.has(key)) return false;
    blockerKeys.add(key);
    return true;
  });

  return { satisfiedById, blockers };
}
