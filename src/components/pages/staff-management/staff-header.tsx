import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';

import AddStaff from './add-staff';

interface StaffsHeaderProps {
  onAddNewClick: () => void;
  isOpen: boolean;
  closeSheet: () => void;
  staffCount: number;
  trainerCount: number;
}

export const StaffsHeader = ({
  onAddNewClick,
  isOpen,
  closeSheet,
  staffCount,
  trainerCount,
}: StaffsHeaderProps) => {
  const { isLimitExceeded, openUpgradeModal } = useSubscriptionAccess();
  const isStaffLimitReached = isLimitExceeded('maxStaffs', staffCount);
  const isTrainerLimitReached = isLimitExceeded('maxTrainers', trainerCount);

  const handleAddNewClick = () => {
    if (isStaffLimitReached && isTrainerLimitReached) {
      openUpgradeModal({
        title: 'Team limit reached',
        message: 'Upgrade your plan to add more staff or trainers.',
      });
      return;
    }
    onAddNewClick();
  };

  return (
    <div className="flex items-center justify-end flex-wrap gap-2">
      <div className="flex items-center space-x-2 flex-wrap">
        <Button className="h-10" onClick={handleAddNewClick}>
          <Plus className="h-4 w-4" />
          Add new
        </Button>
        <AddStaff
          isOpen={isOpen}
          closeSheet={closeSheet}
          staffCount={staffCount}
          trainerCount={trainerCount}
        />
      </div>
    </div>
  );
};
