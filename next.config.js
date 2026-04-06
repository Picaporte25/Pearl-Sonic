/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuración de imágenes para producción
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'cdn.paddle.com',
      },
      {
        protocol: 'https',
        hostname: 'suno.com',
      },
      // Agrega aquí cualquier otro dominio de producción que uses para imágenes
      // {
      //   protocol: 'https',
      //   hostname: 'tu-dominio-de-produccion.com',
      // },
    ],
  },

  // Headers de seguridad para producción
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },

  // Compresión para producción
  compress: true,

  // Optimización de producción
  swcMinify: true,

  // Configuración de entorno
  env: {
    // Valida que las variables críticas estén configuradas en producción
    // Esto causará un error en build si no están configuradas
  },
}

// Validación de variables de entorno críticas en producción
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'PADDLE_API_KEY',
    'PADDLE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes en producción:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n❌ Por favor configura todas las variables de entorno requeridas antes de hacer build para producción.');
    process.exit(1);
  }

  console.log('✅ Todas las variables de entorno críticas están configuradas para producción.');
}

module.exports = nextConfig
