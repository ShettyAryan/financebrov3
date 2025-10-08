#!/bin/bash

# FinanceBro Backend Quick Setup Script

echo "🚀 FinanceBro Backend Quick Setup"
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your Supabase credentials"
    echo ""
    echo "Required values:"
    echo "- SUPABASE_URL: Your Supabase project URL"
    echo "- SUPABASE_KEY: Your Supabase anon public key"
    echo "- JWT_SECRET: A long random string (at least 32 characters)"
    echo ""
    echo "Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api"
    echo ""
    read -p "Press Enter after you've configured .env file..."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

echo ""
echo "🗄️  Database Setup Required:"
echo "1. Go to your Supabase dashboard"
echo "2. Open SQL Editor"
echo "3. Copy and paste the contents of database/schema.sql"
echo "4. Run the SQL script"
echo "5. (Optional) Run database/seed.sql for sample data"
echo ""
echo "See scripts/database-setup.md for detailed instructions"
echo ""

# Test if server can start
echo "🧪 Testing configuration..."
if npm run dev &
SERVER_PID=$!
sleep 5

# Check if server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Server started successfully!"
    echo "📍 Backend running at: http://localhost:3001"
    echo "📚 API docs at: http://localhost:3001/api/docs"
    echo "❤️  Health check: http://localhost:3001/health"
else
    echo "❌ Server failed to start"
    echo "📝 Check the error messages above"
    echo "📖 See scripts/database-setup.md for troubleshooting"
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Setup complete!"
echo "Run 'npm run dev' to start the development server"
