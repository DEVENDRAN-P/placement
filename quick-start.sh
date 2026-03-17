#!/bin/bash

# ============================================
# AI Career Intelligence Portal - Quick Start
# ============================================

echo "🚀 Starting Full Stack Setup..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# ============================================
# Step 1: Check Prerequisites
# ============================================

echo "📋 Checking Prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Check MongoDB
if command -v mongod &> /dev/null; then
    print_status "MongoDB found (local)"
    MONGODB_LOCAL=true
else
    print_warning "MongoDB not found locally (you can use MongoDB Atlas)"
    MONGODB_LOCAL=false
fi

echo ""

# ============================================
# Step 2: Setup Environment File
# ============================================

echo "⚙️  Setting up Environment Variables..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
        echo ""
        echo "📝 Please update .env with your credentials:"
        echo "   - FIREBASE_API_KEY"
        echo "   - FIREBASE_PROJECT_ID"
        echo "   - MONGODB_URI (or use MongoDB Atlas)"
        echo "   - EMAIL_USER and EMAIL_PASSWORD"
        echo "   - JWT_SECRET"
        echo ""
        echo "   Edit .env file now and press Enter to continue..."
        read
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_status ".env file already exists"
fi

echo ""

# ============================================
# Step 3: Install Dependencies
# ============================================

echo "📦 Installing Dependencies..."

# Root dependencies
print_status "Installing root dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    print_status "Root dependencies installed"
else
    print_error "Failed to install root dependencies"
    exit 1
fi

# Client dependencies
print_status "Installing client dependencies..."
cd client
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    print_status "Client dependencies installed"
else
    print_error "Failed to install client dependencies"
    exit 1
fi

cd ..

echo ""

# ============================================
# Step 4: Verify Setup
# ============================================

echo "✅ Verifying Setup..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_status "Root node_modules found"
else
    print_error "Root node_modules not found"
fi

if [ -d "client/node_modules" ]; then
    print_status "Client node_modules found"
else
    print_error "Client node_modules not found"
fi

echo ""

# ============================================
# Step 5: Provide Instructions
# ============================================

echo "🎉 Setup Complete!"
echo ""
echo "================================"
echo "NEXT STEPS:"
echo "================================"
echo ""

if [ "$MONGODB_LOCAL" = true ]; then
    echo "✏️  Terminal 1 - Start MongoDB:"
    echo "   mongod"
    echo ""
fi

echo "✏️  Terminal 2 - Start Backend:"
echo "   npm run server"
echo ""

echo "✏️  Terminal 3 - Start Frontend:"
echo "   cd client && npm start"
echo ""

echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend:  http://localhost:5000/api/health"
echo ""

echo "================================"
echo "MONGODB SETUP:"
echo "================================"
echo ""

if [ "$MONGODB_LOCAL" = true ]; then
    echo "✓ Using Local MongoDB"
    echo "  Make sure mongod is running"
else
    echo "⚠  Local MongoDB not found"
    echo "  Use MongoDB Atlas (Cloud):"
    echo "  1. Go to https://www.mongodb.com/cloud/atlas"
    echo "  2. Create free account and cluster"
    echo "  3. Get connection string"
    echo "  4. Update MONGODB_URI in .env"
fi

echo ""

echo "================================"
echo "FIREBASE SETUP:"
echo "================================"
echo ""

echo "1. Go to https://console.firebase.google.com/"
echo "2. Create or select a project"
echo "3. Enable Email/Password authentication"
echo "4. Get credentials from Project Settings"
echo "5. Update FIREBASE_* variables in .env"

echo ""

echo "================================"
echo "EMAIL SERVICE SETUP:"
echo "================================"
echo ""

echo "Option A: Gmail (Development)"
echo "  1. Enable 2-Step Verification"
echo "  2. Create App Password"
echo "  3. Update EMAIL_USER and EMAIL_PASSWORD in .env"
echo ""
echo "Option B: SendGrid (Production)"
echo "  1. Create account at sendgrid.com"
echo "  2. Generate API key"
echo "  3. Set EMAIL_PROVIDER=sendgrid"
echo "  4. Update SENDGRID_API_KEY in .env"

echo ""

echo "================================"
echo "TESTING:"
echo "================================"
echo ""

echo "After servers start, test:"
echo "1. Register new account on http://localhost:3000"
echo "2. Go to Student → Profile Builder"
echo "3. Fill in profile information"
echo "4. Click Save"
echo ""

echo "For detailed setup guide, see: FULL_STACK_SETUP_GUIDE.md"
echo "For feature testing guide, see: FEATURE_TESTING_GUIDE.md"
echo "For setup checklist, see: SETUP_CHECKLIST.md"

echo ""

print_status "Ready to start development!"
