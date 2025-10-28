-- Create table for managing custom ads
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('banner', 'video', 'square', 'skyscraper')),
  media_url TEXT NOT NULL,
  click_url TEXT,
  placement TEXT NOT NULL CHECK (placement IN ('top-banner', 'bottom-banner', 'left-skyscraper', 'right-square-1', 'right-square-2', 'right-video', 'middle-square', 'post-results-video')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Anyone can view active ads
CREATE POLICY "Anyone can view active ads" 
ON public.ads 
FOR SELECT 
USING (is_active = true);

-- Only authenticated users can manage ads (you can restrict this further if needed)
CREATE POLICY "Authenticated users can insert ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ads" 
ON public.ads 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete ads" 
ON public.ads 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();