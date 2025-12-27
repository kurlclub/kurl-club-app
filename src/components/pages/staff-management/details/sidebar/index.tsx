'use client';

import { useEffect, useRef, useState } from 'react';

import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';

import { Breadcrumb, CollapsibleSection } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { StaffDetails, StaffType } from '@/types/staff';

import { CertificationSection } from './certification-section';
import { PersonalInfoSection } from './personal-info-section';
import { StaffHeader } from './staff-header';

type SectionKey = 'personalInfo' | 'certifications';

export function Sidebar({
  isEditing,
  details,
  updateStaffDetail,
  staffRole,
  handleSave,
  toggleEdit,
}: {
  isEditing: boolean;
  details: StaffDetails | null;
  updateStaffDetail: <K extends keyof StaffDetails>(
    key: K,
    value: StaffDetails[K]
  ) => void;
  staffRole: StaffType;
  handleSave: () => void;
  toggleEdit: () => void;
}) {
  const [sectionStates, setSectionStates] = useState<
    Record<SectionKey, boolean>
  >({
    personalInfo: true,
    certifications: true,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
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
      title: 'Personal Info',
      key: 'personalInfo' as SectionKey,
      content: (
        <PersonalInfoSection
          isEditing={isEditing}
          details={details}
          onUpdate={updateStaffDetail}
        />
      ),
    },
    ...(staffRole === 'trainer'
      ? [
          {
            title: 'Certifications',
            key: 'certifications' as SectionKey,
            content: (
              <CertificationSection
                isEditing={isEditing}
                details={details}
                onUpdate={updateStaffDetail}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Button
        onClick={() => setSidebarOpen(true)}
        className="p-3 ml-2 mt-2 sticky top-0 md:hidden"
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
        className={`fixed z-40 w-full max-h-[calc(100vh-80px)] left-0 sm:max-w-[50%] md:max-w-[300px] md:sticky md:top-0 lg:max-w-[336px] h-auto pb-8 bg-primary-blue-500 text-white overflow-y-auto scrollbar-thin border-r border-secondary-blue-500 transform transition-transform duration-300 ease-in-out md:translate-x-0
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-4 md:px-8 sticky top-0 bg-primary-blue-500 py-4 md:py-8 z-20 flex items-start justify-between">
          <div>
            <Breadcrumb
              items={[
                { label: 'Staff Management', href: '/staff-management' },
                { label: 'Staff details' },
              ]}
            />

            <h5 className="text-2xl mt-2 leading-normal font-normal mb-6">
              Staff details
            </h5>

            <StaffHeader
              isEditing={isEditing}
              details={details}
              onUpdate={updateStaffDetail}
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
          {/* </div> */}
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
            <div className="px-8">{content}</div>
          </CollapsibleSection>
        ))}
      </div>
    </>
  );
}
