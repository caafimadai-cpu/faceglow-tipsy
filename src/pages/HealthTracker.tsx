import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Pill, 
  Apple, 
  Heart, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Sparkles,
  Droplets,
  Moon,
  Zap,
  Activity,
  Scale,
  Clock,
  Brain,
  TrendingUp,
  BarChart3,
  GitCompare,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Bell,
  Target
} from 'lucide-react';
import { HealthReminders } from '@/components/HealthReminders';
import { HealthGoals } from '@/components/HealthGoals';
import { HealthReportExport } from '@/components/HealthReportExport';
import { HealthCharts } from '@/components/HealthCharts';
import { HealthComparison } from '@/components/HealthComparison';
import { cn } from '@/lib/utils';

interface VitaminLog {
  id: string;
  vitamin_name: string;
  dosage: string | null;
  taken_at: string;
  notes: string | null;
}

interface GutHealthLog {
  id: string;
  date: string;
  digestion_score: number | null;
  bloating_level: number | null;
  bowel_regularity: string | null;
  probiotic_taken: boolean;
  water_intake_liters: number | null;
  fiber_intake: string | null;
  notes: string | null;
}

interface BodyHealthLog {
  id: string;
  date: string;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  energy_level: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  exercise_minutes: number | null;
  exercise_type: string | null;
  water_glasses: number | null;
  notes: string | null;
}

interface AIInsight {
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral';
  icon: string;
}

interface AIAnalysis {
  summary: string;
  insights: AIInsight[];
  recommendations: string[];
  correlations: string[];
}

const commonVitamins = [
  'Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D3', 'Vitamin E', 'Vitamin K',
  'Iron', 'Calcium', 'Magnesium', 'Zinc', 'Omega-3', 'Probiotics', 'Biotin', 'Folic Acid'
];

