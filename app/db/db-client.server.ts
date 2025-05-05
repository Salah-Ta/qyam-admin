import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { AppLoadContext } from "@remix-run/cloudflare";

import ws from "ws";
neonConfig.webSocketConstructor = ws;

/**
 * Creates a Prisma client connected to the database
 * Supports both direct database URL and Cloudflare environment
 */
export const client = (db: string, context?: AppLoadContext) => {
  // If db is empty/undefined but context is available, try to get DATABASE_URL from context
  let connectionString = db;
  
  if (!connectionString && context?.cloudflare?.env?.DATABASE_URL) {
    connectionString = context.cloudflare.env.DATABASE_URL;
    console.log("Using DATABASE_URL from Cloudflare environment");
  }else{
    console.log("Using provided database URL:", connectionString);
  }
  
  // Check if we have a valid connection string
  if (!connectionString) {
    console.error("No database connection string provided");
    return null;
  }

  try {
    // Create connection pool
    const pool = new Pool({ 
      connectionString: connectionString,
      // Add additional Cloudflare-optimized settings if needed
      max: 10,
      connectionTimeoutMillis: 5000
    });
    
    // Create Prisma adapter using Neon
    const adapter = new PrismaNeon(pool);
    
    // Create and return Prisma client
    const prisma = new PrismaClient({ adapter });
    return prisma;
  }
  catch(e) {
    console.log("Error connecting to database:", e);
    return null;
  }
};
