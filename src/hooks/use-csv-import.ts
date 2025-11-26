import { useCallback, useState } from 'react';

import Papa from 'papaparse';

import { formatFieldName } from '@/lib/utils';

export const useCSVImport = <T>(
  requiredFields: string[],
  fieldTransformations?: (row: Partial<T>, rowIndex: number) => Partial<T>,
  fieldDefaults?: Partial<T>
) => {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isMappingRequired, setIsMappingRequired] = useState(true);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      Papa.parse(file, {
        complete: (results: Papa.ParseResult<string[]>) => {
          setCsvData(results.data);
          setHeaders(results.data[0]);
          // Initialize mappings with best-guess matches
          // TODO: AI in future
          const initialMappings = results.data[0].reduce(
            (acc, header) => {
              const lowerHeader = header.toLowerCase();
              const match = requiredFields.find((field) =>
                lowerHeader.includes(field.toLowerCase())
              );
              if (match) {
                acc[match] = header;
              }
              return acc;
            },
            {} as { [key: string]: string }
          );
          setMappings(initialMappings);
        },
      });
    },
    [requiredFields]
  );

  const updateMapping = (field: string, value: string) => {
    setMappings((prev) => ({ ...prev, [field]: value }));
  };

  const resetImport = () => {
    setCsvData([]);
    setHeaders([]);
    setMappings({});
    setErrors({});
    setIsMappingRequired(true);
  };

  const validateAndImport = async (onImport: (data: T[]) => Promise<void>) => {
    const newErrors: { [key: string]: string } = {};

    requiredFields.forEach((field) => {
      if (!mappings[field]) {
        newErrors[field] = `${formatFieldName(field)} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    const validRows = csvData.slice(1).filter((row) => {
      return row.some((value) => value.trim() !== '');
    });

    const importedData: T[] = validRows.map((row, index) => {
      const transformedRow: Partial<T> = { ...fieldDefaults };

      Object.entries(mappings).forEach(([field, header]) => {
        const columnIndex = headers.indexOf(header);
        if (columnIndex !== -1) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          transformedRow[field as keyof T] = row[columnIndex]?.trim() || '';
        }
      });

      return fieldTransformations
        ? (fieldTransformations(transformedRow, index) as T)
        : (transformedRow as T);
    });

    await onImport(importedData);
    return true;
  };

  return {
    csvData,
    headers,
    mappings,
    errors,
    isMappingRequired,
    onDrop,
    updateMapping,
    validateAndImport,
    resetImport,
  };
};
