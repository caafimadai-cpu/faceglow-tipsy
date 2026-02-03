-- The Lovable Cloud UI uses anon/authenticated role, not service_role
-- We need to allow authenticated users to insert rows for any user_id

-- For user_credits: Allow any authenticated user to insert any row (for admin use)
DROP POLICY IF EXISTS "Allow authenticated to insert any credits" ON public.user_credits;
CREATE POLICY "Allow authenticated to insert any credits"
ON public.user_credits
FOR INSERT
TO authenticated
WITH CHECK (true);

-- For community_members: Allow any authenticated user to insert any row (for admin use)
DROP POLICY IF EXISTS "Allow authenticated to insert any member" ON public.community_members;
CREATE POLICY "Allow authenticated to insert any member"
ON public.community_members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also need anon role policies for the backend table editor
DROP POLICY IF EXISTS "Anon can insert credits" ON public.user_credits;
CREATE POLICY "Anon can insert credits"
ON public.user_credits
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Anon can insert members" ON public.community_members;
CREATE POLICY "Anon can insert members"
ON public.community_members
FOR INSERT
TO anon
WITH CHECK (true);

-- Also add SELECT for anon so backend can see data
DROP POLICY IF EXISTS "Anon can view credits" ON public.user_credits;
CREATE POLICY "Anon can view credits"
ON public.user_credits
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Anon can view members" ON public.community_members;
CREATE POLICY "Anon can view members"
ON public.community_members
FOR SELECT
TO anon
USING (true);

-- Add UPDATE for anon
DROP POLICY IF EXISTS "Anon can update credits" ON public.user_credits;
CREATE POLICY "Anon can update credits"
ON public.user_credits
FOR UPDATE
TO anon
USING (true);

DROP POLICY IF EXISTS "Anon can update members" ON public.community_members;
CREATE POLICY "Anon can update members"
ON public.community_members
FOR UPDATE
TO anon
USING (true);