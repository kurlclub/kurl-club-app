import type {
  ActivityKey,
  BloodPanels,
  DiabeticPanel,
  Goal,
  Vitals,
} from '@/hooks/use-diet-calculator';
import { ACTIVITY } from '@/hooks/use-diet-calculator';

type ThyroidPanel = { tsh?: number; ft4?: number; meds?: string };
type LipidPanel = { ldl?: number; hdl?: number; tg?: number };
type BPPanel = { systolic?: number; diastolic?: number };
type RenalPanel = { egfr?: number; creatinine?: number };

interface GeneratePlanTextProps {
  vitals: Vitals;
  goal: Goal;
  activityKey: ActivityKey;
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
  diabeticTightCarb: boolean;
  hydration: { minMl: number; maxMl: number };
}

export const generateConditionsList = (bloodFlags: BloodPanels): string[] => {
  const conditions: string[] = [];
  if (bloodFlags.diabetic) conditions.push('Diabetes');
  if (bloodFlags.hypothyroid) conditions.push('Hypothyroid');
  if (bloodFlags.dyslipidemia) conditions.push('Dyslipidemia');
  if (bloodFlags.hypertension) conditions.push('Hypertension');
  if (bloodFlags.renal) conditions.push('Renal impairment');
  return conditions;
};

export const generateConditionNotes = (
  bloodFlags: BloodPanels,
  panels: GeneratePlanTextProps['panels']
): string[] => {
  const conditionNotes: string[] = [];

  if (bloodFlags.diabetic && panels.diabetic) {
    const d: string[] = [];
    if (panels.diabetic.hba1c != null)
      d.push(`HbA1c: ${panels.diabetic.hba1c}%`);
    if (panels.diabetic.fastingGlucose != null)
      d.push(`FPG: ${panels.diabetic.fastingGlucose} mg/dL`);
    if (panels.diabetic.postPrandial != null)
      d.push(`PPG: ${panels.diabetic.postPrandial} mg/dL`);
    if (panels.diabetic.meds) d.push(`Meds: ${panels.diabetic.meds}`);
    if (d.length) conditionNotes.push(`Diabetes → ${d.join(', ')}`);
  }

  if (bloodFlags.hypothyroid && panels.thyroid) {
    const t: string[] = [];
    if (panels.thyroid.tsh != null) t.push(`TSH: ${panels.thyroid.tsh} mIU/L`);
    if (panels.thyroid.ft4 != null)
      t.push(`Free T4: ${panels.thyroid.ft4} ng/dL`);
    if (panels.thyroid.meds) t.push(`Meds: ${panels.thyroid.meds}`);
    if (t.length) conditionNotes.push(`Thyroid → ${t.join(', ')}`);
  }

  if (bloodFlags.dyslipidemia && panels.lipid) {
    const l: string[] = [];
    if (panels.lipid.ldl != null) l.push(`LDL: ${panels.lipid.ldl}`);
    if (panels.lipid.hdl != null) l.push(`HDL: ${panels.lipid.hdl}`);
    if (panels.lipid.tg != null) l.push(`TG: ${panels.lipid.tg}`);
    if (l.length) conditionNotes.push(`Lipid profile → ${l.join(', ')}`);
  }

  if (bloodFlags.hypertension && panels.bp) {
    const b: string[] = [];
    if (panels.bp.systolic != null) b.push(`SBP: ${panels.bp.systolic}`);
    if (panels.bp.diastolic != null) b.push(`DBP: ${panels.bp.diastolic}`);
    if (b.length) conditionNotes.push(`Blood pressure → ${b.join(', ')}`);
  }

  if (bloodFlags.renal && panels.renal) {
    const r: string[] = [];
    if (panels.renal.egfr != null) r.push(`eGFR: ${panels.renal.egfr}`);
    if (panels.renal.creatinine != null)
      r.push(`Cr: ${panels.renal.creatinine}`);
    if (r.length) conditionNotes.push(`Renal → ${r.join(', ')}`);
  }

  return conditionNotes;
};

export const generatePlanText = ({
  vitals,
  goal,
  activityKey,
  bodyFatPct,
  bloodFlags,
  panels,
  notes,
  prescription,
  diabeticTightCarb,
  hydration,
}: GeneratePlanTextProps): string => {
  const today = new Date().toLocaleDateString();
  const activity = ACTIVITY[activityKey];
  const conditions = generateConditionsList(bloodFlags);
  const conditionNotes = generateConditionNotes(bloodFlags, panels);

  const lines: string[] = [
    `KurlClub • Nutrition Plan`,
    `Date: ${today}`,
    ``,
    `Member context`,
    `- Goal: ${goal}`,
    `- Activity: ${activity.label} (x${activity.factor.toFixed(2)})`,
    `- Vitals: ${vitals.sex}, ${vitals.age}y, ${vitals.heightCm} cm, ${vitals.weightKg} kg${typeof bodyFatPct === 'number' ? `, BF%: ${bodyFatPct}` : ''}`,
    conditions.length
      ? `- Conditions: ${conditions.join(', ')}`
      : `- Conditions: none reported`,
    notes ? `- Notes: ${notes}` : ``,
    ``,
    `Daily Targets`,
    `- Energy: ${prescription.calories} kcal`,
    `- Protein: ${prescription.proteinG} g`,
    `- Carbs: ${prescription.carbsG} g`,
    `- Fat: ${prescription.fatG} g`,
    ``,
    `Nutrition plan`,
    `- Structure: 3–5 feedings/day. Distribute macros evenly; fiber 25–30 g/day.`,
    bloodFlags.diabetic
      ? `- Carbs: ${diabeticTightCarb ? '≈35%' : '≈45%'} of kcal with low-GI choices; spread across meals.`
      : `- Carbs: base whole-food sources (grains, legumes, fruits, starchy veg).`,
    bloodFlags.dyslipidemia
      ? `- Fats: bias MUFA/PUFA (olive oil, nuts, seeds, fish); limit SFA; consider omega-3 (EPA/DHA).`
      : `- Fats: mix of mono- and polyunsaturated sources; limit deep-fried/ultra-processed.`,
    bloodFlags.renal
      ? `- Protein: cap around ~1.2 g/kg unless cleared; coordinate with physician.`
      : `- Protein: prioritize lean meat, fish, eggs, dairy, legumes.`,
    bloodFlags.hypertension
      ? `- Sodium: keep < 2 g/day; emphasize potassium-rich whole foods.`
      : ``,
    ``,
    `Hydration`,
    `- Target: ${hydration.minMl}–${hydration.maxMl} mL/day (adjust for heat/training).`,
    ``,
    `Example day (split)`,
    `- Breakfast: 25% kcal`,
    `- Lunch: 30% kcal`,
    `- Snack: 10% kcal`,
    `- Dinner: 35% kcal`,
    `Member may choose meals freely to hit the above daily targets.`,
    ``,
  ];

  if (conditionNotes.length) {
    lines.push(
      `Clinical reference`,
      ...conditionNotes.map((c) => `- ${c}`),
      ``
    );
  }

  lines.push(`— End of plan`);
  return lines.filter(Boolean).join('\n');
};
