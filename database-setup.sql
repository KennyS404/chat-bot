-- WhatsApp Audio Corrector Bot - Database Setup Script
-- Execute this in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    phone_number VARCHAR,
    name VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    last_interaction TIMESTAMP DEFAULT NOW()
);

-- 2. Create audio_messages table
CREATE TABLE IF NOT EXISTS audio_messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    duration INTEGER,
    file_size INTEGER,
    mime_type VARCHAR,
    storage_path VARCHAR,
    transcription TEXT,
    corrected_text TEXT,
    status VARCHAR DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_last_interaction ON users(last_interaction);
CREATE INDEX IF NOT EXISTS idx_audio_messages_user_id ON audio_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_messages_created_at ON audio_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_audio_messages_status ON audio_messages(status);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 5. Grant permissions to the anon role (after tables are created)
GRANT ALL ON users TO anon;
GRANT ALL ON audio_messages TO anon;
GRANT ALL ON system_logs TO anon;

-- Grant sequence permissions (with proper sequence names)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'audio_messages_id_seq' AND relkind = 'S') THEN
        GRANT USAGE, SELECT ON SEQUENCE audio_messages_id_seq TO anon;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'system_logs_id_seq' AND relkind = 'S') THEN
        GRANT USAGE, SELECT ON SEQUENCE system_logs_id_seq TO anon;
    END IF;
END $$;

-- 6. Enable Row Level Security (RLS) but allow service role access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- 7. Create policies to allow service role access (for the bot)
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Enable all access for service role" ON users;
    DROP POLICY IF EXISTS "Enable all access for service role audio" ON audio_messages;
    DROP POLICY IF EXISTS "Enable all access for service role logs" ON system_logs;
    
    -- Create new policies
    CREATE POLICY "Enable all access for service role" ON users
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

    CREATE POLICY "Enable all access for service role audio" ON audio_messages
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');

    CREATE POLICY "Enable all access for service role logs" ON system_logs
    FOR ALL USING (auth.role() = 'service_role' OR auth.role() = 'anon');
END $$;

-- 8. Create storage bucket for audio files (updated for current Supabase schema)
INSERT INTO storage.buckets (id, name)
VALUES ('audio-messages', 'audio-messages')
ON CONFLICT (id) DO NOTHING;

-- 9. Create storage policy for audio bucket
DO $$
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Enable upload for anon users" ON storage.objects;
    DROP POLICY IF EXISTS "Enable read access for anon users" ON storage.objects;
    DROP POLICY IF EXISTS "Enable delete for anon users" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Enable upload for anon users" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'audio-messages');

    CREATE POLICY "Enable read access for anon users" ON storage.objects
    FOR SELECT USING (bucket_id = 'audio-messages');

    CREATE POLICY "Enable delete for anon users" ON storage.objects
    FOR DELETE USING (bucket_id = 'audio-messages');
END $$;

-- Success message
SELECT 'Database setup completed successfully!' as message; 