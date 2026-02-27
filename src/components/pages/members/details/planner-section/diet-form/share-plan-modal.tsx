import Image from 'next/image';
import { useState } from 'react';

import { ClipboardCopy, Download, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SharePlanModalProps {
  prescriptionText: string;
}

export function SharePlanModal({ prescriptionText }: SharePlanModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Convert headers for WhatsApp
  const formatForWhatsApp = (text: string) => {
    return text.replace(/==+\s*(.*?)\s*==+/g, '*$1*');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prescriptionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([prescriptionText], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kurlclub-nutrition-plan-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    formatForWhatsApp(prescriptionText)
  )}`;

  const formatForPreview = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Match "== Heading ==" style
      const headerMatch = line.match(/==+\s*(.*?)\s*==+/);
      if (headerMatch) {
        return (
          <div
            key={idx}
            className="text-primary-green-400 font-semibold mt-4 mb-2 text-sm uppercase"
          >
            {headerMatch[1]}
          </div>
        );
      }

      // Match "DETAILED PLAN:" as a section heading
      if (/^DETAILED PLAN:/i.test(line)) {
        return (
          <div
            key={idx}
            className="text-primary-green-400 font-semibold mt-6 mb-2 text-sm uppercase"
          >
            Detailed Plan
          </div>
        );
      }

      // Highlight macronutrients
      const macroMatch = line.match(/(BMR|TDEE|CALORIES|PROTEIN|CARBS|FAT):/i);
      if (macroMatch) {
        const [label, value] = line.split(':');
        return (
          <div key={idx} className="whitespace-pre-wrap text-sm leading-6">
            <span className="font-semibold">{label}:</span> {value.trim()}
          </div>
        );
      }

      // Normal lines
      return (
        <div key={idx} className="whitespace-pre-wrap text-sm leading-6">
          {line}
        </div>
      );
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="shadow-none text-primary-green-500"
        variant="link"
      >
        <Share2 /> Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl bg-secondary-blue-800 border-primary-blue-400">
          <DialogHeader>
            <DialogTitle>Share Nutrition Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCopy} className="flex-1">
                <ClipboardCopy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadTxt}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download .txt
              </Button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  className="w-full bg-secondary-blue-500 hover:bg-primary-blue-400"
                  variant="secondary"
                >
                  <Image
                    src="/assets/svg/whatsapp.svg"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                  />
                  WhatsApp
                </Button>
              </a>
            </div>

            {/* Preview */}
            <div className="rounded-md border border-primary-blue-500 bg-secondary-blue-500 p-4">
              <div className="text-sm font-medium mb-2">Plan Preview:</div>
              <div className="max-h-96 overflow-auto text-sm leading-6 space-y-1">
                {formatForPreview(prescriptionText)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
