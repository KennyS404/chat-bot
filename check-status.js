import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

async function checkStatus() {
  console.clear();
  console.log('🤖 WhatsApp Audio Corrector Bot - Status\n');

  // Verificar se o processo está rodando
  try {
    const { stdout } = await execAsync('ps aux | grep "node.*src/index.js" | grep -v grep | wc -l');
    const processCount = parseInt(stdout.trim());
    
    if (processCount > 0) {
      console.log('✅ Bot está rodando');
      console.log(`   Processos ativos: ${processCount}`);
    } else {
      console.log('❌ Bot não está rodando');
      console.log('   Execute: npm start');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar processo');
  }

  // Verificar se existe sessão do WhatsApp
  const authDir = join(process.cwd(), 'auth_info_baileys');
  if (existsSync(authDir)) {
    console.log('\n📱 WhatsApp:');
    console.log('   ✅ Sessão salva encontrada');
  } else {
    console.log('\n📱 WhatsApp:');
    console.log('   ⚠️  Nenhuma sessão salva');
    console.log('   Será necessário escanear QR Code');
  }

  // Verificar arquivo .env
  if (existsSync('.env')) {
    const { config } = await import('./src/config.js');
    console.log('\n⚙️  Configuração:');
    
    if (config.openai.apiKey && config.openai.apiKey !== 'your_openai_api_key_here') {
      console.log('   ✅ OpenAI API Key configurada');
    } else {
      console.log('   ❌ OpenAI API Key não configurada');
    }
  } else {
    console.log('\n❌ Arquivo .env não encontrado');
    console.log('   Execute: cp env.example .env');
  }

  console.log('\n📊 Comandos úteis:');
  console.log('   npm start     - Iniciar o bot');
  console.log('   npm run dev   - Modo desenvolvimento');
  console.log('   node test-setup.js - Verificar configuração');
}

checkStatus().catch(console.error); 