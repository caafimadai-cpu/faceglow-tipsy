import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  BellOff,
  Pill, 
  Apple, 
  Activity,
  Plus,
  Trash2,
  Clock,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthReminder {
  id: string;
  reminder_type: 'vitamin' | 'gut' | 'body';
  reminder_time: string;
  is_enabled: boolean;
  days_of_week: number[];
}

interface HealthRemindersProps {
  user: User | null;
}

const reminderTypes = [
  { value: 'vitamin', label: 'Fiitamiino', icon: Pill, color: 'text-amber-400' },
  { value: 'gut', label: 'Caafimaadka Xiidmaha', icon: Apple, color: 'text-emerald-400' },
  { value: 'body', label: 'Caafimaadka Jirka', icon: Activity, color: 'text-primary' }
];

const daysOfWeek = [
  { value: 0, label: 'Ax' },
  { value: 1, label: 'Is' },
  { value: 2, label: 'Sa' },
  { value: 3, label: 'Ar' },
  { value: 4, label: 'Kh' },
  { value: 5, label: 'Ji' },
  { value: 6, label: 'Sa' }
];

export const HealthReminders: React.FC<HealthRemindersProps> = ({ user }) => {
  const [reminders, setReminders] = useState<HealthReminder[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [newReminder, setNewReminder] = useState({
    type: 'vitamin' as 'vitamin' | 'gut' | 'body',
    time: '09:00',
    days: [0, 1, 2, 3, 4, 5, 6]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    if (user) {
      fetchReminders();
    }
  }, [user]);

  // Check and trigger notifications
  useEffect(() => {
    if (!user || notificationPermission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();

      reminders.forEach((reminder) => {
        if (
          reminder.is_enabled &&
          reminder.reminder_time.substring(0, 5) === currentTime &&
          reminder.days_of_week.includes(currentDay)
        ) {
          const typeInfo = reminderTypes.find(t => t.value === reminder.reminder_type);
          new Notification('Xusuusin Caafimaad 🔔', {
            body: `Waa waqtigii aad ${typeInfo?.label || 'caafimaadkaaga'} qoran lahayd!`,
            icon: '/favicon.ico',
            tag: reminder.id
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders, user, notificationPermission]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast({ title: 'Ogeysiisyada', description: 'Ogeysiisyada la dhigay!' });
      } else {
        toast({ title: 'Diidan', description: 'Ogeysiisyada ma la oggolaan', variant: 'destructive' });
      }
    }
  };

  const fetchReminders = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('health_reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('reminder_time', { ascending: true });

    if (!error && data) {
      setReminders(data as HealthReminder[]);
    }
  };

  const addReminder = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('health_reminders').insert({
      user_id: user.id,
      reminder_type: newReminder.type,
      reminder_time: newReminder.time,
      days_of_week: newReminder.days,
      is_enabled: true
    });

    if (error) {
      toast({ title: 'Khalad', description: 'Ma lagu dari karin xusuusinta', variant: 'destructive' });
    } else {
      toast({ title: 'Guul', description: 'Xusuusinta la daray!' });
      fetchReminders();
    }
    setLoading(false);
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from('health_reminders')
      .update({ is_enabled: enabled })
      .eq('id', id);

    if (!error) {
      setReminders(reminders.map(r => r.id === id ? { ...r, is_enabled: enabled } : r));
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase.from('health_reminders').delete().eq('id', id);
    if (!error) {
      fetchReminders();
      toast({ title: 'La tirtiray', description: 'Xusuusinta la tirtiray' });
    }
  };

  const toggleDay = (day: number) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }));
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = reminderTypes.find(t => t.value === type);
    const Icon = typeInfo?.icon || Bell;
    return <Icon className={cn("w-5 h-5", typeInfo?.color)} />;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notification Permission */}
      <div className="analysis-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {notificationPermission === 'granted' ? (
              <Bell className="w-6 h-6 text-emerald-400" />
            ) : (
              <BellOff className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-serif text-lg font-semibold">Ogeysiisyada Browserka</h3>
              <p className="text-sm text-muted-foreground">
                {notificationPermission === 'granted' 
                  ? 'Ogeysiisyada waa shaqaynayaan' 
                  : 'U oggolaanso ogeysiisyada si aad xusuusin u hesho'}
              </p>
            </div>
          </div>
          {notificationPermission !== 'granted' && (
            <Button onClick={requestNotificationPermission} className="gap-2">
              <Bell className="w-4 h-4" />
              Fur Ogeysiisyada
            </Button>
          )}
          {notificationPermission === 'granted' && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">Shaqaynaya</span>
            </div>
          )}
        </div>
      </div>

      {/* Add New Reminder */}
      <div className="analysis-card">
        <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Kudar Xusuusin Cusub
        </h3>

        <div className="space-y-4">
          {/* Reminder Type */}
          <div>
            <Label className="mb-2 block">Nooca Xusuusinta</Label>
            <div className="flex flex-wrap gap-2">
              {reminderTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setNewReminder({ ...newReminder, type: type.value as 'vitamin' | 'gut' | 'body' })}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    newReminder.type === type.value
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

          {/* Time */}
          <div>
            <Label htmlFor="reminder-time" className="mb-2 block">Waqtiga</Label>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <Input
                id="reminder-time"
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                className="w-32"
              />
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <Label className="mb-2 block">Maalmaha</Label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                    newReminder.days.includes(day.value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary text-foreground"
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={addReminder} 
            disabled={loading || newReminder.days.length === 0}
            className="w-full sm:w-auto gap-2"
          >
            <Plus className="w-4 h-4" />
            Kudar Xusuusinta
          </Button>
        </div>
      </div>

      {/* Existing Reminders */}
      <div className="analysis-card">
        <h3 className="font-serif text-lg font-semibold mb-4">Xusuusinteydaada</h3>
        
        {reminders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Xusuusin kuma laha. Ku dar mid cusub!
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const typeInfo = reminderTypes.find(t => t.value === reminder.reminder_type);
              return (
                <div 
                  key={reminder.id} 
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                    reminder.is_enabled 
                      ? "bg-secondary/30 border-border/50" 
                      : "bg-secondary/10 border-border/30 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(reminder.reminder_type)}
                    </div>
                    <div>
                      <p className="font-medium">{typeInfo?.label}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {reminder.reminder_time.substring(0, 5)}
                        <span className="text-xs">
                          • {reminder.days_of_week.map(d => daysOfWeek.find(day => day.value === d)?.label).join(', ')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.is_enabled}
                      onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
