import { HeartPulse, Utensils } from 'lucide-react';

import { KTextarea } from '@/components/shared/form/k-textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DietaryPreference =
  | 'No Restriction'
  | 'Vegetarian'
  | 'Vegan'
  | 'Keto'
  | 'Paleo';

interface BasicInfoSectionProps {
  bodyFatPct?: number;
  dietaryPreference: DietaryPreference;
  notes: string;
  onBodyFatChange: (value?: number) => void;
  onDietaryPreferenceChange: (preference: DietaryPreference) => void;
  onNotesChange: (value: string) => void;
}

export function BasicInfoSection({
  bodyFatPct,
  dietaryPreference,
  notes,
  onBodyFatChange,
  onDietaryPreferenceChange,
  onNotesChange,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="bodyfat" className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-400" />
            Body fat % (optional)
          </Label>
          <Input
            id="bodyfat"
            type="number"
            step="0.1"
            min={2}
            max={70}
            placeholder="e.g., 22.5"
            value={bodyFatPct ?? ''}
            onChange={(e) =>
              onBodyFatChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="shad-select-trigger"
          />
        </div>

        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <Utensils className="h-4 w-4 text-emerald-400" />
            Dietary Preference
          </Label>
          <Select
            value={dietaryPreference}
            onValueChange={(v) =>
              onDietaryPreferenceChange(v as DietaryPreference)
            }
          >
            <SelectTrigger className="w-full shad-select-trigger">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent className="shad-select-content">
              <SelectItem value="No Restriction" className="shad-select-item">
                No Restriction
              </SelectItem>
              <SelectItem value="Vegetarian" className="shad-select-item">
                Vegetarian
              </SelectItem>
              <SelectItem value="Vegan" className="shad-select-item">
                Vegan
              </SelectItem>
              <SelectItem value="Keto" className="shad-select-item">
                Keto
              </SelectItem>
              <SelectItem value="Paleo" className="shad-select-item">
                Paleo
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <KTextarea
        label="Other health conditions / notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
    </div>
  );
}
