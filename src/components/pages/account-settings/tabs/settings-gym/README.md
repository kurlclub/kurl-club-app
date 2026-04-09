# Settings Gym Module

This module owns the shared "selected club inside settings" behavior for the `Profile & Gyms` tab.

## What owns selection

- `ProfileAndGymsTab` owns the local settings club selection.
- Gym-scoped settings content is wrapped with `SettingsGymScopeProvider`.
- Child settings cards should read the active club with `useSettingsGymId()`.

## Selection precedence

`useSettingsGymId()` resolves the active settings club in this order:

1. Local selection made inside the settings page
2. Global sidebar club selection
3. First club available on `user.clubs`

## What is gym-scoped

These settings cards should use `useSettingsGymId()` instead of reading the global branch directly:

- Business profile
- Buffer configuration
- Notification preferences
- Invoice settings
- Danger zone / club deletion

## Why business profile uses `user.clubs`

The auth session stores a richer `AppClub` shape so the settings page can switch between clubs locally without requiring a full global club switch first.

## Intended exports

Use the barrel import from `tabs/settings-gym` for:

- `useSettingsGymId`
- `SettingsGymScopeProvider`
- selection helpers used by tests
- shared default mappers for invoice and notification
- the shared settings form sync hook
