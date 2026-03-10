import {
  Coffee,
  Home,
  Music,
  Paperclip,
  PhoneCall,
  Shield,
  User,
  Wallet,
  Wrench,
} from 'lucide-react';

import type { ExpenseType } from '@/types/reports-and-expenses';

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

const categoryIcons: Record<string, IconComponent> = {
  communications: PhoneCall,
  'staff salaries': Wallet,
  insurance: Shield,
  'equipment maintenance': Wrench,
  'food and beverages': Coffee,
  rent: Home,
  entertainment: Music,
};

const roleColors = {
  Admin: 'bg-purple-500/20 text-purple-300',
  Trainer: 'bg-green-500/20 text-green-300',
  Staff: 'bg-blue-500/20 text-blue-300',
};

const ExpenseCard = ({
  category,
  description,
  amount,
  time,
  role,
  attachments = 0,
}: ExpenseType) => {
  const Icon = categoryIcons[category.toLowerCase()] || Wallet;
  const isExpense = amount.includes('-');

  return (
    <div className="bg-primary-blue-400 border border-secondary-blue-400 rounded-xl p-3 flex items-start justify-between gap-4 hover:shadow-lg transition-all duration-200">
      {/* LEFT SIDE */}
      <div className="flex gap-3">
        {/* ICON */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-green-300/40 to-primary-green-300/10 flex items-center justify-center">
          <Icon size={18} className="text-primary-green-300" />
        </div>

        {/* TEXT CONTENT */}
        <div className="flex flex-col">
          {/* CATEGORY */}
          <span className="text-[14px] font-semibold text-white">
            {category}
          </span>

          {/* DESCRIPTION */}
          <span className="text-[13px] text-primary-blue-100 mt-[2px] truncate max-w-[200px] block">
            {description}
          </span>

          {/* META */}
          <div className="flex items-center gap-2 mt-2">
            {/* ROLE */}
            <span
              className={`text-[10px] px-2 py-[3px] rounded-full flex items-center gap-1 ${roleColors[role]}`}
            >
              <User size={10} />
              {role}
            </span>

            {/* ATTACHMENT */}
            {attachments > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-primary-blue-200">
                <Paperclip size={11} />
                {attachments}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col items-end">
        {/* AMOUNT */}
        <span
          className={`text-[16px] font-bold ${
            isExpense ? 'text-alert-red-400' : 'text-neutral-green-400'
          }`}
        >
          {amount}
        </span>

        {/* TIME */}
        <span className="text-[11px] text-primary-blue-200 mt-1">{time}</span>
      </div>
    </div>
  );
};

export default ExpenseCard;
