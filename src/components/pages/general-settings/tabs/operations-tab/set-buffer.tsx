import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCheck, Edit, Trash2 } from 'lucide-react';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { useBufferConfigs } from '@/hooks/use-buffer-config';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { bufferSchema } from '@/schemas';
import type { BufferConfig } from '@/services/buffer-config';

type BufferFormData = z.infer<typeof bufferSchema>;

export default function SetBuffer() {
  const { gymBranch } = useGymBranch();
  const { configs, isLoading, createConfig, updateConfig, deleteConfig } =
    useBufferConfigs();
  const { formOptions } = useGymFormOptions(gymBranch?.gymId);
  const { showConfirm } = useAppDialog();
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<BufferFormData>({
    resolver: zodResolver(bufferSchema),
    defaultValues: {
      feeBufferAmount: '',
      feeBufferDays: '',
      membershipPlanId: '',
    },
  });

  const planOptions =
    formOptions?.membershipPlans.map((plan) => ({
      label: plan.planName,
      value: plan.membershipPlanId.toString(),
    })) || [];

  const handleSave = async (config?: BufferConfig) => {
    // Validate form before proceeding
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const values = form.getValues();
    const data = {
      membershipPlanId: parseInt(values.membershipPlanId),
      feeBufferAmount: parseInt(values.feeBufferAmount),
      feeBufferDays: parseInt(values.feeBufferDays),
    };

    // Check if values have changed for existing config
    if (config) {
      const hasChanged =
        config.feeBufferAmount !== data.feeBufferAmount ||
        config.feeBufferDays !== data.feeBufferDays ||
        config.membershipPlanId !== data.membershipPlanId;

      if (!hasChanged) {
        // No changes, just exit edit mode
        form.reset();
        setEditingId(null);
        return;
      }
    }

    try {
      if (config) {
        await updateConfig({ id: config.id, config: data });
      } else {
        await createConfig(data);
      }
      form.reset();
      setEditingId(null);
    } catch (error) {
      console.error('Error saving buffer config:', error);
    }
  };

  const handleEdit = (config: BufferConfig) => {
    if (editingId === config.id) {
      // Toggle off edit mode
      setEditingId(null);
      form.reset();
    } else {
      // Toggle on edit mode
      setEditingId(config.id);
      form.setValue('feeBufferAmount', config.feeBufferAmount.toString());
      form.setValue('feeBufferDays', config.feeBufferDays.toString());
      form.setValue('membershipPlanId', config.membershipPlanId.toString());
    }
  };

  const handleDelete = (id: number) => {
    showConfirm({
      title: 'Delete Buffer Configuration',
      description:
        'Are you sure you want to delete this buffer configuration? This action cannot be undone.',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await deleteConfig(id);
        } catch (error) {
          console.error('Error deleting buffer config:', error);
        }
      },
    });
  };

  if (isLoading) {
    return <Skeleton className="h-[390px]" />;
  }

  return (
    <div className="w-full bg-secondary-blue-500 rounded-lg border border-secondary-blue-400">
      <div className="p-6">
        <div className="flex flex-col gap-3 mb-6">
          <h2 className="font-medium text-white text-xl leading-normal">
            Set buffer
          </h2>
          <p className="font-normal text-white text-base leading-normal">
            Set up buffer for fee & due time
          </p>
        </div>
        <div className="border-t border-secondary-blue-400 pt-4">
          <FormProvider {...form}>
            <form
              id="buffer-form"
              className="flex flex-col gap-5 max-w-[630px]"
            >
              {/* Existing Buffer Configurations */}
              <div>
                <p className="text-sm text-white leading-normal mt-3">
                  Enter the minimum payable amount to qualify for &quot;Partial
                  payment&quot;.
                </p>

                {configs.map((config) => (
                  <div key={config.id} className="flex gap-3 mt-4 items-end">
                    {editingId === config.id ? (
                      <>
                        <KFormField
                          fieldType={KFormFieldType.INPUT}
                          control={form.control}
                          name="feeBufferAmount"
                          label="Amount"
                          placeholder="Enter amount"
                          className="bg-secondary-blue-400/60"
                        />
                        <div className="max-w-[88px]">
                          <KFormField
                            fieldType={KFormFieldType.INPUT}
                            control={form.control}
                            name="feeBufferDays"
                            label="Days"
                            placeholder="Days"
                            className="bg-secondary-blue-400/60"
                          />
                        </div>
                        <KFormField
                          fieldType={KFormFieldType.SELECT}
                          control={form.control}
                          name="membershipPlanId"
                          label="Plan"
                          options={planOptions}
                          className="bg-secondary-blue-400/60"
                        />
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => handleSave(config)}
                        >
                          <CheckCheck className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => handleEdit(config)}
                          variant="destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <label className="text-sm text-white/80">
                            Amount
                          </label>
                          <div className="bg-secondary-blue-400/60 text-[14px] px-4 py-2 rounded text-white">
                            ₹{config.feeBufferAmount}
                          </div>
                        </div>
                        <div className="max-w-[88px]">
                          <label className="text-sm text-white/80">Days</label>
                          <div className="bg-secondary-blue-400/60 text-[14px] px-4 py-2 rounded text-white">
                            {config.feeBufferDays}
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm text-white/80">Plan</label>
                          <div className="bg-secondary-blue-400/60 text-[14px] px-4 py-2 rounded text-white">
                            {formOptions?.membershipPlans.find(
                              (p) =>
                                p.membershipPlanId === config.membershipPlanId
                            )?.planName || 'Unknown'}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => handleEdit(config)}
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => handleDelete(config.id)}
                          variant="destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}

                {/* Add New Buffer Form */}
                {!editingId && (
                  <div className="flex gap-3 mt-4 items-end">
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name="feeBufferAmount"
                      label="Amount"
                      placeholder="Enter amount"
                      className="bg-secondary-blue-400/60"
                    />
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name="feeBufferDays"
                      label="Days"
                      placeholder="Days"
                      className="bg-secondary-blue-400/60"
                    />
                    <KFormField
                      fieldType={KFormFieldType.SELECT}
                      control={form.control}
                      name="membershipPlanId"
                      label="Plan"
                      options={planOptions}
                      className="bg-secondary-blue-400/60"
                    />
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => handleSave()}
                    >
                      <CheckCheck className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
