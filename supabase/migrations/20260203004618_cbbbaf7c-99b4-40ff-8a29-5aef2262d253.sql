
-- Drop the restrictive SELECT policy and recreate as permissive
DROP POLICY IF EXISTS "Users can view own memberships" ON public.community_members;

CREATE POLICY "Users can view own memberships"
ON public.community_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
