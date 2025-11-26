import { ArrowRightLeft } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatFieldName } from '@/lib/utils';

interface FieldMapperProps {
  requiredFields: string[];
  headers: string[];
  mappings: { [key: string]: string };
  errors: { [key: string]: string };
  updateMapping: (field: string, value: string) => void;
}
export const FieldMapper = ({
  requiredFields,
  headers,
  mappings,
  errors,
  updateMapping,
}: FieldMapperProps) => {
  return (
    <Card className="w-full border-primary-blue-400">
      <CardHeader>
        <CardTitle>Map CSV Fields</CardTitle>
        <CardDescription className="text-sm leading-relaxed text-secondary-blue-200">
          To import your data, match each column in your CSV file to the
          corresponding required field in our system. This ensures your data is
          correctly aligned and processed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requiredFields.map((field) => (
            <div key={field} className="flex items-center space-x-4">
              <div className="w-1/4">
                <Label htmlFor={field} className="flex items-center space-x-2">
                  <span>{formatFieldName(field)}</span>
                </Label>
              </div>

              <ArrowRightLeft
                className={`w-6 h-6 ${
                  mappings[field]
                    ? 'text-neutral-green-500'
                    : 'text-alert-red-500'
                }`}
              />

              <div className="w-3/4 flex items-center space-x-2">
                <div className="flex flex-col w-full">
                  <Select
                    value={mappings[field] || ''}
                    onValueChange={(value) => updateMapping(field, value)}
                  >
                    <SelectTrigger
                      id={field}
                      className="shad-select-trigger focus:outline-1"
                    >
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent className="shad-select-content">
                      {headers.map((header) => (
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
                  {errors[field] && (
                    <p className="text-alert-red-500 text-[10px] px-1.5">
                      {`* ${errors[field]}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
