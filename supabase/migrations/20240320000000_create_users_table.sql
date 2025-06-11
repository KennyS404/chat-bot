-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Create index on last_interaction for better query performance
CREATE INDEX IF NOT EXISTS idx_users_last_interaction ON public.users(last_interaction);

-- Grant access to the anon role
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role; 