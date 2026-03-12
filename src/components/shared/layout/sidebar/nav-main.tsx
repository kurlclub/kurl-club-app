'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { ChevronRight, Lock, type LucideIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useSubscriptionAccess } from '@/hooks/use-subscription-access';
import { SubscriptionFeatureKey } from '@/types/subscription';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    requiredFeature?: SubscriptionFeatureKey;
    items?: {
      title: string;
      url: string;
      requiredFeature?: SubscriptionFeatureKey;
    }[];
  }[];
}) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const { hasFeatureAccess, requireFeatureAccess } = useSubscriptionAccess();

  const handleLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const [openItems, setOpenItems] = useState<string[]>(() => {
    // Auto-expand items that have active sub-items
    const initialOpen: string[] = [];
    items.forEach((item) => {
      if (
        item.items?.some(
          (subItem) =>
            pathname === subItem.url ||
            (subItem.url !== '/' && pathname.startsWith(subItem.url))
        )
      ) {
        initialOpen.push(item.title);
      }
    });
    return initialOpen;
  });

  const toggleItem = (title: string) => {
    setOpenItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>GENERAL</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isCurrentPage = pathname === item.url || item.isActive;
          const hasSubItems = item.items && item.items.length > 0;
          const isOpen = openItems.includes(item.title);
          const hasActiveSubItem = item.items?.some(
            (subItem) => pathname === subItem.url
          );

          if (hasSubItems) {
            const isParentLocked =
              item.requiredFeature && !hasFeatureAccess(item.requiredFeature);
            if (state === 'collapsed') {
              return (
                <SidebarMenuItem key={item.title}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        isActive={isCurrentPage || hasActiveSubItem}
                        tooltip={item.title}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {isParentLocked && (
                          <Lock className="ml-auto h-3.5 w-3.5 text-primary-green-500" />
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      className="bg-secondary-blue-700 border-secondary-blue-400 text-white"
                    >
                      {item.items?.map((subItem) => {
                        const requiredFeature =
                          subItem.requiredFeature || item.requiredFeature;
                        const isLocked =
                          (requiredFeature &&
                            !hasFeatureAccess(requiredFeature)) ||
                          isParentLocked;
                        return (
                          <DropdownMenuItem
                            key={subItem.title}
                            className="shad-drop-item"
                            onClick={(event) => {
                              if (isLocked) {
                                event.preventDefault();
                                if (requiredFeature) {
                                  requireFeatureAccess(requiredFeature, {
                                    title: 'Upgrade required',
                                    message:
                                      'Upgrade your subscription to unlock this section.',
                                  });
                                }
                                return;
                              }
                              handleLinkClick();
                            }}
                          >
                            {isLocked ? (
                              <span className="flex items-center gap-2">
                                <Lock className="h-3.5 w-3.5 text-primary-green-500" />
                                {subItem.title}
                              </span>
                            ) : (
                              <Link
                                href={subItem.url}
                                onClick={handleLinkClick}
                              >
                                {subItem.title}
                              </Link>
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                open={isOpen}
                onOpenChange={() => toggleItem(item.title)}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isCurrentPage || hasActiveSubItem}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {isParentLocked && (
                        <Lock className="ml-auto h-3.5 w-3.5 text-primary-green-500" />
                      )}
                      <ChevronRight
                        className={`ml-auto transition-transform duration-200 ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const requiredFeature =
                          subItem.requiredFeature || item.requiredFeature;
                        const isLocked =
                          (requiredFeature &&
                            !hasFeatureAccess(requiredFeature)) ||
                          isParentLocked;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild={!isLocked}
                              isActive={pathname === subItem.url}
                              onClick={(event) => {
                                if (isLocked) {
                                  event.preventDefault();
                                  if (requiredFeature) {
                                    requireFeatureAccess(requiredFeature, {
                                      title: 'Upgrade required',
                                      message:
                                        'Upgrade your subscription to unlock this section.',
                                    });
                                  }
                                }
                              }}
                            >
                              {isLocked ? (
                                <span className="flex items-center gap-2">
                                  <Lock className="h-3.5 w-3.5 text-primary-green-500" />
                                  {subItem.title}
                                </span>
                              ) : (
                                <Link
                                  href={subItem.url}
                                  onClick={handleLinkClick}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          const requiredFeature = item.requiredFeature;
          const isLocked =
            requiredFeature && !hasFeatureAccess(requiredFeature);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!isLocked}
                isActive={isCurrentPage}
                tooltip={state === 'collapsed' ? item.title : undefined}
                onClick={(event) => {
                  if (isLocked) {
                    event.preventDefault();
                    if (requiredFeature) {
                      requireFeatureAccess(requiredFeature, {
                        title: 'Upgrade required',
                        message:
                          'Upgrade your subscription to unlock this section.',
                      });
                    }
                  }
                }}
              >
                {isLocked ? (
                  <span className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <Lock className="h-3.5 w-3.5 text-primary-green-500" />
                  </span>
                ) : (
                  <Link href={item.url} onClick={handleLinkClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
