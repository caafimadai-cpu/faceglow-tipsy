-- Create vitamin tracking table
CREATE TABLE public.vitamin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vitamin_name TEXT NOT NULL,
  dosage TEXT,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gut health tracking table
CREATE TABLE public.gut_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  digestion_score INTEGER CHECK (digestion_score >= 1 AND digestion_score <= 10),
  bloating_level INTEGER CHECK (bloating_level >= 1 AND bloating_level <= 5),
  bowel_regularity TEXT,
  probiotic_taken BOOLEAN DEFAULT false,
  water_intake_liters NUMERIC(3,1),
  fiber_intake TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create body health tracking table
CREATE TABLE public.body_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,1),
  bmi NUMERIC(4,1),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  exercise_minutes INTEGER,
  exercise_type TEXT,
  water_glasses INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vitamin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gut_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_health_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vitamin_logs
CREATE POLICY "Users can view their own vitamin logs"
ON public.vitamin_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vitamin logs"
ON public.vitamin_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vitamin logs"
ON public.vitamin_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vitamin logs"
ON public.vitamin_logs FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for gut_health_logs
CREATE POLICY "Users can view their own gut health logs"
ON public.gut_health_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gut health logs"
ON public.gut_health_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gut health logs"
ON public.gut_health_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gut health logs"
ON public.gut_health_logs FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for body_health_logs
CREATE POLICY "Users can view their own body health logs"
ON public.body_health_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own body health logs"
ON public.body_health_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body health logs"
ON public.body_health_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body health logs"
ON public.body_health_logs FOR DELETE
USING (auth.uid() = user_id);