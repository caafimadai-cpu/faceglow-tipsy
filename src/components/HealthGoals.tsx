import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Target,
  Plus,
  Trash2,
  Scale,
  Moon,
  Activity,
  Droplets,
  Pill,
  Brain,
  CheckCircle,
  Calendar,
  TrendingUp,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthGoal {
  id: string;
  goal_type: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
}

interface HealthGoalsProps {
  user: User | null;
}

const goalTypes = [
  { value: 'weight', label: 'Miisaanka', icon: Scale, unit: 'kg', color: 'text-blue-400' },
  { value: 'sleep', label: 'Hurdo', icon: Moon, unit: 'saacadood', color: 'text-indigo-400' },
  { value: 'exercise', label: 'Jimicsi', icon: Activity, unit: 'daqiiqo', color: 'text-emerald-400' },
  { value: 'water', label: 'Biyo', icon: Droplets, unit: 'koobab', color: 'text-cyan-400' },
  { value: 'vitamins', label: 'Fiitamiino', icon: Pill, unit: 'maalmood', color: 'text-amber-400' },
  { value: 'stress', label: 'Walbahaarka', icon: Brain, unit: 'heerka', color: 'text-rose-400' }
];

export const HealthGoals: React.FC<HealthGoalsProps> = ({ user }) => {
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newGoal, setNewGoal] = useState({
    type: 'weight',
    title: '',
    targetValue: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setGoals(data as HealthGoal[]);
    }
  };

  const addGoal = async () => {
    if (!user || !newGoal.title || !newGoal.targetValue) return;
    setLoading(true);

    const typeInfo = goalTypes.find(t => t.value === newGoal.type);

    const { error } = await supabase.from('health_goals').insert({
      user_id: user.id,
      goal_type: newGoal.type,
      title: newGoal.title,
      target_value: parseFloat(newGoal.targetValue),
      current_value: 0,
      unit: typeInfo?.unit || '',
      deadline: newGoal.deadline || null
    });

    if (error) {
      toast({ title: 'Khalad', description: 'Ma lagu dari karin hadafka', variant: 'destructive' });
    } else {
      toast({ title: 'Guul', description: 'Hadafka la daray!' });
      setNewGoal({ type: 'weight', title: '', targetValue: '', deadline: '' });
      setShowForm(false);
      fetchGoals();
    }
    setLoading(false);
  };

  const updateProgress = async (id: string, newValue: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const isCompleted = newValue >= goal.target_value;

    const { error } = await supabase
      .from('health_goals')
      .update({ 
        current_value: newValue,
        is_completed: isCompleted
      })
      .eq('id', id);

    if (!error) {
      setGoals(goals.map(g => 
        g.id === id ? { ...g, current_value: newValue, is_completed: isCompleted } : g
      ));
      if (isCompleted) {
        toast({ title: 'Hambalyo! 🎉', description: 'Hadafkaaga waad gaadhay!' });
      }
    }
    setEditingGoal(null);
    setEditValue('');
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('health_goals').delete().eq('id', id);
    if (!error) {
      fetchGoals();
      toast({ title: 'La tirtiray', description: 'Hadafka la tirtiray' });
    }
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = goalTypes.find(t => t.value === type);
    const Icon = typeInfo?.icon || Target;
    return <Icon className={cn("w-5 h-5", typeInfo?.color)} />;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-emerald-500';
    if (percentage >= 75) return 'bg-emerald-400';
    if (percentage >= 50) return 'bg-amber-400';
    if (percentage >= 25) return 'bg-orange-400';
    return 'bg-rose-400';
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Stats */}
      <div className="analysis-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold">Hadafyada Caafimaadka</h3>
              <p className="text-xs text-muted-foreground">
                {activeGoals.length} hadafyo firfircoon • {completedGoals.length} la dhammeeyay
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Xir' : 'Hadaf Cusub'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <Target className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{goals.length}</p>
            <p className="text-xs text-muted-foreground">Wadarta</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-amber-400 mb-2" />
            <p className="text-2xl font-bold">{activeGoals.length}</p>
            <p className="text-xs text-muted-foreground">Socda</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <CheckCircle className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
            <p className="text-2xl font-bold">{completedGoals.length}</p>
            <p className="text-xs text-muted-foreground">Dhammaystiran</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <Activity className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
            <p className="text-2xl font-bold">
              {goals.length > 0 
                ? Math.round(goals.reduce((acc, g) => acc + (g.current_value / g.target_value * 100), 0) / goals.length)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Celcelis</p>
          </div>
        </div>
      </div>

      {/* Add New Goal Form */}
      {showForm && (
        <div className="analysis-card animate-fadeIn">
          <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Kudar Hadaf Cusub
          </h3>

          <div className="space-y-4">
            {/* Goal Type */}
            <div>
              <Label className="mb-2 block">Nooca Hadafka</Label>
              <div className="flex flex-wrap gap-2">
                {goalTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setNewGoal({ ...newGoal, type: type.value })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      newGoal.type === type.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 hover:bg-secondary text-foreground"
                    )}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="goal-title">Magaca Hadafka</Label>
              <Input
                id="goal-title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="tusaale: Yaree miisaanka ilaa 70kg"
                className="mt-1"
              />
            </div>

            {/* Target Value */}
            <div>
              <Label htmlFor="target-value">
                Qiimaha Bartilmaameedka ({goalTypes.find(t => t.value === newGoal.type)?.unit})
              </Label>
              <Input
                id="target-value"
                type="number"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                placeholder="tusaale: 70"
                className="mt-1"
              />
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="deadline">Wakhtiga Ugu Dambeeya (ikhtiyaari)</Label>
              <Input
                id="deadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={addGoal} 
              disabled={loading || !newGoal.title || !newGoal.targetValue}
              className="w-full sm:w-auto gap-2"
            >
              <Plus className="w-4 h-4" />
              Kudar Hadafka
            </Button>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="analysis-card">
          <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Hadafyada Socda
          </h3>
          
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const percentage = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
              const daysRemaining = getDaysRemaining(goal.deadline);
              const typeInfo = goalTypes.find(t => t.value === goal.goal_type);

              return (
                <div 
                  key={goal.id} 
                  className="p-4 rounded-xl bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(goal.goal_type)}
                      </div>
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="capitalize">{typeInfo?.label}</span>
                          {daysRemaining !== null && (
                            <>
                              <Calendar className="w-3 h-3" />
                              {daysRemaining > 0 
                                ? `${daysRemaining} maalmood haray`
                                : daysRemaining === 0 
                                  ? 'Maanta!'
                                  : 'Waqtiga dhaafay'}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Horumarinta</span>
                      <span className="font-medium">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={percentage} className="h-3" />
                      <span 
                        className={cn(
                          "absolute right-0 top-1/2 -translate-y-1/2 px-2 text-xs font-bold",
                          percentage >= 50 ? "text-primary-foreground" : "text-foreground"
                        )}
                      >
                        {percentage}%
                      </span>
                    </div>
                    
                    {/* Update Progress */}
                    <div className="flex items-center gap-2 mt-3">
                      {editingGoal === goal.id ? (
                        <>
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={`Qiimaha cusub (${goal.unit})`}
                            className="flex-1 h-8"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => updateProgress(goal.id, parseFloat(editValue))}
                            disabled={!editValue}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => { setEditingGoal(null); setEditValue(''); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-2"
                          onClick={() => { 
                            setEditingGoal(goal.id); 
                            setEditValue(goal.current_value.toString()); 
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                          Cusboonaysii
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="analysis-card">
          <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Hadafyada La Dhammeeyay
          </h3>
          
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div 
                key={goal.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-400">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {goal.target_value} {goal.unit} ✓
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && !showForm && (
        <div className="analysis-card text-center py-12">
          <Target className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Weli hadaf kuma laha</p>
          <p className="text-sm text-muted-foreground/70 mb-4">
            Ku dar hadafkaaga caafimaad ugu horeeya si aad u raadraacdo horumarkaaga
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Kudar Hadafka Koowaad
          </Button>
        </div>
      )}
    </div>
  );
};
