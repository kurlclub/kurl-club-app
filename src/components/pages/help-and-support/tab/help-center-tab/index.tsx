'use client';

import { useState } from 'react';

import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  Lock,
  Mail,
  MessageCircleMore,
  Phone,
  PhoneCall,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { SubscriptionFeatureKey } from '@/types/subscription';

const SUPPORT_EMAIL = 'support@kurlclub.com';
const SUPPORT_PHONE = '7994990230';

type SupportOption = {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  icon: typeof Mail;
  iconClass: string;
  topBorder: string;
  featureKey?: SubscriptionFeatureKey;
};

const supportOptions: SupportOption[] = [
  {
    title: 'Email Support',
    description:
      'Write to our team and get a detailed response within 24 hours.',
    actionLabel: 'Send Email',
    href: 'mailto:support@kurlclub.com',
    icon: Mail,
    iconClass: 'text-primary-green-500 bg-primary-green-500/10',
    topBorder: 'border-t-primary-green-500',
    featureKey: 'emailSupport',
  },
  {
    title: 'WhatsApp',
    description:
      'Chat with us on WhatsApp for quick answers and real-time help.',
    actionLabel: 'Open WhatsApp',
    href: 'https://wa.me/917994990230',
    icon: MessageCircleMore,
    iconClass: 'text-emerald-400 bg-emerald-400/10',
    topBorder: 'border-t-emerald-400',
    featureKey: 'chatSupport',
  },
  {
    title: 'Call Support',
    description:
      'Speak with a support agent directly for urgent or complex issues.',
    actionLabel: 'Call Now',
    href: 'tel:+917994990230',
    icon: PhoneCall,
    iconClass: 'text-blue-400 bg-blue-400/10',
    topBorder: 'border-t-blue-400',
    featureKey: 'phoneSupport',
  },
  {
    title: 'Website Help',
    description:
      'Browse our help portal for guides, FAQs, and self-service tools.',
    actionLabel: 'Visit Website',
    href: 'https://kurlclub.com',
    icon: Globe,
    iconClass: 'text-violet-400 bg-violet-400/10',
    topBorder: 'border-t-violet-400',
  },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gray-400 dark:text-secondary-blue-200" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{copied ? 'Copied!' : 'Copy'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function HelpCenterTab() {
  const { openUpgradeModal, hasFeatureAccess } = useSubscriptionAccess();

  const handleDisabledSupportClick = () => {
    openUpgradeModal({
      title: 'Upgrade required',
      message:
        'Upgrade your subscription plan to unlock customer support channels.',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-lg bg-linear-to-r from-secondary-blue-600 to-secondary-blue-700 border border-secondary-blue-400 px-4 py-5 flex items-start gap-4">
        <div className="h-14 w-14 rounded-lg bg-primary-green-500/20 border border-primary-green-500/30 flex items-center justify-center shrink-0">
          <HelpCircle className="h-7 w-7 text-primary-green-500" />
        </div>
        <div className="flex flex-col gap-2">
          <Badge className="bg-primary-green-500 w-fit text-primary-blue-500 hover:bg-primary-green-700 font-semibold text-xs">
            Help Center
          </Badge>
          <h2 className="text-xl font-bold text-white leading-snug">
            We&apos;re here to help you
          </h2>
          <p className="text-secondary-blue-200 text-sm leading-relaxed max-w-xl">
            Reach our support team through any channel below. We typically
            respond within a few hours.
          </p>
        </div>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-primary-green-500/5 blur-3xl" />
        <div className="pointer-events-none absolute right-20 -bottom-8 h-24 w-24 rounded-full bg-secondary-blue-400/20 blur-2xl" />
      </div>

      {/* Contact Details Card */}
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 rounded-lg">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-secondary-blue-400">
            {/* Email */}
            <div className="flex items-center gap-3 flex-1 p-4">
              <div className="h-10 w-10 rounded-lg bg-primary-green-500/10 text-primary-green-500 flex items-center justify-center shrink-0">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-gray-400 dark:text-secondary-blue-300">
                  Support Email
                </p>
                <div className="flex items-center mt-0.5">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {SUPPORT_EMAIL}
                  </span>
                  <CopyButton value={SUPPORT_EMAIL} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 flex-1 p-4">
              <div className="h-10 w-10 rounded-lg bg-primary-green-500/10 text-primary-green-500 flex items-center justify-center shrink-0">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-gray-400 dark:text-secondary-blue-300">
                  Support Phone
                </p>
                <div className="flex items-center mt-0.5">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {SUPPORT_PHONE}
                  </span>
                  <CopyButton value={SUPPORT_PHONE} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Channels */}
      <div>
        <p className="text-xs uppercase tracking-[0.12em] font-semibold text-gray-400 dark:text-secondary-blue-300 mb-3">
          Contact Channels
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            const isDisabled = option.featureKey
              ? !hasFeatureAccess(option.featureKey)
              : false;

            return (
              <Card
                key={option.title}
                onClick={isDisabled ? handleDisabledSupportClick : undefined}
                className={`
    bg-white rounded-lg dark:bg-secondary-blue-500 
    border-gray-200 dark:border-secondary-blue-400 
    overflow-hidden border-t-2 ${option.topBorder}
    transition-all duration-200 group 

    ${
      isDisabled
        ? 'opacity-70 cursor-not-allowed hover:opacity-80 hover:scale-[1.01]'
        : 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary-green-400'
    }
  `}
              >
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`
    h-11 w-11 rounded-lg flex items-center justify-center shrink-0 
    ${option.iconClass}
    transition-all duration-200

    ${!isDisabled && 'group-hover:scale-110'}
  `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-secondary-blue-200 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-gray-100 dark:bg-secondary-blue-400" />
                  {isDisabled ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDisabledSupportClick();
                      }}
                    >
                      Upgrade Plan
                      <Lock className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full p-0"
                    >
                      <a href={option.href} target="_blank" rel="noreferrer">
                        {option.actionLabel}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HelpCenterTab;
