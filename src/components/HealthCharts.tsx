import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { TrendingUp, Activity, Moon, Zap, Droplets, Scale, Brain, Apple } from 'lucide-react';
import { format } from 'date-fns';

interface HealthChartsProps {
  user: User | null;
}

interface BodyHealthLog {
  date: string;
  weight_kg: number | null;
  energy_level: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  water_glasses: number | null;
  exercise_minutes: number | null;
}

interface GutHealthLog {
  date: string;
  digestion_score: number | null;
  bloating_level: number | null;
  water_intake_liters: number | null;
}

const chartConfig = {
  energy: { label: 'Tamarta', color: 'hsl(var(--chart-1))' },
  sleep: { label: 'Hurdo', color: 'hsl(var(--chart-2))' },
  stress: { label: 'Walwal', color: 'hsl(var(--chart-3))' },
  water: { label: 'Biyo', color: 'hsl(var(--chart-4))' },
  weight: { label: 'Miisaanka', color: 'hsl(var(--chart-5))' },
  digestion: { label: 'Dheefshiid', color: 'hsl(var(--chart-1))' },
  bloating: { label: 'Baruurid', color: 'hsl(var(--chart-3))' },
  exercise: { label: 'Jimicsiga', color: 'hsl(var(--chart-2))' },
};

export const HealthCharts: React.FC<HealthChartsProps> = ({ user }) => {
  const [bodyLogs, setBodyLogs] = useState<BodyHealthLog[]>([]);
  const [gutLogs, setGutLogs] = useState<GutHealthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const [bodyResult, gutResult] = await Promise.all([
      supabase
        .from('body_health_logs')
        .select('date, weight_kg, energy_level, sleep_hours, sleep_quality, stress_level, water_glasses, exercise_minutes')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(30),
      supabase
        .from('gut_health_logs')
        .select('date, digestion_score, bloating_level, water_intake_liters')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(30),
    ]);

    if (bodyResult.data) setBodyLogs(bodyResult.data);
    if (gutResult.data) setGutLogs(gutResult.data);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM');
    } catch {
      return dateStr;
    }
  };

  const bodyChartData = bodyLogs.map((log) => ({
    date: formatDate(log.date),
    energy: log.energy_level,
    sleep: log.sleep_hours,
    stress: log.stress_level,
    water: log.water_glasses,
    weight: log.weight_kg,
    exercise: log.exercise_minutes,
  }));

  const gutChartData = gutLogs.map((log) => ({
    date: formatDate(log.date),
    digestion: log.digestion_score,
    bloating: log.bloating_level,
    water: log.water_intake_liters,
  }));

  if (loading) {
    return (
      <div className="analysis-card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const hasBodyData = bodyLogs.length > 0;
  const hasGutData = gutLogs.length > 0;

  if (!hasBodyData && !hasGutData) {
    return (
      <div className="analysis-card">
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Weli xog lama helin</p>
          <p className="text-sm text-muted-foreground/70">
            Ku dar xogta caafimaadka jidhkaaga iyo caloosha si aad u aragto jadwalada isbedelka
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Energy, Sleep & Stress Trends */}
      {hasBodyData && (
        <div className="analysis-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">Tamarta, Hurdada & Walwalka</h3>
              <p className="text-xs text-muted-foreground">Isbedelka 30-kii maalmood ee la soo dhaafay</p>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart data={bodyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                domain={[0, 10]}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="energy"
                name="Tamarta"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                name="Hurdo (saacado)"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="stress"
                name="Walwal"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
              <span className="text-muted-foreground">Tamarta</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
              <span className="text-muted-foreground">Hurdada</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
              <span className="text-muted-foreground">Walwalka</span>
            </div>
          </div>
        </div>
      )}

      {/* Water & Exercise */}
      {hasBodyData && (
        <div className="analysis-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">Biyaha & Jimicsiga</h3>
              <p className="text-xs text-muted-foreground">Maalintii koobab iyo daqiiqado</p>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={bodyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="water"
                name="Biyo (koobab)"
                fill="hsl(var(--chart-4))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="exercise"
                name="Jimicsi (daqiiqo)"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-4))]" />
              <span className="text-muted-foreground">Biyaha (koobab)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
              <span className="text-muted-foreground">Jimicsiga (daqiiqo)</span>
            </div>
          </div>
        </div>
      )}

      {/* Weight Trend */}
      {hasBodyData && bodyLogs.some(log => log.weight_kg) && (
        <div className="analysis-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">Isbedelka Miisaanka</h3>
              <p className="text-xs text-muted-foreground">Miisaankaaga waqti ka waqti (kg)</p>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <AreaChart data={bodyChartData.filter(d => d.weight)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="weight"
                name="Miisaanka (kg)"
                stroke="hsl(var(--chart-5))"
                fill="hsl(var(--chart-5))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      )}

      {/* Gut Health Trends */}
      {hasGutData && (
        <div className="analysis-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Apple className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">Caafimaadka Caloosha</h3>
              <p className="text-xs text-muted-foreground">Dheefshiidka & Baruurida waqti ka waqti</p>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={gutChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                domain={[0, 10]}
                className="fill-muted-foreground"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="digestion"
                name="Dheefshiidka"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="bloating"
                name="Baruurida"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]" />
              <span className="text-muted-foreground">Dheefshiidka</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
              <span className="text-muted-foreground">Baruurida</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
