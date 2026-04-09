import type { SubscriptionAccessKey } from '@/types/subscription';

export type RouteGateMode = 'block' | 'overlay';

export type RouteFeatureGate = {
  prefix: string;
  feature: SubscriptionAccessKey;
  mode: RouteGateMode;
  title: string;
  message: string;
};

export const ROUTE_FEATURE_GATES: RouteFeatureGate[] = [
  {
    prefix: '/members',
    feature: 'memberManagement',
    mode: 'block',
    title: 'Members require a higher plan',
    message: 'Upgrade your subscription to manage members.',
  },
  {
    prefix: '/payments/session-payments',
    feature: 'paymentTracking',
    mode: 'block',
    title: 'Payments require a higher plan',
    message: 'Upgrade your subscription to access payments.',
  },
  {
    prefix: '/payments',
    feature: 'paymentTracking',
    mode: 'block',
    title: 'Payments require a higher plan',
    message: 'Upgrade your subscription to access payments.',
  },
  {
    prefix: '/attendance',
    feature: 'attendanceTracking',
    mode: 'block',
    title: 'Attendance requires a higher plan',
    message: 'Upgrade your subscription to access attendance.',
  },
  {
    prefix: '/staff-management',
    feature: 'staffManagement',
    mode: 'block',
    title: 'Staff management requires a higher plan',
    message: 'Upgrade your subscription to manage staff and trainers.',
  },
  {
    prefix: '/plans-and-workouts',
    feature: 'membershipManagement',
    mode: 'block',
    title: 'Plans & workouts require a higher plan',
    message: 'Upgrade your subscription to manage plans and workouts.',
  },
  {
    prefix: '/reports-and-expenses',
    feature: 'basicReports',
    mode: 'overlay',
    title: 'Reports require a higher plan',
    message: 'Upgrade your subscription to unlock Basic Reports.',
  },
  {
    prefix: '/lead-management',
    feature: 'leadManagement',
    mode: 'block',
    title: 'Lead management requires a higher plan',
    message: 'Upgrade your subscription to manage leads.',
  },
];

export const EXPIRED_ALLOWED_PREFIXES = ['/account-settings', '/auth'];
