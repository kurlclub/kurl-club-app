'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Check, MessageCircle, Send } from 'lucide-react';
import { z } from 'zod';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMessaging } from '@/hooks/use-messaging';

const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const SuccessState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-8"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      className="relative mx-auto mb-6 w-20 h-20"
    >
      <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
      <div className="absolute inset-2 bg-green-500/30 rounded-full animate-pulse" />
      <Check className="h-12 w-12 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-white text-xl font-semibold mb-2 flex items-center justify-center gap-2">
        Invitation Sent!
      </h3>
      <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto">
        The member will receive a WhatsApp message with their onboarding link.
      </p>
    </motion.div>
  </motion.div>
);

const OnboardingFormContent = ({
  sent,
  form,
  handleSend,
  isSending,
  onClose,
}: {
  sent: boolean;
  form: ReturnType<typeof useForm<OnboardingFormData>>;
  handleSend: (data: OnboardingFormData) => Promise<void>;
  isSending: boolean;
  onClose: () => void;
}) => (
  <>
    {sent ? (
      <SuccessState />
    ) : (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-gray-300 text-sm leading-relaxed">
            We&apos;ll send a WhatsApp message with a link to complete their
            membership registration.
          </p>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSend)} className="space-y-4">
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="name"
              label="Name"
            />

            <KFormField
              fieldType={KFormFieldType.PHONE_INPUT}
              control={form.control}
              name="phone"
              label="Phone"
              placeholder="(555) 123-4567"
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSending} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    )}
  </>
);

export const SendOnboardingForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendOnboardingForm, isSending } = useMessaging();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: '', phone: '' },
  });

  const handleSend = async (data: OnboardingFormData) => {
    await sendOnboardingForm(data);
    setSent(true);
    form.reset();
  };

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSent(false);
      form.reset();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-primary-green-50 hover:text-primary-green-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-4 w-4 text-primary-green-600" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-secondary-blue-700 border-primary-blue-400 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              Invite New Member
            </DialogTitle>
          </DialogHeader>
          <OnboardingFormContent
            sent={sent}
            form={form}
            handleSend={handleSend}
            isSending={isSending}
            onClose={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const SendOnboardingModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [sent, setSent] = useState(false);
  const { sendOnboardingForm, isSending } = useMessaging();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: '', phone: '' },
  });

  const handleSend = async (data: OnboardingFormData) => {
    await sendOnboardingForm(data);
    setSent(true);
    form.reset();
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setSent(false);
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-secondary-blue-700 border-primary-blue-400 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            Invite New Member
          </DialogTitle>
        </DialogHeader>
        <OnboardingFormContent
          sent={sent}
          form={form}
          handleSend={handleSend}
          isSending={isSending}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
