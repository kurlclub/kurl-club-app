import {
  AlertCircle,
  Calendar,
  Check,
  CircleUserRound,
  Gift,
  Minus,
  PersonStanding,
} from 'lucide-react';

export const filters = [
  {
    columnId: 'package',
    title: 'Package',
    options: [
      { label: 'Monthly', value: 'Monthly', icon: Calendar },
      { label: 'Quarterly', value: 'Quarterly', icon: Calendar },
      { label: 'Half Yearly', value: 'Half_Yearly', icon: Calendar },
      { label: 'Yearly', value: 'Yearly', icon: Calendar },
      { label: 'Special', value: 'Special', icon: Gift },
    ],
  },
  {
    columnId: 'feeStatus',
    title: 'Fee Status',
    options: [
      { label: 'Paid', value: 'paid', icon: Check },
      { label: 'Partially Paid', value: 'partially_paid', icon: Minus },
      { label: 'Unpaid', value: 'unpaid', icon: AlertCircle },
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
