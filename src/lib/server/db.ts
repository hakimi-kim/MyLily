// src/lib/server/db.ts
import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

// This initializes the serverless Neon client using your .env variable
export const sql = neon(DATABASE_URL);
