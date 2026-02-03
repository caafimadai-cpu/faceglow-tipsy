
-- Add category column to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general';

-- Add read_time column for better blog UX
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS read_time integer DEFAULT 3;

-- Add excerpt column for preview
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS excerpt text;
