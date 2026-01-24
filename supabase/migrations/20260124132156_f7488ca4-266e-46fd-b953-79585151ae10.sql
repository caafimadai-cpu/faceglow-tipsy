-- Fix security issues

-- 1. Remove the overly permissive "Public view basic membership" policy from community_members
DROP POLICY IF EXISTS "Public view basic membership" ON public.community_members;

-- 2. Remove duplicate policy on community_members (keep only one user-specific policy)
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.community_members;

-- 3. Restrict profiles table - users can only view their own profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. Create a function to get public community member count without exposing payment data
CREATE OR REPLACE FUNCTION public.get_community_member_count(community_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER 
  FROM community_members 
  WHERE community_id = community_uuid 
    AND payment_status = 'completed';
$$;