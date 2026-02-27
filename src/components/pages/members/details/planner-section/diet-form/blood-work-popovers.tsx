import { useState } from 'react';

import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DiabeticPanel } from '@/hooks/use-diet-calculator';

type ThyroidPanel = { tsh?: number; ft4?: number; meds?: string };
type LipidPanel = { ldl?: number; hdl?: number; tg?: number };
type BPPanel = { systolic?: number; diastolic?: number };
type RenalPanel = { egfr?: number; creatinine?: number };

interface DiabeticPopoverProps {
  data: DiabeticPanel;
  onChange: (data: DiabeticPanel) => void;
  onSave: () => void;
}

export function DiabeticPopover({
  data,
  onChange,
  onSave,
}: DiabeticPopoverProps) {
  const [open, setOpen] = useState(false);
  const [originalData, setOriginalData] = useState<DiabeticPanel>(data);
  const hasData =
    data.hba1c || data.fastingGlucose || data.postPrandial || data.meds;

  const handleOpen = () => {
    setOriginalData(data);
    setOpen(true);
  };

  const handleCancel = () => {
    onChange(originalData);
    setOpen(false);
  };

  const handleSave = () => {
    onSave();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => (isOpen ? handleOpen() : setOpen(false))}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${hasData ? 'bg-primary-green-100 border-primary-green-800 text-black' : 'bg-secondary-blue-500'}`}
        >
          {hasData && <Check className="h-4 w-4" />}
          Diabetes
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-secondary-blue-600 border-primary-blue-400 shadow-lg">
        <div className="space-y-4">
          <h4 className="font-medium">Diabetes details</h4>
          <div className="grid gap-3 grid-cols-2">
            <div className="grid gap-1.5">
              <Label>% HbA1c</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 7.2"
                value={data.hba1c ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    hba1c: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Fasting glucose (mg/dL)</Label>
              <Input
                type="number"
                placeholder="e.g., 110"
                value={data.fastingGlucose ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    fastingGlucose: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Postprandial (mg/dL)</Label>
              <Input
                type="number"
                placeholder="e.g., 160"
                value={data.postPrandial ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    postPrandial: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Medications</Label>
              <Input
                placeholder="e.g., Metformin, Insulin"
                value={data.meds ?? ''}
                onChange={(e) => onChange({ ...data, meds: e.target.value })}
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
          </div>
          <p className="text-xs text-white/80">
            If HbA1c ≥ 6.5% or FPG ≥ 126 mg/dL, carbs are tightened to 35% of
            calories.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ThyroidPopoverProps {
  data: ThyroidPanel;
  onChange: (data: ThyroidPanel) => void;
  onSave: () => void;
}

export function ThyroidPopover({
  data,
  onChange,
  onSave,
}: ThyroidPopoverProps) {
  const [open, setOpen] = useState(false);
  const [originalData, setOriginalData] = useState<ThyroidPanel>(data);
  const hasData = data.tsh || data.ft4 || data.meds;

  const handleOpen = () => {
    setOriginalData(data);
    setOpen(true);
  };

  const handleCancel = () => {
    onChange(originalData);
    setOpen(false);
  };

  const handleSave = () => {
    onSave();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => (isOpen ? handleOpen() : setOpen(false))}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${hasData ? 'bg-primary-green-100 border-primary-green-800 text-black' : 'bg-secondary-blue-500'}`}
        >
          {hasData && <Check className="h-4 w-4" />}
          Hypothyroid
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-secondary-blue-700 border-primary-blue-400">
        <div className="space-y-4">
          <h4 className="font-medium">Thyroid details</h4>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>TSH (mIU/L)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.tsh ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    tsh: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Free T4 (ng/dL)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.ft4 ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    ft4: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Medications</Label>
              <Input
                placeholder="Levothyroxine dose..."
                value={data.meds ?? ''}
                onChange={(e) => onChange({ ...data, meds: e.target.value })}
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface LipidPopoverProps {
  data: LipidPanel;
  onChange: (data: LipidPanel) => void;
  onSave: () => void;
}

