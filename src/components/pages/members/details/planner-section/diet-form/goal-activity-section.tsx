import { ActivityIcon, Target } from 'lucide-react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ACTIVITY, ActivityKey, Goal } from '@/hooks/use-diet-calculator';

interface GoalActivitySectionProps {
  goal: Goal;
  activityKey: ActivityKey;
  onGoalChange: (goal: Goal) => void;
  onActivityChange: (activity: ActivityKey) => void;
}

export function GoalActivitySection({
  goal,
  activityKey,
  onGoalChange,
  onActivityChange,
}: GoalActivitySectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <Label className="flex items-center gap-2">
          <Target className="h-4 w-4 text-emerald-400" />
          Goal
        </Label>
        <Select value={goal} onValueChange={(v) => onGoalChange(v as Goal)}>
          <SelectTrigger className="w-full shad-select-trigger">
            <SelectValue placeholder="Select goal" />
          </SelectTrigger>
          <SelectContent className="shad-select-content">
            <SelectItem value="Fat loss" className="shad-select-item">
              Fat loss
            </SelectItem>
            <SelectItem value="Maintenance" className="shad-select-item">
              Maintenance
            </SelectItem>
            <SelectItem value="Lean bulk" className="shad-select-item">
              Lean bulk
            </SelectItem>
            <SelectItem value="Bulk" className="shad-select-item">
              Bulk
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-emerald-400" />
          Activity level
        </Label>
        <Select
          value={activityKey}
          onValueChange={(v) => onActivityChange(v as ActivityKey)}
        >
          <SelectTrigger className="w-full shad-select-trigger">
            <SelectValue>
              {activityKey && ACTIVITY[activityKey]
                ? `${ACTIVITY[activityKey].label} · ${ACTIVITY[activityKey].factor.toFixed(3)}`
                : 'Select activity level'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="shad-select-content">
            {Object.entries(ACTIVITY).map(([k, v]) => (
              <SelectItem key={k} value={k} className="shad-select-item">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {v.label} · {v.factor.toFixed(3)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {v.desc}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
