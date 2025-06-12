#!/usr/bin/env node

// Calculadora de Custos Detalhada - WhatsApp Audio Corrector Bot
// Comparação entre OpenAI, Híbrido e Super Otimizado

console.log('💰 CALCULADORA DE CUSTOS - WHATSAPP AUDIO CORRECTOR BOT\n');

// Parâmetros base
const AUDIO_DURATION_MIN = 1; // minutos por áudio
const AVG_TEXT_LENGTH = 150; // caracteres médios por áudio
const TOKENS_PER_CHAR = 0.25; // aproximação de tokens por caractere

// Preços por serviço (USD) - CORRIGIDOS baseado na pesquisa
const PRICES = {
  openai: {
    whisper: 0.006, // $0.006 por minuto
    gpt: 0.000003, // $3/1M tokens (input + output médio)
    tts: 0.000015 // $15/1M caracteres
  },
  deepseek: {
    chat_regular: 0.00000027, // $0.27/1M tokens
    chat_offpeak: 0.000000135 // 50% desconto off-peak
  },
  deepgram: {
    nova2: 0.46 / 60 / 60 // $0.46/HORA = $0.000128/minuto (87% mais barato!)
  },
  aws: {
    polly_neural: 0.000004 // $4/1M caracteres (73% mais barato que OpenAI!)
  }
};

// Taxa de conversão USD para BRL
const USD_TO_BRL = 6.0;

function calculateCosts(numAudios) {
  const totalMinutes = numAudios * AUDIO_DURATION_MIN;
  const totalChars = numAudios * AVG_TEXT_LENGTH;
  const totalTokens = Math.ceil(totalChars * TOKENS_PER_CHAR);

  // Cenário 1: OpenAI Puro (atual)
  const openai_pure = {
    transcription: totalMinutes * PRICES.openai.whisper,
    correction: totalTokens * PRICES.openai.gpt,
    tts: totalChars * PRICES.openai.tts,
  };
  openai_pure.total = openai_pure.transcription + openai_pure.correction + openai_pure.tts;

  // Cenário 2: Híbrido (OpenAI + DeepSeek)
  const hybrid = {
    transcription: totalMinutes * PRICES.openai.whisper,
    correction: totalTokens * PRICES.deepseek.chat_regular,
    tts: totalChars * PRICES.openai.tts,
  };
  hybrid.total = hybrid.transcription + hybrid.correction + hybrid.tts;

  // Cenário 3: Híbrido Off-Peak
  const hybrid_offpeak = {
    transcription: totalMinutes * PRICES.openai.whisper,
    correction: totalTokens * PRICES.deepseek.chat_offpeak,
    tts: totalChars * PRICES.openai.tts,
  };
  hybrid_offpeak.total = hybrid_offpeak.transcription + hybrid_offpeak.correction + hybrid_offpeak.tts;

  // Cenário 4: SUPER OTIMIZADO (Deepgram + DeepSeek + Polly)
  const super_optimized = {
    transcription: totalMinutes * PRICES.deepgram.nova2,
    correction: totalTokens * PRICES.deepseek.chat_regular,
    tts: totalChars * PRICES.aws.polly_neural,
  };
  super_optimized.total = super_optimized.transcription + super_optimized.correction + super_optimized.tts;

  // Cenário 5: SUPER OTIMIZADO Off-Peak
  const super_optimized_offpeak = {
    transcription: totalMinutes * PRICES.deepgram.nova2,
    correction: totalTokens * PRICES.deepseek.chat_offpeak,
    tts: totalChars * PRICES.aws.polly_neural,
  };
  super_optimized_offpeak.total = super_optimized_offpeak.transcription + super_optimized_offpeak.correction + super_optimized_offpeak.tts;

  return {
    openai_pure,
    hybrid,
    hybrid_offpeak,
    super_optimized,
    super_optimized_offpeak,
    params: { numAudios, totalMinutes, totalChars, totalTokens }
  };
}

