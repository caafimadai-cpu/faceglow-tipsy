-- Create health reminders table
CREATE TABLE public.health_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'vitamin', 'gut', 'body'
  reminder_time TIME NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=Sunday, 6=Saturday
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reminders" 
ON public.health_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.health_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.health_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.health_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_health_reminders_updated_at
BEFORE UPDATE ON public.health_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();