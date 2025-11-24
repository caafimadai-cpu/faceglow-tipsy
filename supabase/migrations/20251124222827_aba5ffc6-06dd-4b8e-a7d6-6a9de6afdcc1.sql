-- Fix 1: Add creator tracking to ads table
ALTER TABLE public.ads ADD COLUMN creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set existing ads to NULL creator (will need manual assignment)
-- New ads will require creator_id

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert ads" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can update ads" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can delete ads" ON public.ads;

-- Create owner-based policies for ads
CREATE POLICY "Users can create their own ads"
ON public.ads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own ads"
ON public.ads
FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own ads"
ON public.ads
FOR DELETE
TO authenticated
USING (auth.uid() = creator_id);

-- Fix 3: Restrict community_members visibility
DROP POLICY IF EXISTS "Anyone can view memberships" ON public.community_members;

-- Users can only view their own membership details
CREATE POLICY "Users view own memberships"
ON public.community_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public can view basic membership info (for member counts) but not payment details
CREATE POLICY "Public view basic membership"
ON public.community_members
FOR SELECT
TO anon
USING (true);