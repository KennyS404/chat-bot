import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfsrlamwuvycryhqczyv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc3JsYW13dXZ5Y3J5aHFjenl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NDI2MzYsImV4cCI6MjA2NDExODYzNn0.EOnh_5_d6hYnc8qfiv0Fadp2jxT5EZZX18P4Jhf7wWk';
const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
    async createUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([
                    { 
                        id: userId,
                        created_at: new Date().toISOString(),
                        last_interaction: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async getUser(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    async updateLastInteraction(userId) {
        try {
            const { error } = await supabase
                .from('users')
                .update({ last_interaction: new Date().toISOString() })
                .eq('id', userId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating last interaction:', error);
            throw error;
        }
    }
}

export default new SupabaseService(); 