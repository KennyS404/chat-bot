import qrcode from 'qrcode-terminal';

// Script para testar visualização de QR codes
console.log('🧪 Testando visualização de QR codes...\n');

// QR code de teste
const testQr = 'https://example.com/test-qr-code-whatsapp';

// Função otimizada similar à do WhatsApp Service
function displayTestQR(qrString) {
  try {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    
    if (!isProduction) {
      console.clear();
    }
    
    console.log('\n'.repeat(3));
    
    const header = '🔥'.repeat(15) + ' TEST QR CODE ' + '🔥'.repeat(15);
    console.log(header);
    console.log('█'.repeat(header.length));
    console.log('\n');
    
    console.log('📱 QR CODE PRINCIPAL:');
    console.log('━'.repeat(60));
    console.log('\n');
    
    qrcode.generate(qrString, {
      small: true,
      errorCorrectionLevel: 'H',
      margin: 2
    });
    
    console.log('\n');
    console.log('━'.repeat(60));
    console.log('\n');
    
    console.log('📱 QR CODE COMPACTO:');
    console.log('─'.repeat(35));
    console.log('\n');
    
    qrcode.generate(qrString, {
      small: true,
      errorCorrectionLevel: 'M',
      margin: 1
    });
    
    console.log('\n');
    console.log('─'.repeat(35));
    console.log('\n');
    
    console.log('✅ Teste de QR code concluído!');
    console.log('Se você consegue ver os QR codes acima claramente,');
    console.log('então a visualização no WhatsApp também funcionará.');
    console.log('═'.repeat(60));
    console.log('\n');
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar teste
displayTestQR(testQr);

// Testar diferentes configurações
console.log('\n🔬 TESTANDO CONFIGURAÇÕES OTIMIZADAS:\n');

console.log('1. QR Padrão otimizado:');
qrcode.generate(testQr, { 
  small: true, 
  errorCorrectionLevel: 'H' 
});

console.log('\n2. QR Compacto:');
qrcode.generate(testQr, { 
  small: true, 
  errorCorrectionLevel: 'M' 
});

console.log('\n3. QR com margem extra:');
qrcode.generate(testQr, { 
  small: true, 
  errorCorrectionLevel: 'H',
  margin: 3
});

console.log('\n✅ Todas as configurações testadas!');
console.log('🎯 Estas são as configurações que funcionam bem no Render.'); 