import { Fragment, useMemo, useState } from 'react';

import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useGymBranch } from '@/providers/gym-branch-provider';
import type { EditableSectionProps } from '@/types/staff';

export function CertificationSection({
  isEditing,
  details,
  onUpdate,
}: EditableSectionProps) {
  const { gymBranch } = useGymBranch();
  const { formOptions } = useGymFormOptions(gymBranch?.gymId);
  const [searchTerm, setSearchTerm] = useState('');

  // Parse certifications from JSON string
  const certifications = details?.certification
    ? JSON.parse(details.certification)
    : [];

  const filteredCertificates = useMemo(() => {
    const allCertificates = formOptions?.certificatesOptions ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return allCertificates;
    return allCertificates.filter((certificate) =>
      certificate.name.toLowerCase().includes(normalizedSearch)
    );
  }, [formOptions?.certificatesOptions, searchTerm]);

  const handleAddCertification = (certificationName: string) => {
    if (!certifications.includes(certificationName)) {
      const updatedCertifications = [...certifications, certificationName];
      onUpdate('certification', JSON.stringify(updatedCertifications));
    }
  };

  const handleRemoveCertification = (certificationToRemove: string) => {
    const updatedCertifications = certifications.filter(
      (cert: string) => cert !== certificationToRemove
    );
    onUpdate('certification', JSON.stringify(updatedCertifications));
  };

  return (
    <Fragment>
      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          Certifications
        </Label>

        {/* Display certifications as chips */}
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {certifications.length > 0 ? (
            certifications.map((cert: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-primary-blue-400/60 text-white flex items-start gap-1 px-2 py-1 max-w-full min-w-0 text-wrap break-words"
              >
                <span className="min-w-0 break-words">{cert}</span>
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent shrink-0"
                    onClick={() => handleRemoveCertification(cert)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))
          ) : (
            <p className="text-primary-blue-200 text-sm italic">
              No certifications added
            </p>
          )}
        </div>

        {/* Add certification dropdown in edit mode */}
        {isEditing && (
          <div className="mt-2">
            <Select
              onValueChange={handleAddCertification}
              onOpenChange={(open) => {
                if (!open) setSearchTerm('');
              }}
            >
              <SelectTrigger className="border-0 border-b rounded-none focus:outline-hidden focus:shadow-none focus:ring-0 p-0 h-auto text-[15px] text-white font-normal leading-normal pb-2 border-primary-blue-300 focus:border-white hover:border-white k-transition focus:outline-0">
                <SelectValue placeholder="Add certification..." />
              </SelectTrigger>
              <SelectContent className="shad-select-content">
                <div className="sticky top-0 z-10 px-2 py-2 bg-secondary-blue-700 border-b border-primary-blue-400">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(event) => event.stopPropagation()}
                    placeholder="Search certifications..."
                    className="w-full h-9 px-3 rounded-md border border-primary-blue-400 bg-secondary-blue-500 text-sm text-white placeholder:text-primary-blue-100 outline-none focus:border-primary-green-700"
                  />
                </div>
                {filteredCertificates.map((certificate) => (
                  <SelectItem
                    className="shad-select-item"
                    key={certificate.id}
                    value={certificate.name}
                    disabled={certifications.includes(certificate.name)}
                  >
                    {certificate.name}
                  </SelectItem>
                ))}
                {filteredCertificates.length === 0 && (
                  <div className="px-3 py-2 text-sm text-primary-blue-100">
                    No results found.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Fragment>
  );
}
