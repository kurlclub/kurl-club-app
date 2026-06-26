import { Button } from '@/components/ui/button';

interface SettingsDirtyActionsProps {
  onDiscard: () => void;
  onSave: () => void;
  isSaving: boolean;
  isBusy: boolean;
}

/**
 * Save / Discard pair shown in a SettingsSection header while the form is dirty.
 */
export function SettingsDirtyActions({
  onDiscard,
  onSave,
  isSaving,
  isBusy,
}: SettingsDirtyActionsProps) {
  return (
    <div className="flex gap-2 shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onDiscard}
        disabled={isBusy}
      >
        Discard
      </Button>
      <Button type="button" size="sm" onClick={onSave} disabled={isBusy}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
