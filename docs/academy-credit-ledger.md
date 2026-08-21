# Academy & Credit Ledger

Academy is OpenOrg's sector-neutral learning operations module. It separates
the learning event, enrollment, attendance evidence, and professional credit so
an organization can use SKP, CPD, CEU, compliance hours, or an internal point
system without changing the base schema.

## Core model

```text
Credit scheme
     │
     └──► Learning activity ──► Enrollment ──► Attendance
                  │                                  │
                  └──────────────────────────────────┴──► Credit ledger
```

- **Credit scheme** defines a code, display unit, description, and optional
  validity period. Examples include `SKP`, `CPD`, and `COMPLIANCE-HOUR`.
- **Learning activity** defines schedule, delivery mode, enrollment capacity,
  credit value, and lifecycle state.
- **Enrollment** is unique per member and activity. Self-enrollment becomes
  waitlisted when capacity is full.
- **Attendance** records present, late, absent, or excused status with optional
  check-in/out, attended minutes, source, evidence, and verifier.
- **Credit ledger** is append-only. Balances are calculated from ledger entries;
  an operator never overwrites a member's total.

Credit values are stored as integer hundredths. For example, `2.5 CPD points`
is stored as `250`, avoiding floating-point balance errors while still allowing
fractional professional credits.

## Award workflow

1. An operator creates a credit scheme and learning activity.
2. Members self-enroll, or an operator enrolls them from the CMS.
3. An operator verifies attendance.
4. Completing the activity selects only registered/confirmed members marked
   present or late.
5. One earned ledger entry is inserted per member, activity, and scheme.
6. Eligible enrollments become completed.

The database has a partial unique index for earned activity credit. Repeating a
completion request is safe and cannot double the member balance. Absence does
not issue credit. Corrections use positive or negative adjustment entries with
a reason and actor rather than editing earned entries.

## Industry abstraction

| Sector | Activity example | Scheme example |
| --- | --- | --- |
| HVAC | Refrigerant handling recertification | CPD points |
| Medical/professional | Ethics or clinical update | SKP |
| Fintech | AML governance training | Compliance hours |
| E-commerce association | Consumer protection workshop | Association CPD |
| Nonprofit | Safeguarding certification | Internal learning credits |

The sector changes only configuration and terminology. Enrollment, attendance,
award eligibility, ledger integrity, and tenant security stay unchanged.

## API surface

Admin routes use `/v1/admin/learning`:

- `GET /overview`
- `POST /schemes`
- `POST /activities`
- `POST /activities/:id/enrollments`
- `PATCH /activities/:id/attendance`
- `POST /activities/:id/complete`
- `POST /ledger` for reasoned adjustments

Member routes use the member session:

- `GET /v1/member/learning`
- `POST /v1/member/learning/activities/:id/enroll`

## Security and audit

- All data and validation queries are constrained by `organizationId`.
- `learning.read`, `learning.write`, and `learning.award` separate viewing,
  operations, and credit-issuing authority.
- Only active members can enroll or be enrolled.
- Every administrative mutation is written to the organization audit log.
- Attendance stores its verifier and provenance separately from the enrollment.
- Award idempotency is enforced by PostgreSQL, not only by UI state.

The next increment can add QR check-in, certificate generation, external LMS
adapters, credit-period targets, and renewal alerts without changing the ledger
contract.
