'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CreditCard, UserPlus, Users } from 'lucide-react';

import { SendOnboardingModal } from '@/components/shared/quick-actions';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';

const commands = [
  {
    id: 'send-onboarding',
    label: 'Send Onboarding',
    icon: UserPlus,
    action: 'modal',
    keywords: ['onboarding', 'send', 'whatsapp', 'link'],
  },
  {
    id: 'record-payment',
    label: 'Record Payment',
    icon: CreditCard,
    action: '/payments?action=record',
    keywords: ['payment', 'record', 'fee', 'collect'],
  },
  {
    id: 'view-members',
    label: 'View Members',
    icon: Users,
    action: '/members',
    keywords: ['members', 'list', 'view', 'all'],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (action: string) => {
    setOpen(false);
    if (action === 'modal') {
      setOnboardingOpen(true);
    } else {
      router.push(action);
    }
  };

  return (
    <>
      <SendOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
      <CommandDialog open={open} onOpenChange={setOpen} closable={false}>
        <DialogTitle className="sr-only">Commands</DialogTitle>
        <div className="shad-command-wrapper">
          <CommandInput
            placeholder="Type a command or search..."
            className="shad-command-input"
          />
        </div>
        <CommandList className="shad-command-list">
          <CommandEmpty className="shad-command-empty">
            No results found.
          </CommandEmpty>
          <CommandGroup heading="Quick Actions" className="shad-command-group">
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command.action)}
                className="shad-command-item"
              >
                <command.icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function QuickActionsButton() {
  const [open, setOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <>
      <SendOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        className="group hidden md:flex items-center gap-0 px-1 py-1 text-sm font-medium text-white bg-gradient-to-r from-secondary-blue-600 to-secondary-blue-500 hover:from-secondary-blue-500 hover:to-secondary-blue-400 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ease-out border border-secondary-blue-400/30 backdrop-blur-sm"
      >
        <span className="flex items-center gap-1.5 text-xs px-2 py-1 border-r border-secondary-blue-200/40">
          <div className="w-2 h-2 bg-primary-green-500 rounded-full animate-pulse"></div>
          Quick Actions
        </span>
        <kbd className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-transparent text-gray-300 transition-all duration-200">
          <span className="text-xs font-bold group-hover:text-primary-green-500 transition-colors duration-200">
            ⌘
          </span>
          <span className="group-hover:text-primary-green-500 transition-colors duration-200">
            K
          </span>
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} closable={false}>
        <DialogTitle className="sr-only">Commands</DialogTitle>
        <div className="shad-command-wrapper">
          <CommandInput
            placeholder="Type a command or search..."
            className="shad-command-input"
          />
        </div>
        <CommandList className="shad-command-list">
          <CommandEmpty className="shad-command-empty">
            No results found.
          </CommandEmpty>
          <CommandGroup heading="Quick Actions" className="shad-command-group">
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={() => {
                  setOpen(false);
                  if (command.action === 'modal') {
                    setOnboardingOpen(true);
                  } else {
                    window.location.href = command.action;
                  }
                }}
                className="shad-command-item"
              >
                <command.icon className="mr-2 h-4 w-4" />
                <span>{command.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
