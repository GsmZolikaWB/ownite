#!/bin/bash

# Troubleshooting script for mechatronics portfolio deployment issues

echo "🔍 Mechatronics Portfolio - Troubleshooting"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES=0

# Check 1: .env file exists
echo -e "${BLUE}1. Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file is missing!${NC}"
    echo -e "   Fix: cp .env.example .env && nano .env"
    echo -e "   Then edit the file with your actual values"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ .env file exists${NC}"

    # Check required environment variables
    if ! grep -q "DATABASE_URL=" .env || grep -q "DATABASE_URL=\"file:./dev.db\"" .env; then
        echo -e "${YELLOW}⚠️  DATABASE_URL might need to be updated for production${NC}"
    fi

    if ! grep -q "NEXTAUTH_SECRET=" .env || grep -q "your-secret-key-here" .env; then
        echo -e "${RED}❌ NEXTAUTH_SECRET is not set or using default value!${NC}"
        echo -e "   Fix: Generate a secret with: openssl rand -base64 32"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✓ NEXTAUTH_SECRET is configured${NC}"
    fi

    if ! grep -q "NEXTAUTH_URL=" .env || grep -q "http://localhost:3000" .env; then
        echo -e "${YELLOW}⚠️  NEXTAUTH_URL should be set to your production URL${NC}"
    fi
fi
echo ""

# Check 2: Node modules installed
echo -e "${BLUE}2. Checking node_modules...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules not found!${NC}"
    echo -e "   Fix: npm install"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ node_modules exists${NC}"
fi
echo ""

# Check 3: Prisma generated
echo -e "${BLUE}3. Checking Prisma client...${NC}"
if [ ! -d "node_modules/.prisma" ]; then
    echo -e "${RED}❌ Prisma client not generated!${NC}"
    echo -e "   Fix: npx prisma generate"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ Prisma client is generated${NC}"
fi
echo ""

# Check 4: Database exists and is migrated
echo -e "${BLUE}4. Checking database...${NC}"
if [ ! -f "prisma/dev.db" ]; then
    echo -e "${RED}❌ Database file not found!${NC}"
    echo -e "   Fix: npx prisma migrate deploy"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ Database file exists${NC}"
fi
echo ""

# Check 5: Build artifacts
echo -e "${BLUE}5. Checking build artifacts...${NC}"
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ Build artifacts (.next) not found!${NC}"
    echo -e "   Fix: npm run build"
    ISSUES=$((ISSUES + 1))
else
    echo -e "${GREEN}✓ Build artifacts exist${NC}"
fi
echo ""

# Check 6: Port 3000 availability
echo -e "${BLUE}6. Checking port 3000...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo -e "   Process using port 3000:"
    lsof -Pi :3000 -sTCP:LISTEN 2>/dev/null || echo "   (Unable to determine)"
    echo -e "   Fix: pm2 delete mechatronics-portfolio (if PM2) or pkill -f next"
else
    echo -e "${GREEN}✓ Port 3000 is available${NC}"
fi
echo ""

# Check 7: PM2 logs (if PM2 is running)
echo -e "${BLUE}7. Checking PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓ PM2 is installed${NC}"

    if pm2 list | grep -q "mechatronics-portfolio"; then
        echo -e "${BLUE}   PM2 app status:${NC}"
        pm2 list | grep -E "mechatronics-portfolio|App name"
        echo ""
        echo -e "${BLUE}   Recent error logs:${NC}"
        pm2 logs mechatronics-portfolio --lines 20 --nostream --err 2>/dev/null || echo "   (No logs available)"
    else
        echo -e "${YELLOW}⚠️  mechatronics-portfolio not found in PM2${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2 not installed${NC}"
fi
echo ""

# Summary
echo "==========================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ No critical issues found!${NC}"
    echo -e "${BLUE}If the app is still not working, check PM2 logs above${NC}"
else
    echo -e "${RED}❌ Found $ISSUES critical issue(s) that need to be fixed${NC}"
    echo ""
    echo -e "${YELLOW}Quick fix - run these commands in order:${NC}"
    echo ""

    if [ ! -f .env ]; then
        echo -e "  ${GREEN}# 1. Create and configure .env file${NC}"
        echo "  cp .env.example .env"
        echo "  # Edit .env with: nano .env"
        echo "  # Set NEXTAUTH_SECRET with: openssl rand -base64 32"
        echo ""
    fi

    if [ ! -d "node_modules" ]; then
        echo -e "  ${GREEN}# 2. Install dependencies${NC}"
        echo "  npm install"
        echo ""
    fi

    if [ ! -d "node_modules/.prisma" ] || [ ! -f "prisma/dev.db" ]; then
        echo -e "  ${GREEN}# 3. Setup database${NC}"
        echo "  npx prisma generate"
        echo "  npx prisma migrate deploy"
        echo ""
    fi

    if [ ! -d ".next" ]; then
        echo -e "  ${GREEN}# 4. Build the application${NC}"
        echo "  npm run build"
        echo ""
    fi

    echo -e "  ${GREEN}# 5. Restart the application${NC}"
    echo "  pm2 delete mechatronics-portfolio 2>/dev/null || true"
    echo "  pm2 start ecosystem.config.js"
    echo "  pm2 save"
fi

echo "==========================================="
