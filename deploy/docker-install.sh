#!/bin/bash

###############################################################################
# Mechatronics Portfolio - Docker Automatic Installation Script
#
# This script installs Docker (if needed) and deploys the application
# Works on Proxmox host or any Linux system
#
# Usage:
#   bash docker-install.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Mechatronics Portfolio - Docker Auto Installer        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"

    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Start Docker
    systemctl enable docker
    systemctl start docker

    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${GREEN}Docker is already installed.${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
fi

echo -e "${GREEN}Building and starting application...${NC}"
cd /home/user/ownite

# Build and start with Docker Compose
docker-compose up -d --build

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             Installation Complete! ✓                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Application Access:${NC}"
echo -e "  URL: ${YELLOW}http://$(hostname -I | awk '{print $1}'):3000${NC}"
echo -e "  Or: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}Admin Login Credentials:${NC}"
echo -e "  Email: ${YELLOW}admin@mechatronics.hu${NC}"
echo -e "  Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "${GREEN}Docker Commands:${NC}"
echo -e "  View logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop app: ${YELLOW}docker-compose stop${NC}"
echo -e "  Start app: ${YELLOW}docker-compose start${NC}"
echo -e "  Restart app: ${YELLOW}docker-compose restart${NC}"
echo -e "  Remove app: ${YELLOW}docker-compose down${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Change the admin password after first login!${NC}"
echo ""
