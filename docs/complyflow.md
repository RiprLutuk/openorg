# ComplyFlow and Industry Packs

ComplyFlow is OpenOrg's industry-neutral credential and compliance engine. It
models the rule behind a certificate, license, registration number, or other
proof instead of adding sector-specific columns to a member record.

## Product model

```text
Credential scheme
  ├── Dynamic fields
  ├── Minimum verification level
  └── Validity policy
          │
          ▼
Membership requirement ──► required | one_of | optional
          │                  + blocks approval
          ▼
Member credential ────────► Evidence reference
          │
          └───────────────► Append-only verification event
```

- **Credential scheme** describes reusable metadata: subject type, issuer,
  number/issue/expiry requirements, and organization-defined fields.
- **Membership requirement** attaches a scheme to a membership type. A rule can
  be mandatory, optional, or one alternative in a named `one_of` group.
- **Member credential** is the member's submitted instance and lifecycle state.
- **Evidence** references supporting media or an external source URL.
- **Verification event** records the decision, method, source, actor, notes, and
  result without rewriting prior events.

Approval is evaluated on the server. A blocking requirement is satisfied only
by a credential that is verified, not beyond its configured expiry grace
period, and at or above the required verification level.

## Verification trust levels

| Level | Meaning | Example |
| --- | --- | --- |
| `self_declared` | Supplied by the member | A member types an old certificate number |
| `document_checked` | Evidence was reviewed by an operator | Admin compares a PDF with the submitted data |
| `issuer_confirmed` | The issuing institution confirmed it | An LSP confirms a refrigeration technician certificate |
| `api_verified` | A trusted registry/API returned a match | A regulated company license is matched to the authoritative registry |
| `cryptographically_verified` | Signature or seal was validated | A signed electronic credential is validated through a trusted service |

Higher levels satisfy requirements for lower levels, never the reverse. A
scheme also defines its own minimum, preventing an operator from approving it
with a weaker decision.

## Industry Pack examples

Industry Packs are editable presets, not code branches. The initial demo
contains these three mappings:

| Sector | Membership type | Scheme | Required trust |
| --- | --- | --- | --- |
| HVAC | `hvac-professional` | HVAC Competency Level 3 | Issuer confirmed |
| Fintech | `fintech-company` | Financial Services Operating License | API verified |
| Medical | `medical-professional` | Medical Practice License | API verified |

An administrator can rename schemes, add dynamic fields, change the issuer,
validity rules, requirement type, approval blocking behavior, and verification
threshold in **CMS Studio → Community → Credentials**. Adding a construction,
legal, e-commerce, or nonprofit pack uses the same tables and endpoints.

## API surface

Admin routes are under `/v1/admin/credentials` and require tenant-scoped RBAC:

- `GET|POST|PATCH /schemes`
- `GET|POST|DELETE /requirements`
- `GET|POST /credentials`
- `GET /credentials/:id`
- `PATCH /credentials/:id/verify`

Member routes are under `/v1/member` and use the member session:

- `GET /credentials`
- `POST /credentials`

Membership approval returns HTTP `409` with code
`MEMBERSHIP_COMPLIANCE_BLOCKED` and structured blockers when a mandatory rule
is not satisfied. Clients should render these blockers instead of duplicating
the rules locally.

## Security boundary

- Every query is constrained by `organizationId`; IDs from another tenant are
  rejected.
- Creation, reading, and verification use separate RBAC permissions.
- Verification decisions create audit logs and immutable verification events.
- External evidence is stored as a reference; private uploads must use the
  tenant-scoped media service and authorization policy.
- API or issuer adapters should store normalized results and provenance in the
  verification event, not raw secrets or unnecessary personal data.
- Legal reliance still depends on the authority of the source, consent and
  retention policy, and—in applicable workflows—a trusted Indonesian electronic
  signature provider. A database flag alone is not a legal signature.

## Extension path

An issuer adapter should implement four steps: normalize the submitted number,
query the authoritative source, compare the subject identity, and append the
verification result. The credential engine and approval evaluator remain
unchanged. This boundary allows an organization to add, for example, an LSP,
professional council, regulator, or internal HR registry integration without
forking the membership module.
