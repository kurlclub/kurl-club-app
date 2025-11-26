'use client';

import { useMemo, useState } from 'react';

import { MaintainWeightIcon } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIDietPlanner } from '@/hooks/use-ai-diet-planner';
import {
  type ActivityKey,
  type BloodPanels,
  type DiabeticPanel,
  type Goal,
  type Vitals,
  useDietCalculator,
} from '@/hooks/use-diet-calculator';
import { generatePlanText } from '@/utils/diet-plan-generator';

import { BasicInfoSection } from './diet-form/basic-info-section';
import { BloodWorkSection } from './diet-form/blood-work-section';
import { GoalActivitySection } from './diet-form/goal-activity-section';
import { NutritionSummary } from './diet-form/nutrition-summary';

type ThyroidPanel = { tsh?: number; ft4?: number; meds?: string };
type LipidPanel = { ldl?: number; hdl?: number; tg?: number };
type BPPanel = { systolic?: number; diastolic?: number };
type RenalPanel = { egfr?: number; creatinine?: number };

interface DietPlannerProps {
  vitals: Vitals;
  defaultGoal?: Goal;
  onSave?: (payload: {
    goal: Goal;
    activity: ActivityKey;
    bodyFatPct?: number;
    bloodFlags: BloodPanels;
    panels: {
      diabetic?: DiabeticPanel;
      thyroid?: ThyroidPanel;
      lipid?: LipidPanel;
      bp?: BPPanel;
      renal?: RenalPanel;
    };
    notes?: string;
    prescription: {
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
    };
  }) => void;
}

export default function DietPlanner({
  vitals,
  defaultGoal = 'Fat loss',
  onSave,
}: DietPlannerProps) {
  const [goal, setGoal] = useState<Goal>(defaultGoal);
  const [activityKey, setActivityKey] = useState<ActivityKey>('moderate');
  const [bodyFatPct, setBodyFatPct] = useState<number | undefined>(undefined);
  const [dietaryPreference, setDietaryPreference] = useState<
    'No Restriction' | 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo'
  >('No Restriction');
  const [notes, setNotes] = useState<string>('');

  const [bloodFlags, setBloodFlags] = useState<BloodPanels>({});
  const [diabetic, setDiabetic] = useState<DiabeticPanel>({});
  const [thyroid, setThyroid] = useState<ThyroidPanel>({});
  const [lipid, setLipid] = useState<LipidPanel>({});
  const [bp, setBp] = useState<BPPanel>({});
  const [renal, setRenal] = useState<RenalPanel>({});

  // AI-powered diet planner with manual backup
  const {
    bmr,
    tdee,
    calories,
    proteinG,
    carbsG,
    fatG,
    chartData,
    prescriptionText: aiPrescriptionText,
    useAI,
    isGenerating,
    error,
    generateAIPlan,
  } = useAIDietPlanner({
    vitals,
    goal,
    activityKey,
    bodyFatPct,
    dietaryPreference,
    bloodFlags,
    panels: { diabetic, thyroid, lipid, bp, renal },
    notes,
  });

  // Manual backup calculations
  const manualData = useDietCalculator({
    vitals,
    goal,
    activityKey,
    bloodFlags,
    diabetic,
  });

  const prescriptionText = useMemo(() => {
    if (useAI && aiPrescriptionText) {
      return aiPrescriptionText;
    }
    return generatePlanText({
      vitals,
      goal,
      activityKey,
      bodyFatPct,
      bloodFlags,
      panels: { diabetic, thyroid, lipid, bp, renal },
      notes,
      prescription: { calories, proteinG, carbsG, fatG },
      diabeticTightCarb: manualData.diabeticTightCarb,
      hydration: manualData.hydration,
    });
  }, [
    useAI,
    aiPrescriptionText,
    vitals,
    goal,
    activityKey,
    bodyFatPct,
    bloodFlags,
    diabetic,
    thyroid,
    lipid,
    bp,
    renal,
    notes,
    calories,
    proteinG,
    carbsG,
    fatG,
    manualData.diabeticTightCarb,
    manualData.hydration,
  ]);

  const handleSave = () => {
    onSave?.({
      goal,
      activity: activityKey,
      bodyFatPct,
      bloodFlags,
      panels: { diabetic, thyroid, lipid, bp, renal },
      notes,
      prescription: { calories, proteinG, carbsG, fatG },
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 items-stretch p-6">
      <Card className="bg-primary-blue-400/70 border-primary-blue-400">
        <CardHeader className="px-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <MaintainWeightIcon className="h-5 w-5 text-emerald-400" />
            Diet plan setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <GoalActivitySection
            goal={goal}
            activityKey={activityKey}
            onGoalChange={setGoal}
            onActivityChange={setActivityKey}
          />

          <BasicInfoSection
            bodyFatPct={bodyFatPct}
            dietaryPreference={dietaryPreference}
            notes={notes}
            onBodyFatChange={setBodyFatPct}
            onDietaryPreferenceChange={setDietaryPreference}
            onNotesChange={setNotes}
          />

          <BloodWorkSection
            bloodFlags={bloodFlags}
            diabetic={diabetic}
            thyroid={thyroid}
            lipid={lipid}
            bp={bp}
            renal={renal}
            onBloodFlagsChange={setBloodFlags}
            onDiabeticChange={setDiabetic}
            onThyroidChange={setThyroid}
            onLipidChange={setLipid}
            onBpChange={setBp}
            onRenalChange={setRenal}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={generateAIPlan}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <MaintainWeightIcon className="h-4 w-4" />
                    Regenerate AI Plan
                  </>
                )}
              </Button>
            </div>
            <Button type="button" onClick={handleSave}>
              Save plan
            </Button>
          </div>
          {error && !useAI && (
            <div className="text-amber-400 text-sm mt-2">
              AI failed, switched to manual mode. {error}
            </div>
          )}
          {error && useAI && (
            <div className="text-red-400 text-sm mt-2">{error}</div>
          )}
        </CardContent>
      </Card>

      <NutritionSummary
        goal={goal}
        activityKey={activityKey}
        bmr={bmr}
        tdee={tdee}
        calories={calories}
        proteinG={proteinG}
        carbsG={carbsG}
        fatG={fatG}
        chartData={chartData}
        prescriptionText={prescriptionText}
      />
    </div>
  );
}
