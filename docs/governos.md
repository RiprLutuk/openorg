# GovernOS

GovernOS is OpenOrg's configurable organization structure and office-term
register. The first delivery replaces hard-coded labels such as DPP, DPD,
Korwil, board, council, and committee with reusable hierarchy primitives.

## Core model

```text
Organization unit ──► child organization unit
        │
        └───────────► position ──► parent position
                               └─► member appointment + term
```

- **Organization unit** represents any national body, region, branch, chapter,
  committee, working group, or internal department.
- **Position** belongs to a unit and can optionally report to another position.
- **Position appointment** connects an active member to an office with start and
  end dates. Ending a term updates its period rather than deleting its history.

The organization chooses its own unit types and names. ASISI can use DPP/DPD,
an Indonesian professional association can use pusat/wilayah/cabang, and a
foundation can use board/program office with the same schema and routes.

## Operational surfaces

**CMS Studio → Community → Governance** provides:

- live counts for units, positions, and current appointments;
- hierarchical unit map;
- position and office-holder register;
- forms to create units, positions, and appointments;
- a term-ending action that preserves the appointment record.

The public `/structure` page reads the same source through
`GET /v1/public/structure`; there is no duplicated page-builder copy to become
stale.

Admin routes use the `/v1/admin/governance` prefix:

- `GET /overview`
- `POST|PATCH /units`
- `POST|PATCH /positions`
- `POST|PATCH /assignments`

## Integrity and security

- All reads, validation lookups, and mutations are constrained by
  `organizationId`.
- `governance.read` and `governance.write` are independent RBAC permissions.
- Parent unit loops and cross-tenant parents are rejected.
- A position parent must be in the same unit.
- Only an active, non-deleted member from the tenant can be appointed.
- Appointment end dates cannot precede start dates.
- Every mutation writes an audit log with actor, request, before, and after data.

## Next governance increment

The hierarchy is the identity layer for the next GovernOS capabilities:
versioned bylaws and policies, meeting/quorum records, resolutions, voting,
delegated signing authority, and consent evidence. Those workflows should
reference unit, position, appointment, and member IDs rather than copying names,
so historical decisions remain explainable after leadership changes.
