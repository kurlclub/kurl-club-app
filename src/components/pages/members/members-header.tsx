//TODO: Re-enable import functionality when ready
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  // Download,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useMemberForm } from '@/hooks/use-member-form';

import AddFrom from './add-member';
import { SetupChecklistDialog } from './setup-checklist-dialog';

interface MembersHeaderProps {
  onImportClick: () => void;
  onAddNewClick: () => void;
  isOpen: boolean;
  closeSheet: () => void;
  gymId?: number;
}

export const MembersHeader = ({
  // onImportClick,
  onAddNewClick,
  isOpen,
  closeSheet,
  gymId,
}: MembersHeaderProps) => {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [cameFromSetup, setCameFromSetup] = useState(false);
  const { formOptions } = useGymFormOptions(gymId);
  const memberForm = useMemberForm(gymId);
  const searchParams = useSearchParams();

  const hasPackages = (formOptions?.membershipPlans?.length ?? 0) > 0;
  const hasTrainers = (formOptions?.trainers?.length ?? 0) > 0;
  const hasWorkoutPlans = (formOptions?.workoutPlans?.length ?? 0) > 0;
  const allSetupComplete = hasPackages && hasTrainers && hasWorkoutPlans;

  // Detect if user came from setup pages
  useEffect(() => {
    if (searchParams.get('setup') === 'true') {
      setCameFromSetup(true);
    }
  }, [searchParams]);

  // Reset flag when dialog closes
  useEffect(() => {
    if (!isOpen && cameFromSetup) {
      setCameFromSetup(false);
    }
  }, [isOpen, cameFromSetup]);

  const handleAddNewClick = () => {
    // If all setup is complete and not coming from setup, go directly to add member
    if (allSetupComplete && !cameFromSetup) {
      setShowAddMemberForm(true);
    } else {
      setShowAddMemberForm(false);
    }
    onAddNewClick();
  };

  return (
    <div className="flex items-center justify-end flex-wrap gap-2">
      <div className="flex items-center space-x-2 flex-wrap">
        {/* <Button variant="outline" className="h-10" onClick={onImportClick}>
          <Download className=" h-4 w-4" />
          Import
        </Button> */}
        <Button className="h-10" onClick={handleAddNewClick}>
          <Plus className="h-4 w-4" />
          Add new
        </Button>

        {showAddMemberForm && allSetupComplete ? (
          <AddFrom
            isOpen={isOpen}
            closeSheet={() => {
              closeSheet();
              setShowAddMemberForm(false);
            }}
            gymId={gymId}
            memberForm={memberForm}
          />
        ) : (
          <SetupChecklistDialog
            isOpen={isOpen}
            onClose={() => {
              closeSheet();
              setShowAddMemberForm(false);
            }}
            formOptions={formOptions}
            onProceed={() => {
              // Check if setup is complete and proceed
              const currentlyComplete =
                (formOptions?.membershipPlans?.length ?? 0) > 0 &&
                (formOptions?.trainers?.length ?? 0) > 0 &&
                (formOptions?.workoutPlans?.length ?? 0) > 0;
              if (currentlyComplete) {
                setShowAddMemberForm(true);
                setCameFromSetup(false); // Reset flag when user manually proceeds
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
