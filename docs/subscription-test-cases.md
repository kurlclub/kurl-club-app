# Subscription Module Test Cases

Scope: Web subscription access control, limits, and lifecycle UX.

## Setup Notes

1. Use a user whose `/User/GetUserById/:uid` response includes `subscription` with feature flags and usage limits.
2. To simulate expiring/expired, adjust `subscription.endDate` in the API response.
3. To simulate limits, set usage limits low and use seed data to approach limits.

## Core Access Control

1. Active plan, all features true.
   Steps: Login, navigate to all major sections (Members, Payments, Attendance, Staff, Plans & Workouts, Reports).
   Expected: No lock overlays or upgrade modals appear, all navigation works.

2. Feature disabled at navigation.
   Steps: Set `memberManagement=false`, try to click Members in sidebar and use command palette to open Members.
   Expected: Navigation is blocked and upgrade modal appears.

3. Route guard direct access.
   Steps: With `paymentTracking=false`, directly visit `/payments` and `/payments/session-payments`.
   Expected: Full screen lock appears and upgrade CTA is shown.

4. Reports overlay when locked.
   Steps: Set `basicReports=false`, visit `/reports-and-expenses`.
   Expected: Reports content is blurred with overlay. Upgrade CTA opens subscription page modal.

## Attendance In-Screen Locks

5. Live attendance disabled.
   Steps: Set `liveAttendance=false`, visit Attendance.
   Expected: Dashboard and Device tabs show overlay. Records tab shows banner prompting upgrade. No realtime sync occurs.

6. Manual attendance disabled.
   Steps: Set `manualAttendance=false`, open Records tab and toggle Manual Mode.
   Expected: Upgrade modal appears and Manual Mode does not enable.

## Usage Limits

7. Member limit reached on add member.
   Steps: Set `maxMembers=1` and ensure 1 member exists. Click Add new member.
   Expected: Upgrade modal shown, add flow does not open.

8. Member limit reached on CSV import.
   Steps: Set `maxMembers=2`, ensure 2 members exist. Attempt CSV import with 1+ row.
   Expected: Upgrade modal shown, import does not proceed.

9. Staff limit reached.
   Steps: Set `maxStaffs=1` and ensure 1 staff exists. Try to add staff.
   Expected: Upgrade modal shown, add flow blocked.

10. Trainer limit reached.
    Steps: Set `maxTrainers=1` and ensure 1 trainer exists. Switch type to trainer and submit.
    Expected: Upgrade modal shown, add flow blocked.

11. Both staff and trainer limits reached.
    Steps: Set `maxStaffs=1` and `maxTrainers=1` with both counts at limit. Click Add new.
    Expected: Upgrade modal shown before opening the sheet.

12. Max clubs reached on switching.
    Steps: Set `maxClubs=1`, ensure multiple clubs exist, open club switcher.
    Expected: Upgrade modal appears when trying to switch to another club.

## Subscription Lifecycle UX

13. Expiring warning.
    Steps: Set `endDate` within 7 days. Reload app.
    Expected: Expiring modal appears once per day.

14. Expired lockout.
    Steps: Set `endDate` in the past or `plan.status=expired`. Reload app and try to access any non-account page.
    Expected: Full-screen expired screen appears. Only `/account-settings` and `/auth/*` are accessible.

## Subscription UI

15. Subscription card data.
    Steps: Open Account Settings > Subscription tab.
    Expected: Plan name, billing cycle, and end date render from subscription data.

16. Pricing catalog normalization.
    Steps: Open Subscription tab with `/SubscriptionPlan` returning features and limits.
    Expected: Pricing cards display normalized pricing and feature list.

## Regression Checks

17. Reports API errors.
    Steps: Force a reports API error (non-subscription error).
    Expected: Standard error state shows, no upgrade prompt.

18. Auth persistence.
    Steps: Login, refresh page, verify subscription gating still works.
    Expected: Subscription data persists and gating is consistent across reloads.
