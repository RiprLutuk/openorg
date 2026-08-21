# Asisi feature parity

This document maps the operational Asisi application to reusable OpenOrg
modules. The goal is capability parity without hard-coding refrigeration,
Indonesian administrative levels, or Asisi-specific terminology.

## Public website

| Asisi capability | OpenOrg module | Status |
| --- | --- | --- |
| Rich homepage, banner carousel, organization statistics | Page builder, content feeds, events, stats | Partial: blocks exist; richer demo composition required |
| Organization profile, logo, vision and mission | Pages and organization settings | Implemented |
| News and articles | Content library | Implemented |
| Activity schedules | Events | Implemented |
| DPP, DPD, and Korwil pages | Hierarchical units, positions, assignments | CMS workflow and public structure implemented |
| Public member profile and QR verification | Public member directory and membership verification | Card verification implemented; directory pending |
| Member registration and requirements | Membership application and configurable credential workflow | Implemented foundation |
| Campaign popup | Scheduled announcement | Implemented |
| Media center and YouTube content | Media library and media page blocks | Pending |
| WhatsApp service contacts | Quick contact and contact directory | Partial |
| Protected proposal | Document library with access policy | Pending |
| Advertisements and click analytics | Campaign/placement analytics | Pending |

## Member lifecycle

| Asisi capability | Generic OpenOrg equivalent | Status |
| --- | --- | --- |
| Two-step registration | Configurable membership application | Implemented |
| Email/OTP verification | Verification token workflow and mail adapter | Token workflow implemented; production mail adapter pending |
| Admin approval/rejection and reason | Application review queue with audit trail | Implemented |
| Sequential unique member ID | Organization-specific member number policy | Implemented |
| Identity, background-check, and certificate files | ComplyFlow credential schemes, evidence, and verification | Implemented foundation |
| Member profile and business/service profile | Member profile plus custom fields | Partial |
| Social media management | Member social links | Implemented in data model; portal UI pending |
| Digital ID card, QR, download and print | Versioned membership card and public verification | Implemented |
| Member schedule | Academy activity enrollment and member learning calendar | Implemented foundation |
| Member activity history | Attendance and append-only credit ledger | Implemented foundation |

## Administration

| Asisi capability | Generic OpenOrg equivalent | Status |
| --- | --- | --- |
| Admins, groups and granular permissions | Users, roles and RBAC permissions | Core implemented; management UI pending |
| Member import | CSV import with dry-run and error report | Pending |
| Locations | Organization units and optional geographic datasets | Partial |
| Organization structures and position assignments | GovernOS units, positions and term register | Implemented foundation |
| Terms and conditions | Versioned policy documents and consent records | Pending |
| Security log | Audit logs and authentication events | Core audit log implemented; viewer pending |
| Page views and advertisement clicks | Analytics events and reports | Pending |
| Banners, campaign popups, advertising | Campaign and placement module | Partial |
| Media/file management | Tenant-scoped media library | Data model implemented; upload UI pending |

## Delivery order

1. ~~Membership application, review, approval and rejection.~~
2. ~~Member authentication and self-service portal.~~
3. ~~Membership card, print and public verification.~~
4. ~~ComplyFlow credential schemes and compliance-gated approval.~~
5. ~~Units, positions, assignments and public structure views.~~
6. Versioned terms, meeting records, resolutions and voting.
7. ~~Learning activities, attendance and reusable credit ledger.~~
8. Billing, documents, import, analytics and campaign placements.
9. Richer demo homepage that exercises all public modules.

Every module must preserve tenant isolation, RBAC, audit logging, accessible
responsive interfaces, and organization-specific naming/configuration.
