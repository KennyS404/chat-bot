-- Temporarily disable RLS for development/testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs DISABLE ROW LEVEL SECURITY;

-- Create permissive policies for anon users (for development only)
-- In production, you should implement proper RLS policies

-- Users table policies
CREATE POLICY "Allow all operations on users" ON public.users
    FOR ALL USING (true);

-- Audio messages table policies
CREATE POLICY "Allow all operations on audio_messages" ON public.audio_messages
    FOR ALL USING (true);

-- Conversations table policies
CREATE POLICY "Allow all operations on conversations" ON public.conversations
    FOR ALL USING (true);

-- Messages table policies
CREATE POLICY "Allow all operations on messages" ON public.messages
    FOR ALL USING (true);

-- System logs table policies
CREATE POLICY "Allow all operations on system_logs" ON public.system_logs
    FOR ALL USING (true);

-- Ensure audio-messages bucket exists and has proper permissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-messages', 'audio-messages', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for audio-messages bucket
CREATE POLICY "Allow authenticated access to audio files" ON storage.objects
    FOR ALL USING (bucket_id = 'audio-messages'); 