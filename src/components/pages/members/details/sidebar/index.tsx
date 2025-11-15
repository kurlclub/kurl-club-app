'use client';

import { useEffect, useRef, useState } from 'react';

import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';

import { Breadcrumb, CollapsibleSection } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { MemberDetails } from '@/types/members';

import { BasicDetailsSection } from './basic-details-section';
import { MemberHeader } from './member-header';
import { PersonalInfoSection } from './personal-info-section';

type SectionKey = 'basicDetails' | 'personalInfo';

export function Sidebar({
  isEditing,
  details,
  updateMemberDetail,
  handleSave,
  toggleEdit,
  formOptions,
}: {
  memberId: string;
  isEditing: boolean;
  toggleEdit: () => void;
  details: MemberDetails | null;
  handleSave: () => void;
  updateMemberDetail: <K extends keyof MemberDetails>(
    key: K,
    value: MemberDetails[K]
  ) => void;
  formOptions?: FormOptionsResponse | null;
}) {
  const [sectionStates, setSectionStates] = useState<
    Record<SectionKey, boolean>
  >({
    basicDetails: true,
    personalInfo: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSidebarOpen(isEditing);
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        sidebarOpen &&
        window.innerWidth < 768
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const sections = [
    {
      title: 'Membership & Fitness',
      key: 'basicDetails' as SectionKey,
      content: (
        <BasicDetailsSection
          isEditing={isEditing}
          details={details}
          onUpdate={updateMemberDetail}
          formOptions={formOptions || undefined}
        />
      ),
    },
    {
      title: 'Personal Info',
      key: 'personalInfo' as SectionKey,
      content: (
        <PersonalInfoSection
          isEditing={isEditing}
          details={details}
          onUpdate={updateMemberDetail}
        />
      ),
    },
  ];

  return (
    <>
      <Button
        onClick={() => setSidebarOpen(true)}
        className="p-3 ml-2 mt-2 sticky top-[62px] md:hidden"
      >
        <PanelLeftOpen />
      </Button>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <div
        ref={sidebarRef}
        className={`fixed z-40 left-0 sm:max-w-[50%] md:max-w-[300px] lg:max-w-[336px] w-full h-full md:sticky md:top-0 pb-8 bg-primary-blue-500 text-white overflow-y-auto scrollbar-thin border-r border-secondary-blue-500 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 md:px-8 sticky top-0 bg-primary-blue-500 py-4 md:py-8 z-20 flex items-start justify-between">
          <div>
            <Breadcrumb
              items={[
                { label: 'Members', href: '/members' },
                { label: 'Member details' },
              ]}
            />

            <h5 className="text-2xl mt-2 leading-normal font-normal mb-6">
              Member details
            </h5>

            <MemberHeader
              isEditing={isEditing}
              details={details}
              onUpdate={updateMemberDetail}
            />
          </div>
          <div className="flex items-center gap-2 md:hidden">
            {isEditing ? (
              <Button onClick={handleSave}>Save</Button>
            ) : (
              <Button onClick={toggleEdit} className="h-10" variant="outline">
                Edit
              </Button>
            )}
            <Button onClick={() => setSidebarOpen(false)} className="p-3">
              <PanelRightOpen />
            </Button>
          </div>
        </div>

        {sections.map(({ title, key, content }) => (
          <CollapsibleSection
            key={key}
            title={title}
            isOpen={sectionStates[key]}
            setIsOpen={(isOpen) =>
              setSectionStates((prev) => ({ ...prev, [key]: isOpen }))
            }
          >
            <div className="px-4 md:px-8">{content}</div>
          </CollapsibleSection>
        ))}
      </div>
    </>
  );
}
