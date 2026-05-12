#!/bin/bash

# GoalsFair Setup Checker
# This script checks if all required setup steps are complete

echo "🔍 Checking GoalsFair Setup Status..."
echo ""

# Check 1: .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    
    # Check if it has Supabase credentials
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local; then
        echo "✅ Supabase URL configured"
    else
        echo "❌ Supabase URL not configured"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ" .env.local; then
        echo "✅ Supabase anon key configured"
    else
        echo "❌ Supabase anon key not configured"
    fi
    
    if grep -q "UPSTASH_REDIS_REST_URL=" .env.local; then
        echo "✅ Upstash Redis configured"
    else
        echo "⚠️  Upstash Redis not configured (optional for now)"
    fi
else
    echo "❌ .env.local file not found"
    echo "   Run: cp .env.local.example .env.local"
    echo "   Then edit with your credentials"
fi

echo ""

# Check 2: node_modules
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed"
    echo "   Run: npm install"
fi

echo ""

# Check 3: Supabase CLI
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI installed globally"
elif npx supabase --version &> /dev/null; then
    echo "✅ Supabase CLI available via npx"
else
    echo "❌ Supabase CLI not available"
fi

echo ""

# Check 4: TypeScript compilation
echo "🔍 Checking TypeScript..."
if npm run typecheck 2>&1 | grep -q "Found 0 errors"; then
    echo "✅ TypeScript compilation passes"
else
    ERROR_COUNT=$(npm run typecheck 2>&1 | grep -o "Found [0-9]* error" | grep -o "[0-9]*")
    echo "❌ TypeScript has $ERROR_COUNT errors"
    echo "   This is expected until Supabase is connected"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
if [ -f ".env.local" ] && grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local; then
    echo "✅ Setup looks good! Next steps:"
    echo "   1. npx supabase login"
    echo "   2. npx supabase link --project-ref your-ref"
    echo "   3. npx supabase db push"
    echo "   4. npx supabase gen types typescript --project-id your-ref > types/database.ts"
    echo "   5. npm run dev"
else
    echo "⚠️  Setup incomplete. Follow these steps:"
    echo "   1. Create Supabase project at https://supabase.com/dashboard"
    echo "   2. Copy .env.local.example to .env.local"
    echo "   3. Add your Supabase credentials to .env.local"
    echo "   4. Follow SUPABASE_SETUP.md for detailed instructions"
fi

echo ""
