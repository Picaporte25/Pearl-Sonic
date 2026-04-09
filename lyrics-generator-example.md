# Generador de Letras Freemium con Groq

## CONFIGURACIÓN GROQ

1. **Crear cuenta en [groq.com](https://groq.com)**
2. **Obtener API Key** (gratis, no requiere tarjeta)
3. **Instalar SDK:**

```bash
npm install groq-sdk
```

4. **Agregar a .env.local:**

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## BACKEND API (Next.js API Route)

### Archivo: `src/pages/api/lyrics/generate.js`

```javascript
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Límites diarios
const LIMITS = {
  anonymous: 3,
  registered: 10,
  premium: 100,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, genre, mood, duration, userId, ipAddress } = req.body;

    // 1. Verificar límites
    const { canGenerate, limitInfo } = await checkLimits(userId, ipAddress);

    if (!canGenerate) {
      return res.status(429).json({
        error: 'Daily limit reached',
        limitInfo,
      });
    }

    // 2. Generar letra con Groq
    const lyrics = await generateLyrics(prompt, genre, mood, duration);

    // 3. Guardar en DB
    await saveLyrics({
      userId,
      ipAddress,
      lyrics,
      prompt,
      genre,
      mood,
      duration,
    });

    // 4. Incrementar contador
    await incrementCounter(userId, ipAddress);

    res.json({
      lyrics,
      limitInfo: {
        remaining: limitInfo.remaining - 1,
        total: limitInfo.total,
        resetTime: limitInfo.resetTime,
      },
    });

  } catch (error) {
    console.error('Error generating lyrics:', error);
    res.status(500).json({ error: 'Failed to generate lyrics' });
  }
}

// Verificar límites diarios
async function checkLimits(userId, ipAddress) {
  const today = new Date().toISOString().split('T')[0];

  if (userId) {
    // Usuario registrado
    const user = await supabase
      .from('users')
      .select('subscription_tier, lyrics_generated_today, last_lyrics_date')
      .eq('id', userId)
      .single();

    if (user.last_lyrics_date !== today) {
      // Resetear contador si es nuevo día
      await supabase
        .from('users')
        .update({
          lyrics_generated_today: 0,
          last_lyrics_date: today,
        })
        .eq('id', userId);

      user.lyrics_generated_today = 0;
    }

    const limit = LIMITS[user.subscription_tier] || LIMITS.registered;
    const remaining = limit - user.lyrics_generated_today;

    return {
      canGenerate: remaining > 0,
      limitInfo: {
        remaining,
        total: limit,
        resetTime: getNextResetTime(),
        subscriptionTier: user.subscription_tier,
      },
    };
  } else {
    // Usuario anónimo (por IP)
    const { data: ipUsage } = await supabase
      .from('ip_lyrics_usage')
      .select('count, last_date')
      .eq('ip_address', ipAddress)
      .single();

    if (!ipUsage || ipUsage.last_date !== today) {
      // Crear o resetear
      await supabase
        .from('ip_lyrics_usage')
        .upsert({
          ip_address: ipAddress,
          count: 0,
          last_date: today,
        });

      ipUsage = { count: 0 };
    }

    const remaining = LIMITS.anonymous - ipUsage.count;

    return {
      canGenerate: remaining > 0,
      limitInfo: {
        remaining,
        total: LIMITS.anonymous,
        resetTime: getNextResetTime(),
        isAnonymous: true,
      },
    };
  }
}

// Generar letra con Groq
async function generateLyrics(prompt, genre, mood, duration) {
  const systemPrompt = `You are a professional song lyric writer. Generate creative, engaging song lyrics based on the user's input.

Genre: ${genre || 'Pop'}
Mood: ${mood || 'Emotional'}
Duration: ${duration || '3 minutes'}

Guidelines:
- Create verses, chorus, and bridge structure
- Make lyrics memorable and catchy
- Use rhyming schemes naturally
- Include emotional depth matching the mood
- Keep lyrics appropriate for the genre
- Structure for song performance`;

  const userPrompt = `Write song lyrics about: ${prompt}`;

  const response = await groq.chat.completions.create({
    model: 'llama3-70b-8192', // Modelo potente y gratis
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || '';
}

// Guardar letras en DB
async function saveLyrics(data) {
  await supabase.from('lyrics').insert({
    ...data,
    created_at: new Date().toISOString(),
  });
}

// Incrementar contador
async function incrementCounter(userId, ipAddress) {
  if (userId) {
    await supabase.rpc('increment_lyrics_counter', { user_id: userId });
  } else {
    await supabase.rpc('increment_ip_lyrics_counter', { ip_address: ipAddress });
  }
}

// Tiempo de reset (mañana a las 00:00)
function getNextResetTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}
```

---

## BASE DE DATOS (Supabase SQL)

### Tablas necesarias:

```sql
-- 1. Tabla de letras generadas
CREATE TABLE lyrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address TEXT,
  lyrics TEXT NOT NULL,
  prompt TEXT NOT NULL,
  genre TEXT,
  mood TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contador de uso por IP
CREATE TABLE ip_lyrics_usage (
  ip_address TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  last_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar columna a usuarios (si no existe)
ALTER TABLE users ADD COLUMN IF NOT EXISTS lyrics_generated_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_lyrics_date DATE;

-- 4. Función para incrementar contador de usuario
CREATE OR REPLACE FUNCTION increment_lyrics_counter(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET lyrics_generated_today = lyrics_generated_today + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para incrementar contador de IP
CREATE OR REPLACE FUNCTION increment_ip_lyrics_counter(ip_address TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ip_lyrics_usage (ip_address, count, last_date)
  VALUES (ip_address, 1, CURRENT_DATE)
  ON CONFLICT (ip_address)
  DO UPDATE SET
    count = ip_lyrics_usage.count + 1,
    last_date = CURRENT_DATE,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 6. Index para mejor rendimiento
CREATE INDEX idx_lyrics_user_id ON lyrics(user_id);
CREATE INDEX idx_lyrics_ip_address ON lyrics(ip_address);
CREATE INDEX idx_lyrics_created_at ON lyrics(created_at DESC);
```

---

## FRONTEND COMPONENT

### Archivo: `src/components/LyricsGenerator.jsx`

```javascript
import { useState } from 'react';
import Link from 'next/link';

export default function LyricsGenerator({ user }) {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('Emotional');
  const [duration, setDuration] = useState('3 minutes');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState(null);
  const [error, setError] = useState('');

  const genres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Country', 'R&B', 'Jazz', 'Latin'];
  const moods = ['Happy', 'Sad', 'Angry', 'Romantic', 'Inspirational', 'Dark', 'Upbeat', 'Chill'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Obtener IP del usuario (para usuarios anónimos)
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip: ipAddress } = await ipResponse.json();

      const response = await fetch('/api/lyrics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre,
          mood,
          duration,
          userId: user?.id,
          ipAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate lyrics');
      }

      setLyrics(data.lyrics);
      setLimitInfo(data.limitInfo);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
          Free AI Lyrics Generator
        </h1>
        <p className="text-gray-400 text-lg">
          Create song lyrics in seconds with AI. No credit card required.
        </p>
        {limitInfo && (
          <div className="mt-4 inline-block px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
            <span className="text-purple-300 font-semibold">
              {limitInfo.remaining} / {limitInfo.total} lyrics left today
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="card p-6 mb-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Prompt */}
          <div>
            <label className="block text-white font-semibold mb-2">
              What should the song be about?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A story about traveling through space and finding a new home planet..."
              className="w-full p-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              rows={4}
              required
            />
          </div>

          {/* Genre & Mood */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-purple-500 focus:outline-none"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:border-purple-500 focus:outline-none"
              >
                {moods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-white font-semibold mb-2">Duration</label>
            <div className="flex gap-3">
              {['1 minute', '2 minutes', '3 minutes', '4 minutes', '5 minutes'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                    duration === d
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-white/20 bg-white/5 text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !prompt}
            className="btn-primary w-full py-4 text-lg"
          >
            {loading ? '🎵 Generating...' : '🎵 Generate Lyrics'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
            {error}
            {error.includes('limit') && !user && (
              <Link href="/register" className="block mt-2 text-purple-400 hover:underline">
                Register for 10 free lyrics per day
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Result */}
      {lyrics && (
        <div className="card p-6 border-2 border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Your Generated Lyrics:</h2>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 mb-6">
            <pre className="whitespace-pre-wrap text-gray-300 font-sans">
              {lyrics}
            </pre>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/generate">
              <button className="btn-primary flex-1 py-4">
                🎵 Create Music with These Lyrics
              </button>
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(lyrics);
                alert('Copied to clipboard!');
              }}
              className="btn-outline flex-1 py-4"
            >
              📋 Copy Lyrics
            </button>
          </div>

          {/* Upgrade CTA para anónimos */}
          {!user && (
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-center">
              <p className="text-purple-300 mb-3">
                Love these lyrics? Get more features:
              </p>
              <Link href="/register">
                <button className="btn-primary">
                  Register for 10 Free Lyrics/Day
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## FUNNELING ESTRATEGIA

### 1. **Letra generada** → **Crear música**
```javascript
<Link href={`/generate?prompt=${encodeURIComponent(prompt)}&lyrics=${encodeURIComponent(lyrics)}`}>
  <button>🎵 Create Music with These Lyrics</button>
</Link>
```

### 2. **Límite alcanzado** → **Registro**
```javascript
{limitInfo.remaining === 0 && !user && (
  <Link href="/register">
    <button>Register for 10 Free Lyrics/Day</button>
  </Link>
)}
```

### 3. **Usuario registrado** → **Upgrade Premium**
```javascript
{user && limitInfo.remaining === 0 && (
  <Link href="/checkout-paddle">
    <button>Upgrade for 100 Lyrics/Day</button>
  </Link>
)}
```

---

## COSTOS Y ESCALABILIDAD

### **Costo de Groq:**
- **GRATIS** para uso personal/development
- **$0.59/million tokens** para producción (cuando crezcas)
- Una letra ~1,000 tokens = **$0.00059 por letra**

### **Proyección:**
- 10,000 letras/día = ~$5.9/día
- 100,000 letras/día = ~$59/día
- Se puede escalar a pago gradualmente

---

## SIGUIENTES PASOS

1. ✅ Implementar API route
2. ✅ Crear tabla en Supabase
3. ✅ Crear componente frontend
4. ✅ Añadir página `/lyrics-generator`
5. ✅ Integrar con sistema de límites
6. ✅ Añadir analytics (Google Analytics, Vercel Analytics)
7. ✅ A/B test del funnel

---

## MARKETING

### **Promocionar el generador de letras:**

1. **Header:** "Free AI Lyrics Generator - No Credit Card"
2. **Blog:** Artículos sobre cómo crear letras con IA
3. **SEO:** Keywords: "free lyrics generator", "AI song lyrics", "song lyrics generator"
4. **Social Media:** Compartir ejemplos de letras generadas
5. **Email Marketing:** Enviar mejores letras generadas a usuarios

---

**¿Listo para implementar? ¡Empieza con la configuración de Groq!** 🚀