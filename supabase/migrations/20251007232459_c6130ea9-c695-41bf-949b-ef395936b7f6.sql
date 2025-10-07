-- Create communities table
CREATE TABLE public.communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  UNIQUE(community_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities (public read)
CREATE POLICY "Anyone can view communities"
ON public.communities
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create communities"
ON public.communities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for community_members
CREATE POLICY "Anyone can view memberships"
ON public.community_members
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join communities"
ON public.community_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memberships"
ON public.community_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Function to update member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update member count
CREATE TRIGGER update_member_count_trigger
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW
EXECUTE FUNCTION public.update_community_member_count();

-- Insert some sample communities
INSERT INTO public.communities (name, description, member_count) VALUES
('Maqaarka Daryeelka Bulshada', 'Ku soo biir bulshada daryeelka maqaarka ee ugu weyn Soomaaliya', 0),
('Caafimaadka Iftiinka', 'Wadaag oo baro cilmiga iftiinka iyo caafimaadka maqaarka', 0),
('Dabiiciga Quruxda', 'Bulshada loogu talogalay daryeelka maqaarka oo dabiici ah', 0);