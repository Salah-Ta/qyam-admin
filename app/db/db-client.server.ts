import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { AppLoadContext } from "@remix-run/cloudflare";

import ws from "ws";
neonConfig.webSocketConstructor = ws;

export const createPrismaClient = (dbUrl?: string, context?: AppLoadContext): PrismaClient => {
  let connectionString = dbUrl || 
                        context?.cloudflare?.env?.DATABASE_URL ||
                        process.env.DEV_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("No database connection string found in any source");
  }


  try {

      const pool = new Pool({
        connectionString: connectionString,
        max: 5,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      });
      
      const adapter = new PrismaNeon(pool);
      return new PrismaClient({ 
        adapter,
        log: ['error'],
      });
    
  } catch (e) {
    throw e;
  }
};

// Aliases for backward compatibility
export const client = createPrismaClient;
export const getPrismaClient = createPrismaClient;
