# Barangay San Pedro Website — Complete (Phases 0–4)

All 20 pages from the original plan, all reading and writing real data
against a live Supabase project. Public site, Resident Portal, Staff Portal,
Admin Panel — done.

## Run it

```bash
cd san-pedro-website
npm install
npm run dev
```

`.env.local` already has real credentials, so everything works immediately.

## Try it as admin

Your `admin@gmail.com` account is already set up (see the bugfix log below —
login is fixed). Sign in at `/login`, you'll land on `/admin`.

- **Dashboard** — real KPIs, a received-vs-completed trend chart, requests
  broken down by document type, resident distribution by purok (donut), and
  a live activity feed pulled from recent requests/blotters/announcements.
- **Users** — every account (admin/staff/resident) in one table. Click one
  to change its role or status, trigger a password-reset email, or
  deactivate it. You can't change your own role from here (guardrail).
- **Reports** — pick a date range, get real aggregates plus a printable
  monthly summary (Print / Export as PDF both use the browser's real print,
  styled to show only the report).
- **Settings** — Barangay Info is fully editable and persists to
  `barangay_settings`. Logo & Branding is intentionally read-only (see
  below). Theme toggles the same light/dark state Staff uses. Account &
  Security lets you actually change your own password.

## What changed under the hood this phase

- Added `barangay_settings` — a singleton table (`id` is always `true`,
  enforced by a check constraint) for the one set of barangay-wide info
  Settings edits.
- **Logo & Branding is deliberately read-only.** The two logos are static
  files in `public/brand/logos/`, not database-driven — making them
  editable from the UI would mean uploading to Storage and rewriting every
  page that references them by path. Rather than build a fake "Replace"
  button that doesn't actually change anything, the tab just says so.
- Reused `MonthlyTrendChart` for the Admin Dashboard's weekly/monthly toggle
  by generalizing `buildDailyTrend`/`buildMonthlyTrend` to share a shape,
  and added two new chart components (`RequestsByTypeChart`,
  `ResidentDistributionChart`) alongside the existing ones rather than
  duplicating the Recharts boilerplate a third time.
- Reports' print/export reuses the same `.print-area` CSS pattern the
  Certificate Generator introduced in Phase 3 (generalized from an ID
  selector to a class, since now two different pages need it).

## Supabase project

- Tables: `profiles`, `document_requests`, `household_members`,
  `announcements`, `blotters`, `equipment`, `equipment_rentals`,
  `certificates`, `barangay_settings` — all RLS-enabled, advisors clean
  (only expected info-level "unused index" notices on low-traffic tables,
  plus the two accepted `current_user_role()` advisories explained below)
- One setting outside SQL's reach: **leaked password protection is off** —
  an Auth-level toggle. Dashboard → Authentication → Policies → turn it on
  whenever you'd like (checks new passwords against HaveIBeenPwned).
- Edge Functions: `admin-create-resident` (ACTIVE)
- Storage: `document-requirements` (private, Phase 2), `avatars` (public,
  Round 2), `logos` (public, admin-only writes, Round 2)

## What's in here

- `app/` — routes, grouped by access tier: public, `(resident)`, `(staff)`, `(admin)`
- `lib/route-access.ts` — single source of truth for which role can access
  which route prefix, used by `proxy.ts`, the login page, and
  `require-role.ts` alike (see bugfix log — this used to be duplicated)
- `lib/data/documents.ts`, `lib/data/officials.ts` — reference content that
  isn't a full DB table (document type definitions, placeholder officials —
  see the Tier 4 note from Phase 1 about swapping in real photos)
- `lib/supabase/types.ts` — types for every table
- `lib/chart-aggregation.ts` — raw `document_requests` rows → the shapes
  every dashboard chart needs
- `components/staff/` — Staff Portal pieces, including the shared chart
  components both Staff and Admin dashboards use
- `components/admin/` — Admin Panel pieces: user management, report
  controls, print buttons, settings panel
- `components/portal/` — the 3 interactive Resident Portal pieces
- `supabase/migrations/` — 0001 through 0016, every one already applied to
  the live project, in order
- `supabase/functions/admin-create-resident/` — local copy of the deployed
  Edge Function
