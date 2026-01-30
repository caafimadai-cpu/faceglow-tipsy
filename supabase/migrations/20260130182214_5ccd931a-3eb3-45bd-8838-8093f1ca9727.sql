-- Create community_posts table for articles and posts
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for community_posts
-- Members can view posts from communities they've joined (with completed payment)
CREATE POLICY "Members can view community posts"
ON public.community_posts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_members.community_id = community_posts.community_id
    AND community_members.user_id = auth.uid()
    AND community_members.payment_status = 'completed'
  )
);

-- Members can create posts in communities they've joined
CREATE POLICY "Members can create posts"
ON public.community_posts
FOR INSERT
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM public.community_members
    WHERE community_members.community_id = community_posts.community_id
    AND community_members.user_id = auth.uid()
    AND community_members.payment_status = 'completed'
  )
);

-- Authors can update their own posts
CREATE POLICY "Authors can update their posts"
ON public.community_posts
FOR UPDATE
USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete their posts"
ON public.community_posts
FOR DELETE
USING (auth.uid() = author_id);

-- Create trigger for updated_at
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample posts to the first community
INSERT INTO public.community_posts (community_id, author_id, title, content)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Soo Dhawoow Bulshada!',
  'Waxaan ku faraxsannahay inaad nagu soo biirtay bulshadayada. Halkan waxaad ka helaysaa talooyinka ugu muhiimsan ee daryeelka maqaarka iyo caafimaadka guud.'
FROM public.communities c
LIMIT 1;

INSERT INTO public.community_posts (community_id, author_id, title, content)
SELECT 
  c.id,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Talooyinka Daryeelka Maqaarka',
  'Maqaarkaaga waa mushkiladda ugu weyn jirkaaga, wuxuuna u baahan yahay daryeel joogto ah. Halkan waxaan kugu soo bandhigaynaa talooyinka ugu fiican ee aad ku ilaalin karto maqaarkaaga.'
FROM public.communities c
LIMIT 1;