const HealthTracker = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('vitamins');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Vitamin states
  const [vitaminLogs, setVitaminLogs] = useState<VitaminLog[]>([]);
  const [newVitamin, setNewVitamin] = useState({ name: '', dosage: '', notes: '' });
  const [loadingVitamins, setLoadingVitamins] = useState(false);

  // Gut health states
  const [gutHealthLogs, setGutHealthLogs] = useState<GutHealthLog[]>([]);
  const [gutForm, setGutForm] = useState({
    digestion_score: 5,
    bloating_level: 1,
    bowel_regularity: 'normal',
    probiotic_taken: false,
    water_intake_liters: 2,
    fiber_intake: 'moderate',
    notes: ''
  });

  // Body health states
  const [bodyHealthLogs, setBodyHealthLogs] = useState<BodyHealthLog[]>([]);
  const [bodyForm, setBodyForm] = useState({
    weight_kg: '',
    height_cm: '',
    energy_level: 5,
    sleep_hours: 7,
    sleep_quality: 5,
    stress_level: 5,
    exercise_minutes: '',
    exercise_type: '',
    water_glasses: 8,
    notes: ''
  });

  // AI Insights states
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchVitaminLogs();
      fetchGutHealthLogs();
      fetchBodyHealthLogs();
    }
  }, [user]);

  const fetchVitaminLogs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('vitamin_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setVitaminLogs(data as VitaminLog[]);
    }
  };

  const fetchGutHealthLogs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('gut_health_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);

    if (!error && data) {
      setGutHealthLogs(data as GutHealthLog[]);
    }
  };

  const fetchBodyHealthLogs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('body_health_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);

    if (!error && data) {
      setBodyHealthLogs(data as BodyHealthLog[]);
    }
  };

  const addVitamin = async () => {
    if (!user || !newVitamin.name) return;
    setLoadingVitamins(true);

    const { error } = await supabase.from('vitamin_logs').insert({
      user_id: user.id,
      vitamin_name: newVitamin.name,
      dosage: newVitamin.dosage || null,
      notes: newVitamin.notes || null
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to log vitamin', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `${newVitamin.name} logged!` });
      setNewVitamin({ name: '', dosage: '', notes: '' });
      fetchVitaminLogs();
    }
    setLoadingVitamins(false);
  };

  const deleteVitaminLog = async (id: string) => {
    const { error } = await supabase.from('vitamin_logs').delete().eq('id', id);
    if (!error) {
      fetchVitaminLogs();
      toast({ title: 'Deleted', description: 'Vitamin log removed' });
    }
  };

  const saveGutHealth = async () => {
    if (!user) return;

    const { error } = await supabase.from('gut_health_logs').insert({
      user_id: user.id,
      digestion_score: gutForm.digestion_score,
      bloating_level: gutForm.bloating_level,
      bowel_regularity: gutForm.bowel_regularity,
      probiotic_taken: gutForm.probiotic_taken,
      water_intake_liters: gutForm.water_intake_liters,
      fiber_intake: gutForm.fiber_intake,
      notes: gutForm.notes || null
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to save gut health log', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Gut health logged!' });
      fetchGutHealthLogs();
    }
  };

  const saveBodyHealth = async () => {
    if (!user) return;

    const weight = bodyForm.weight_kg ? parseFloat(bodyForm.weight_kg) : null;
    const height = bodyForm.height_cm ? parseFloat(bodyForm.height_cm) : null;
    const bmi = weight && height ? parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1)) : null;

    const { error } = await supabase.from('body_health_logs').insert({
      user_id: user.id,
      weight_kg: weight,
      height_cm: height,
      bmi: bmi,
      energy_level: bodyForm.energy_level,
      sleep_hours: bodyForm.sleep_hours,
      sleep_quality: bodyForm.sleep_quality,
      stress_level: bodyForm.stress_level,
      exercise_minutes: bodyForm.exercise_minutes ? parseInt(bodyForm.exercise_minutes) : null,
      exercise_type: bodyForm.exercise_type || null,
      water_glasses: bodyForm.water_glasses,
      notes: bodyForm.notes || null
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to save body health log', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Body health logged!' });
      fetchBodyHealthLogs();
    }
  };

  const getScoreColor = (score: number, max: number = 10) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return 'text-emerald-400';
    if (percentage >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const fetchAIInsights = async () => {
    if (!user) return;
    setLoadingInsights(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-health`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze health data');
      }

      const data = await response.json();
      setAiAnalysis(data);
      toast({ title: 'Analysis Complete', description: 'Your health insights are ready!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to analyze health data', variant: 'destructive' });
    } finally {
      setLoadingInsights(false);
    }
  };

  const getInsightIcon = (iconType: string) => {
    switch (iconType) {
      case 'vitamin': return Pill;
      case 'gut': return Apple;
      case 'sleep': return Moon;
      case 'energy': return Zap;
      case 'water': return Droplets;
      case 'exercise': return Activity;
      case 'stress': return AlertTriangle;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'warning': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      default: return 'bg-primary/10 border-primary/30 text-primary';
    }
  };

  return (
    <div className="min-h-screen grain">
      <div className="hero-glow w-[500px] h-[500px] -top-[250px] left-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Guriga
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold">Raadraaca Caafimaadka</span>
          </div>
          {user && <HealthReportExport userId={user.id} />}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" />
            Complete Health Tracking
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">Track Your Wellness</h1>
          <p className="text-muted-foreground">Monitor vitamins, gut health, and body wellness</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-8 w-full max-w-5xl mx-auto bg-secondary/50 border border-border/50 p-1 rounded-2xl">
            <TabsTrigger value="vitamins" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Vitamins</span>
            </TabsTrigger>
            <TabsTrigger value="gut" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">Gut</span>
            </TabsTrigger>
            <TabsTrigger value="body" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Body</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Reminders</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
          </TabsList>

          {/* Vitamins Tab */}
          <TabsContent value="vitamins" className="space-y-6 animate-fadeIn">
            <div className="analysis-card">
              <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Log Vitamin Intake (Diiwaan Geli Fiitaamiinkaaga)
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {commonVitamins.map((vitamin) => (
                  <button
                    key={vitamin}
                    onClick={() => setNewVitamin({ ...newVitamin, name: vitamin })}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      newVitamin.name === vitamin
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 hover:bg-secondary text-foreground"
                    )}
                  >
                    {vitamin}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="vitamin-name">Vitamin Name (Magaca Fiitaamiinka)</Label>
                  <Input
                    id="vitamin-name"
                    value={newVitamin.name}
                    onChange={(e) => setNewVitamin({ ...newVitamin, name: e.target.value })}
                    placeholder="e.g., Vitamin D3"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage (Qiyaasta)</Label>
                  <Input
                    id="dosage"
                    value={newVitamin.dosage}
                    onChange={(e) => setNewVitamin({ ...newVitamin, dosage: e.target.value })}
                    placeholder="e.g., 1000 IU"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vitamin-notes">Notes (Qoraalada)</Label>
                  <Input
                    id="vitamin-notes"
                    value={newVitamin.notes}
                    onChange={(e) => setNewVitamin({ ...newVitamin, notes: e.target.value })}
                    placeholder="Optional notes"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button onClick={addVitamin} disabled={!newVitamin.name || loadingVitamins} className="w-full sm:w-auto gap-2">
                <Plus className="w-4 h-4" />
                Log Vitamin (Diiwaan Geli)
              </Button>
            </div>

            {/* Recent Vitamin Logs */}
            <div className="analysis-card">
              <h3 className="font-serif text-lg font-semibold mb-4">Recent Logs (Diiwaangelinta Dhawaan)</h3>
              {vitaminLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Weli fiitaamiin lama diiwaan gelin. Bilow raadraaca!</p>
              ) : (
                <div className="space-y-3">
                  {vitaminLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Pill className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{log.vitamin_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.dosage && `${log.dosage} • `}
                            {new Date(log.taken_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteVitaminLog(log.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Gut Health Tab */}
          <TabsContent value="gut" className="space-y-6 animate-fadeIn">
            <div className="analysis-card">
              <h3 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
                <Apple className="w-5 h-5 text-primary" />
                Daily Gut Health Check (Baaritaanka Caafimaadka Caloosha)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Digestion Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Digestion Score (Dhibcaha Dheefshiidka)</Label>
                    <span className={cn("font-semibold", getScoreColor(gutForm.digestion_score))}>
                      {gutForm.digestion_score}/10
                    </span>
                  </div>
                  <Slider
                    value={[gutForm.digestion_score]}
                    onValueChange={([value]) => setGutForm({ ...gutForm, digestion_score: value })}
                    min={1}
                    max={10}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Bloating Level */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Bloating Level (Heerka Buurnaanta Caloosha)</Label>
                    <span className={cn("font-semibold", getScoreColor(6 - gutForm.bloating_level, 5))}>
                      {gutForm.bloating_level}/5
                    </span>
                  </div>
                  <Slider
                    value={[gutForm.bloating_level]}
                    onValueChange={([value]) => setGutForm({ ...gutForm, bloating_level: value })}
                    min={1}
                    max={5}
                    step={1}
                    className="py-2"
                  />
                </div>

                {/* Water Intake */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Water Intake (Cabista Biyaha)
                    </Label>
                    <span className="font-semibold text-primary">{gutForm.water_intake_liters}L</span>
                  </div>
                  <Slider
                    value={[gutForm.water_intake_liters]}
                    onValueChange={([value]) => setGutForm({ ...gutForm, water_intake_liters: value })}
                    min={0}
                    max={5}
                    step={0.5}
                    className="py-2"
                  />
                </div>

                {/* Probiotic Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                  <Label className="flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Probiotic Taken Today (Maanta Probiotic Ma Qaadatay)
                  </Label>
                  <Switch
                    checked={gutForm.probiotic_taken}
                    onCheckedChange={(checked) => setGutForm({ ...gutForm, probiotic_taken: checked })}
                  />
                </div>

                {/* Fiber Intake */}
                <div className="space-y-2">
                  <Label>Fiber Intake (Cunista Fiiberka)</Label>
                  <div className="flex gap-2">
                    {['low', 'moderate', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setGutForm({ ...gutForm, fiber_intake: level })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                          gutForm.fiber_intake === level
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 hover:bg-secondary"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bowel Regularity */}
                <div className="space-y-2">
                  <Label>Bowel Regularity (Saxnaanta Saxarada)</Label>
                  <div className="flex gap-2">
                    {['irregular', 'normal', 'regular'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setGutForm({ ...gutForm, bowel_regularity: status })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                          gutForm.bowel_regularity === status
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 hover:bg-secondary"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Label>Notes (Qoraalada)</Label>
                <Textarea
                  value={gutForm.notes}
                  onChange={(e) => setGutForm({ ...gutForm, notes: e.target.value })}
                  placeholder="Any additional notes about your gut health today..."
                  className="mt-2"
                />
              </div>

              <Button onClick={saveGutHealth} className="w-full sm:w-auto mt-6 gap-2">
                <Plus className="w-4 h-4" />
                Save Gut Health Log (Kaydi Xogta Caloosha)
              </Button>
            </div>

            {/* Recent Gut Health Logs */}
            {gutHealthLogs.length > 0 && (
              <div className="analysis-card">
                <h3 className="font-serif text-lg font-semibold mb-4">Recent Gut Health Logs (Diiwaanka Caafimaadka Caloosha)</h3>
                <div className="space-y-3">
                  {gutHealthLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                        <span className={cn("font-semibold", getScoreColor(log.digestion_score || 5))}>
                          Dheefshiid: {log.digestion_score}/10
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Biyo</p>
                          <p className="font-medium">{log.water_intake_liters}L</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Buurnaanta</p>
                          <p className="font-medium">{log.bloating_level}/5</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Probiotic</p>
                          <p className="font-medium">{log.probiotic_taken ? '✓' : '✗'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Body Health Tab */}
          <TabsContent value="body" className="space-y-6 animate-fadeIn">
            <div className="analysis-card">
              <h3 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Daily Body Health Check (Baaritaanka Caafimaadka Jidhka)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Weight */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Weight (Miisaanka - kg)
                  </Label>
                  <Input
                    type="number"
                    value={bodyForm.weight_kg}
                    onChange={(e) => setBodyForm({ ...bodyForm, weight_kg: e.target.value })}
                    placeholder="e.g., 70"
                  />
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label>Height (Dhererka - cm)</Label>
                  <Input
                    type="number"
                    value={bodyForm.height_cm}
                    onChange={(e) => setBodyForm({ ...bodyForm, height_cm: e.target.value })}
                    placeholder="e.g., 175"
                  />
                </div>

                {/* BMI Display */}
                {bodyForm.weight_kg && bodyForm.height_cm && (
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 flex flex-col justify-center">
                    <p className="text-xs text-muted-foreground">Calculated BMI (BMI La Xisaabiyay)</p>
                    <p className="text-2xl font-serif font-bold text-primary">
                      {(parseFloat(bodyForm.weight_kg) / Math.pow(parseFloat(bodyForm.height_cm) / 100, 2)).toFixed(1)}
                    </p>
                  </div>
                )}

                {/* Energy Level */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Energy Level (Heerka Tamarta)
                    </Label>
                    <span className={cn("font-semibold", getScoreColor(bodyForm.energy_level))}>
                      {bodyForm.energy_level}/10
                    </span>
                  </div>
                  <Slider
                    value={[bodyForm.energy_level]}
                    onValueChange={([value]) => setBodyForm({ ...bodyForm, energy_level: value })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {/* Sleep Hours */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Sleep Hours (Saacadaha Hurdada)
                    </Label>
                    <span className="font-semibold text-primary">{bodyForm.sleep_hours}h</span>
                  </div>
                  <Slider
                    value={[bodyForm.sleep_hours]}
                    onValueChange={([value]) => setBodyForm({ ...bodyForm, sleep_hours: value })}
                    min={0}
                    max={12}
                    step={0.5}
                  />
                </div>

                {/* Sleep Quality */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Sleep Quality (Tayada Hurdada)</Label>
                    <span className={cn("font-semibold", getScoreColor(bodyForm.sleep_quality))}>
                      {bodyForm.sleep_quality}/10
                    </span>
                  </div>
                  <Slider
                    value={[bodyForm.sleep_quality]}
                    onValueChange={([value]) => setBodyForm({ ...bodyForm, sleep_quality: value })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {/* Stress Level */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Stress Level (Heerka Walwalka)</Label>
                    <span className={cn("font-semibold", getScoreColor(11 - bodyForm.stress_level))}>
                      {bodyForm.stress_level}/10
                    </span>
                  </div>
                  <Slider
                    value={[bodyForm.stress_level]}
                    onValueChange={([value]) => setBodyForm({ ...bodyForm, stress_level: value })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                {/* Water Glasses */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      Water (Biyo - koobab)
                    </Label>
                    <span className="font-semibold text-primary">{bodyForm.water_glasses}</span>
                  </div>
                  <Slider
                    value={[bodyForm.water_glasses]}
                    onValueChange={([value]) => setBodyForm({ ...bodyForm, water_glasses: value })}
                    min={0}
                    max={15}
                    step={1}
                  />
                </div>

                {/* Exercise */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Exercise (Jimicsiga - daqiiqo)
                  </Label>
                  <Input
                    type="number"
                    value={bodyForm.exercise_minutes}
                    onChange={(e) => setBodyForm({ ...bodyForm, exercise_minutes: e.target.value })}
                    placeholder="e.g., 30"
                  />
                </div>

                {/* Exercise Type */}
                <div className="space-y-2">
                  <Label>Exercise Type (Nooca Jimicsiga)</Label>
                  <Input
                    value={bodyForm.exercise_type}
                    onChange={(e) => setBodyForm({ ...bodyForm, exercise_type: e.target.value })}
                    placeholder="e.g., Running, Yoga"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label>Notes (Qoraalada)</Label>
                <Textarea
                  value={bodyForm.notes}
                  onChange={(e) => setBodyForm({ ...bodyForm, notes: e.target.value })}
                  placeholder="Any additional notes about your body health today..."
                  className="mt-2"
                />
              </div>

              <Button onClick={saveBodyHealth} className="w-full sm:w-auto mt-6 gap-2">
                <Plus className="w-4 h-4" />
                Save Body Health Log (Kaydi Xogta Jidhka)
              </Button>
            </div>

            {/* Recent Body Health Logs */}
            {bodyHealthLogs.length > 0 && (
              <div className="analysis-card">
                <h3 className="font-serif text-lg font-semibold mb-4">Recent Body Health Logs (Diiwaanka Caafimaadka Jidhka)</h3>
                <div className="space-y-3">
                  {bodyHealthLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                        {log.bmi && (
                          <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                            BMI: {log.bmi}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Tamarta</p>
                          <p className={cn("font-medium", getScoreColor(log.energy_level || 5))}>{log.energy_level}/10</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Hurdo</p>
                          <p className="font-medium">{log.sleep_hours}h</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Walwal</p>
                          <p className={cn("font-medium", getScoreColor(11 - (log.stress_level || 5)))}>{log.stress_level}/10</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Biyo</p>
                          <p className="font-medium">{log.water_glasses} koob</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6 animate-fadeIn">
            <HealthCharts user={user} />
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6 animate-fadeIn">
            <HealthComparison user={user} />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6 animate-fadeIn">
            <HealthGoals user={user} />
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6 animate-fadeIn">
            <HealthReminders user={user} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6 animate-fadeIn">
            <div className="analysis-card">
              <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold">Falanqaynta AI Caafimaadka</h3>
                    <p className="text-xs text-muted-foreground">Waxaa ku shaqeeya AI-ga casriga ah</p>
                  </div>
                </div>
                <Button onClick={fetchAIInsights} disabled={loadingInsights} className="gap-2">
                  {loadingInsights ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Waa la falanqaynayaa...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Falanqee Xogtayda
                    </>
                  )}
                </Button>
              </div>

              {!aiAnalysis && !loadingInsights && (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-2">Weli falanqayn la ma samayn</p>
                  <p className="text-sm text-muted-foreground/70">
                    Dhagsii "Falanqee Xogtayda" si aad u hesho talooyinka AI ku salaysan xogtaada caafimaadka
                  </p>
                </div>
              )}

              {loadingInsights && (
                <div className="text-center py-12">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                    <Brain className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                  </div>
                  <p className="text-muted-foreground">Waxaa la falanqaynayaa qaababka caafimaadkaaga...</p>
                  <p className="text-sm text-muted-foreground/70">Tani waxay qaadan kartaa dhowr ilbiriqsi</p>
                </div>
              )}
            </div>

            {aiAnalysis && (
              <>
                {/* Summary */}
                <div className="analysis-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold">Soo Koobid</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{aiAnalysis.summary}</p>
                </div>

                {/* Insights */}
                {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-semibold">Aragtiyo Muhiim ah</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiAnalysis.insights.map((insight, index) => {
                        const Icon = getInsightIcon(insight.icon);
                        return (
                          <div
                            key={index}
                            className={cn(
                              "p-4 rounded-xl border",
                              getInsightColor(insight.type)
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">{insight.title}</h4>
                                <p className="text-sm opacity-80">{insight.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Correlations */}
                {aiAnalysis.correlations && aiAnalysis.correlations.length > 0 && (
                  <div className="analysis-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold">Isku-xirnaanshaha Qaababka</h3>
                    </div>
                    <div className="space-y-2">
                      {aiAnalysis.correlations.map((correlation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                          <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-sm">{correlation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                  <div className="analysis-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold">Talooyinka</h3>
                    </div>
                    <div className="space-y-3">
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {index + 1}
                          </span>
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HealthTracker;
