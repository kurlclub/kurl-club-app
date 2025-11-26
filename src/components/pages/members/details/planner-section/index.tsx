'use client';

import { useState } from 'react';

import { RefreshCw } from 'lucide-react';

import { KTabs, TabItem } from '@/components/shared/form/k-tabs';
import { Button } from '@/components/ui/button';
import { calculateAge } from '@/lib/utils';
import { MemberDetails } from '@/types/members';

import DietPlanner from './diet-planner';
import { WorkoutPlans } from './workout-plans';

interface PlannerSectionProps {
  memberDetails: MemberDetails | null;
}

export default function PlannerSection({ memberDetails }: PlannerSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('workout');
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const vitals = memberDetails
    ? {
        sex: (memberDetails.gender === 'male' ? 'Male' : 'Female') as
          | 'Male'
          | 'Female',
        age: calculateAge(memberDetails.dob),
        heightCm: memberDetails.height,
        weightKg: memberDetails.weight,
      }
    : null;

  const handleClick = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 1000);
  };

  const tabs: TabItem[] = [
    { id: 'workout', label: 'Workout plans' },
    { id: 'diet', label: 'Diet plans' },
  ];

  return (
    <div className="bg-secondary-blue-500 text-white mt-4 rounded-lg">
      <div className="flex justify-between items-center px-6 pt-3 pb-4">
        <h6 className="text-base leading-normal font-normal text-white">
          Diet & workouts
        </h6>
        <Button
          variant="secondary"
          onClick={handleClick}
          className="group p-0 md:h-[46px] md:px-5 md:py-4"
        >
          <RefreshCw
            className={`text-primary-blue-200 group-hover:text-primary-green-400 transition 
          ${isRotating ? 'animate-spin text-primary-green-400' : ''}`}
          />
        </Button>
      </div>

      <KTabs
        items={tabs}
        variant="underline"
        value={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'workout' ? (
        <WorkoutPlans />
      ) : vitals ? (
        <DietPlanner vitals={vitals} />
      ) : (
        <div className="p-6 text-center text-primary-blue-100">
          <p>
            Member data incomplete. Please update height, weight, gender, and
            date of birth to generate diet plans.
          </p>
        </div>
      )}
    </div>
  );
}
