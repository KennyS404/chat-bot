#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 WhatsApp Audio Corrector Bot - Environment Setup');
console.log('='.repeat(50));

// Check if .env already exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
    console.log('📝 Please verify your configurations are correct');
    process.exit(0);
}

// Copy from env.example
const examplePath = path.join(__dirname, 'env.example');
if (!fs.existsSync(examplePath)) {
    console.error('❌ env.example file not found!');
    process.exit(1);
}

try {
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ .env file created from env.example');
    console.log('');
    console.log('🚨 IMPORTANT: You must configure these values in .env:');
    console.log('');
    console.log('1. 🔑 OPENAI_API_KEY - Get from https://platform.openai.com/api-keys');
    console.log('   Replace: your_openai_api_key_here');
    console.log('');
    console.log('2. 🗄️  SUPABASE_URL - Get from your Supabase project dashboard');
    console.log('   Replace: your_supabase_url_here');
    console.log('');
    console.log('3. 🔐 SUPABASE_KEY - Get from your Supabase project settings');
    console.log('   Replace: your_supabase_key_here');
    console.log('');
    console.log('📝 Open .env file and update these values before running the bot!');
    console.log('');
    console.log('🔧 After updating .env, run: npm start');
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
} 