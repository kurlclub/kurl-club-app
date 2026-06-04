'use client';

import { useCallback, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { ImportMembersResult, importMembersCSV } from '@/services/member';

type Step = 'upload' | 'map' | 'results';

type ApiField = {
  apiName: string;
  label: string;
  required: boolean;
};

const API_FIELDS: ApiField[] = [
  { apiName: 'Name', label: 'Name', required: true },
  { apiName: 'Number', label: 'Phone Number', required: false },
  { apiName: 'ISD Code', label: 'ISD Code', required: false },
  { apiName: 'Email', label: 'Email', required: false },
  { apiName: 'Gender', label: 'Gender', required: false },
  { apiName: 'Conversion Date', label: 'Date of Joining', required: false },
  { apiName: 'DOB', label: 'Date of Birth', required: false },
  { apiName: 'Address', label: 'Address', required: false },
  {
    apiName: 'Emergency Contact No',
    label: 'Emergency Contact',
    required: false,
  },
  { apiName: 'Code', label: 'Member Code', required: false },
];

const NONE_VALUE = '__none__';

interface MemberImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: number;
}

export function MemberImportDialog({
  isOpen,
  onClose,
  gymId,
}: MemberImportDialogProps) {
  const queryClient = useQueryClient();
  const { formOptions } = useGymFormOptions(gymId);

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileRows, setFileRows] = useState<Record<string, string>[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [mapErrors, setMapErrors] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportMembersResult | null>(
    null
  );
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: '',
        raw: false,
      });

      if (rows.length === 0) return;

      const headers = Object.keys(rows[0]);
      setFileHeaders(headers);
      setFileRows(rows);
      setFileName(file.name);

      // Auto-map: match api field label / apiName to file header (case-insensitive)
      const autoMap: Record<string, string> = {};
      API_FIELDS.forEach(({ apiName, label }) => {
        const match = headers.find(
          (h) =>
            h.toLowerCase() === apiName.toLowerCase() ||
            h.toLowerCase() === label.toLowerCase() ||
            h.toLowerCase().includes(apiName.toLowerCase())
        );
        if (match) autoMap[apiName] = match;
      });
      setMapping(autoMap);
      setStep('map');
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleImport = async () => {
    const errors: Record<string, string> = {};
    API_FIELDS.filter((f) => f.required).forEach(({ apiName, label }) => {
      if (!mapping[apiName]) errors[apiName] = `${label} is required`;
    });
    if (!selectedPlanId) errors['plan'] = 'Membership plan is required';
    if (Object.keys(errors).length > 0) {
      setMapErrors(errors);
      return;
    }
    setMapErrors({});
    setIsImporting(true);

    try {
      const csvBlob = buildMappedCsv(fileRows, mapping);
      const result = await importMembersCSV(
        csvBlob,
        gymId,
        Number(selectedPlanId)
      );
      if (result.success && result.data) {
        setImportResult(result.data);
        await queryClient.invalidateQueries({ queryKey: ['gymMembers'] });
      } else {
        setImportError(result.error ?? 'Import failed');
      }
    } catch {
      setImportError('Unexpected error during import');
    } finally {
      setIsImporting(false);
      setStep('results');
    }
  };

  const buildMappedCsv = (
    rows: Record<string, string>[],
    fieldMapping: Record<string, string>
  ): Blob => {
    const apiHeaders = API_FIELDS.map((f) => f.apiName).filter(
      (apiName) => fieldMapping[apiName]
    );
    const mapped = rows.map((row) =>
      apiHeaders.reduce(
        (obj, apiField) => {
          obj[apiField] = row[fieldMapping[apiField]] ?? '';
          return obj;
        },
        {} as Record<string, string>
      )
    );
    const sheet = XLSX.utils.json_to_sheet(mapped, { header: apiHeaders });
    const csv = XLSX.utils.sheet_to_csv(sheet);
    return new Blob([csv], { type: 'text/csv' });
  };

  const downloadErrorReport = () => {
    if (!importResult?.errors?.length) return;
    const rows = importResult.errors.map((r) => ({
      Row: r.row,
      Name: r.name,
      Reason: r.reason,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep('upload');
    setFileName('');
    setFileRows([]);
    setFileHeaders([]);
    setMapping({});
    setSelectedPlanId('');
    setMapErrors({});
    setImportResult(null);
    setImportError('');
    onClose();
  };

  const stepLabels = ['Upload', 'Map Columns', 'Results'];
  const stepIndex = step === 'upload' ? 0 : step === 'map' ? 1 : 2;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[680px] bg-secondary-blue-700 border-primary-blue-400 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Members</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    i < stepIndex
                      ? 'bg-primary-green-500 text-white'
                      : i === stepIndex
                        ? 'bg-primary-green-700 text-white ring-2 ring-primary-green-500'
                        : 'bg-secondary-blue-500 text-secondary-blue-200'
                  }`}
                >
                  {i < stepIndex ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-sm ${i === stepIndex ? 'text-white font-medium' : 'text-secondary-blue-300'}`}
                >
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className="flex-1 h-px w-8 bg-secondary-blue-500" />
              )}
            </div>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary-green-500 bg-primary-green-700/10'
                  : 'border-secondary-blue-500 hover:border-secondary-blue-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-secondary-blue-300" />
              <p className="text-lg font-medium mb-1">
                {isDragging ? 'Drop file here' : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-secondary-blue-300 mb-4">
                Supports CSV, XLS, XLSX
              </p>
              <Button variant="outline" size="sm" type="button">
                <Upload className="w-4 h-4 mr-1" /> Browse file
              </Button>
            </div>
          )}

          {/* Step 2: Map Columns */}
          {step === 'map' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-secondary-blue-300 bg-secondary-blue-600/50 rounded-md px-3 py-2">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span className="truncate">{fileName}</span>
                <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                  {fileRows.length} rows
                </Badge>
              </div>

              {/* Membership Plan */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  Membership Plan <span className="text-alert-red-500">*</span>
                </Label>
                <Select
                  value={selectedPlanId}
                  onValueChange={setSelectedPlanId}
                >
                  <SelectTrigger className="shad-select-trigger">
                    <SelectValue placeholder="Select a membership plan" />
                  </SelectTrigger>
                  <SelectContent className="shad-select-content">
                    {formOptions?.membershipPlans?.map((plan) => (
                      <SelectItem
                        key={plan.membershipPlanId}
                        value={String(plan.membershipPlanId)}
                        className="shad-select-item"
                      >
                        {plan.planName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mapErrors['plan'] && (
                  <p className="text-alert-red-500 text-xs px-1">
                    {mapErrors['plan']}
                  </p>
                )}
              </div>

              <div className="text-sm text-secondary-blue-300">
                Match your file&apos;s columns to the fields below. Required
                fields must be mapped.
              </div>

              <div className="space-y-3">
                {API_FIELDS.map(({ apiName, label, required }) => (
                  <div key={apiName} className="flex items-center gap-3">
                    <div className="w-[180px] shrink-0">
                      <span className="text-sm font-medium">{label}</span>
                      {required && (
                        <span className="text-alert-red-500 ml-1">*</span>
                      )}
                    </div>
                    <ArrowRightLeft
                      className={`w-4 h-4 shrink-0 ${
                        mapping[apiName]
                          ? 'text-neutral-green-500'
                          : 'text-secondary-blue-400'
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <Select
                        value={mapping[apiName] ?? NONE_VALUE}
                        onValueChange={(val) =>
                          setMapping((prev) => {
                            const next = { ...prev };
                            if (val === NONE_VALUE) delete next[apiName];
                            else next[apiName] = val;
                            return next;
                          })
                        }
                      >
                        <SelectTrigger className="shad-select-trigger h-8 text-sm">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent className="shad-select-content">
                          <SelectItem
                            value={NONE_VALUE}
                            className="shad-select-item text-secondary-blue-300"
                          >
                            — Not mapped —
                          </SelectItem>
                          {fileHeaders.map((header) => (
                            <SelectItem
                              key={header}
                              value={header}
                              className="shad-select-item"
                            >
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mapErrors[apiName] && (
                        <p className="text-alert-red-500 text-xs px-1">
                          {mapErrors[apiName]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'results' && (
            <div className="space-y-4">
              {importError ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-alert-red-500/10 border border-alert-red-500/30">
                  <AlertCircle className="w-5 h-5 text-alert-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-alert-red-400">
                      Import failed
                    </p>
                    <p className="text-sm text-secondary-blue-300 mt-1">
                      {importError}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {importResult?.message && (
                    <p className="text-sm text-secondary-blue-200 bg-secondary-blue-600/50 rounded-md px-3 py-2">
                      {importResult.message}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-green-500/10 border border-neutral-green-500/30">
                      <CheckCircle2 className="w-8 h-8 text-neutral-green-500 shrink-0" />
                      <div>
                        <p className="text-2xl font-bold text-neutral-green-400">
                          {importResult?.imported ?? 0}
                        </p>
                        <p className="text-xs text-secondary-blue-300">
                          Imported successfully
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-alert-orange-500/10 border border-alert-orange-500/30">
                      <X className="w-8 h-8 text-alert-orange-400 shrink-0" />
                      <div>
                        <p className="text-2xl font-bold text-alert-orange-400">
                          {importResult?.skipped ?? 0}
                        </p>
                        <p className="text-xs text-secondary-blue-300">
                          Rows skipped{' '}
                          {importResult?.totalRows
                            ? `out of ${importResult.totalRows}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(importResult?.errors?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-secondary-blue-200">
                          Skipped rows
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadErrorReport}
                          className="h-7 text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" /> Download report
                        </Button>
                      </div>
                      <div className="rounded-md border border-secondary-blue-500 overflow-auto max-h-48">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-secondary-blue-500">
                              <TableHead className="text-xs py-2">
                                Row
                              </TableHead>
                              <TableHead className="text-xs py-2">
                                Name
                              </TableHead>
                              <TableHead className="text-xs py-2">
                                Reason
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importResult?.errors?.map((err, i) => (
                              <TableRow
                                key={i}
                                className="border-secondary-blue-500"
                              >
                                <TableCell className="text-xs py-2">
                                  {err.row}
                                </TableCell>
                                <TableCell className="text-xs py-2">
                                  {err.name || '—'}
                                </TableCell>
                                <TableCell className="text-xs py-2 text-alert-red-400">
                                  {err.reason}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-3 border-t border-secondary-blue-500 mt-2">
          <Button variant="outline" onClick={handleClose}>
            {step === 'results' ? 'Close' : 'Cancel'}
          </Button>
          <div className="flex gap-2">
            {step === 'map' && (
              <Button variant="ghost" onClick={() => setStep('upload')}>
                Back
              </Button>
            )}
            {step === 'map' && (
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting
                  ? 'Importing...'
                  : `Import ${fileRows.length} rows`}
              </Button>
            )}
            {step === 'results' && importError && (
              <Button onClick={() => setStep('upload')}>Try again</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
