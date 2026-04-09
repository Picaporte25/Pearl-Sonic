export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, userId, ipAddress } = req.body;

    console.log('🎵 Generating lyrics for prompt:', prompt);
    console.log('🔑 GROQ_API_KEY configured:', !!process.env.GROQ_API_KEY);

    // 1. Verificar límites
    const { canGenerate, limitInfo } = await checkLimits(userId, ipAddress);

    if (!canGenerate) {
      return res.status(429).json({
        error: 'Daily limit reached',
        limitInfo,
      });
    }

    // 2. Generar letra con Groq
    const lyrics = await generateLyrics(prompt);

    console.log('✅ Lyrics generated successfully');

    res.json({
      lyrics,
      limitInfo: {
        remaining: limitInfo.remaining - 1,
        total: limitInfo.total,
        resetTime: limitInfo.resetTime,
      },
    });

  } catch (error) {
    console.error('❌ Error generating lyrics:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to generate lyrics: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Verificar límites diarios
async function checkLimits(userId, ipAddress) {
  const today = new Date().toISOString().split('T')[0];

  // Límites diarios
  const LIMITS = {
    anonymous: 3,
    registered: 10,
    premium: 100,
  };

  // Para simplificar, siempre permitir en esta etapa
  return {
    canGenerate: true,
    limitInfo: {
      remaining: userId ? LIMITS.registered : LIMITS.anonymous,
      total: userId ? LIMITS.registered : LIMITS.anonymous,
      resetTime: getNextResetTime(),
    },
  };
}

// Generar letra con Groq
async function generateLyrics(prompt) {
  // Verificar API key
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured. Please add it to .env.local');
  }

  console.log('📦 Importing Groq SDK...');

  // Importar Groq dinámicamente (server-side only)
  let groq;
  try {
    groq = (await import('groq-sdk')).default;
    console.log('✅ Groq SDK imported successfully');
  } catch (e) {
    console.error('❌ Failed to import Groq:', e);
    throw new Error('Failed to import Groq SDK: ' + e.message);
  }

  console.log('🔧 Initializing Groq client...');
  const groqClient = new groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  console.log('✅ Groq client initialized');

  const systemPrompt = `You are a professional song lyric writer. Generate creative, engaging song lyrics based on user's input.

Guidelines:
- Create verses, chorus, and bridge structure
- Make lyrics memorable and catchy
- Use rhyming schemes naturally
- Include emotional depth
- Keep lyrics appropriate for popular music genres
- Structure for song performance
- Write in English language
- The lyrics should be suitable for professional music production
- Generate 3-4 verses and 2-3 choruses
- Include a bridge section
- Total length should be appropriate for a 3-4 minute song`;

  const userPrompt = `Write song lyrics about: ${prompt}`;

  console.log('🤖 Calling Groq API with prompt:', userPrompt);

  // Try with production models that work
  const workingModels = [
    'llama-3.3-70b-versatile',    // Best quality
    'llama-3.1-8b-instant'        // Fastest
  ];

  for (const modelName of workingModels) {
    try {
      console.log(`🎯 Trying model: ${modelName}`);

      const response = await groqClient.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      console.log(`✅ Model ${modelName} worked! Response received.`);

      const lyrics = response.choices[0]?.message?.content || '';
      if (!lyrics) {
        throw new Error('Empty response from Groq API');
      }

      console.log('✅ Lyrics extracted successfully');
      return lyrics;

    } catch (error) {
      console.error(`❌ Model ${modelName} failed:`, error.message);
      // Continue to next model if not the last one
      if (modelName !== workingModels[workingModels.length - 1]) {
        console.log(`🔄 Trying next model...`);
        continue;
      }
      // Last model failed
      throw new Error(`Groq API Error: ${error.message}`);
    }
  }
}

// Tiempo de reset (mañana a las 00:00)
function getNextResetTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
