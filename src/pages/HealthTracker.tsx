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
  Clock
} from 'lucide-react';
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

  return (
    <div className="min-h-screen grain">
      <div className="hero-glow w-[500px] h-[500px] -top-[250px] left-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <span className="font-serif text-lg font-semibold">Health Tracker</span>
          </div>
          <div className="w-20" />
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
          <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto bg-secondary/50 border border-border/50 p-1 rounded-2xl">
            <TabsTrigger value="vitamins" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Vitamins</span>
            </TabsTrigger>
            <TabsTrigger value="gut" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">Gut Health</span>
            </TabsTrigger>
            <TabsTrigger value="body" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Body Health</span>
            </TabsTrigger>
          </TabsList>

          {/* Vitamins Tab */}
          <TabsContent value="vitamins" className="space-y-6 animate-fadeIn">
            <div className="analysis-card">
              <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Log Vitamin Intake
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
                  <Label htmlFor="vitamin-name">Vitamin Name</Label>
                  <Input
                    id="vitamin-name"
                    value={newVitamin.name}
                    onChange={(e) => setNewVitamin({ ...newVitamin, name: e.target.value })}
                    placeholder="e.g., Vitamin D3"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newVitamin.dosage}
                    onChange={(e) => setNewVitamin({ ...newVitamin, dosage: e.target.value })}
                    placeholder="e.g., 1000 IU"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vitamin-notes">Notes</Label>
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
                Log Vitamin
              </Button>
            </div>

            {/* Recent Vitamin Logs */}
            <div className="analysis-card">
              <h3 className="font-serif text-lg font-semibold mb-4">Recent Logs</h3>
              {vitaminLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No vitamins logged yet. Start tracking!</p>
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
                Daily Gut Health Check
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Digestion Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Digestion Score</Label>
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
                    <Label>Bloating Level</Label>
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
                      Water Intake (L)
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
                    Probiotic Taken Today
                  </Label>
                  <Switch
                    checked={gutForm.probiotic_taken}
                    onCheckedChange={(checked) => setGutForm({ ...gutForm, probiotic_taken: checked })}
                  />
                </div>

                {/* Fiber Intake */}
                <div className="space-y-2">
                  <Label>Fiber Intake</Label>
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
                  <Label>Bowel Regularity</Label>
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
                <Label>Notes</Label>
                <Textarea
                  value={gutForm.notes}
                  onChange={(e) => setGutForm({ ...gutForm, notes: e.target.value })}
                  placeholder="Any additional notes about your gut health today..."
                  className="mt-2"
                />
              </div>

              <Button onClick={saveGutHealth} className="w-full sm:w-auto mt-6 gap-2">
                <Plus className="w-4 h-4" />
                Save Gut Health Log
              </Button>
            </div>

            {/* Recent Gut Health Logs */}
            {gutHealthLogs.length > 0 && (
              <div className="analysis-card">
                <h3 className="font-serif text-lg font-semibold mb-4">Recent Gut Health Logs</h3>
                <div className="space-y-3">
                  {gutHealthLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
                        <span className={cn("font-semibold", getScoreColor(log.digestion_score || 5))}>
                          Digestion: {log.digestion_score}/10
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Water</p>
                          <p className="font-medium">{log.water_intake_liters}L</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Bloating</p>
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
                Daily Body Health Check
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Weight */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Weight (kg)
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
                  <Label>Height (cm)</Label>
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
                    <p className="text-xs text-muted-foreground">Calculated BMI</p>
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
                      Energy Level
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
                      Sleep Hours
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
                    <Label>Sleep Quality</Label>
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
                    <Label>Stress Level</Label>
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
                      Water (glasses)
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
                    Exercise (minutes)
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
                  <Label>Exercise Type</Label>
                  <Input
                    value={bodyForm.exercise_type}
                    onChange={(e) => setBodyForm({ ...bodyForm, exercise_type: e.target.value })}
                    placeholder="e.g., Running, Yoga"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label>Notes</Label>
                <Textarea
                  value={bodyForm.notes}
                  onChange={(e) => setBodyForm({ ...bodyForm, notes: e.target.value })}
                  placeholder="Any additional notes about your body health today..."
                  className="mt-2"
                />
              </div>

              <Button onClick={saveBodyHealth} className="w-full sm:w-auto mt-6 gap-2">
                <Plus className="w-4 h-4" />
                Save Body Health Log
              </Button>
            </div>

            {/* Recent Body Health Logs */}
            {bodyHealthLogs.length > 0 && (
              <div className="analysis-card">
                <h3 className="font-serif text-lg font-semibold mb-4">Recent Body Health Logs</h3>
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
                          <p className="text-xs text-muted-foreground">Energy</p>
                          <p className={cn("font-medium", getScoreColor(log.energy_level || 5))}>{log.energy_level}/10</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Sleep</p>
                          <p className="font-medium">{log.sleep_hours}h</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Stress</p>
                          <p className={cn("font-medium", getScoreColor(11 - (log.stress_level || 5)))}>{log.stress_level}/10</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Water</p>
                          <p className="font-medium">{log.water_glasses} glasses</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HealthTracker;
