'use client';

import { Clock, PenLine, TrendingUp, User2 } from 'lucide-react';

import { KInput } from '@/components/shared/form/k-input';
import { KSelect } from '@/components/shared/form/k-select';
import { KTextarea } from '@/components/shared/form/k-textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  getDifficultyColor,
  getInitials,
  getProfilePictureSrc,
} from '@/lib/utils';
import { Member } from '@/types/members';
import type { WorkoutPlan } from '@/types/workoutplan';

interface OverviewProps {
  plan: WorkoutPlan;
  planMembers?: Member[];
  isEditMode: boolean;
  isNewPlan?: boolean;
  onUpdatePlan: (updatedPlan: WorkoutPlan) => void;
  onImmediateUpdate: (updatedPlan: WorkoutPlan) => void;
  onDelete: () => void;
  onEdit: () => void;
  onShowMembers: () => void;
}

export function Overview({
  plan,
  planMembers = [],
  isEditMode,
  isNewPlan = false,
  onUpdatePlan,
  onImmediateUpdate,
  onEdit,
  onShowMembers,
}: OverviewProps) {
  const handleDefaultChange = (checked: boolean) => {
    const updatedPlan = { ...plan, isDefault: checked };

    if (isNewPlan) {
      onUpdatePlan(updatedPlan);
    } else {
      onImmediateUpdate(updatedPlan);
    }
  };

  const renderOverviewCard = (data: WorkoutPlan) => (
    <Card className="w-full bg-secondary-blue-500 border-secondary-blue-600 text-white rounded-md">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl leading-tight font-medium">{data.planName}</h1>
          <button
            className="text-zinc-400 hover:text-primary-green-200 transition-colors"
            onClick={onEdit}
          >
            <PenLine className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[15px] text-zinc-200 font-light leading-relaxed">
          {data.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <User2 className="w-6 h-6 text-primary-blue-200 shrink-0" />
            <div>
              <p className="text-primary-blue-50 text-sm">Member strength</p>
              <div
                className="flex items-center cursor-pointer"
                onClick={onShowMembers}
              >
                <div className="flex -space-x-2">
                  {planMembers.slice(0, 3).map((member) => (
                    <Avatar
                      key={member.id}
                      className="border border-neutral-300 w-5 h-5"
                    >
                      <AvatarFallback className="bg-primary-blue-400 text-[10px]">
                        {getInitials(member.name)}
                      </AvatarFallback>
                      <AvatarImage
                        src={getProfilePictureSrc(
                          member.profilePicture,
                          member.avatar
                        )}
                        alt={member.name}
                      />
                    </Avatar>
                  ))}
                </div>
                {planMembers.length > 3 && (
                  <span className="ml-1 text-sm text-semantic-blue-500 underline">
                    + {planMembers.length - 3} others
                  </span>
                )}
                {planMembers.length === 0 && (
                  <span className="text-sm text-gray-400">
                    No members assigned
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator
            orientation="vertical"
            className="h-12 hidden sm:block bg-primary-blue-400"
          />

          <div className="flex items-start gap-3">
            <TrendingUp className="w-6 h-6 text-primary-blue-200 shrink-0" />
            <div>
              <p className="text-primary-blue-50 text-sm">Training level</p>
              <Badge
                variant="secondary"
                className={`${getDifficultyColor(plan.difficultyLevel)} text-xs rounded-2xl px-2 py-1 capitalize`}
              >
                {plan.difficultyLevel}
              </Badge>
            </div>
          </div>

          <Separator
            orientation="vertical"
            className="h-12 hidden sm:block bg-primary-blue-400"
          />

          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-primary-blue-200 shrink-0" />
            <div>
              <p className="text-primary-blue-50 text-sm">Duration</p>
              <p className="text-sm text-white">{data.duration} Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2>Basic details</h2>
        <div className="flex items-center gap-2">
          <span>Set as default</span>
          <Switch
            checked={plan.isDefault}
            onCheckedChange={handleDefaultChange}
            className="data-[state=checked]:bg-primary-green-500"
          />
        </div>
      </div>
      {isEditMode ? (
        <div className="space-y-4">
          <KInput
            label="Name"
            placeholder=" "
            value={plan.planName}
            onChange={(e) =>
              onUpdatePlan({ ...plan, planName: e.target.value })
            }
            disabled={!isEditMode}
            mandetory
          />

          <KTextarea
            label="Description"
            value={plan.description}
            onChange={(e) =>
              onUpdatePlan({ ...plan, description: e.target.value })
            }
            disabled={!isEditMode}
          />

          <div className="flex flex-col md:flex-row gap-4">
            <KSelect
              label="Difficulty level"
              value={plan.difficultyLevel}
              onValueChange={(value) =>
                onUpdatePlan({
                  ...plan,
                  difficultyLevel: value as WorkoutPlan['difficultyLevel'],
                })
              }
              options={[
                { label: 'Beginner', value: 'beginner' },
                { label: 'Intermediate', value: 'intermediate' },
                { label: 'Advanced', value: 'advanced' },
              ]}
              className="border-white! rounded-lg!"
            />

            <KInput
              label="Duration (days)"
              type="number"
              placeholder={undefined}
              value={plan.duration}
              onChange={(e) =>
                onUpdatePlan({
                  ...plan,
                  duration: Number.parseInt(e.target.value),
                })
              }
              disabled={!isEditMode}
              mandetory
            />
          </div>
        </div>
      ) : (
        <>{renderOverviewCard(plan)}</>
      )}
    </>
  );
}
