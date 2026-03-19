'use client';

import { useState } from 'react';

import { ArrowUpRight, LockKeyhole } from 'lucide-react';

import { StudioLayout } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';

import AddSupport from './add-support';
import EmptyState from './empty-state';

const requestData = [
  // {
  //   id: '1',
  //   subject: 'Issue with login',
  //   description:
  //     'I am unable to login to my account using my credentials. It keeps showing an error message.',
  //   category: 'Authentication',
  //   priority: 'high',
  //   status: 'open',
  //   createdAt: '2026-03-01T10:00:00Z',
  //   dueAt: '2026-03-05T10:00:00Z',
  //   timeline: [
  //     {
  //       id: '1',
  //       type: 'Ticket created',
  //       message: 'We started to look into your issue',
  //       user: 'support@kurlclub.com',
  //       role: 'support-agent',
  //       updatedAt: '2026-03-01T10:00:00Z',
  //     },
  //     {
  //       id: '2',
  //       type: 'Ticket updated',
  //       message: 'We are still investigating your issue',
  //       user: 'support@kurlclub.com',
  //       role: 'support-agent',
  //       updatedAt: '2026-03-02T10:00:00Z',
  //     },
  //     {
  //       id: '3',
  //       type: 'Ticket updated',
  //       message: 'We have identified the issue and are working on a fix',
  //       user: 'support@kurlclub.com',
  //       role: 'support-agent',
  //       updatedAt: '2026-03-03T10:00:00Z',
  //     },
  //   ],
  // },
  // {
  //   id: '2',
  //   subject: 'Feature request: Dark mode',
  //   description:
  //     'It would be great to have a dark mode option in the application for better usability at night.',
  //   category: 'Feature Request',
  //   priority: 'medium',
  //   status: 'closed',
  //   createdAt: '2026-02-15T14:30:00Z',
  //   dueAt: '2026-02-20T14:30:00Z',
  //   timeline: [
  //     {
  //       id: '1',
  //       type: 'Ticket created',
  //       message: 'We have received your feature request and are reviewing it',
  //       user: 'support@kurlclub.com',
  //       role: 'support-agent',
  //       updatedAt: '2026-02-15T14:30:00Z',
  //     },
  //     {
  //       id: '2',
  //       type: 'Ticket updated',
  //       message:
  //         'We have decided to implement this feature in a future release',
  //       user: 'support@kurlclub.com',
  //       role: 'support-agent',
  //       updatedAt: '2026-02-20T14:30:00Z',
  //     },
  //     {
  //       id: '3',
  //       type: 'Ticket closed',
  //       message: 'The feature has been implemented and released',
  //       user: 'support@kurlclub.com',
  //       role: 'support-agent',
  //       updatedAt: '2026-02-25T14:30:00Z',
  //     },
  //   ],
  // },
];

function HelpAndSupport() {
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false);

  const headerAction = (
    <div className="flex items-center gap-2">
      <Button className="gap-1" onClick={() => setIsAddSupportOpen(true)}>
        Request support <ArrowUpRight size={18} />
      </Button>
      <Button className="bg-primary-blue-400 text-primary-blue-50! hover:bg-primary-blue-400/70 gap-1">
        Whatsapp support{' '}
        <LockKeyhole size={18} className="text-primary-green-500" />
      </Button>
      <Button className="bg-primary-blue-400 text-primary-blue-50! hover:bg-primary-blue-400/70 gap-1">
        Email support{' '}
        <LockKeyhole size={18} className="text-primary-green-500" />
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
        {requestData.length > 0 ? (
          'hello'
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
