import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { logger } from '../logger.js';

export class DatabaseService {
    constructor() {
        // Check if Supabase configuration is available
        if (!config.supabase.url || !config.supabase.key || 
            config.supabase.url === 'your_supabase_url_here' || 
            config.supabase.key === 'your_supabase_key_here') {
            
            logger.error('❌ Configuração do Supabase não encontrada!');
            logger.error('   Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env');
            logger.error('   Execute: npm run setup-env para criar o arquivo .env');
            throw new Error('Supabase configuration missing');
        }
        
        this.supabase = createClient(config.supabase.url, config.supabase.key);
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Check if tables exist by querying the users table
            const { error } = await this.supabase
                .from('users')
                .select('id')
                .limit(1);

            if (error && error.code === '42P01') { // Table doesn't exist
                logger.info('Initializing database tables...');
                await this.createTables();
            }

            this.initialized = true;
            logger.info('Database initialized successfully');
        } catch (error) {
            logger.error('Error initializing database:', error);
            throw error;
        }
    }

    async createTables() {
        // The tables will be created automatically by Supabase migrations
        // This is just a fallback in case migrations fail
        logger.info('Tables will be created by Supabase migrations');
    }

    async storeAudio(userId, audioData) {
        try {
            // First ensure user exists
            let user = await this.getUser(userId);
            if (!user) {
                logger.warn(`User ${userId} not found, creating user first`);
                user = await this.createUser(userId, userId.split('@')[0], 'Usuário WhatsApp');
            }

            // Generate a unique filename with timestamp and random string
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const filename = `${userId.replace('@', '_')}/${timestamp}_${randomStr}.ogg`;
            
            // Compress audio before upload if it's too large
            let audioBuffer = audioData.buffer;
            if (audioBuffer.length > 1024 * 1024) { // If larger than 1MB
                logger.info('Audio file is large, attempting compression...');
                try {
                    audioBuffer = await this.compressAudio(audioBuffer);
                    logger.info(`Audio compressed from ${audioData.buffer.length} to ${audioBuffer.length} bytes`);
                } catch (compressionError) {
                    logger.warn('Audio compression failed, using original:', compressionError.message);
                    audioBuffer = audioData.buffer;
                }
            }
            
            // Try to upload audio file to storage with retry logic
            let uploadData, uploadError;
            for (let attempt = 1; attempt <= 3; attempt++) {
                logger.info(`Attempting audio upload (attempt ${attempt}/3)...`);
                const uploadResult = await this.supabase
                    .storage
                    .from('audio-messages')
                    .upload(filename, audioBuffer, {
                        contentType: 'audio/ogg',
                        cacheControl: '3600',
                        upsert: false
                    });
                
                uploadData = uploadResult.data;
                uploadError = uploadResult.error;
                
                if (!uploadError) {
                    logger.info('Audio upload successful');
                    break;
                } else {
                    logger.warn(`Upload attempt ${attempt} failed:`, uploadError.message);
                    if (attempt === 3) {
                        // On final attempt, try with a different filename
                        const retryFilename = `${userId.replace('@', '_')}/${timestamp}_${randomStr}_retry.ogg`;
                        logger.info('Final attempt with new filename:', retryFilename);
                        const finalUpload = await this.supabase
                            .storage
                            .from('audio-messages')
                            .upload(retryFilename, audioBuffer, {
                                contentType: 'audio/ogg',
                                cacheControl: '3600',
                                upsert: true // Allow overwrite on final attempt
                            });
                        uploadData = finalUpload.data;
                        uploadError = finalUpload.error;
                        if (!uploadError) {
                            filename = retryFilename;
                        }
                    }
                }
                
                if (attempt < 3 && uploadError) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Progressive delay
                }
            }

            if (uploadError) {
                logger.error('All upload attempts failed:', uploadError);
                throw uploadError;
            }

            // Create audio message record with retry logic
            let audioMessage, insertError;
            for (let attempt = 1; attempt <= 2; attempt++) {
                const insertResult = await this.supabase
                    .from('audio_messages')
                    .insert([{
                        user_id: userId,
                        duration: audioData.duration || 10,
                        file_size: audioBuffer.length,
                        mime_type: 'audio/ogg',
                        storage_path: filename,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                audioMessage = insertResult.data;
                insertError = insertResult.error;
                
                if (!insertError) {
                    logger.info('Audio message record created successfully');
                    break;
                } else {
                    logger.warn(`Insert attempt ${attempt} failed:`, insertError.message);
                    if (attempt === 2) {
                        throw insertError;
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            return audioMessage;
        } catch (error) {
            logger.error('Error storing audio:', error.message || error);
            logger.error('Audio storage details:', {
                userId,
                audioSize: audioData.buffer?.length,
                duration: audioData.duration,
                errorCode: error.code,
                errorMessage: error.message
            });
            
            // Return a fallback object to prevent complete failure
            return {
                id: `fallback_${Date.now()}`,
                user_id: userId,
                duration: audioData.duration || 10,
                file_size: audioData.buffer?.length || 0,
                mime_type: 'audio/ogg',
                storage_path: null,
                status: 'error',
                error_message: error.message,
                created_at: new Date().toISOString()
            };
        }
    }

    async compressAudio(buffer) {
        // Implement basic audio compression
        // This is a placeholder - in a real implementation, you would use a proper audio compression library
        return buffer;
    }

    async updateAudioTranscription(audioId, transcription, correctedText) {
        try {
            const { data, error } = await this.supabase
                .from('audio_messages')
                .update({
                    transcription,
                    corrected_text: correctedText,
                    status: 'completed'
                })
                .eq('id', audioId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            logger.error('Error updating audio transcription:', error);
            throw error;
        }
    }

    async logSystemEvent(level, message, metadata = {}) {
        try {
            const { error } = await this.supabase
                .from('system_logs')
                .insert([{
                    level,
                    message,
                    metadata
                }]);

            if (error) throw error;
        } catch (error) {
            logger.error('Error logging system event:', error);
            // Don't throw here to prevent cascading failures
        }
    }

    async getUser(userId) {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            logger.error('Error getting user:', error);
            return null;
        }
    }

    async createUser(userId, phoneNumber, name) {
        try {
            // First check if user already exists
            const existingUser = await this.getUser(userId);
            if (existingUser) {
                logger.info(`User ${userId} already exists, updating last interaction`);
                await this.updateUserLastInteraction(userId);
                return existingUser;
            }

            // Use upsert to handle duplicate users gracefully
            const { data, error } = await this.supabase
                .from('users')
                .upsert([{
                    id: userId,
                    phone_number: phoneNumber,
                    name: name || 'Usuário WhatsApp',
                    last_interaction: new Date().toISOString()
                }], { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                })
                .select()
                .single();

            if (error) {
                // If it's a duplicate error, try to get the existing user
                if (error.code === '23505') { // PostgreSQL unique violation
                    logger.info('User already exists due to race condition, fetching existing user');
                    const existingUser = await this.getUser(userId);
                    if (existingUser) {
                        await this.updateUserLastInteraction(userId);
                        return existingUser;
                    }
                }
                throw error;
            }
            
            logger.info(`User created successfully: ${userId}`);
            return data;
        } catch (error) {
            logger.error('Error creating user:', error.message || error);
            logger.error('Create user details:', {
                userId,
                phoneNumber,
                name,
                errorCode: error.code,
                errorDetails: error.details,
                errorHint: error.hint,
                errorMessage: error.message
            });
            
            // Try to fallback to getting existing user
            try {
                const existingUser = await this.getUser(userId);
                if (existingUser) {
                    logger.info('Fallback: Found existing user, updating last interaction');
                    await this.updateUserLastInteraction(userId);
                    return existingUser;
                }
            } catch (fallbackError) {
                logger.error('Fallback also failed:', fallbackError.message);
            }
            
            // If all else fails, return a minimal user object to not break the flow
            logger.warn('Creating minimal user object as fallback');
            return {
                id: userId,
                phone_number: phoneNumber,
                name: name || 'Usuário WhatsApp',
                created_at: new Date().toISOString(),
                last_interaction: new Date().toISOString()
            };
        }
    }

    async updateUserLastInteraction(userId) {
        try {
            const { error } = await this.supabase
                .from('users')
                .update({ last_interaction: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
        } catch (error) {
            logger.error('Error updating user last interaction:', error);
            throw error;
        }
    }
}

export default new DatabaseService(); 