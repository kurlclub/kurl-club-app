import { Droplets } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { BloodPanels, DiabeticPanel } from '@/hooks/use-diet-calculator';

import {
  BPPopover,
  DiabeticPopover,
  LipidPopover,
  RenalPopover,
  ThyroidPopover,
} from './blood-work-popovers';

type ThyroidPanel = { tsh?: number; ft4?: number; meds?: string };
type LipidPanel = { ldl?: number; hdl?: number; tg?: number };
type BPPanel = { systolic?: number; diastolic?: number };
type RenalPanel = { egfr?: number; creatinine?: number };

interface BloodWorkSectionProps {
  bloodFlags: BloodPanels;
  diabetic: DiabeticPanel;
  thyroid: ThyroidPanel;
  lipid: LipidPanel;
  bp: BPPanel;
  renal: RenalPanel;
  onBloodFlagsChange: (flags: BloodPanels) => void;
  onDiabeticChange: (data: DiabeticPanel) => void;
  onThyroidChange: (data: ThyroidPanel) => void;
  onLipidChange: (data: LipidPanel) => void;
  onBpChange: (data: BPPanel) => void;
  onRenalChange: (data: RenalPanel) => void;
}

export function BloodWorkSection({
  bloodFlags,
  diabetic,
  thyroid,
  lipid,
  bp,
  renal,
  onBloodFlagsChange,
  onDiabeticChange,
  onThyroidChange,
  onLipidChange,
  onBpChange,
  onRenalChange,
}: BloodWorkSectionProps) {
  const handleDiabeticSave = () => {
    const hasData = !!(
      diabetic.hba1c ||
      diabetic.fastingGlucose ||
      diabetic.postPrandial ||
      diabetic.meds
    );
    onBloodFlagsChange({ ...bloodFlags, diabetic: hasData });
  };

  const handleThyroidSave = () => {
    const hasData = !!(thyroid.tsh || thyroid.ft4 || thyroid.meds);
    onBloodFlagsChange({ ...bloodFlags, hypothyroid: hasData });
  };

  const handleLipidSave = () => {
    const hasData = !!(lipid.ldl || lipid.hdl || lipid.tg);
    onBloodFlagsChange({ ...bloodFlags, dyslipidemia: hasData });
  };

  const handleBPSave = () => {
    const hasData = !!(bp.systolic || bp.diastolic);
    onBloodFlagsChange({ ...bloodFlags, hypertension: hasData });
  };

  const handleRenalSave = () => {
    const hasData = !!(renal.egfr || renal.creatinine);
    onBloodFlagsChange({ ...bloodFlags, renal: hasData });
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <Droplets className="h-4 w-4 text-emerald-400" />
        Blood work conditions
      </Label>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        <DiabeticPopover
          data={diabetic}
          onChange={onDiabeticChange}
          onSave={handleDiabeticSave}
        />
        <ThyroidPopover
          data={thyroid}
          onChange={onThyroidChange}
          onSave={handleThyroidSave}
        />
        <LipidPopover
          data={lipid}
          onChange={onLipidChange}
          onSave={handleLipidSave}
        />
        <BPPopover data={bp} onChange={onBpChange} onSave={handleBPSave} />
        <RenalPopover
          data={renal}
          onChange={onRenalChange}
          onSave={handleRenalSave}
        />
      </div>
    </div>
  );
}
