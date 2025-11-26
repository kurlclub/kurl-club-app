import {
  AlertCircle,
  CircleUserRound,
  Clock,
  Minus,
  PersonStanding,
} from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  columnId: string;
  title: string;
  options: FilterOption[];
}

// Buffer Due Date Filter
export const bufferDueDateFilter = {
  columnId: 'currentCycle.bufferEndDate',
  title: 'Due Date Urgency',
  options: [
    { label: 'Overdue', value: 'overdue', icon: AlertCircle },
    { label: 'Due Today', value: 'today', icon: Clock },
    { label: 'Due in 1-3 days', value: '1-3', icon: Clock },
    { label: 'Due in 4-7 days', value: '4-7', icon: Clock },
    { label: 'Due in 7+ days', value: '7+', icon: Clock },
  ],
};

// Payment Status Filter
export const paymentStatusFilter = {
  columnId: 'currentCycle.status',
  title: 'Payment Status',
  options: [
    { label: 'Pending', value: 'Pending', icon: AlertCircle },
    { label: 'Partial', value: 'Partial', icon: Minus },
    { label: 'Completed', value: 'Completed', icon: CircleUserRound },
    { label: 'Debt', value: 'Debt', icon: AlertCircle },
  ],
};

// Helper function to create package filter with dynamic options
export const createPackageFilter = (
  membershipPlans: Array<{ membershipPlanId: number; planName: string }>
) => ({
  columnId: 'membershipPlanId',
  title: 'Package Type',
  options: membershipPlans.map((plan) => ({
    label: plan.planName,
    value: plan.membershipPlanId.toString(),
  })),
});

// Helper functions to get filters for each tab
export const getPaymentFilters = (
  membershipPlans: Array<{ membershipPlanId: number; planName: string }> = []
) => [
  bufferDueDateFilter,
  paymentStatusFilter,
  createPackageFilter(membershipPlans),
];

export const getCompletedPaymentFilters = (
  membershipPlans: Array<{ membershipPlanId: number; planName: string }> = []
) => [createPackageFilter(membershipPlans)];

// Staff filters
export const staffFilters = [
  {
    columnId: 'role',
    title: 'Designation',
    options: [
      { label: 'Trainer', value: 'Trainer', icon: PersonStanding },
      { label: 'Staff', value: 'Staff', icon: CircleUserRound },
    ],
  },
  {
    columnId: 'bloodGroup',
    title: 'Blood Group',
    options: [
      { label: 'A+', value: 'A+' },
      { label: 'A-', value: 'A-' },
      { label: 'B+', value: 'B+' },
      { label: 'B-', value: 'B-' },
      { label: 'AB+', value: 'AB+' },
      { label: 'AB-', value: 'AB-' },
      { label: 'O+', value: 'O+' },
      { label: 'O-', value: 'O-' },
    ],
  },
];
