import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import type { PaymentHistory } from '@/services/transaction';

type PaymentListItemProps = {
  payment: PaymentHistory;
  isSelected: boolean;
  onSelect: (paymentId: number) => void;
};

export function PaymentListItem({
  payment,
  isSelected,
  onSelect,
}: PaymentListItemProps) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-primary-green-400 bg-primary-green-500/10 shadow-md'
          : 'border-primary-blue-400 bg-primary-blue-500/10 hover:bg-primary-blue-500/20 hover:border-primary-blue-300'
      }`}
      onClick={() => onSelect(payment.id)}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="text-white font-semibold text-base">
                ₹{payment.amount.toLocaleString()}
              </div>
              {isSelected && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary-green-400 animate-pulse" />
              )}
            </div>
            <div className="text-xs text-primary-blue-200">
              {payment.paymentMethod}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-primary-blue-300">
              {formatDateTime(payment.paymentDate, 'date')}
            </div>
            <div className="text-[10px] text-primary-blue-200 font-mono mt-0.5">
              #{payment.id}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
