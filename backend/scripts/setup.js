#!/usr/bin/env node

/**
 * FinanceBro Backend Setup Script
 * This script helps set up the backend environment and database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../src/config/database.js';
import { config } from '../src/config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 FinanceBro Backend Setup');
console.log('============================\n');

/**
 * Check if .env file exists
 */
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    console.log('📝 Please copy env.example to .env and configure your environment variables');
    console.log('   cp env.example .env');
    return false;
  }
  
  console.log('✅ .env file found');
  return true;
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  console.log('\n🔌 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('📝 Please check your Supabase configuration in .env');
    return false;
  }
}

/**
 * Check database schema
 */
async function checkDatabaseSchema() {
  console.log('\n📋 Checking database schema...');
  
  const tables = ['users', 'lessons', 'progress', 'practice', 'achievements'];
  const missingTables = [];
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        missingTables.push(table);
      } else {
        console.log(`✅ Table '${table}' exists`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
      missingTables.push(table);
    }
  }
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  Missing tables:', missingTables.join(', '));
    console.log('📝 Please run the database schema setup:');
    console.log('   1. Open your Supabase project dashboard');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Copy and paste the contents of database/schema.sql');
    console.log('   4. Run the SQL script');
    return false;
  }
  
  console.log('✅ All required tables exist');
  return true;
}

/**
 * Check if sample data exists
 */
async function checkSampleData() {
  console.log('\n📊 Checking sample data...');
  
  try {
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('count')
      .limit(1);
    
    if (lessonsError) {
      throw lessonsError;
    }
    
    if (!lessons || lessons.length === 0) {
      console.log('⚠️  No sample data found');
      console.log('📝 To add sample data:');
      console.log('   1. Open your Supabase project dashboard');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Copy and paste the contents of database/seed.sql');
      console.log('   4. Run the SQL script');
      return false;
    }
    
    console.log('✅ Sample data found');
    return true;
  } catch (error) {
    console.log('❌ Error checking sample data:', error.message);
    return false;
  }
}

/**
 * Test API endpoints
 */
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API endpoints...');
  
  const baseUrl = `http://localhost:${config.port}`;
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${baseUrl}/health`);
    if (healthResponse.ok) {
      console.log('✅ Health endpoint working');
    } else {
      console.log('❌ Health endpoint failed');
      return false;
    }
    
    // Test root endpoint
    const rootResponse = await fetch(`${baseUrl}/`);
    if (rootResponse.ok) {
      console.log('✅ Root endpoint working');
    } else {
      console.log('❌ Root endpoint failed');
      return false;
    }
    
    // Test API docs endpoint
    const docsResponse = await fetch(`${baseUrl}/api/docs`);
    if (docsResponse.ok) {
      console.log('✅ API docs endpoint working');
    } else {
      console.log('❌ API docs endpoint failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ API endpoint test failed:', error.message);
    console.log('📝 Make sure the server is running: npm run dev');
    return false;
  }
}

/**
 * Main setup function
 */
async function main() {
  let allChecksPassed = true;
  
  // Check environment file
  if (!checkEnvFile()) {
    allChecksPassed = false;
  }
  
  // Test database connection
  if (allChecksPassed && !(await testDatabaseConnection())) {
    allChecksPassed = false;
  }
  
  // Check database schema
  if (allChecksPassed && !(await checkDatabaseSchema())) {
    allChecksPassed = false;
  }
  
  // Check sample data
  if (allChecksPassed && !(await checkSampleData())) {
    allChecksPassed = false;
  }
  
  // Test API endpoints (only if server is running)
  if (allChecksPassed && !(await testAPIEndpoints())) {
    console.log('⚠️  API endpoint tests failed - server may not be running');
    console.log('📝 Start the server with: npm run dev');
  }
  
  console.log('\n============================');
  
  if (allChecksPassed) {
    console.log('🎉 Setup completed successfully!');
    console.log('🚀 Your FinanceBro backend is ready to use');
    console.log(`📍 Server: http://localhost:${config.port}`);
    console.log(`📚 API Docs: http://localhost:${config.port}/api/docs`);
  } else {
    console.log('❌ Setup incomplete - please fix the issues above');
    console.log('📝 Refer to the README.md for detailed setup instructions');
  }
  
  console.log('============================\n');
}

// Run the setup
main().catch(console.error);
