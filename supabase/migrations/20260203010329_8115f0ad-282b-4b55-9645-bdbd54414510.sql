-- Fix communities INSERT policy - make it permissive
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;

CREATE POLICY "Authenticated users can create communities"
ON public.communities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix user_credits INSERT policy - make it permissive  
DROP POLICY IF EXISTS "Users can insert their own credits" ON public.user_credits;

CREATE POLICY "Users can insert their own credits"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);