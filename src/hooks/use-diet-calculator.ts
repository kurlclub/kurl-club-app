import { useMemo } from 'react';

export type Goal = 'Fat loss' | 'Maintenance' | 'Lean bulk' | 'Bulk';
export type Sex = 'Male' | 'Female';
export type ActivityKey =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very'
  | 'athlete';

export type Vitals = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
};

export type BloodPanels = {
  diabetic?: boolean;
  hypothyroid?: boolean;
  dyslipidemia?: boolean;
  hypertension?: boolean;
  renal?: boolean;
};

export type DiabeticPanel = {
  hba1c?: number;
  fastingGlucose?: number;
  postPrandial?: number;
  meds?: string;
};

export const ACTIVITY: Record<
  ActivityKey,
  { label: string; factor: number; desc: string }
> = {
  sedentary: {
    label: 'Sedentary',
    factor: 1.2,
    desc: 'Desk job, little to no exercise',
  },
  light: {
    label: 'Lightly active',
    factor: 1.375,
    desc: '1–3 workouts/week or 6–8k steps/day',
  },
  moderate: {
    label: 'Moderately active',
    factor: 1.55,
    desc: '3–5 workouts/week or 8–12k steps/day',
  },
  very: {
    label: 'Very active',
    factor: 1.725,
    desc: '6–7 workouts/week, physical job',
  },
  athlete: {
    label: 'Athlete',
    factor: 1.9,
    desc: '2 sessions/day or high-volume training',
  },
};

interface UseDietCalculatorProps {
  vitals: Vitals;
  goal: Goal;
  activityKey: ActivityKey;
  bloodFlags: BloodPanels;
  diabetic: DiabeticPanel;
}

export const useDietCalculator = ({
  vitals,
  goal,
  activityKey,
  bloodFlags,
  diabetic,
}: UseDietCalculatorProps) => {
  // BMR calculation using Mifflin-St Jeor equation
  const bmr = useMemo(() => {
    const { sex, weightKg, heightCm, age } = vitals;
    if (sex === 'Male') return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }, [vitals]);

  // TDEE calculation
  const tdee = useMemo(
    () => Math.round(bmr * ACTIVITY[activityKey].factor),
    [bmr, activityKey]
  );

  // Calorie adjustment based on goal
  const calories = useMemo(() => {
    const goalAdjustments: Record<Goal, number> = {
      'Fat loss': -0.2,
      Maintenance: 0,
      'Lean bulk': 0.1,
      Bulk: 0.2,
    };
    let delta = goalAdjustments[goal];
    if (bloodFlags.renal) {
      delta = Math.max(-0.15, Math.min(0.15, delta));
    }
    return Math.round(tdee * (1 + delta));
  }, [tdee, goal, bloodFlags.renal]);

  // Protein calculation
  const { proteinPerKg, proteinG } = useMemo(() => {
    let base =
      goal === 'Fat loss'
        ? 2.0
        : goal === 'Lean bulk'
          ? 1.8
          : goal === 'Bulk'
            ? 1.6
            : 1.7;
    if (bloodFlags.renal) base = Math.min(base, 1.2);
    return {
      proteinPerKg: base,
      proteinG: Math.round(base * vitals.weightKg),
    };
  }, [goal, bloodFlags.renal, vitals.weightKg]);

  // Fat calculation
  const { fatPct, fatG, fatCal } = useMemo(() => {
    let pct = goal === 'Fat loss' ? 0.25 : goal === 'Bulk' ? 0.25 : 0.3;
    if (bloodFlags.hypothyroid) pct += 0.03;
    if (bloodFlags.dyslipidemia) pct -= 0.03;
    pct = Math.min(0.35, Math.max(0.2, pct));

    const cal = Math.round(calories * pct);
    return {
      fatPct: pct,
      fatCal: cal,
      fatG: Math.round(cal / 9),
    };
  }, [goal, bloodFlags.hypothyroid, bloodFlags.dyslipidemia, calories]);

  // Carb calculation
  const { carbsG, carbCal, diabeticTightCarb } = useMemo(() => {
    const a1c = diabetic.hba1c ?? 0;
    const fpg = diabetic.fastingGlucose ?? 0;
    const ppg = diabetic.postPrandial ?? 0;
    const tightCarb = a1c >= 6.5 || fpg >= 126 || ppg >= 200;

    const proteinCal = proteinG * 4;
    const carbCalBase = Math.max(0, calories - proteinCal - fatCal);

    let cal = carbCalBase;
    if (bloodFlags.diabetic) {
      const targetPct = tightCarb ? 0.35 : 0.45;
      cal = Math.round(calories * targetPct);
    }

    return {
      carbCal: cal,
      carbsG: Math.max(0, Math.round(cal / 4)),
      diabeticTightCarb: tightCarb,
    };
  }, [diabetic, bloodFlags.diabetic, calories, proteinG, fatCal]);

  // Hydration calculation
  const hydration = useMemo(
    () => ({
      minMl: Math.round(vitals.weightKg * 30),
      maxMl: Math.round(vitals.weightKg * 35),
    }),
    [vitals.weightKg]
  );

  // Chart data for visualization
  const chartData = useMemo(
    () => [
      { name: 'Protein', value: proteinG * 4, color: '#c0e102' },
      { name: 'Carbs', value: carbsG * 4, color: '#679cf1' },
      { name: 'Fat', value: fatG * 9, color: '#db9e56' },
    ],
    [proteinG, carbsG, fatG]
  );

  return {
    bmr,
    tdee,
    calories,
    proteinPerKg,
    proteinG,
    fatPct,
    fatG,
    fatCal,
    carbsG,
    carbCal,
    diabeticTightCarb,
    hydration,
    chartData,
    prescription: { calories, proteinG, carbsG, fatG },
  };
};
