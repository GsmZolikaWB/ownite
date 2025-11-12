#!/bin/bash
set -e

# Quick fix script for common deployment issues

echo "🔧 Fixing common deployment issues..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env from example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env file with your production values!${NC}"
    echo -e "   Run: nano .env"
    echo -e "   Set NEXTAUTH_SECRET with: openssl rand -base64 32"
    echo ""
    read -p "Press Enter after you've configured .env file..."
fi

# Stop any existing PM2 process
echo -e "${BLUE}🛑 Stopping existing PM2 processes...${NC}"
pm2 delete mechatronics-portfolio 2>/dev/null || true

# Kill any process on port 3000
echo -e "${BLUE}🔪 Killing any process on port 3000...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Ensure logs directory exists
echo -e "${BLUE}📁 Creating logs directory...${NC}"
mkdir -p logs

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Generate Prisma client
echo -e "${BLUE}🗄️  Generating Prisma client...${NC}"
npx prisma generate

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

# Start with PM2
echo -e "${BLUE}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save

echo ""
echo -e "${GREEN}✅ Deployment fixed!${NC}"
echo ""
echo -e "${BLUE}Check status with:${NC}"
echo "  pm2 status"
echo "  pm2 logs mechatronics-portfolio"
echo ""
echo -e "${BLUE}If there are still errors, check the logs:${NC}"
echo "  pm2 logs mechatronics-portfolio --lines 50"
