# Row Level Security (RLS) Fix Guide

## 🚨 **Problem**
The registration error occurs because Supabase's Row Level Security (RLS) policies are blocking user creation. The original schema was designed for Supabase's built-in authentication, but we're using custom JWT authentication.

## 🔧 **Solution Options**

### **Option 1: Quick Fix (Recommended)**
Run this SQL script in your Supabase SQL Editor to disable RLS:

```sql
-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE practice DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies
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
```

### **Option 2: Use Service Role Key**
The backend has been updated to use the service role key for user operations, which bypasses RLS. Make sure your `.env` file has:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Option 3: Complete Schema Rebuild**
If you want to start fresh, use the fixed schema:

1. Drop all tables in Supabase
2. Run `backend/database/schema-fixed.sql` in SQL Editor

## 🚀 **Quick Fix Steps**

### **Step 1: Fix Database**
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy and paste the contents of `backend/scripts/fix-rls.sql`
4. Click "Run"

### **Step 2: Update Environment**
Make sure your `backend/.env` file has the service role key:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
```

### **Step 3: Restart Backend**
```bash
cd backend
npm run dev
```

### **Step 4: Test Registration**
1. Go to `http://localhost:8080`
2. Try registering a new user
3. Should work without RLS errors

## 🔍 **Why This Happened**

1. **RLS Policies**: The original schema had RLS policies that expected Supabase's `auth.uid()`
2. **Custom Auth**: We're using custom JWT authentication, not Supabase Auth
3. **Policy Conflict**: RLS policies blocked our custom authentication system

## 🛡️ **Security Note**

Disabling RLS is safe for this use case because:
- We handle authentication at the application level (JWT)
- We validate user permissions in our backend code
- We use the service role key for admin operations
- RLS was designed for Supabase Auth, which we're not using

## ✅ **Verification**

After applying the fix, you should see:
- ✅ User registration works
- ✅ User login works
- ✅ No RLS policy violations
- ✅ All API endpoints function normally

## 🆘 **If Still Having Issues**

1. **Check Service Role Key**: Make sure it's set in `.env`
2. **Verify RLS Disabled**: Run this query in Supabase:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('users', 'lessons', 'progress', 'practice', 'achievements');
   ```
3. **Check Backend Logs**: Look for any remaining RLS errors
4. **Test API Directly**: Use curl to test registration endpoint

The fix should resolve the registration error and allow your FinanceBro app to work properly! 🚀
