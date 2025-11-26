'use client';

import { useState } from 'react';

import { Breadcrumb, CollapsibleSection } from '@/components/shared/layout';
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
}: {
  isEditing: boolean;
  details: StaffDetails | null;
  updateStaffDetail: <K extends keyof StaffDetails>(
    key: K,
    value: StaffDetails[K]
  ) => void;
  staffRole: StaffType;
}) {
  const [sectionStates, setSectionStates] = useState<
    Record<SectionKey, boolean>
  >({
    personalInfo: true,
    certifications: true,
  });

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
    <div className="min-w-[336px] max-h-[calc(100vh-80px)] sticky left-0 top-[80px] max-w-[336px] h-auto pb-8 bg-primary-blue-500 text-white overflow-y-auto scrollbar-thin border-r border-secondary-blue-500">
      <div className="px-8 sticky top-0 bg-primary-blue-500 py-8 z-20">
        <Breadcrumb
          items={[
            { label: 'Staff Management', href: '/settings/staff-management' },
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
  );
}
