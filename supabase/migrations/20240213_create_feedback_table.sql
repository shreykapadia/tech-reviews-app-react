-- Create Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
    message TEXT NOT NULL,
    email TEXT,
    user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own feedback
CREATE POLICY "Enable insert for authenticated users only" ON public.feedback
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback
CREATE POLICY "Enable select for users based on user_id" ON public.feedback
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all feedback (for admin dashboard)
-- (Implicitly available to service_role, but explicit policies can be added if needed for other roles)
