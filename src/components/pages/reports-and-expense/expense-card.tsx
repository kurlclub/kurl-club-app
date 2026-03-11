import type { ComponentType } from 'react';

import {
  Coffee,
  Home,
  Music,
  PhoneCall,
  Shield,
  Wallet,
  Wrench,
} from 'lucide-react';

import { ReportBreakdownItem } from '@/types/reports-and-expenses';
import { formatCurrency } from '@/utils/format-currency';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

const categoryIcons: Record<string, IconComponent> = {
  communication: PhoneCall,
  communications: PhoneCall,
  insurance: Shield,
  'equipment maintenance': Wrench,
  'food & beverages': Coffee,
  'food and beverages': Coffee,
  'cleaning supplies': Wallet,
  'staff salaries': Wallet,
  entertainment: Music,
  rent: Home,
};

interface ExpenseCardProps extends ReportBreakdownItem {
  share: number;
}

const ExpenseCard = ({ name, amount, color, share }: ExpenseCardProps) => {
  const Icon = categoryIcons[name.toLowerCase()] || Wallet;

  return (
    <div className="bg-primary-blue-400 border border-secondary-blue-400 rounded-xl p-3 flex items-start justify-between gap-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/6 border border-white/10">
          <Icon size={18} className="text-white" />
        </div>

        <div className="flex flex-col">
          <span className="text-[14px] font-semibold text-white">{name}</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-[12px] text-primary-blue-100">
              {share.toFixed(1)}% of total expenses
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-[16px] font-bold text-white">
          {formatCurrency(amount)}
        </span>
        <span className="text-[11px] text-primary-blue-200">
          Category spend
        </span>
      </div>
    </div>
  );
};

export default ExpenseCard;
