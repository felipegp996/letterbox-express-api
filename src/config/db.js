import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkgPg from 'pg';
import { MongoClient } from "mongodb"

// 1. Força o carregamento do .env.local direto do sistema de arquivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const { PrismaClient } = pkg;
const { Pool } = pkgPg;

// ==========================================
// 2. PostgreSQL / Prisma Setup
// ==========================================
const getPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("❌ Erro: A variável DATABASE_URL não foi encontrada no .env.local");
  }

  console.log("🔌 Conectando ao Neon via Driver PG Nativo (Ambiente Seguro)...");

  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
};

export const prisma = getPrismaClient();

// ==========================================
// 3. Native MongoDB Setup
// ==========================================
const mongoURL = process.env.MONGO_CONNECT
const mongoClient = new MongoClient(mongoURL)
let mongoDbInstance = null

export const connectMongoDB = async () => {
  if(mongoDbInstance) return mongoDbInstance

  try {

    await mongoClient.connect()
    console.log('🔌 Conectando ao MongoDB com sucesso...');
    mongoDbInstance = mongoClient.db('letterboxd-clone-api');
    return mongoDbInstance
  } catch(err) {
    console.error('❌ Erro ao conectar no MongoDB:', err);
    throw err;
  }
}

export const getMongoDb = () => {
  if(!mongoDbInstance) {
    throw new Error("❌ Erro: Banco de dados MongoDB não inicializado. Chame connectMongoDB() primeiro.");
  }
  return mongoDbInstance
}