- `supabase/seed.sql` — equipment + announcements seed data, for
  reproducing this starting state on a fresh project

## Bugfix log

- **`ERR_TOO_MANY_REDIRECTS` on `/portal` for an admin account.** The login
  page trusted a `?redirectTo=` param unconditionally, so an admin who'd
  once tried to visit `/portal` while logged out got sent there after
  signing in regardless of role. Fixed with `lib/route-access.ts` as the
  single source of truth, and the login page now only honors `redirectTo`
  if the signed-in user's actual role is allowed there.

- **Login got stuck on "Signing in..." forever — a real database bug.**
  Sign-in succeeded, but the very next request (fetching the profile to
  decide where to send the user) failed with a 500 on every attempt. Root
  cause: the `profiles` RLS policy checked "is this user staff/admin?" by
  querying `profiles` from *within its own policy* — Postgres detected the
  cycle and threw `infinite recursion detected in policy for relation
  "profiles"`. This had been silently broken since Phase 2; every earlier
  test went through the Supabase MCP connection, which bypasses RLS
  entirely, so it never got exercised by a real login until this one.
  Fixed with `current_user_role()`, a `SECURITY DEFINER` function that
  checks the role while bypassing RLS internally, breaking the cycle — now
  used by all 9 tables instead of a raw self-referencing subquery. One
  accepted advisory tradeoff: the linter flags this function as callable
  directly via RPC by anyone signed in — that's required for it to work
  inside policies at all, and it only ever returns the caller's *own*
  role, so there's no real exposure.

## Round 2 — user-reported fixes (all 9 addressed)

1. **Progress tracker didn't show green on the final "Released" step** — it
   treated the last step like every other "current" step (gold ring, not
   checked). Fixed: once a request is released, every step shows complete.
2. **Resident dashboard's "View All" for announcements left the portal** —
   linked to the public `/announcements` instead of `/portal/announcements`.
   Fixed, and went further: individual announcement *cards* had the same
   bug (always linked to the public detail page even from inside the
   portal). Added a `basePath` prop to `AnnouncementCard`/`AnnouncementsBrowser`
   and a new `/portal/announcements/[slug]` detail page so residents never
   leave their portal shell.
3. **Camera icon on My Profile did nothing** — now opens a file picker,
   uploads to a new `avatars` Storage bucket, and updates `avatar_url` for
   real. Required a new public bucket + RLS (users can only write their own
   folder) — see migration 0017.
4. **Bell and chevron didn't do anything, anywhere — this was a real gap,
   not just a resident-portal issue.** There was no logout anywhere in the
   app. Built two shared components used by all three authenticated
   layouts: `UserMenu` (avatar/name/chevron → dropdown with My Profile +
   real Log Out) and `NotificationsBell` (real data — a resident's own
   recent request status changes; staff/admin see recent pending requests
   and open blotters).
5. **Staff dark mode toggle didn't visually do anything.** Real bug, not
   cosmetic — `StaffLayout` had the toggle UI and the theme context wired
   up, but zero `dark:` Tailwind classes anywhere in its chrome. Fixed the
   sidebar, topbar, and inputs to match the pattern `AdminLayout` already
   had. (Individual white content cards inside each staff page mostly stay
   light against the now-dark chrome — a common dashboard pattern, and a
   full per-page pass across 7 pages' worth of tables/cards was out of
   scope for this round.)
6. **Clicking a blotter row did nothing.** There was no detail view at all.
   Added a side panel (matching the Requests Management pattern) showing
   the full incident and letting staff move it Open → Under Mediation →
   Resolved.
7. **Same dark-mode and bell/chevron issues on the Admin dashboard** — fixed
   by the same shared components above, since `AdminLayout` now uses
   `UserMenu`/`NotificationsBell` too.
8. **Logo replacement is now real.** Click a logo in Settings → Branding →
   confirm dialog → file picker → uploads to a new `logos` Storage bucket
   (admin-only writes) → `barangay_settings.official_seal_url`/`sk_logo_url`
   update → every page that shows these logos re-reads the current URL.
   Covers both authenticated layouts, the public layout, the login page,
   the Certificate Generator, and the Reports printable summary.
