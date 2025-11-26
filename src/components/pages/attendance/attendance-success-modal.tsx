'use client';

import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';

type Props = {
  open: boolean;
  onClose: () => void;
  member: {
    name: string;
    identifier: string;
  } | null;
  action: 'checkin' | 'checkout';
  time: string;
};

export function AttendanceSuccessModal({
  open,
  onClose,
  member,
  action,
  time,
}: Props) {
  if (!member) return null;

  const avatarStyle = getAvatarColor(member.name);
  const initials = getInitials(member.name);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-secondary-blue-500 border-secondary-blue-400 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg text-white">
            {action === 'checkin'
              ? 'Check-In Confirmed'
              : 'Check-Out Confirmed'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            {action === 'checkin'
              ? 'Member has been successfully checked in'
              : 'Member has been successfully checked out'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative mb-4"
          >
            <Avatar className="w-20 h-20 border-4 border-primary-green-500/30">
              <AvatarFallback
                className="text-xl font-semibold"
                style={avatarStyle}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="absolute -bottom-1.5 -right-1.5 bg-primary-green-500 rounded-full p-1.5"
            >
              <CheckCircle2 className="w-5 h-5 text-black" />
            </motion.div>
          </motion.div>

          <h3 className="text-xl text-white mb-1.5">{member.name}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {action === 'checkin' ? 'Checked in at' : 'Checked out at'} {time}
          </p>

          <div className="w-full bg-secondary-blue-400/50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Member ID</span>
              <span className="text-white font-semibold text-sm">
                #{member.identifier}
              </span>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
