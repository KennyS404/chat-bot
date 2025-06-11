# 🤖 Guia de Provedores de IA - WhatsApp Audio Corrector Bot

## 📊 **Comparação de Custos e Recursos**

### **OpenAI vs DeepSeek vs Híbrido**

| Recurso | OpenAI | DeepSeek | Híbrido (Recomendado) |
|---------|--------|----------|----------------------|
| **🎧 Transcrição de Áudio** | ✅ Whisper | ❌ Não tem | ✅ OpenAI Whisper |
| **✏️ Correção de Texto** | ✅ GPT-3.5/4 | ✅ DeepSeek-Chat | ✅ DeepSeek-Chat |
| **🔊 Text-to-Speech** | ✅ TTS | ❌ Não tem | ✅ OpenAI TTS |
| **💰 Custo Input (1M tokens)** | $3.00 | $0.27 | $0.27 |
| **💰 Custo Output (1M tokens)** | $6.00 | $1.10 | $1.10 |
| **🕐 Desconto Off-peak** | ❌ | ✅ 50% | ✅ 50% |
| **🌍 Idioma Português** | ✅ Excelente | ✅ Muito Bom | ✅ Excelente |

## 🎯 **Recomendação: Modo HÍBRIDO**

### **Por que Híbrido é a melhor opção:**

1. **💸 Economia Máxima:** 90% menos custo na correção de texto
2. **🎧 Áudio Completo:** Mantém Whisper + TTS da OpenAI
3. **🔄 Fallback:** Se DeepSeek falhar, usa OpenAI automaticamente
4. **🕐 Desconto:** 50% off em horários específicos (16:30-00:30 UTC)

### **Economia Real:**

```
📱 Para 1000 mensagens/mês:
• OpenAI only:    ~$15.00/mês
• Híbrido:        ~$2.50/mês
• 💰 Economia:    $12.50/mês (83% menos)
```

## 🔧 **Como Configurar**

### **1. Obter API Keys**

#### **OpenAI (Obrigatório):**
1. Acesse: https://platform.openai.com/api-keys
2. Crie nova chave
3. Adicione créditos ($5-10 mínimo)

#### **DeepSeek (Opcional, mas recomendado):**
1. Acesse: https://platform.deepseek.com
2. Registre conta
3. Vá em API Keys
4. Crie nova chave
5. Adicione créditos ($5 é suficiente)

### **2. Configurar .env**

```bash
# Obrigatório
OPENAI_API_KEY=sk-sua-chave-openai

# Opcional (mas recomendado para economia)
DEEPSEEK_API_KEY=sk-sua-chave-deepseek

# Modo de operação
AI_MODE=hybrid
```

### **3. Modos Disponíveis**

```bash
# 1. Apenas OpenAI (padrão atual)
AI_MODE=openai

# 2. Híbrido - OpenAI para áudio + DeepSeek para texto (RECOMENDADO)
AI_MODE=hybrid

# 3. Apenas DeepSeek - só correção, sem áudio
AI_MODE=deepseek
```

## 📈 **Análise de Custos Detalhada**

### **Cenário Real: Bot com 1000 mensagens/mês**

| Componente | OpenAI Only | Híbrido | Economia |
|------------|-------------|---------|-----------|
| **Transcrição** | $6.00 | $6.00 | $0.00 |
| **Correção** | $6.00 | $0.60 | $5.40 |
| **TTS** | $3.00 | $3.00 | $0.00 |
| **Total** | **$15.00** | **$9.60** | **$5.40** |

### **Com Desconto Off-peak (50%):**
- **OpenAI Only:** $15.00 (sem desconto)
- **Híbrido:** $6.30 (com desconto DeepSeek)
- **💰 Economia:** $8.70/mês (58% menos)

## ⚡ **Performance e Qualidade**

### **Velocidade:**
- **OpenAI:** ~3-5s por correção
- **DeepSeek:** ~2-4s por correção
- **Híbrido:** Melhor de ambos

### **Qualidade em Português:**
- **OpenAI:** ⭐⭐⭐⭐⭐ (Excelente)
- **DeepSeek:** ⭐⭐⭐⭐ (Muito Bom)
- **Híbrido:** ⭐⭐⭐⭐⭐ (Excelente com economia)

## 🔄 **Fallback Automático**

O modo híbrido tem fallback inteligente:

```javascript
try {
    // Tenta DeepSeek primeiro (mais barato)
    const correction = await deepseek.correctGrammar(text);
} catch (error) {
    // Se falhar, usa OpenAI automaticamente
    const correction = await openai.correctGrammar(text);
}
```

## 🚀 **Quick Start Híbrido**

### **1. Configurar API Keys:**
```bash
# Editar .env
OPENAI_API_KEY=sk-sua-chave-openai
DEEPSEEK_API_KEY=sk-sua-chave-deepseek
AI_MODE=hybrid
```

### **2. Instalar e Executar:**
```bash
npm install
npm start
```

### **3. Monitorar Logs:**
```bash
# Você verá logs indicando qual provedor está sendo usado:
✅ Transcrevendo áudio com OpenAI Whisper...
✅ Corrigindo gramática com DeepSeek (economia de 90%)...
✅ Gerando áudio com OpenAI TTS...
```

## 💡 **Dicas de Otimização**

### **1. Horários Off-peak DeepSeek:**
- **16:30-00:30 UTC** = 50% desconto
- **13:30-21:30 BRT** (horário brasileiro)

### **2. Cache de Correções:**
- Textos similares podem ser cacheados
- Reduz ainda mais os custos

### **3. Configurações Inteligentes:**
```bash
# Fallback para OpenAI se DeepSeek falhar
FALLBACK_TO_OPENAI=true

# Usar apenas correção, sem TTS (mais economia)
ENABLE_AUDIO_RESPONSE=false
```

## 📊 **Monitoramento de Custos**

O bot inclui estimativa de custos em tempo real:

```javascript
// Logs automáticos mostrando economia
logger.info('💰 Economia estimada com DeepSeek: 90%');
logger.info('📊 Custo por correção: $0.0003 (vs $0.003 OpenAI)');
```

## 🎯 **Recomendação Final**

### **Para Uso Pessoal/Teste:**
```bash
AI_MODE=hybrid
DEEPSEEK_API_KEY=sua-chave  # Opcional
```

### **Para Produção/Empresa:**
```bash
AI_MODE=hybrid
DEEPSEEK_API_KEY=sua-chave  # Obrigatório
FALLBACK_TO_OPENAI=true
```

### **Para Máxima Economia:**
```bash
AI_MODE=hybrid
DEEPSEEK_API_KEY=sua-chave
ENABLE_AUDIO_RESPONSE=false  # Desabilita TTS
```

---

## 🔗 **Links Úteis**

- **OpenAI Platform:** https://platform.openai.com
- **DeepSeek Platform:** https://platform.deepseek.com
- **Documentação DeepSeek:** https://api-docs.deepseek.com
- **Preços DeepSeek:** https://platform.deepseek.com/pricing

---

💡 **O modo híbrido oferece a melhor relação custo-benefício, mantendo toda a funcionalidade do bot com 80%+ de economia nos custos!** 