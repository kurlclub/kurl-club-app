# Canonical `/Access/me` Entitlements

`GET /api/Access/me` is the single runtime authority for authorization in `kurl-club-app`.

## Mental Model

- `getUserByUid` owns identity, clubs, active gym details, and lifecycle-only subscription metadata.
- `/Access/me` owns role, permissions, subscription limits, and subscription features.
- The app stores one encrypted `appSession` that contains:
  - `user`
  - `gymDetails`
  - `entitlements`
  - `subscriptionLifecycle`
- `gymBranch` remains a separate persisted branch preference.

## Canonical Domain

- Raw `/Access/me` transport parsing stays in [access-me-normalizer.ts](../src/services/auth/access-me-normalizer.ts).
- Canonical storage and migration live in [auth-session.ts](../src/lib/auth-session.ts).
- Runtime guards and semantic selectors live in [access-policy.ts](../src/lib/subscription/access-policy.ts).
- Derived subscription status and merged current-subscription state live in [subscription-state.ts](../src/lib/subscription/subscription-state.ts).

## Extension Flow

When the backend adds or changes access data, follow this order:

1. Update the canonical nested subscription or entitlement type in [subscription.ts](../src/types/subscription.ts) or [access.ts](../src/types/access.ts).
2. Update `/Access/me` normalization in [access-me-normalizer.ts](../src/services/auth/access-me-normalizer.ts). Missing data must fail closed.
3. Add or update the semantic selector in [access-policy.ts](../src/lib/subscription/access-policy.ts).
4. Wire route or action gates through the shared guards and `useSubscriptionAccess()`.
5. Add or update tests in `tests/auth` or `tests/subscription`.

## Guard Rules

- Do not gate screens directly from raw backend field names.
- Do not read authorization state from `user.subscription`.
- Do not add new flat feature keys for compatibility.
- Keep lifecycle-only fields such as `billingCycle`, `startDate`, `endDate`, and `status` on `subscriptionLifecycle` until backend parity exists on `/Access/me`.

## Current Sources

- Auth bootstrap: [auth-provider.tsx](../src/providers/auth-provider.tsx)
- Canonical fetch join: [auth.ts](../src/services/auth/auth.ts)
- API headers: [api.ts](../src/lib/api.ts)
- Subscription provider: [subscription-provider.tsx](../src/providers/subscription-provider.tsx)
