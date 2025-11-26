import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Upload } from 'lucide-react';

import { FieldMapper } from '@/components/shared/table/field-mapper';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCSVImport } from '@/hooks/use-csv-import';

interface ImportCSVModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: T[]) => Promise<void>;
  requiredFields: string[];
  transformations?: (row: Partial<T>, rowIndex: number) => Partial<T>;
  defaults?: Partial<T>;
}

export const ImportCSVModal = <T,>({
  isOpen,
  onClose,
  onImport,
  requiredFields,
  transformations,
  defaults,
}: ImportCSVModalProps<T>) => {
  const [importCompleted, setImportCompleted] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const {
    csvData,
    headers,
    mappings,
    errors,
    isMappingRequired,
    onDrop,
    updateMapping,
    validateAndImport,
    resetImport,
  } = useCSVImport<T>(requiredFields, transformations, defaults);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleImport = async () => {
    setIsImporting(true);
    try {
      if (await validateAndImport(onImport)) {
        setImportCompleted(false);
        resetImport();
        onClose();
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    resetImport();
    setImportCompleted(false);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-secondary-blue-700 border-primary-blue-400">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
        </DialogHeader>
        {csvData.length === 0 || importCompleted ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-green-800 bg-primary-green-700/10'
                : 'border-secondary-blue-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-secondary-blue-300" />
            <p className="text-lg font-medium mb-2">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop a CSV file here'}
            </p>
            <p className="text-sm text-secondary-blue-300">
              or click to select a file
            </p>
          </div>
        ) : isMappingRequired ? (
          <FieldMapper
            requiredFields={requiredFields}
            headers={headers}
            mappings={mappings}
            errors={errors}
            updateMapping={updateMapping}
          />
        ) : (
          <div className="p-6 text-center">
            <p>All required fields are mapped.</p>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={csvData.length === 0 || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
