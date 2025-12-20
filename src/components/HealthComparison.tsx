import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  TrendingUp, 
  Calendar,
  Zap,
  Moon,
  Droplets,
  Activity,
  Scale,
  Apple,
  Loader2
} from 'lucide-react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HealthComparisonProps {
  user: User | null;
}

type PeriodType = 'week' | 'month';

interface PeriodMetrics {
  avgEnergy: number;
  avgSleep: number;
  avgStress: number;
  avgWater: number;
  avgExercise: number;
  avgWeight: number;
  avgDigestion: number;
  avgBloating: number;
  totalLogs: number;
}

interface ComparisonData {
  period1: PeriodMetrics;
  period2: PeriodMetrics;
  period1Label: string;
  period2Label: string;
}

const emptyMetrics: PeriodMetrics = {
  avgEnergy: 0,
  avgSleep: 0,
  avgStress: 0,
  avgWater: 0,
  avgExercise: 0,
  avgWeight: 0,
  avgDigestion: 0,
  avgBloating: 0,
  totalLogs: 0,
};

export const HealthComparison: React.FC<HealthComparisonProps> = ({ user }) => {
  const [periodType, setPeriodType] = useState<PeriodType>('week');
  const [period1Offset, setPeriod1Offset] = useState('0');
  const [period2Offset, setPeriod2Offset] = useState('1');
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);

  const getPeriodRange = (type: PeriodType, offset: number) => {
    const now = new Date();
    if (type === 'week') {
      const targetDate = subWeeks(now, offset);
      return {
        start: startOfWeek(targetDate, { weekStartsOn: 1 }),
        end: endOfWeek(targetDate, { weekStartsOn: 1 }),
      };
    } else {
      const targetDate = subMonths(now, offset);
      return {
        start: startOfMonth(targetDate),
        end: endOfMonth(targetDate),
      };
    }
  };

  const getPeriodLabel = (type: PeriodType, offset: number) => {
    const range = getPeriodRange(type, offset);
    if (type === 'week') {
      return `${format(range.start, 'dd/MM')} - ${format(range.end, 'dd/MM')}`;
    } else {
      return format(range.start, 'MMMM yyyy');
    }
  };

  const fetchPeriodMetrics = async (start: Date, end: Date): Promise<PeriodMetrics> => {
    if (!user) return emptyMetrics;

    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    const [bodyResult, gutResult] = await Promise.all([
      supabase
        .from('body_health_logs')
        .select('energy_level, sleep_hours, stress_level, water_glasses, exercise_minutes, weight_kg')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr),
      supabase
        .from('gut_health_logs')
        .select('digestion_score, bloating_level')
        .eq('user_id', user.id)
        .gte('date', startStr)
        .lte('date', endStr),
    ]);

    const bodyLogs = bodyResult.data || [];
    const gutLogs = gutResult.data || [];

    const avgValue = (arr: (number | null | undefined)[]): number => {
      const valid = arr.filter((v): v is number => v !== null && v !== undefined);
      return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
    };

    return {
      avgEnergy: avgValue(bodyLogs.map(l => l.energy_level)),
      avgSleep: avgValue(bodyLogs.map(l => l.sleep_hours)),
      avgStress: avgValue(bodyLogs.map(l => l.stress_level)),
      avgWater: avgValue(bodyLogs.map(l => l.water_glasses)),
      avgExercise: avgValue(bodyLogs.map(l => l.exercise_minutes)),
      avgWeight: avgValue(bodyLogs.map(l => l.weight_kg)),
      avgDigestion: avgValue(gutLogs.map(l => l.digestion_score)),
      avgBloating: avgValue(gutLogs.map(l => l.bloating_level)),
      totalLogs: bodyLogs.length + gutLogs.length,
    };
  };

  const compareperiods = async () => {
    if (!user) return;
    setLoading(true);

    const range1 = getPeriodRange(periodType, parseInt(period1Offset));
    const range2 = getPeriodRange(periodType, parseInt(period2Offset));

    const [metrics1, metrics2] = await Promise.all([
      fetchPeriodMetrics(range1.start, range1.end),
      fetchPeriodMetrics(range2.start, range2.end),
    ]);

    setComparison({
      period1: metrics1,
      period2: metrics2,
      period1Label: getPeriodLabel(periodType, parseInt(period1Offset)),
      period2Label: getPeriodLabel(periodType, parseInt(period2Offset)),
    });

    setLoading(false);
  };

  const renderChange = (current: number, previous: number, inverse: boolean = false) => {
    if (previous === 0 && current === 0) return <Minus className="w-4 h-4 text-muted-foreground" />;
    
    const diff = current - previous;
    const isPositive = inverse ? diff < 0 : diff > 0;
    const isNegative = inverse ? diff > 0 : diff < 0;
    
    if (Math.abs(diff) < 0.1) return <Minus className="w-4 h-4 text-muted-foreground" />;
    
    return (
      <div className={cn(
        "flex items-center gap-1 text-sm font-medium",
        isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-muted-foreground"
      )}>
        {diff > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        {Math.abs(diff).toFixed(1)}
      </div>
    );
  };

  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value1, 
    value2, 
    unit = '', 
    inverse = false,
    iconColor = 'text-primary'
  }: { 
    icon: React.ElementType; 
    label: string; 
    value1: number; 
    value2: number; 
    unit?: string;
    inverse?: boolean;
    iconColor?: string;
  }) => (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-4 h-4", iconColor)} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Hore</p>
          <p className="font-semibold">{value2 > 0 ? value2.toFixed(1) : '-'}{unit}</p>
        </div>
        <div className="text-center flex flex-col items-center justify-center">
          {renderChange(value1, value2, inverse)}
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Hadda</p>
          <p className="font-semibold">{value1 > 0 ? value1.toFixed(1) : '-'}{unit}</p>
        </div>
      </div>
    </div>
  );

  const periodOptions = periodType === 'week' 
    ? [
        { value: '0', label: 'Usbuucan' },
        { value: '1', label: 'Usbuuc ka hor' },
        { value: '2', label: '2 usbuuc ka hor' },
        { value: '3', label: '3 usbuuc ka hor' },
        { value: '4', label: '4 usbuuc ka hor' },
      ]
    : [
        { value: '0', label: 'Bishan' },
        { value: '1', label: 'Bishii hore' },
        { value: '2', label: '2 bilood ka hor' },
        { value: '3', label: '3 bilood ka hor' },
      ];

  return (
    <div className="space-y-6">
      <div className="analysis-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold">Isbarbardhigga Caafimaadka</h3>
            <p className="text-xs text-muted-foreground">Barbardhig xogtaada wakhti kala duwan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Nooca Wakhtiga</Label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Usbuuc</SelectItem>
                <SelectItem value="month">Bil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Wakhti 1 (Hadda)</Label>
            <Select value={period1Offset} onValueChange={setPeriod1Offset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Wakhti 2 (Hore)</Label>
            <Select value={period2Offset} onValueChange={setPeriod2Offset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={compareperiods} disabled={loading} className="w-full sm:w-auto gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Waa la barbardhigayaa...
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Barbardhig
            </>
          )}
        </Button>
      </div>

      {comparison && (
        <>
          <div className="analysis-card">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-serif font-semibold">Natiijada Isbarbardhigga</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  {comparison.period2Label}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {comparison.period1Label}
                </span>
              </div>
            </div>

            {comparison.period1.totalLogs === 0 && comparison.period2.totalLogs === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Xog lama helin wakhtiyadan</p>
                <p className="text-sm text-muted-foreground/70">Ku dar xog caafimaad si aad u aragto isbarbardhigga</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  icon={Zap}
                  label="Tamarta"
                  value1={comparison.period1.avgEnergy}
                  value2={comparison.period2.avgEnergy}
                  unit="/10"
                  iconColor="text-amber-400"
                />
                <MetricCard
                  icon={Moon}
                  label="Hurdada"
                  value1={comparison.period1.avgSleep}
                  value2={comparison.period2.avgSleep}
                  unit="h"
                  iconColor="text-blue-400"
                />
                <MetricCard
                  icon={Activity}
                  label="Walwalka"
                  value1={comparison.period1.avgStress}
                  value2={comparison.period2.avgStress}
                  unit="/10"
                  inverse={true}
                  iconColor="text-rose-400"
                />
                <MetricCard
                  icon={Droplets}
                  label="Biyaha"
                  value1={comparison.period1.avgWater}
                  value2={comparison.period2.avgWater}
                  unit=""
                  iconColor="text-cyan-400"
                />
                <MetricCard
                  icon={Activity}
                  label="Jimicsiga"
                  value1={comparison.period1.avgExercise}
                  value2={comparison.period2.avgExercise}
                  unit="m"
                  iconColor="text-emerald-400"
                />
                <MetricCard
                  icon={Scale}
                  label="Miisaanka"
                  value1={comparison.period1.avgWeight}
                  value2={comparison.period2.avgWeight}
                  unit="kg"
                  iconColor="text-purple-400"
                />
                <MetricCard
                  icon={Apple}
                  label="Dheefshiidka"
                  value1={comparison.period1.avgDigestion}
                  value2={comparison.period2.avgDigestion}
                  unit="/10"
                  iconColor="text-green-400"
                />
                <MetricCard
                  icon={Apple}
                  label="Baruurida"
                  value1={comparison.period1.avgBloating}
                  value2={comparison.period2.avgBloating}
                  unit="/5"
                  inverse={true}
                  iconColor="text-orange-400"
                />
              </div>
            )}
          </div>

          {(comparison.period1.totalLogs > 0 || comparison.period2.totalLogs > 0) && (
            <div className="analysis-card">
              <h4 className="font-serif font-semibold mb-4">Kooban</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{comparison.period2Label}</p>
                  <p className="text-2xl font-serif font-bold">{comparison.period2.totalLogs}</p>
                  <p className="text-xs text-muted-foreground">diiwaangelino</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{comparison.period1Label}</p>
                  <p className="text-2xl font-serif font-bold text-primary">{comparison.period1.totalLogs}</p>
                  <p className="text-xs text-muted-foreground">diiwaangelino</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
