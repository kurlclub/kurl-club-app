'use client';

import { useEffect, useState } from 'react';

import Contents from '@/components/pages/staff-management/details/contents';
import { Sidebar } from '@/components/pages/staff-management/details/sidebar';
import { AppLoader } from '@/components/shared/loaders';
import { useStaffDetails } from '@/hooks/use-staff-details';
import { StaffType } from '@/types/staff';

interface StaffDetailsPageProps {
  params: Promise<{ role: StaffType; userId: string }>;
}

export default function StaffDetailsPage({ params }: StaffDetailsPageProps) {
  const [staffId, setStaffId] = useState<string>('');
  const [staffRole, setStaffRole] = useState<StaffType>('staff');

  useEffect(() => {
    params.then(({ userId, role }) => {
      setStaffId(userId);
      setStaffRole(role);
    });
  }, [params]);

  const {
    isEditing,
    isSaving,
    handleSave,
    toggleEdit,
    details,
    loading,
    error,
    updateStaffDetail,
  } = useStaffDetails(staffId, staffRole);

  if (loading) return <AppLoader />;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="flex h-full min-w-0 flex-auto gap-4 bg-background-dark p-0 md:gap-0">
      <Sidebar
        isEditing={isEditing}
        isSaving={isSaving}
        details={details}
        updateStaffDetail={updateStaffDetail}
        staffRole={staffRole}
        handleSave={handleSave}
        toggleEdit={toggleEdit}
      />
      <Contents
        staffRole={staffRole}
        staffId={staffId}
        isEditing={isEditing}
        isSaving={isSaving}
        handleSave={handleSave}
        toggleEdit={toggleEdit}
      />
    </main>
  );
}
