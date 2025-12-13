import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CheckCheck, Edit, Plus, Trash2, Wallet } from 'lucide-react';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  const [isAdding, setIsAdding] = useState(false);

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
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    const data = {
      membershipPlanId: parseInt(values.membershipPlanId),
      feeBufferAmount: parseInt(values.feeBufferAmount),
      feeBufferDays: parseInt(values.feeBufferDays),
    };

    if (config) {
      const hasChanged =
        config.feeBufferAmount !== data.feeBufferAmount ||
        config.feeBufferDays !== data.feeBufferDays ||
        config.membershipPlanId !== data.membershipPlanId;

      if (!hasChanged) {
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
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving buffer config:', error);
    }
  };

  const handleEdit = (config: BufferConfig) => {
    if (editingId === config.id) {
      setEditingId(null);
      form.reset();
    } else {
      setEditingId(config.id);
      setIsAdding(false);
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

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingId(null);
    form.reset();
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    form.reset();
  };

  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  return (
    <Card className="bg-secondary-blue-500/80 backdrop-blur-sm border-secondary-blue-400 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none" />
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-white">Buffer Configuration</CardTitle>
            <CardDescription className="text-secondary-blue-200 mt-1">
              Set minimum payment amount and grace period for partial payments
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Buffer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <FormProvider {...form}>
          {configs.length === 0 && !isAdding && (
            <div className="text-center py-12 border-2 border-dashed border-primary-blue-400 rounded-lg">
              <Wallet className="h-12 w-12 mx-auto text-primary-blue-300 mb-3" />
              <p className="text-gray-400 text-sm">
                No buffer configurations yet
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Add your first buffer to get started
              </p>
            </div>
          )}

          {configs.map((config) => (
            <div
              key={config.id}
              className="space-y-4 p-4 bg-secondary-blue-700 rounded-lg border border-secondary-blue-400"
            >
              {editingId === config.id ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name="feeBufferAmount"
                      label="Minimum Amount"
                      placeholder="1000"
                      suffix="₹"
                    />
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name="feeBufferDays"
                      label="Grace Days"
                      placeholder="3"
                      suffix="days"
                    />
                    <KFormField
                      fieldType={KFormFieldType.SELECT}
                      control={form.control}
                      name="membershipPlanId"
                      label="Membership Plan"
                      options={planOptions}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSave(config)}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(config)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary-green-500" />
                      <div>
                        <p className="text-xs text-gray-400">Minimum Amount</p>
                        <p className="text-lg font-semibold text-white">
                          ₹{config.feeBufferAmount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">Grace Period</p>
                        <p className="text-lg font-semibold text-white">
                          {config.feeBufferDays} days
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Plan</p>
                      <p className="text-sm font-medium text-white">
                        {formOptions?.membershipPlans.find(
                          (p) => p.membershipPlanId === config.membershipPlanId
                        )?.planName || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding && (
            <div className="space-y-4 p-4 bg-secondary-blue-600/50 rounded-lg border border-secondary-blue-400">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="feeBufferAmount"
                  label="Minimum Amount"
                  placeholder="1000"
                  suffix="₹"
                />
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="feeBufferDays"
                  label="Grace Days"
                  placeholder="3"
                  suffix="days"
                />
                <KFormField
                  fieldType={KFormFieldType.SELECT}
                  control={form.control}
                  name="membershipPlanId"
                  label="Membership Plan"
                  options={planOptions}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => handleSave()}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Save Buffer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancelAdd}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </FormProvider>

        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-300">
            <strong>Note:</strong> Members who pay at least the minimum amount
            will get {configs[0]?.feeBufferDays || 'X'} extra days to complete
            their payment without being marked as expired.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
