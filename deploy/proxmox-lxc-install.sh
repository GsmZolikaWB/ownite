#!/bin/bash

###############################################################################
# Mechatronics Portfolio - Proxmox LXC Automatic Installation Script
#
# This script automatically creates and configures an LXC container on Proxmox
# and deploys the Next.js application with all dependencies.
#
# Usage: Run this on your Proxmox host (not in a container)
#   bash proxmox-lxc-install.sh
###############################################################################

set -e  # Exit on error

# Configuration
CTID=200  # Container ID (change if 200 is already used)
HOSTNAME="mechatronics-web"
MEMORY=2048  # MB
SWAP=512
DISK_SIZE=10  # GB
CORES=2
STORAGE="local-lvm"  # Change to your storage name
TEMPLATE="local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst"  # Ubuntu 22.04 template
PASSWORD="changeme123"  # Root password for the container
BRIDGE="vmbr0"  # Network bridge
IP_ADDRESS="dhcp"  # or set static like "192.168.1.100/24"
GATEWAY=""  # Set if using static IP, e.g. "192.168.1.1"
APP_PORT=3000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Mechatronics Portfolio - Proxmox LXC Auto Installer   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running on Proxmox
if ! command -v pct &> /dev/null; then
    echo -e "${RED}Error: This script must be run on a Proxmox host!${NC}"
    exit 1
fi

# Check if container ID is already used
if pct status $CTID &> /dev/null; then
    echo -e "${YELLOW}Warning: Container $CTID already exists!${NC}"
    read -p "Do you want to destroy it and create a new one? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Stopping and destroying container $CTID...${NC}"
        pct stop $CTID || true
        pct destroy $CTID
    else
        echo -e "${RED}Aborted. Please change CTID in the script.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}[1/6] Creating LXC container...${NC}"
pct create $CTID $TEMPLATE \
    --hostname $HOSTNAME \
    --memory $MEMORY \
    --swap $SWAP \
    --cores $CORES \
    --rootfs $STORAGE:$DISK_SIZE \
    --password $PASSWORD \
    --net0 name=eth0,bridge=$BRIDGE,ip=$IP_ADDRESS,gw=$GATEWAY \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1

echo -e "${GREEN}[2/6] Starting container...${NC}"
pct start $CTID

# Wait for container to be ready
echo -e "${YELLOW}Waiting for container to start...${NC}"
sleep 5

echo -e "${GREEN}[3/6] Installing system dependencies...${NC}"
pct exec $CTID -- bash -c "apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl \
    git \
    ca-certificates \
    gnupg \
    build-essential"

echo -e "${GREEN}[4/6] Installing Node.js 20.x...${NC}"
pct exec $CTID -- bash -c "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs"

echo -e "${GREEN}[5/6] Setting up application...${NC}"

# Create app directory
pct exec $CTID -- bash -c "mkdir -p /opt/mechatronics-app"

# Copy application files from host to container
echo -e "${YELLOW}Copying application files...${NC}"
pct push $CTID /home/user/ownite /opt/mechatronics-app --recursive

# Install dependencies and setup
pct exec $CTID -- bash -c "cd /opt/mechatronics-app && \
    npm install && \
    npx prisma generate && \
    npx prisma migrate deploy && \
    npx prisma db seed"

echo -e "${GREEN}[6/6] Setting up systemd service...${NC}"

# Create systemd service file
pct exec $CTID -- bash -c "cat > /etc/systemd/system/mechatronics.service << 'EOF'
[Unit]
Description=Mechatronics Portfolio Next.js Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mechatronics-app
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"

# Build the application
echo -e "${YELLOW}Building Next.js application...${NC}"
pct exec $CTID -- bash -c "cd /opt/mechatronics-app && npm run build"

# Enable and start service
pct exec $CTID -- bash -c "systemctl daemon-reload && \
    systemctl enable mechatronics.service && \
    systemctl start mechatronics.service"

# Get container IP
CONTAINER_IP=$(pct exec $CTID -- hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             Installation Complete! ✓                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Container Details:${NC}"
echo -e "  Container ID: ${YELLOW}$CTID${NC}"
echo -e "  Hostname: ${YELLOW}$HOSTNAME${NC}"
echo -e "  IP Address: ${YELLOW}$CONTAINER_IP${NC}"
echo -e "  Root Password: ${YELLOW}$PASSWORD${NC}"
echo ""
echo -e "${GREEN}Application Access:${NC}"
echo -e "  URL: ${YELLOW}http://$CONTAINER_IP:$APP_PORT${NC}"
echo ""
echo -e "${GREEN}Admin Login Credentials:${NC}"
echo -e "  Email: ${YELLOW}admin@mechatronics.hu${NC}"
echo -e "  Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "${GREEN}Useful Commands:${NC}"
echo -e "  Enter container: ${YELLOW}pct enter $CTID${NC}"
echo -e "  Check app status: ${YELLOW}pct exec $CTID -- systemctl status mechatronics${NC}"
echo -e "  View app logs: ${YELLOW}pct exec $CTID -- journalctl -u mechatronics -f${NC}"
echo -e "  Restart app: ${YELLOW}pct exec $CTID -- systemctl restart mechatronics${NC}"
echo -e "  Stop container: ${YELLOW}pct stop $CTID${NC}"
echo -e "  Start container: ${YELLOW}pct start $CTID${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Change the admin password after first login!${NC}"
echo ""
