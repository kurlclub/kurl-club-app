import type { GymDetails } from '@/types/gym';
import type {
  BillingCycle,
  SubscriptionLifecycle,
  SubscriptionPlanEntitlement,
} from '@/types/subscription';

export type PermissionModuleKey =
  | 'member_management'
  | 'staff_management'
  | 'trainer_management'
  | 'reports'
  | 'lead_management'
  | 'expense_management'
  | 'attendance_management'
  | 'payment_management'
  | 'workout_plan_management'
  | 'settings_management'
  | 'payroll_management'
  | (string & {});

export interface AccessPermission {
  moduleKey: PermissionModuleKey;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface AuthEntitlements {
  role: string;
  permissions: AccessPermission[];
  subscriptionPlan: SubscriptionPlanEntitlement | null;
}

export interface AppGymSummary {
  gymId: number;
  gymName: string;
  gymLocation: string;
}

export interface AppClub {
  gymId: number;
  gymName: string;
  location: string;
  contactNumber1: string;
  contactNumber2: string | null;
  email: string;
  socialLinks?: string | Array<string | { url?: string | null }> | null;
  gymAdminId: number;
  status: number;
  gymIdentifier: string;
  photoPath: string | null;
}

export interface AppUser {
  userId: number;
  userName: string;
  userEmail: string;
  userRole: string;
  uid: string;
  photoURL?: string | null;
  isMultiClub: boolean;
  gyms: AppGymSummary[];
  clubs: AppClub[];
}

export interface LegacyUserSubscription {
  plan: {
    id: number;
    name: string;
    tier: string;
    status: 'active' | 'expired' | 'cancelled';
  };
  subscriptionId: number;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  usageLimits: {
    maxClubs: number;
    maxMembers: number;
    maxTrainers: number;
    maxStaffs: number;
  };
  features: Record<string, boolean | number>;
}

export interface AppSession {
  user: AppUser | null;
  gymDetails: GymDetails | null;
  entitlements: AuthEntitlements | null;
  subscriptionLifecycle: SubscriptionLifecycle | null;
}

export interface StoredAppSession extends AppSession {
  version: number;
}
