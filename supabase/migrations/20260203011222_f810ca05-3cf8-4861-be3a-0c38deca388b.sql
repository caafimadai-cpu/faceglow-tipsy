-- Add service role bypass for user_credits INSERT (allows admin to add rows for any user)
DROP POLICY IF EXISTS "Service role can insert any credits" ON public.user_credits;
CREATE POLICY "Service role can insert any credits"
ON public.user_credits
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add service role bypass for community_members INSERT (allows admin to add rows for any user)
DROP POLICY IF EXISTS "Service role can insert any member" ON public.community_members;
CREATE POLICY "Service role can insert any member"
ON public.community_members
FOR INSERT
TO service_role
WITH CHECK (true);

-- Also add service role SELECT policies so admin can view all data
DROP POLICY IF EXISTS "Service role can view all credits" ON public.user_credits;
CREATE POLICY "Service role can view all credits"
ON public.user_credits
FOR SELECT
TO service_role
USING (true);

DROP POLICY IF EXISTS "Service role can view all members" ON public.community_members;
CREATE POLICY "Service role can view all members"
ON public.community_members
FOR SELECT
TO service_role
USING (true);

-- Add service role UPDATE policies
DROP POLICY IF EXISTS "Service role can update any credits" ON public.user_credits;
CREATE POLICY "Service role can update any credits"
ON public.user_credits
FOR UPDATE
TO service_role
USING (true);

DROP POLICY IF EXISTS "Service role can update any member" ON public.community_members;
CREATE POLICY "Service role can update any member"
ON public.community_members
FOR UPDATE
TO service_role
USING (true);