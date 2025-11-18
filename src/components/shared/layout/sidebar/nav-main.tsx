'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { state } = useSidebar();
  const pathname = usePathname();
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
                      tooltip={state === 'collapsed' ? item.title : undefined}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight
                        className={`ml-auto transition-transform duration-200 ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isCurrentPage}
                tooltip={state === 'collapsed' ? item.title : undefined}
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
