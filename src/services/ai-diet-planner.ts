import type {
  ActivityKey,
  BloodPanels,
  DiabeticPanel,
  Goal,
  Vitals,
} from '@/hooks/use-diet-calculator';
import { generateAIContent } from '@/services/ai';

type ThyroidPanel = { tsh?: number; ft4?: number; meds?: string };
type LipidPanel = { ldl?: number; hdl?: number; tg?: number };
type BPPanel = { systolic?: number; diastolic?: number };
type RenalPanel = { egfr?: number; creatinine?: number };

export interface DietPlannerInput {
  vitals: Vitals;
  goal: Goal;
  activityKey: ActivityKey;
  bodyFatPct?: number;
  dietaryPreference: string;
  bloodFlags: BloodPanels;
  panels: {
    diabetic?: DiabeticPanel;
    thyroid?: ThyroidPanel;
    lipid?: LipidPanel;
    bp?: BPPanel;
    renal?: RenalPanel;
  };
  notes?: string;
}

export interface DietPlanResponse {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  bmr: number;
  tdee: number;
  prescriptionText: string;
  chartData: Array<{ name: string; value: number; color: string }>;
}

const buildHealthConditionsText = (
  bloodFlags: BloodPanels,
  panels: DietPlannerInput['panels']
): string => {
  const conditions: string[] = [];

  if (bloodFlags.diabetic && panels.diabetic) {
    const diabeticInfo = [];
    if (panels.diabetic.hba1c)
      diabeticInfo.push(`HbA1c: ${panels.diabetic.hba1c}%`);
    if (panels.diabetic.fastingGlucose)
      diabeticInfo.push(`FPG: ${panels.diabetic.fastingGlucose} mg/dL`);
    if (panels.diabetic.meds)
      diabeticInfo.push(`Medications: ${panels.diabetic.meds}`);
    conditions.push(`Diabetes (${diabeticInfo.join(', ')})`);
  }

  if (bloodFlags.hypothyroid && panels.thyroid) {
    const thyroidInfo = [];
    if (panels.thyroid.tsh)
      thyroidInfo.push(`TSH: ${panels.thyroid.tsh} mIU/L`);
    if (panels.thyroid.meds)
      thyroidInfo.push(`Medications: ${panels.thyroid.meds}`);
    conditions.push(`Hypothyroid (${thyroidInfo.join(', ')})`);
  }

  if (bloodFlags.hypertension && panels.bp) {
    const bpInfo = [];
    if (panels.bp.systolic && panels.bp.diastolic) {
      bpInfo.push(`BP: ${panels.bp.systolic}/${panels.bp.diastolic} mmHg`);
    }
    conditions.push(`Hypertension (${bpInfo.join(', ')})`);
  }

  if (bloodFlags.dyslipidemia && panels.lipid) {
    const lipidInfo = [];
    if (panels.lipid.ldl) lipidInfo.push(`LDL: ${panels.lipid.ldl}`);
    if (panels.lipid.hdl) lipidInfo.push(`HDL: ${panels.lipid.hdl}`);
    conditions.push(`Dyslipidemia (${lipidInfo.join(', ')})`);
  }

  if (bloodFlags.renal && panels.renal) {
    const renalInfo = [];
    if (panels.renal.egfr) renalInfo.push(`eGFR: ${panels.renal.egfr}`);
    conditions.push(`Renal impairment (${renalInfo.join(', ')})`);
  }

  return conditions.length > 0 ? conditions.join('; ') : 'None reported';
};