function printResults(costs) {
  const { params } = costs;
  
  console.log(`📊 ANÁLISE PARA ${params.numAudios} ÁUDIOS/MÊS`);
  console.log(`   ${params.totalMinutes} minutos total | ${params.totalChars} caracteres | ${params.totalTokens} tokens\n`);
  
  console.log('┌─' + '─'.repeat(98) + '┐');
  console.log('│' + ' '.repeat(35) + 'COMPARAÇÃO DE CUSTOS (USD)' + ' '.repeat(35) + '│');
  console.log('├─' + '─'.repeat(98) + '┤');
  console.log('│ Cenário                    │ Transcrição │ Correção │    TTS   │  Total  │ Total BRL│');
  console.log('├─' + '─'.repeat(98) + '┤');
  
  const scenarios = [
    { name: 'OpenAI Puro (atual)', data: costs.openai_pure },
    { name: 'Híbrido (OpenAI+DeepSeek)', data: costs.hybrid },
    { name: 'Híbrido Off-Peak', data: costs.hybrid_offpeak },
    { name: '🚀 SUPER OTIMIZADO', data: costs.super_optimized },
    { name: '🚀 SUPER + Off-Peak', data: costs.super_optimized_offpeak }
  ];
  
  scenarios.forEach(scenario => {
    const d = scenario.data;
    const totalBRL = d.total * USD_TO_BRL;
    console.log(`│ ${scenario.name.padEnd(26)} │ $${d.transcription.toFixed(3).padStart(9)} │ $${d.correction.toFixed(3).padStart(6)} │ $${d.tts.toFixed(3).padStart(6)} │ $${d.total.toFixed(2).padStart(5)} │ R$${totalBRL.toFixed(0).padStart(5)}│`);
  });
  
  console.log('└─' + '─'.repeat(98) + '┘\n');
  
  // Economia
  const baselineCost = costs.openai_pure.total;
  const optimizedCost = costs.super_optimized.total;
  const optimizedOffpeakCost = costs.super_optimized_offpeak.total;
  
  const savingsOptimized = ((baselineCost - optimizedCost) / baselineCost * 100);
  const savingsOffpeak = ((baselineCost - optimizedOffpeakCost) / baselineCost * 100);
  
  console.log('💡 ECONOMIA COM SUPER OTIMIZADO:');
  console.log(`   Regular: ${savingsOptimized.toFixed(1)}% | $${(baselineCost - optimizedCost).toFixed(2)} USD | R$ ${((baselineCost - optimizedCost) * USD_TO_BRL).toFixed(0)}/mês`);
  console.log(`   Off-Peak: ${savingsOffpeak.toFixed(1)}% | $${(baselineCost - optimizedOffpeakCost).toFixed(2)} USD | R$ ${((baselineCost - optimizedOffpeakCost) * USD_TO_BRL).toFixed(0)}/mês\n`);
  
  // Custo por áudio
  console.log('📈 CUSTO POR ÁUDIO:');
  console.log(`   OpenAI Puro: $${(baselineCost / params.numAudios).toFixed(4)} | R$ ${(baselineCost / params.numAudios * USD_TO_BRL).toFixed(3)}`);
  console.log(`   Super Otimizado: $${(optimizedCost / params.numAudios).toFixed(4)} | R$ ${(optimizedCost / params.numAudios * USD_TO_BRL).toFixed(3)}`);
  console.log(`   Economia por áudio: R$ ${((baselineCost - optimizedCost) / params.numAudios * USD_TO_BRL).toFixed(3)}\n`);
}

// Análises para diferentes volumes
const volumes = [100, 500, 1000, 5000];

volumes.forEach(volume => {
  const costs = calculateCosts(volume);
  printResults(costs);
});

// Análise anual para 1000 áudios/mês
console.log('🎯 PROJEÇÃO ANUAL (1000 áudios/mês):');
const annual = calculateCosts(12000); // 12 meses
const yearlyOpenAI = annual.openai_pure.total;
const yearlyOptimized = annual.super_optimized.total;
const yearlyOffpeak = annual.super_optimized_offpeak.total;

console.log(`   OpenAI Puro: $${yearlyOpenAI.toFixed(0)} USD | R$ ${(yearlyOpenAI * USD_TO_BRL).toFixed(0)}`);
console.log(`   Super Otimizado: $${yearlyOptimized.toFixed(0)} USD | R$ ${(yearlyOptimized * USD_TO_BRL).toFixed(0)}`);
console.log(`   Economia anual: $${(yearlyOpenAI - yearlyOptimized).toFixed(0)} USD | R$ ${((yearlyOpenAI - yearlyOptimized) * USD_TO_BRL).toFixed(0)}`);
console.log(`   Com off-peak: R$ ${((yearlyOpenAI - yearlyOffpeak) * USD_TO_BRL).toFixed(0)} economia/ano\n`);

console.log('🚀 RECOMENDAÇÃO:');
console.log('   Use AI_MODE=optimized para máxima economia!');
console.log('   Configure Deepgram + AWS Polly + DeepSeek');
console.log('   Economia garantida de 88%+ nos custos de AI\n');

console.log('📋 PARA CONFIGURAR AS APIs:');
console.log('   1. Deepgram: https://console.deepgram.com/project/*/settings');
console.log('   2. AWS Polly: https://console.aws.amazon.com/iam/home#/security_credentials');
console.log('   3. DeepSeek: https://platform.deepseek.com/api_keys');
console.log('   4. Execute: npm run setup-env');
console.log('   5. Configure AI_MODE=optimized no .env'); 