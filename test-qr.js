import qrcode from 'qrcode-terminal';
import QRCode from 'qrcode';

// Script para testar visualização de QR codes
console.log('🧪 Testando NOVOS métodos de visualização de QR codes...\n');

// QR code de teste
const testQr = 'https://example.com/test-qr-code-whatsapp';

// Função para gerar QR ASCII simples
async function generateTestSimpleQR(qrString) {
  try {
    const qrAscii = await QRCode.toString(qrString, {
      type: 'terminal',
      small: true,
      errorCorrectionLevel: 'L',
      margin: 1
    });
    
    console.log('\n');
    console.log('> QR CODE ASCII SIMPLES:');
    console.log('*'.repeat(40));
    console.log(qrAscii);
    console.log('*'.repeat(40));
    console.log('\n');
    
  } catch (error) {
    console.error('Erro ao gerar QR ASCII simples:', error);
  }
}

// Função otimizada completa para testes
async function displayTestQR(qrString) {
  try {
    console.log('\n'.repeat(3));
    
    console.log('='.repeat(60));
    console.log('                 TEST QR CODE                 ');
    console.log('='.repeat(60));
    console.log('\n');
    
    // Método 1: QR code terminal padrão
    console.log('> METODO 1 - QR TERMINAL:');
    console.log('-'.repeat(40));
    console.log('\n');
    
    qrcode.generate(qrString, {
      small: true,
      errorCorrectionLevel: 'L',
      margin: 1
    });
    
    console.log('\n');
    console.log('-'.repeat(40));
    console.log('\n');
    
    // Método 2: QR ASCII alternativo
    await generateTestSimpleQR(qrString);
    
    // Método 3: Versão ultra simples
    console.log('> METODO 3 - ULTRA SIMPLES:');
    console.log('.'.repeat(30));
    console.log('\n');
    
    qrcode.generate(qrString, {
      small: true,
      errorCorrectionLevel: 'L',
      margin: 0
    });
    
    console.log('\n');
    console.log('.'.repeat(30));
    console.log('\n');
    
    console.log('✅ Teste completo!');
    console.log('Se pelo menos UM QR code aparece claramente,');
    console.log('então a conexão no WhatsApp funcionará!');
    console.log('='.repeat(60));
    console.log('\n');
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar teste completo
await displayTestQR(testQr);

console.log('\n🎯 TESTE DE COMPATIBILIDADE RENDER:');
console.log('Os 3 métodos acima são testados no Render.');
console.log('Pelo menos um deles deve funcionar no seu ambiente!');
console.log('\n✅ Teste concluído!'); 