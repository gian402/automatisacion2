// ============================================================
// Configuración tipada de variables de entorno
// Se usa junto con @nestjs/config y ConfigModule.forRoot()
// ============================================================

export default () => ({
  // Servidor
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Base de datos
  databaseUrl: process.env.DATABASE_URL,

  // JWT — Access Token
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',

  // Refresh Token
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d',

  // Frontend
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  // Supabase Storage
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    bucket: process.env.SUPABASE_BUCKET ?? 'cotizaciones-pdf',
  },

  // Reglas de negocio
  igvPorcentaje: parseFloat(process.env.IGV_PORCENTAJE ?? '0.18'),

  // n8n — Automatización
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL ?? '',
    webhookSecret: process.env.N8N_WEBHOOK_SECRET ?? '',
  },
});
