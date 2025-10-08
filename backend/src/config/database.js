import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Create admin client for server-side operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database connection test
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('⚠️  Database connected but tables not found');
      console.log('📝 Please run the database setup:');
      console.log('   1. Copy database/schema.sql');
      console.log('   2. Paste it in your Supabase SQL Editor');
      console.log('   3. Run the SQL script');
      console.log('   4. See scripts/database-setup.md for detailed instructions');
      return false;
    } else if (error) {
      throw error;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.log('📝 Please check your .env file configuration:');
    console.log('   - SUPABASE_URL should be your project URL');
    console.log('   - SUPABASE_KEY should be your anon public key');
    console.log('   - See scripts/database-setup.md for help');
    return false;
  }
};

// Database schema validation
export const validateSchema = async () => {
  const tables = ['users', 'lessons', 'progress', 'practice'];
  const missingTables = [];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        missingTables.push(table);
      }
    } catch (error) {
      console.error(`Error checking table ${table}:`, error.message);
    }
  }
  
  if (missingTables.length > 0) {
    console.warn('⚠️  Missing tables:', missingTables.join(', '));
    console.log('Run the database migrations to create missing tables.');
  } else {
    console.log('✅ All required tables exist');
  }
  
  return missingTables;
};
