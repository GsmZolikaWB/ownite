#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store current commit hash
OLD_COMMIT=$(git rev-parse HEAD)

# Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes...${NC}"
git pull origin $(git branch --show-current)

# Get new commit hash
NEW_COMMIT=$(git rev-parse HEAD)

# Check if package.json or package-lock.json changed
if git diff --name-only $OLD_COMMIT $NEW_COMMIT | grep -q "package.*\.json"; then
    echo -e "${YELLOW}📦 Dependencies changed, running npm install...${NC}"
    npm install
else
    echo -e "${GREEN}✓ No dependency changes detected${NC}"
fi

# Check if prisma schema changed
if git diff --name-only $OLD_COMMIT $NEW_COMMIT | grep -q "prisma/schema.prisma"; then
    echo -e "${YELLOW}🗄️  Database schema changed, running migrations...${NC}"
    npx prisma migrate deploy
    npx prisma generate
else
    echo -e "${GREEN}✓ No schema changes detected${NC}"
fi

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

# Restart the application (choose your method)
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}🔄 Restarting with PM2...${NC}"
    pm2 restart mechatronics-portfolio || pm2 start npm --name "mechatronics-portfolio" -- start
elif systemctl is-active --quiet mechatronics-portfolio; then
    echo -e "${BLUE}🔄 Restarting with systemd...${NC}"
    sudo systemctl restart mechatronics-portfolio
else
    echo -e "${YELLOW}⚠️  No process manager detected. Please restart manually:${NC}"
    echo -e "   ${GREEN}npm start${NC}"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}📝 Changes:${NC}"
git log --oneline $OLD_COMMIT..$NEW_COMMIT
