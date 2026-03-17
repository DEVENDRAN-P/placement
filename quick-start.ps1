# ============================================
# AI Career Intelligence Portal - Quick Start
# Windows PowerShell Version
# ============================================

Write-Host "🚀 Starting Full Stack Setup..." -ForegroundColor Green
Write-Host ""

# Function to print colored output
function Print-Status {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

# ============================================
# Step 1: Check Prerequisites
# ============================================

Write-Host "📋 Checking Prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $NodeVersion = node --version
    Print-Status "Node.js installed: $NodeVersion"
}
else {
    Print-Error "Node.js not found. Please install from https://nodejs.org/"
    exit 1
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $NpmVersion = npm --version
    Print-Status "npm installed: $NpmVersion"
}
else {
    Print-Error "npm not found"
    exit 1
}

# Check MongoDB
if (Get-Command mongod -ErrorAction SilentlyContinue) {
    Print-Status "MongoDB found (local)"
    $MongoDBLocal = $true
}
else {
    Print-Warning "MongoDB not found locally (you can use MongoDB Atlas)"
    $MongoDBLocal = $false
}

Write-Host ""

# ============================================
# Step 2: Setup Environment File
# ============================================

Write-Host "⚙️  Setting up Environment Variables..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Print-Status "Created .env file from .env.example"
        Write-Host ""
        Write-Host "📝 Please update .env with your credentials:" -ForegroundColor Yellow
        Write-Host "   - FIREBASE_API_KEY"
        Write-Host "   - FIREBASE_PROJECT_ID"
        Write-Host "   - MONGODB_URI (or use MongoDB Atlas)"
        Write-Host "   - EMAIL_USER and EMAIL_PASSWORD"
        Write-Host "   - JWT_SECRET"
        Write-Host ""
        Write-Host "   Opening .env in notepad for editing..." -ForegroundColor Yellow
        Write-Host "   Save and close when done, then press Enter..."
        Read-Host ""
        
        # Try to open in default editor
        notepad ".env"
    }
    else {
        Print-Error ".env.example not found"
        exit 1
    }
}
else {
    Print-Status ".env file already exists"
}

Write-Host ""

# ============================================
# Step 3: Install Dependencies
# ============================================

Write-Host "📦 Installing Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Root dependencies
Print-Status "Installing root dependencies..."
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Print-Status "Root dependencies installed"
}
else {
    Print-Error "Failed to install root dependencies"
    exit 1
}

# Client dependencies
Print-Status "Installing client dependencies..."
Set-Location "client"
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Print-Status "Client dependencies installed"
}
else {
    Print-Error "Failed to install client dependencies"
    exit 1
}

Set-Location ".."

Write-Host ""

# ============================================
# Step 4: Verify Setup
# ============================================

Write-Host "✅ Verifying Setup..." -ForegroundColor Green
Write-Host ""

if (Test-Path "node_modules") {
    Print-Status "Root node_modules found"
}
else {
    Print-Error "Root node_modules not found"
}

if (Test-Path "client\node_modules") {
    Print-Status "Client node_modules found"
}
else {
    Print-Error "Client node_modules not found"
}

Write-Host ""

# ============================================
# Step 5: Provide Instructions
# ============================================

Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($MongoDBLocal) {
    Write-Host "✏️  Terminal 1 - Start MongoDB:" -ForegroundColor Yellow
    Write-Host "   mongod"
    Write-Host ""
}

Write-Host "✏️  Terminal 2 - Start Backend:" -ForegroundColor Yellow
Write-Host "   npm run server"
Write-Host ""

Write-Host "✏️  Terminal 3 - Start Frontend:" -ForegroundColor Yellow
Write-Host "   cd client && npm start"
Write-Host ""

Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "MONGODB SETUP:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if ($MongoDBLocal) {
    Write-Host "✓ Using Local MongoDB" -ForegroundColor Green
    Write-Host "  Make sure mongod is running"
}
else {
    Print-Warning "Local MongoDB not found"
    Write-Host "  Use MongoDB Atlas (Cloud):" -ForegroundColor Yellow
    Write-Host "  1. Go to https://www.mongodb.com/cloud/atlas"
    Write-Host "  2. Create free account and cluster"
    Write-Host "  3. Get connection string"
    Write-Host "  4. Update MONGODB_URI in .env"
}

Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "FIREBASE SETUP:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor Yellow
Write-Host "2. Create or select a project"
Write-Host "3. Enable Email/Password authentication"
Write-Host "4. Get credentials from Project Settings"
Write-Host "5. Update FIREBASE_* variables in .env"

Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "EMAIL SERVICE SETUP:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option A: Gmail (Development)" -ForegroundColor Yellow
Write-Host "  1. Enable 2-Step Verification"
Write-Host "  2. Create App Password"
Write-Host "  3. Update EMAIL_USER and EMAIL_PASSWORD in .env"
Write-Host ""

Write-Host "Option B: SendGrid (Production)" -ForegroundColor Yellow
Write-Host "  1. Create account at sendgrid.com"
Write-Host "  2. Generate API key"
Write-Host "  3. Set EMAIL_PROVIDER=sendgrid"
Write-Host "  4. Update SENDGRID_API_KEY in .env"

Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTING:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After servers start, test:" -ForegroundColor Yellow
Write-Host "1. Register new account on http://localhost:3000"
Write-Host "2. Go to Student → Profile Builder"
Write-Host "3. Fill in profile information"
Write-Host "4. Click Save"
Write-Host ""

Write-Host "For detailed setup guide, see:" -ForegroundColor Cyan
Write-Host "  📖 FULL_STACK_SETUP_GUIDE.md"
Write-Host "  📖 FEATURE_TESTING_GUIDE.md"
Write-Host "  📖 SETUP_CHECKLIST.md"

Write-Host ""

Print-Status "Ready to start development!"
Write-Host ""

# ============================================
# Optional: Offer to open explorer
# ============================================

$OpenExplorer = Read-Host "Open project folder in Explorer? (y/n)"
if ($OpenExplorer -eq 'y' -or $OpenExplorer -eq 'Y') {
    Start-Process explorer.exe -ArgumentList (Get-Location).Path
}
