export interface ExpenseData {
  id: string;
  category: string;
  description: string;
  amount: string;
  time: string;
  addedBy: string;
  attachments?: number;
}

export const dummyExpenses: ExpenseData[] = [
  {
    id: '1',
    category: 'Communications',
    description: 'Monthly internet and phone bills',
    amount: '-$2,450.00',
    time: '2 hours ago',
    addedBy: 'John Doe',
    attachments: 2,
  },
  {
    id: '2',
    category: 'Staff Salaries',
    description: 'Monthly payroll for all staff members',
    amount: '-$15,750.00',
    time: '1 day ago',
    addedBy: 'HR Manager',
    attachments: 1,
  },
  {
    id: '3',
    category: 'Insurance',
    description: 'Health insurance premiums',
    amount: '-$3,200.00',
    time: '3 days ago',
    addedBy: 'Finance Dept',
    attachments: 0,
  },
  {
    id: '4',
    category: 'Equipment Maintenance',
    description: 'Gym equipment servicing and repairs',
    amount: '-$850.00',
    time: '1 week ago',
    addedBy: 'Maintenance Team',
    attachments: 3,
  },
  {
    id: '5',
    category: 'Food and Beverages',
    description: 'Member refreshments and supplies',
    amount: '-$420.00',
    time: '2 days ago',
    addedBy: 'Operations',
    attachments: 1,
  },
  {
    id: '6',
    category: 'Rent',
    description: 'Monthly facility rental payment',
    amount: '-$8,500.00',
    time: '5 days ago',
    addedBy: 'Property Manager',
    attachments: 0,
  },
  {
    id: '7',
    category: 'Entertainment',
    description: 'Member event entertainment system',
    amount: '-$150.00',
    time: '1 week ago',
    addedBy: 'Events Coordinator',
    attachments: 2,
  },
  {
    id: '8',
    category: 'Communications',
    description: 'New phone system installation',
    amount: '-$1,200.00',
    time: '3 hours ago',
    addedBy: 'IT Department',
    attachments: 4,
  },
  {
    id: '9',
    category: 'Equipment Maintenance',
    description: 'Treadmill belt replacement',
    amount: '-$320.00',
    time: '4 days ago',
    addedBy: 'Maintenance Team',
    attachments: 1,
  },
  {
    id: '10',
    category: 'Food and Beverages',
    description: 'Protein shake supplies',
    amount: '-$95.00',
    time: '6 hours ago',
    addedBy: 'Nutrition Staff',
    attachments: 0,
  },
  {
    id: '11',
    category: 'Insurance',
    description: 'Equipment liability insurance',
    amount: '-$450.00',
    time: '2 weeks ago',
    addedBy: 'Finance Dept',
    attachments: 1,
  },
  {
    id: '12',
    category: 'Staff Salaries',
    description: 'Overtime pay for holiday period',
    amount: '-$2,100.00',
    time: '1 week ago',
    addedBy: 'HR Manager',
    attachments: 2,
  },
];
