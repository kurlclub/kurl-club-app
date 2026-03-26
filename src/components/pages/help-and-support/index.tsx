'use client';

import { useState } from 'react';

import { ArrowUpRight, LockKeyhole } from 'lucide-react';

import { StudioLayout } from '@/components/shared/layout';
import { AppLoader } from '@/components/shared/loaders';
import { Button } from '@/components/ui/button';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { useSupportTickets } from '@/hooks/use-support';
import { useGymBranch } from '@/providers/gym-branch-provider';

import AddSupport from './add-support';
import EmptyState from './empty-state';
import Requests from './requests';

function HelpAndSupport() {
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false);
  const { gymBranch } = useGymBranch();
  const { hasFeatureAccess, requireFeatureAccess } = useSubscriptionAccess();
  const {
    data: tickets,
    isLoading,
    error,
  } = useSupportTickets(gymBranch?.gymId);

  const isChatSupportLocked = !hasFeatureAccess('chatSupport');
  const isEmailSupportLocked = !hasFeatureAccess('emailSupport');

  const handleWhatsappSupport = () => {
    const hasAccess = requireFeatureAccess('chatSupport', {
      title: 'Upgrade required',
      message: 'Upgrade required',
    });

    if (!hasAccess) return;

    window.open('https://wa.me/7994990230', '_blank', 'noopener,noreferrer');
  };

  const handleEmailSupport = () => {
    const hasAccess = requireFeatureAccess('emailSupport', {
      title: 'Upgrade required',
      message: 'Upgrade required',
    });

    if (!hasAccess) return;

    window.location.href = 'mailto:support@kurlclub.com';
  };

  const headerAction = (
    <div className="flex items-center gap-2">
      <Button className="gap-1" onClick={() => setIsAddSupportOpen(true)}>
        Request support <ArrowUpRight size={18} />
      </Button>
      <Button
        className={`bg-primary-blue-400 text-primary-blue-50! hover:bg-primary-blue-400/70 gap-1 ${isChatSupportLocked ? 'opacity-80' : ''}`}
        onClick={handleWhatsappSupport}
      >
        Whatsapp support{' '}
        {isChatSupportLocked ? (
          <LockKeyhole size={18} className="text-primary-green-500" />
        ) : (
          <ArrowUpRight size={18} className="text-primary-green-500" />
        )}
      </Button>
      <Button
        className={`bg-primary-blue-400 text-primary-blue-50! hover:bg-primary-blue-400/70 gap-1 ${isEmailSupportLocked ? 'opacity-80' : ''}`}
        onClick={handleEmailSupport}
      >
        Email support{' '}
        {isEmailSupportLocked ? (
          <LockKeyhole size={18} className="text-primary-green-500" />
        ) : (
          <ArrowUpRight size={18} className="text-primary-green-500" />
        )}
      </Button>
    </div>
  );

  return (
    <>
      <StudioLayout
        title="Help & Support"
        description="Need help using our services ? Describe your problem and let us help you out !"
        headerActions={headerAction}
      >
        <h1 className="text-[20px] font-medium leading-normal">
          Recent requests
        </h1>
        {isLoading ? (
          <AppLoader />
        ) : error ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-alert-red-500">Failed to load support tickets</p>
          </div>
        ) : tickets && tickets.length > 0 ? (
          <Requests data={tickets} gymId={gymBranch?.gymId} />
        ) : (
          <EmptyState onRequestSupport={() => setIsAddSupportOpen(true)} />
        )}
      </StudioLayout>
      <AddSupport
        isOpen={isAddSupportOpen}
        closeSheet={() => setIsAddSupportOpen(false)}
      />
    </>
  );
}

export default HelpAndSupport;
