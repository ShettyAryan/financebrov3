-- FinanceBro Database Schema - Fixed for Custom Authentication
-- This file contains the complete database schema for the FinanceBro MVP
-- Updated to work with custom JWT authentication instead of Supabase Auth

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    xp INTEGER DEFAULT 0 CHECK (xp >= 0),
    coins INTEGER DEFAULT 0 CHECK (coins >= 0),
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB, -- Store lesson content as JSON
    category VARCHAR(50) DEFAULT 'basics',
    xp_reward INTEGER DEFAULT 50 CHECK (xp_reward > 0),
    order_index INTEGER DEFAULT 0,
    is_unlocked_by_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Practice session tracking
CREATE TABLE IF NOT EXISTS practice (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    coins_earned INTEGER DEFAULT 0 CHECK (coins_earned >= 0),
    coins_lost INTEGER DEFAULT 0 CHECK (coins_lost >= 0),
    attempts INTEGER DEFAULT 1 CHECK (attempts > 0),
    last_feedback TEXT,
    session_data JSONB, -- Store practice session details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements/badges
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_data JSONB,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON progress(status);
CREATE INDEX IF NOT EXISTS idx_practice_user_id ON practice(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_lesson_id ON practice(lesson_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_updated_at BEFORE UPDATE ON practice
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DISABLE Row Level Security for custom authentication
-- Since we're using our own JWT authentication, we'll handle security at the application level
-- This allows our backend to manage user data without RLS conflicts

-- Users table - allow all operations (security handled by backend)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Progress table - allow all operations (security handled by backend)
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;

-- Practice table - allow all operations (security handled by backend)
ALTER TABLE practice DISABLE ROW LEVEL SECURITY;

-- Achievements table - allow all operations (security handled by backend)
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;

-- Lessons table - publicly readable (no RLS needed)
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
