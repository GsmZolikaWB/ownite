# Telepítési Útmutató - Proxmox

## 🚀 Gyors Telepítés

Két módszert kínálunk a Proxmox szerveren történő telepítéshez:

### 1️⃣ LXC Container Telepítés (Ajánlott)

Ez a módszer egy dedikált LXC containert hoz létre, telepíti a Node.js-t és az alkalmazást.

**Proxmox host-on futtasd:**

```bash
# Script letöltése
cd /tmp
wget https://raw.githubusercontent.com/your-repo/ownite/main/deploy/proxmox-lxc-install.sh

# Szerkeszd a konfigurációt a script tetején (opcionális)
nano proxmox-lxc-install.sh

# Futtasd a telepítőt
bash proxmox-lxc-install.sh
```

**Vagy közvetlenül a repository-ból:**

```bash
cd /root
git clone https://github.com/your-username/ownite.git
cd ownite
bash deploy/proxmox-lxc-install.sh
```

**Konfiguráció** (script elején módosítható):
- `CTID=200` - Container ID
- `MEMORY=2048` - RAM MB-ban
- `DISK_SIZE=10` - Lemez GB-ban
- `IP_ADDRESS="dhcp"` - vagy statikus IP mint "192.168.1.100/24"
- `PASSWORD="changeme123"` - Root jelszó

### 2️⃣ Docker Telepítés

Egyszerűbb, de Docker-t igényel. Proxmox host-on vagy bármely LXC/VM-ben futtatható.

**Egy paranccsal:**

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/ownite/main/deploy/docker-install.sh | bash
```

**Vagy lépésről lépésre:**

```bash
# Projekt clone
git clone https://github.com/your-username/ownite.git
cd ownite

# Docker telepítése (ha nincs)
curl -fsSL https://get.docker.com | sh

# Alkalmazás indítása
docker-compose up -d --build
```

## 📋 Manuális Telepítés

Ha egyedi beállításokat szeretnél:

### LXC Container Létrehozása

```bash
# Container létrehozás
pct create 200 local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
    --hostname mechatronics-web \
    --memory 2048 \
    --swap 512 \
    --cores 2 \
    --rootfs local-lvm:10 \
    --password changeme123 \
    --net0 name=eth0,bridge=vmbr0,ip=dhcp \
    --unprivileged 1 \
    --features nesting=1 \
    --onboot 1

# Container indítása
pct start 200

# Belépés a container-be
pct enter 200
```

### Alkalmazás Telepítése a Container-ben

```bash
# Rendszer frissítése
apt update && apt upgrade -y

# Függőségek telepítése
apt install -y curl git ca-certificates gnupg build-essential

# Node.js 20 telepítése
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Alkalmazás letöltése
cd /opt
git clone https://github.com/your-username/ownite.git mechatronics-app
cd mechatronics-app

# .env fájl létrehozása
cp .env.example .env

# Szükség esetén szerkeszd az .env fájlt
nano .env

# Függőségek telepítése
npm install

# Adatbázis inicializálása
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Alkalmazás build
npm run build

# Systemd service létrehozása
cat > /etc/systemd/system/mechatronics.service << 'EOF'
[Unit]
Description=Mechatronics Portfolio
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mechatronics-app
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Service engedélyezése és indítása
systemctl daemon-reload
systemctl enable mechatronics
systemctl start mechatronics
```

## 🔧 Konfiguráció

### Környezeti Változók (.env)

```bash
# Adatbázis
DATABASE_URL="file:./dev.db"

# NextAuth (KÖTELEZŐ változtatni production-ben!)
NEXTAUTH_SECRET="generálj-egy-hosszú-véletlenszerű-stringet"
NEXTAUTH_URL="http://your-server-ip:3000"

# Email (opcionális)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### Reverse Proxy (Nginx) - HTTPS-hez

```nginx
server {
    listen 80;
    server_name mechatronics.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Hasznos Parancsok

### LXC Container Kezelés

```bash
# Container státusz
pct status 200

# Belépés
pct enter 200

# Indítás/Leállítás
pct start 200
pct stop 200

# Resource használat
pct exec 200 -- htop

# Log megtekintése
pct exec 200 -- journalctl -u mechatronics -f
```

### Docker Kezelés

```bash
# Logok
docker-compose logs -f

# Újraindítás
docker-compose restart

# Leállítás
docker-compose down

# Újraépítés
docker-compose up -d --build

# Container shell
docker exec -it mechatronics-portfolio sh
```

### Alkalmazás Kezelés

```bash
# Service státusz
systemctl status mechatronics

# Újraindítás
systemctl restart mechatronics

# Logok
journalctl -u mechatronics -f

# Build újragenerálás
cd /opt/mechatronics-app
npm run build
systemctl restart mechatronics
```

## 🔒 Biztonsági Beállítások

1. **Változtasd meg az admin jelszót** első bejelentkezés után!
2. **NEXTAUTH_SECRET** generálása:
   ```bash
   openssl rand -base64 32
   ```
3. **Firewall beállítása** (Proxmox host-on):
   ```bash
   # Ha UFW van telepítve
   ufw allow 3000/tcp

   # Vagy iptables
   iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
   ```

4. **SSL/HTTPS** beállítása reverse proxy-val (Nginx/Caddy)

## 🐛 Hibaelhárítás

### Alkalmazás nem indul

```bash
# Ellenőrizd a logokat
journalctl -u mechatronics -n 50

# Node.js verzió ellenőrzése
node --version  # Kell: v20.x

# Port foglaltság
netstat -tulpn | grep 3000
```

### Adatbázis hiba

```bash
cd /opt/mechatronics-app
npx prisma migrate reset
npx prisma db seed
```

### Docker build hiba

```bash
# Cache ürítése
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## 🔄 Frissítés

```bash
cd /opt/mechatronics-app
git pull
npm install
npm run build
systemctl restart mechatronics
```

## 📞 Support

Ha problémába ütközöl:
1. Ellenőrizd a logokat
2. Nézd meg a GitHub Issues-t
3. Olvasd el a README.md-t

---

**Készítette:** Claude AI
**Verzió:** 1.0.0
**Utolsó frissítés:** 2024
