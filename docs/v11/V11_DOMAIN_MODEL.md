# V11 Domain Model (Tenant First)

Status: Draft
Last updated: 2026-01-12

This model defines tenant-first entities for Breslov University v11.
Every entity marked "school scoped" must include school_id and use scoped helpers.

## Core Tenancy
- Tenant (School): id, name, slug, status, brand, is_public
- OrgUnit (optional): id, school_id, type (campus, department), name, parent_id
- User: id, email, display_name, role_label
- IdentityLink: id, user_id, provider (google_oidc, microsoft_oidc, magic_link), external_id
- AuthSession (global): id, user_email, provider, expires_at, revoked_at
- AuthState (global): id, provider, code_verifier, expires_at, used_at
- SchoolMembership (school scoped): id, school_id, user_email, role, title_label
- UserSchoolPreference (global): id, user_email, active_school_id
- SchoolAuthPolicy (school scoped): allowed_providers, allowed_domains, require_domain_match, require_domain_verification, auto_provision, domain_role_map
- DomainVerification (school scoped): domain, token, status, verified_at, expires_at

## Courses and Learning
- Course (school scoped): id, school_id, title, description, status, access_level
- Lesson (school scoped): id, school_id, course_id, title, status, is_preview, drip fields
- LessonNote, Bookmark, Transcript (school scoped)
- UserProgress (school scoped): user_email, course_id, lesson_id, progress
- Quiz (school scoped): id, school_id, course_id, is_published
- QuizQuestion (school scoped): quiz_id, question_index
- QuizAttempt (school scoped): quiz_id, user_email, score

## Assignments and Grading
- Assignment (school scoped): course_id, title, due_at
- Submission (school scoped): assignment_id, user_email, status
- Rubric (future): assignment_id, criteria

## Community and Messaging
- Post, Comment, Discussion (school scoped)
- Message (school scoped)
- Announcement, UserAnnouncementRead (school scoped)

## Commerce and Billing
- Offer (school scoped): offer_type, price_cents, access_scope, billing_interval
- OfferCourse (school scoped): offer_id, course_id
- Coupon (school scoped): code, discount_type, usage_limit
- Transaction (school scoped): offer_id, amount_cents, status
- Subscription (school scoped): user_email, offer_id, status
- Entitlement (school scoped): user_email, type, course_id
- CouponRedemption (school scoped)
- PricingChangeRequest (school scoped): pending approvals
- StripeAccount (school scoped): stripe_account_id, charges_enabled, payouts_enabled
- StripeWebhookEvent (school scoped): event_type, account_id, payload

## Content Protection
- ContentProtectionPolicy (school scoped): copy_mode, download_mode, preview limits
- Download (school scoped): course_id, file_url, price_cents
- DownloadToken (school scoped): token, download_id, expires_at, used_at
- StreamUpload (school scoped): stream_uid, upload_url, lesson_id, status

## AI and Mobile
- AiTutorSession (school scoped): user_email, context_type, context_id, messages
- AiTutorPolicyLog (school scoped): action, reason, context_type, context_id
- AiRagIndex (school scoped): lesson_id, course_id, token_count, tokens, source_updated_at
- NotificationToken (school scoped): user_email, token, platform, device_id, last_seen_at, revoked_at

## Integrations
- Integration (global): marketplace metadata
- IntegrationState (global): provider, school_id, expires_at
- IntegrationSecret (global): provider, school_id, access_token, refresh_token
- IntegrationConnection (school scoped): provider, status, connected_at, scopes
- GoogleOAuthToken, GoogleDriveToken (global)
- TenantApplication (global): school onboarding requests

## Observability and Security
- AuditLog (school scoped): action, entity_type, entity_id, metadata
- EventLog (school scoped): event_type, entity_id, metadata
- RateLimitLog (school scoped)

## Relationships
- School -> Course -> Lesson
- School -> Offer -> OfferCourse -> Course
- School -> Membership -> User
- User -> Entitlement -> Course
- Course -> Assignment -> Submission

## Scoping Rules
- All school scoped entities must include school_id and be queried via scoped helpers.
- Public surfaces must filter to is_public schools and avoid fetching locked content.
