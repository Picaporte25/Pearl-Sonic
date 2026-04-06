# Rate Limiting - Configuración para Producción

## Estado Actual (Implementación en Memoria)

La aplicación actual usa un sistema de rate limiting basado en memoria (`lib/rate-limit.js`). Esto funciona bien para desarrollo y pruebas, pero tiene limitaciones importantes en producción.

## Limitaciones del Sistema Actual

### 1. **No Persistente**
- Los datos de rate limiting se pierden cada vez que el servidor se reinicia
- En entornos con múltiples servidores/servicios, el rate limiting no funciona entre instancias
- Un reinicio del servidor resetea todos los límites, permitiendo ataques después del reinicio

### 2. **Escalabilidad Limitada**
- Con el aumento de usuarios, el uso de memoria puede volverse un problema
- No hay mecanismo de limpieza automático eficiente para datos antiguos
- Puede causar problemas en entornos con alta concurrencia

### 3. **No Distribuido**
- En configuraciones con múltiples servidores, cada servidor mantiene su propio conteo
- Un usuario podría superar el límite conectándose a diferentes servidores
- No funciona correctamente con load balancers

## Configuración Actual

```javascript
const RATE_LIMIT_CONFIG = {
  auth: { max: 5, windowMs: 1 * 60 * 1000 },      // 5 intentos por 1 minuto
  webhook: { max: 10, windowMs: 60 * 1000 },     // 10 requests por 1 minuto
  generate: { max: 5, windowMs: 60 * 1000 },    // 5 requests por 1 minuto
  general: { max: 100, windowMs: 60 * 1000 },   // 100 requests por 1 minuto
};
```

## Recomendaciones para Producción

### Opción 1: Redis (Recomendada)
**Ventajas:**
- Persistente y distribuido
- Alto rendimiento
- TTL automático para limpieza
- Escala horizontalmente
- Ampliamente usado en producción

**Implementación sugerida:**
```bash
npm install redis
```

```javascript
// lib/rate-limit-redis.js
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.connect().catch(console.error);

export async function checkRateLimitRedis(type, ip) {
  const key = `rate_limit:${type}:${ip}`;
  const window = RATE_LIMIT_CONFIG[type].windowMs;
  const max = RATE_LIMIT_CONFIG[type].max;

  const current = await redisClient.incr(key);

  if (current === 1) {
    await redisClient.expire(key, window / 1000);
  }

  return {
    allowed: current <= max,
    remaining: Math.max(0, max - current),
    count: current,
    limit: max
  };
}
```

**Variables de entorno necesarias:**
```bash
REDIS_URL=redis://user:password@host:port
```

### Opción 2: Upstash Redis (Fácil integración con Vercel)
**Ventajas:**
- Compatible con Redis API
- Gratuito para uso moderado
- Fácil integración con Vercel
- Sin servidor propio necesario

**Implementación:**
```bash
npm install @upstash/redis
```

```javascript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
```

### Opción 3: Cloudflare (Si usas Cloudflare)
**Ventajas:**
- Integración nativa si ya usas Cloudflare
- Configuración simple
- Sin código adicional necesario

**Configuración:**
- Usar Cloudflare Workers para rate limiting
- Configurar reglas en el dashboard de Cloudflare

### Opción 4: Servicios de Rate Limiting
**Servicios recomendados:**
- **RateLimiter**: rate-limiter.io
- **Stripe Rate Limiting**: stripe-rate-limiting
- **AWS API Gateway**: Rate limiting nativo

## Cronología de Implementación Recomendada

### Fase 1: Inmediata (Lanzamiento)
- **Mantener sistema actual** (en memoria)
- Monitorear uso de memoria
- Documentar las limitaciones
- Configurar monitoreo de reinicios de servidor

### Fase 2: Corto Plazo (1-2 semanas después del lanzamiento)
- **Implementar Redis** si el tráfico aumenta
- Migrar a Upstash Redis si usas Vercel
- Probar extensivamente en staging

### Fase 3: Medio Plazo (1 mes después del lanzamiento)
- Evaluar métricas de uso
- Optimizar límites según patrones de uso
- Implementar alertas para rate limiting abusivo

## Variables de Ambiente para Producción

```bash
# Para Redis estándar
REDIS_URL=redis://username:password@redis-host:6379

# Para Upstash Redis (recomendado para Vercel)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Configuraciones de rate limiting (ajustar según necesidades)
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_AUTH_WINDOW_MS=60000
RATE_LIMIT_GENERATE_MAX=10
RATE_LIMIT_GENERATE_WINDOW_MS=60000
```

## Monitoreo y Alertas

Para producción, deberías monitorear:

1. **Métricas de Rate Limiting:**
   - Usuarios afectados por rate limiting
   - IPs más activas
   - Patrones de abuso

2. **Alertas:**
   - Uso excesivo de memoria por rate limiting
   - Reinicios frecuentes del servidor
   - Rate limiting afectando usuarios legítimos

3. **Logs:**
   - Guardar eventos de rate limiting
   - Analizar patrones de comportamiento
   - Identificar posibles bots/ataques

## Conclusión

**Para el lanzamiento inicial:** El sistema actual es funcional, pero debes estar consciente de sus limitaciones.

**Para producción estable:** Implementa Redis o un servicio distribuido de rate limiting tan pronto como tengas usuarios reales.

**Recomendación final:** Comienza con el sistema actual y migra a Redis (preferiblemente Upstash si usas Vercel) dentro de las primeras 2 semanas de producción.