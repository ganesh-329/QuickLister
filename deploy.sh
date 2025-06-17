#!/bin/bash

# QuickLister Deployment Automation Script
# This script automates the deployment of QuickLister to Vercel

set -e  # Exit on any error

echo "🚀 QuickLister Deployment Automation"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing globally..."
    npm install -g vercel
fi

print_status "Prerequisites checked"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
print_status "Dependencies installed"

# Check for localhost references
echo "🔍 Checking for localhost references..."
if grep -r "localhost" frontend/src/ --exclude-dir=node_modules 2>/dev/null | grep -v "UPDATED" > /dev/null; then
    print_warning "Found remaining localhost references in frontend. Please review and update them."
fi

# Run build test
echo "🔨 Testing build process..."
npm run build:frontend
if [ $? -eq 0 ]; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed. Please fix build issues before deploying."
    exit 1
fi

npm run build:backend
if [ $? -eq 0 ]; then
    print_status "Backend build successful"
else
    print_error "Backend build failed. Please fix build issues before deploying."
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found. This file is required for deployment."
    exit 1
fi

print_status "Build tests passed"

# Environment variables reminder
echo "🔐 Environment Variables Required:"
echo "=================================="
echo "Please ensure these environment variables are set in your Vercel dashboard:"
echo ""
echo "Backend Environment Variables:"
echo "- MONGODB_URI (MongoDB Atlas connection string)"
echo "- JWT_SECRET (32+ character secret)"
echo "- JWT_REFRESH_SECRET (32+ character secret)"
echo "- COHERE_API_KEY (for AI chat functionality)"
echo "- GOOGLE_MAPS_API_KEY (optional, for enhanced maps)"
echo "- CORS_ORIGIN (your production domain, e.g., https://your-app.vercel.app)"
echo ""
echo "Frontend Environment Variables:"
echo "- VITE_GOOGLE_MAPS_API_KEY (Google Maps API key)"
echo "- VITE_API_URL (will be set automatically to /api for production)"
echo ""

# MongoDB Atlas setup reminder
echo "🗄️  Database Setup:"
echo "=================="
echo "1. Create a MongoDB Atlas account (free tier available)"
echo "2. Create a new cluster"
echo "3. Add your IP address to the IP whitelist (or use 0.0.0.0/0 for all IPs)"
echo "4. Create a database user"
echo "5. Get the connection string and set it as MONGODB_URI in Vercel"
echo ""

# Deployment instructions
echo "📋 Deployment Steps:"
echo "==================="
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. Login to Vercel:"
echo "   vercel login"
echo ""
echo "3. Deploy the project:"
echo "   vercel --prod"
echo ""
echo "4. Or deploy via Vercel Dashboard:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Click 'Import Project'"
echo "   - Connect your GitHub repository"
echo "   - Configure environment variables"
echo "   - Deploy!"
echo ""

# Final checklist
echo "✅ Pre-deployment Checklist:"
echo "============================"
echo "□ Code is committed and pushed to GitHub"
echo "□ MongoDB Atlas cluster is created and configured"
echo "□ All environment variables are ready"
echo "□ Build tests passed locally"
echo "□ Google Maps API key is obtained (if using maps)"
echo "□ Cohere AI API key is obtained (for chat functionality)"
echo ""

echo "🎉 Your QuickLister app is ready for deployment!"
echo "After deployment, test these features:"
echo "- User registration and login"
echo "- Gig creation and viewing"
echo "- Map functionality"
echo "- Chat system (note: real-time features may have limitations on Vercel)"
echo "- Admin panel access"
echo ""

print_status "Deployment preparation completed successfully!"

# Optional: Auto-deploy if user confirms
read -p "Do you want to deploy now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting deployment..."
    vercel --prod
else
    echo "🕒 Deployment skipped. Run 'vercel --prod' when ready to deploy."
fi 