export function LipidPopover({ data, onChange, onSave }: LipidPopoverProps) {
  const [open, setOpen] = useState(false);
  const [originalData, setOriginalData] = useState<LipidPanel>(data);
  const hasData = data.ldl || data.hdl || data.tg;

  const handleOpen = () => {
    setOriginalData(data);
    setOpen(true);
  };

  const handleCancel = () => {
    onChange(originalData);
    setOpen(false);
  };

  const handleSave = () => {
    onSave();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => (isOpen ? handleOpen() : setOpen(false))}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${hasData ? 'bg-primary-green-100 border-primary-green-800 text-black' : 'bg-secondary-blue-500'}`}
        >
          {hasData && <Check className="h-4 w-4" />}
          Dyslipidemia
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-secondary-blue-700 border-primary-blue-400">
        <div className="space-y-4">
          <h4 className="font-medium">Lipid profile</h4>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>LDL (mg/dL)</Label>
              <Input
                type="number"
                value={data.ldl ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    ldl: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>HDL (mg/dL)</Label>
              <Input
                type="number"
                value={data.hdl ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    hdl: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Triglycerides (mg/dL)</Label>
              <Input
                type="number"
                value={data.tg ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    tg: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
          </div>
          <p className="text-xs text-white/80">
            Fats are slightly lowered; recommend MUFA/PUFA and fiber ≥
            25–30g/day.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface BPPopoverProps {
  data: BPPanel;
  onChange: (data: BPPanel) => void;
  onSave: () => void;
}

export function BPPopover({ data, onChange, onSave }: BPPopoverProps) {
  const [open, setOpen] = useState(false);
  const [originalData, setOriginalData] = useState<BPPanel>(data);
  const hasData = data.systolic || data.diastolic;

  const handleOpen = () => {
    setOriginalData(data);
    setOpen(true);
  };

  const handleCancel = () => {
    onChange(originalData);
    setOpen(false);
  };

  const handleSave = () => {
    onSave();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => (isOpen ? handleOpen() : setOpen(false))}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${hasData ? 'bg-primary-green-100 border-primary-green-800 text-black' : 'bg-secondary-blue-500'}`}
        >
          {hasData && <Check className="h-4 w-4" />}
          Hypertension
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-secondary-blue-700 border-primary-blue-400">
        <div className="space-y-4">
          <h4 className="font-medium">Blood pressure</h4>
          <div className="grid gap-3 grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Systolic (mmHg)</Label>
              <Input
                type="number"
                value={data.systolic ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    systolic: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Diastolic (mmHg)</Label>
              <Input
                type="number"
                value={data.diastolic ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    diastolic: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
          </div>
          <p className="text-xs text-white/80">
            Prioritize sodium less than 2g/day, potassium-rich whole foods, and
            aerobic work per plan.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface RenalPopoverProps {
  data: RenalPanel;
  onChange: (data: RenalPanel) => void;
  onSave: () => void;
}

export function RenalPopover({ data, onChange, onSave }: RenalPopoverProps) {
  const [open, setOpen] = useState(false);
  const [originalData, setOriginalData] = useState<RenalPanel>(data);
  const hasData = data.egfr || data.creatinine;

  const handleOpen = () => {
    setOriginalData(data);
    setOpen(true);
  };

  const handleCancel = () => {
    onChange(originalData);
    setOpen(false);
  };

  const handleSave = () => {
    onSave();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => (isOpen ? handleOpen() : setOpen(false))}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${hasData ? 'bg-primary-green-100 border-primary-green-800 text-black' : 'bg-secondary-blue-500'}`}
        >
          {hasData && <Check className="h-4 w-4" />}
          Renal impairment
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-secondary-blue-700 border-primary-blue-400">
        <div className="space-y-4">
          <h4 className="font-medium">Renal function</h4>
          <div className="grid gap-3 grid-cols-2">
            <div className="grid gap-1.5">
              <Label>eGFR (mL/min/1.73m²)</Label>
              <Input
                type="number"
                step="0.1"
                value={data.egfr ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    egfr: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Creatinine (mg/dL)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.creatinine ?? ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    creatinine: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="shad-select-trigger bg-secondary-blue-400/45!"
              />
            </div>
          </div>
          <p className="text-xs text-white/80">
            Protein capped at 1.2 g/kg unless cleared by clinician. Hydration
            and potassium restrictions per stage.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
