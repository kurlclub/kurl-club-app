import { Activity, Beef, Egg, Target, Wheat, Zap } from 'lucide-react';
import { Cell, Label, Pie, PieChart } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ACTIVITY, ActivityKey, Goal } from '@/hooks/use-diet-calculator';

import { SharePlanModal } from './share-plan-modal';

interface NutritionSummaryProps {
  goal: Goal;
  activityKey: ActivityKey;
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  chartData: Array<{ name: string; value: number; color: string }>;
  prescriptionText: string;
}

const chartConfig = {
  value: {
    label: 'Calories',
  },
  protein: {
    label: 'Protein',
    color: '#c0e102',
  },
  carbs: {
    label: 'Carbs',
    color: '#679cf1',
  },
  fat: {
    label: 'Fat',
    color: '#db9e56',
  },
} satisfies ChartConfig;

export function NutritionSummary({
  goal,
  activityKey,
  bmr,
  tdee,
  calories,
  proteinG,
  carbsG,
  fatG,
  chartData,
  prescriptionText,
}: NutritionSummaryProps) {
  const goalAdjustments = {
    'Fat loss': -0.2,
    Maintenance: 0,
    'Lean bulk': 0.1,
    Bulk: 0.2,
  } as const;

  const macroItems = [
    {
      label: 'Calories',
      value: calories,
      unit: 'kcal',
      icon: Zap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
    {
      label: 'Protein',
      value: proteinG,
      unit: 'g',
      icon: Beef,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      label: 'Carbs',
      value: carbsG,
      unit: 'g',
      icon: Wheat,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      label: 'Fat',
      value: fatG,
      unit: 'g',
      icon: Egg,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
    },
  ];

  return (
    <Card className="bg-primary-blue-400/70 border-primary-blue-400">
      <CardHeader className="px-6">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-400" />
          Nutrition plan summary
        </CardTitle>
        <div className="mt-2 flex justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-neutral-green-500/15 text-neutral-green-200 border border-emerald-400/40">
              Trainer-ready
            </Badge>
            {goalAdjustments[goal] < 0 && (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-400/40">
                Calorie deficit
              </Badge>
            )}
            {goalAdjustments[goal] > 0 && (
              <Badge className="bg-sky-500/15 text-sky-400 border border-sky-400/40">
                Calorie surplus
              </Badge>
            )}
          </div>
          <SharePlanModal prescriptionText={prescriptionText} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 h-full">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md p-3 bg-secondary-blue-600/80">
            <div className="text-xs text-muted-foreground">BMR</div>
            <div className="text-xl font-semibold">{Math.round(bmr)} kcal</div>
          </div>
          <div className="rounded-md p-3 bg-secondary-blue-600/80">
            <div className="text-xs text-muted-foreground">
              TDEE ({ACTIVITY[activityKey].label})
            </div>
            <div className="text-xl font-semibold">{tdee} kcal</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-secondary-blue-600/80 border-primary-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-primary-green-500/10 ring-1 ring-primary-green-500/20">
                <Target className="h-4 w-4 text-primary-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Daily Targets
                </h3>
                <p className="text-xs text-primary-blue-100 font-medium">
                  Nutrition goals (grams)
                </p>
              </div>
            </div>

            {/* Macro Grid */}
            <div className="grid grid-cols-2 gap-3">
              {macroItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="group">
                    <div className="p-3 rounded-xl bg-primary-blue-400/30 border border-primary-blue-300/50 hover:border-primary-blue-200 transition-all duration-200 hover:bg-primary-blue-400/50">
                      {/* Icon and Label */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`p-1 rounded-md ${item.bgColor} ring-1 ring-current/20`}
                        >
                          <Icon className={`h-3 w-3 ${item.color}`} />
                        </div>
                        <span className="text-xs font-semibold text-primary-blue-100 uppercase tracking-wide">
                          {item.label}
                        </span>
                      </div>

                      {/* Value Display */}
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-white tabular-nums">
                            {item.value.toLocaleString()}
                          </span>
                          <span className="text-xs font-medium text-primary-blue-100">
                            {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-md p-3 bg-secondary-blue-600/80">
            <div className="text-xs text-muted-foreground mb-2">
              Macro split (calories)
            </div>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-primary-green-50 text-3xl font-bold"
                            >
                              {calories}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-primary-green-50 text-lg"
                            >
                              kcal
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-1 grid grid-cols-3 gap-2 text-xs justify-items-center w-full">
              {chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-sm"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
