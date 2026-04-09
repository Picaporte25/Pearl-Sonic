// Test script para verificar qué modelos de Groq funcionan
const GroqSDK = require('groq-sdk');

// Intentar leer API key de diferentes fuentes
let apiKey = process.env.GROQ_API_KEY;

// Si no está en variables de entorno, buscar en argumentos
if (!apiKey && process.argv.length > 2) {
  apiKey = process.argv[2];
}

if (!apiKey) {
  console.error('❌ ERROR: GROQ_API_KEY no encontrada');
  console.log('\n💡 SOLUCIONES:');
  console.log('1. Asegúrate de tener un archivo .env.local en la carpeta del proyecto');
  console.log('2. Agrega esta línea al .env.local:');
  console.log('   GROQ_API_KEY=tu_api_key_aqui');
  console.log('3. O pasa la API key como argumento:');
  console.log('   node test-groq-models.js "tu_api_key_aqui"');
  console.log('4. Reinicia cualquier servidor que esté corriendo');
  console.log('\n📖 Para más información: https://console.groq.com/docs/models');
  process.exit(1);
}

const groq = new GroqSDK({
  apiKey: apiKey,
});

console.log('✅ API key encontrada, conectando a Groq...\n');

async function testModels() {
  const modelsToTest = [
    // Llama 3.1 (nueva versión)
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-versatile',
    // Llama 3 (posible)
    'llama3-70b-instruct',
    'llama3-8b-instruct',
    // Otros modelos populares
    'mixtral-8x7b-32768',
    'gemma-7b-it',
    'gemma2-9b',
  ];

  const testPrompt = {
    model: modelsToTest[0],
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say "Hello" in one word.' }
    ],
    max_tokens: 10,
  };

  console.log('🧪 Testing Groq API models...\n');

  for (const model of modelsToTest) {
    try {
      console.log(`🎯 Testing model: ${model}`);

      const response = await groq.chat.completions.create({
        ...testPrompt,
        model: model,
      });

      console.log(`✅ ${model}: WORKS`);
      console.log(`   Response: ${response.choices[0].message.content}`);

    } catch (error) {
      console.log(`❌ ${model}: FAILED`);
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n✅ Model testing completed!');
}

testModels().catch(console.error);