# V11 Acceptance Criteria (P0)

Status: Draft
Last updated: 2026-01-11

Each P0 feature must pass at least one Given/When/Then test.

## Tenant Isolation
- Given a signed-in user with activeSchoolId=A, when they query school-scoped entities, then only records with school_id=A are returned.
- Given a non-global admin, when they attempt cross-school reads via base44.entities.* then the request is blocked or returns empty.

## Public Home + School Directory
- Given an anonymous visitor, when they open /, then only schools with is_public=true and status!=inactive are listed.
- Given a public visitor, when they search, then no private school appears.

## Login and Signup
- Given a public visitor, when they select Student Login, then the login flow starts and returns to the correct portal.
- Given a public visitor, when they complete school signup, then a pending tenant application is created.

## Bot Protection
- Given a public visitor, when they attempt login or signup without a valid Turnstile token, then the request is rejected.

## Storefront Pricing + Checkout
- Given a public visitor on school pricing, when offers load, then only offers for that school are shown.
- Given a visitor checkout, when a payment is initiated, then a pending Transaction is created and AuditLog written.

## Lesson Access Protection
- Given a locked student, when they open a lesson, then the app shows AccessGate and never fetches full content.
- Given a preview student, when they open a lesson, then content is truncated to policy limits.

## Secure Downloads
- Given a user without download license, when they request a download, then the API returns allowed=false and no file_url.
- Given a licensed user, when they request a download, then a DownloadToken is issued and used once.

## Teacher Authoring
- Given a teacher, when they publish a lesson, then a scoped Lesson update is created and audit logged.
- Given a teacher, when they create a course, then school_id is injected and visible only in that school.

## Pricing Approvals
- Given a pricing change request, when it is pending, then the Offer/Coupon is not updated.
- Given another admin approves, then the Offer/Coupon is updated, OfferCourse is synced, and AuditLog written.

## Integrity Diagnostics
- Given an admin, when they open /integrity, then the scan reports tenancy guard and drift checks.
