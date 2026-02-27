import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TabItem } from '@/components/shared/form/k-tabs';

export function useTabState(tabs: TabItem[], defaultTab: string) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(
    tabs.some((tab) => tab.id === queryTab) ? queryTab! : defaultTab
  );

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);

    if (tabId === defaultTab) {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tabId);
    }

    router.push(url.toString(), { scroll: false });
  };

  useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(
        tabs.some((tab) => tab.id === queryTab) ? queryTab! : defaultTab
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTab]);

  return { activeTab, handleTabChange };
}
