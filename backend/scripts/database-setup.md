# Database Setup Instructions

## Quick Setup for FinanceBro Backend

The error you're seeing occurs because the database tables haven't been created yet. Follow these steps to set up your Supabase database:

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be fully provisioned (usually 2-3 minutes)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### Step 3: Configure Environment

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
   ```

### Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database/schema.sql` and paste it into the editor
4. Click **Run** to execute the SQL

### Step 5: Add Sample Data (Optional)

1. In the SQL Editor, create another new query
2. Copy the entire contents of `database/seed.sql` and paste it into the editor
3. Click **Run** to add sample lessons and test data

### Step 6: Test the Setup

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:3001/health
   ```

3. Run the setup script to verify everything:
   ```bash
   npm run setup
   ```

## Troubleshooting

### Common Issues:

1. **"Could not find table 'users'"**
   - Make sure you've run the schema.sql script in Supabase
   - Check that your SUPABASE_URL and SUPABASE_KEY are correct

2. **"Invalid API key"**
   - Verify your SUPABASE_KEY is the anon public key (not the service_role key)
   - Make sure there are no extra spaces or characters

3. **"JWT secret not provided"**
   - Make sure JWT_SECRET is set in your .env file
   - Use a long, random string (at least 32 characters)

### Quick Test Commands:

```bash
# Test database connection
curl http://localhost:3001/health

# Test API docs
curl http://localhost:3001/api/docs

# Test AI service (placeholder)
curl http://localhost:3001/api/ai/test
```

## Next Steps

Once the database is set up, you can:

1. **Test user registration:**
   ```bash
   curl -X POST http://localhost:3001/api/users/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "Password123!"
     }'
   ```

2. **Test login:**
   ```bash
   curl -X POST http://localhost:3001/api/users/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Password123!"
     }'
   ```

3. **Get lessons:**
   ```bash
   curl http://localhost:3001/api/lessons
   ```

Your FinanceBro backend should now be ready to use! 🚀
