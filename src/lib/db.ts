import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  databaseUrl: string | undefined;
};

function resolveDatabaseUrl(): string {
  if (globalForPrisma.databaseUrl) {
    return globalForPrisma.databaseUrl;
  }

  const configured = process.env.DATABASE_URL ?? 'file:./db/custom.db';

  if (!process.env.VERCEL || !configured.startsWith('file:')) {
    globalForPrisma.databaseUrl = configured;
    return configured;
  }

  const tmpDb = path.join('/tmp', 'ciar-custom.db');

  if (!fs.existsSync(tmpDb)) {
    const bundledDb = path.join(process.cwd(), 'db', 'custom.db');
    if (fs.existsSync(bundledDb)) {
      fs.copyFileSync(bundledDb, tmpDb);
    }
  }

  const url = `file:${tmpDb}`;
  process.env.DATABASE_URL = url;
  globalForPrisma.databaseUrl = url;
  return url;
}

function createPrismaClient() {
  resolveDatabaseUrl();

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