export const generateAIDietPlan = async (
  input: DietPlannerInput
): Promise<DietPlanResponse> => {
  const healthConditions = buildHealthConditionsText(
    input.bloodFlags,
    input.panels
  );

  const prompt = `You are a professional nutritionist. Create a concise but comprehensive diet plan with EXACT calculations and Kerala-based food recommendations. Use a professional but simple and motivational tone.

  CLIENT PROFILE:
  - Demographics: ${input.vitals.sex}, ${input.vitals.age} years, ${input.vitals.heightCm}cm, ${input.vitals.weightKg}kg
  - Body Fat: ${input.bodyFatPct ? `${input.bodyFatPct}%` : 'Not specified'}
  - Goal: ${input.goal}
  - Activity Level: ${input.activityKey}
  - Dietary Preference: ${input.dietaryPreference}
  - Health Conditions: ${healthConditions}
  - Additional Notes: ${input.notes || 'None'}

  CALCULATION REQUIREMENTS:
  1. Calculate BMR using Mifflin-St Jeor equation
  2. Calculate TDEE based on activity level
  3. Adjust calories for goal: Fat loss (-20%), Maintenance (0%), Lean bulk (+10%), Bulk (+20%)
  4. Calculate macros: Protein (1.6–2.0g/kg based on goal), Fat (25–30% of calories), Carbs (remainder)
  5. Apply health condition adjustments if needed

  REQUIRED OUTPUT FORMAT (START DIRECTLY WITH NUMBERS, NO INTRO OR EXTRA TEXT. MUST FOLLOW THIS FORMAT EXACTLY — WHATSAPP/TXT FRIENDLY):
  BMR: [number]
  TDEE: [number]
  CALORIES: [number]
  PROTEIN: [number]g
  CARBS: [number]g
  FAT: [number]g

  DETAILED PLAN:

  == Suggested Daily Food Sources (Kerala-Based) ==
  • Protein: [list]
  • Carbs: [list]
  • Fat: [list]

  == Meal Split Guidance ==
  • Breakfast: [guidance with target macros e.g., 25g protein / 60g carbs / 15g fat]
  • Lunch: [guidance with target macros]
  • Evening Snack: [guidance with target macros]
  • Dinner: [guidance with target macros]
  • Pre/Post Workout: [guidance with target macros]

  == Hydration ==
  • Daily target: [liters based on weight and activity]

  == Foods to Avoid ==
  • [list]

  == Supplements (Optional) ==
  • [list]

  [motivational note]

  IMPORTANT:
  1. Do NOT add greetings, disclaimers, or introductory lines before the numbers.
  2. The response must begin directly with "BMR: [number]".
  3. Do NOT use Markdown formatting (*, **, etc.).
  4. Use only simple ASCII characters for headers (==) and bullet points (•).
  5. Keep the plan concise, practical, and straight to the point so it can be shared via WhatsApp or PDF easily.
  6. Always keep recommendations Kerala-based with available food options.`;

  const response = await generateAIContent(prompt);

  if (response.error) {
    throw new Error(response.error);
  }

  // Parse AI response to extract calculations
  const lines = response.text.split('\n');
  let bmr = 0,
    tdee = 0,
    calories = 0,
    proteinG = 0,
    carbsG = 0,
    fatG = 0;

  for (const line of lines) {
    if (line.startsWith('BMR:')) bmr = parseInt(line.match(/\d+/)?.[0] || '0');
    if (line.startsWith('TDEE:'))
      tdee = parseInt(line.match(/\d+/)?.[0] || '0');
    if (line.startsWith('CALORIES:'))
      calories = parseInt(line.match(/\d+/)?.[0] || '0');
    if (line.startsWith('PROTEIN:'))
      proteinG = parseInt(line.match(/\d+/)?.[0] || '0');
    if (line.startsWith('CARBS:'))
      carbsG = parseInt(line.match(/\d+/)?.[0] || '0');
    if (line.startsWith('FAT:')) fatG = parseInt(line.match(/\d+/)?.[0] || '0');
  }

  const chartData = [
    { name: 'Protein', value: proteinG * 4, color: '#c0e102' },
    { name: 'Carbs', value: carbsG * 4, color: '#679cf1' },
    { name: 'Fat', value: fatG * 9, color: '#db9e56' },
  ];

  return {
    bmr,
    tdee,
    calories,
    proteinG,
    carbsG,
    fatG,
    prescriptionText: response.text,
    chartData,
  };
};
