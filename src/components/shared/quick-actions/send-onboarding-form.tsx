'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { Form } from '@/components/ui/form';

const onboardingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const SendOnboardingForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      setIsOpen(false);
      form.reset();
      setSent(false);
    }, 2000);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-4 w-4 text-primary-green-600" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-secondary-blue-700 border-primary-blue-400">
          <DialogHeader>
            <DialogTitle className="text-white">
              Send Onboarding Link
            </DialogTitle>
          </DialogHeader>

          {sent ? (
            <div className="text-center py-8">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-white">Sent successfully!</p>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSend)}
                className="space-y-4"
              >
                <p className="text-gray-300 text-sm">
                  Send onboarding form to new member via WhatsApp
                </p>

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

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Hook for external components to trigger the modal
export const useSendOnboarding = () => {
  const [isOpen, setIsOpen] = useState(false);

  return {
    openModal: () => setIsOpen(true),
    SendOnboardingModal: () => {
      const [sent, setSent] = useState(false);

      const form = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
          name: '',
          phone: '',
        },
      });

      const handleSend = () => {
        setSent(true);
        setTimeout(() => {
          setIsOpen(false);
          form.reset();
          setSent(false);
        }, 2000);
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-secondary-blue-700 border-primary-blue-400">
            <DialogHeader>
              <DialogTitle className="text-white">
                Send Onboarding Link
              </DialogTitle>
            </DialogHeader>

            {sent ? (
              <div className="text-center py-8">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-white">Sent successfully!</p>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSend)}
                  className="space-y-4"
                >
                  <p className="text-gray-300 text-sm">
                    Send onboarding form to new member via WhatsApp
                  </p>

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

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      );
    },
  };
};
