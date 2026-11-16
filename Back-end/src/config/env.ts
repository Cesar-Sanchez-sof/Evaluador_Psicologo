import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_NAME: z.string().min(1).default('Evaluador_Psicologo'),
  DB_USER: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Error en variables de entorno (.env):', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
