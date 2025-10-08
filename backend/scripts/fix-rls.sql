-- Quick fix for Row Level Security issues
-- Run this in your Supabase SQL Editor to fix the registration error

-- Disable RLS on all tables since we're using custom authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies that are causing conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own progress" ON progress;
DROP POLICY IF EXISTS "Users can update own progress" ON progress;
DROP POLICY IF EXISTS "Users can view own practice" ON practice;
DROP POLICY IF EXISTS "Users can insert own practice" ON practice;
DROP POLICY IF EXISTS "Users can update own practice" ON practice;
DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
DROP POLICY IF EXISTS "Lessons are publicly readable" ON lessons;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'lessons', 'progress', 'practice', 'achievements');