9. **Admin clicking a Staff Module switched to the light Staff chrome
   instead of staying in the dark Admin one.** The 7 staff-facing pages
   (`/staff` + its 6 modules) hardcoded `<StaffLayout>`. Added
   `RoleAwareStaffLayout`, which renders `AdminLayout` when the viewer is
   admin and `StaffLayout` otherwise — same page content either way, since
   admin already had full staff permissions at the database level (RLS has
   allowed `staff` and `admin` equally since Phase 3); this was purely a
   presentation bug. Also made the Pending Requests / Blotters Today /
   Total Residents / Equipment Rented KPI cards on both dashboards clickable,
   linking to their respective modules.

## Round 3 — user-reported fixes (all 10 addressed)

1. **Progress tracker: only steps *before* the current one were green** —
   the current step showed a gold "in progress" ring instead of being
   marked complete. Simplified: every step up to and including the current
   status is green now (reaching "Ready" means Ready is done, not still
   pending). Also removes the "in progress" concept entirely — a request is
   either reached a step or it hasn't.
2. **Dark mode reset to light when navigating between Admin and Staff
   modules.** Real architectural bug: `ThemeProvider` was mounted separately
   in `(staff)/layout.tsx` and `(admin)/layout.tsx` — two independent React
   context instances that only *loosely* agreed via a shared localStorage
   key, causing a visible flash/reset on every cross-segment navigation.
   Fixed by moving `ThemeProvider` to the root `app/layout.tsx` — exactly
   one instance for the whole app, so switching between `/admin` and
   `/staff/*` (and now `/portal/*`) never resets or flashes.
3. **Residents now have dark mode too**, added to `PortalLayout` with the
   same toggle pattern Staff/Admin use.
4. **Avatar upload appeared to silently do nothing.** Verified the RLS
   policy directly — it was actually correct — but the code had no error
   handling at all: if anything failed, it failed completely silently with
   no feedback. Wrapped the whole upload flow in try/catch with a visible
   error message, so any future failure is at least diagnosable instead of
   invisible.
5. **Notification badge only appeared after clicking the bell, and only
   showed a dot, not a count.** `NotificationsBell` now loads on mount (not
   just on click) and shows the actual unread count in the badge.
6. **Unread notifications weren't visually distinguished.** Added
   `profiles.notifications_last_seen_at` to track real per-user read state;
   unread items get a red left border and a "NEW" tag until the next reload
   after being viewed — matches the exact behavior described (badge clears
   on open, but the list itself keeps showing what was new for that
   viewing).
7. **Clicking the avatar and clicking the chevron did the same thing, and
   there was no profile page for Staff or Admin at all.** Split `UserMenu`:
   clicking the photo/name now goes straight to a profile page; the chevron
   alone opens a dropdown with Profile + Log Out. Built `/staff/profile` and
   `/admin/profile` (avatar upload, name edit, password change) — these
   didn't exist before this round.
8. **Admin can now add Staff and Resident accounts (previously only
   Resident, and only from the Staff side)**, with a photo uploaded during
   creation and reflected immediately. Added a "Kagawad" account type — same
   `role='staff'` and identical permissions everywhere, distinguished only
   by a new `profiles.position` label. Caps enforced in the UI: 2 Staff, 7
   Kagawad. Required generalizing the `admin-create-resident` Edge Function
   to accept `role`/`position`, and a new storage policy letting staff/admin
   write to *any* user's avatar folder (needed since the account being
   created can't upload its own photo — it doesn't have a session yet).
9. **Manage Account had no way to see a user's full profile, and the status
   toggle's circle wasn't cleanly contained in the track.** Added a "View
   Details" expandable section (address, DOB, sex, civil status, etc.), and
   fixed the toggle to use an explicit base position (`left-0.5` +
   `translate-x-0`/`translate-x-5`) instead of relying on an implicit
   static position, which is what caused the visual overlap.
10. **Resident Management's eye and pencil icons did nothing.** Wired up:
    eye opens a read-only detail view, pencil opens an editable form
    (contact, address, household no., status) that saves for real.

Also, since `Card` (the shared component used almost everywhere) now has
built-in `dark:` styling, individual pages no longer need one-off
`className="dark:bg-maroon-700"` overrides — though the existing ones are
harmless left in place.
