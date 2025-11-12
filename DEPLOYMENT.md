# 🚀 Deployment Útmutató

## Gyors áttekintés

3 deployment módszer közül választhatsz:

1. **Manuális deploy script** - Egy parancs a szerveren
2. **PM2 automatikus** - Process manager, auto-restart
3. **Systemd service** - Rendszerszintű szolgáltatás
4. **GitHub Actions** - Automatikus deploy minden push-nál

---

## 1️⃣ Manuális Deployment (Ajánlott kezdéshez)

### Első telepítés

```bash
# Clone a repository
git clone <your-repo-url> /var/www/ownite
cd /var/www/ownite

# Telepítés
npm install
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# Indítás
npm start
```

### Frissítés (EGY PARANCS!)

```bash
cd /var/www/ownite
./deploy.sh
```

A `deploy.sh` automatikusan:
- ✅ Git pull
- ✅ Ellenőrzi, változtak-e a dependencies (csak akkor `npm install`)
- ✅ Ellenőrzi, változott-e a DB schema (csak akkor migrate)
- ✅ Build
- ✅ Restart (PM2/systemd/manual)

### Gyors frissítés (csak kód változás, dependency nélkül)

```bash
./quick-update.sh
```

---

## 2️⃣ PM2 Process Manager (Ajánlott production-re)

### PM2 telepítése

```bash
npm install -g pm2
```

### Alkalmazás indítása PM2-vel

```bash
cd /var/www/ownite
npm run build
pm2 start ecosystem.config.js
pm2 save  # Mentés
pm2 startup  # Auto-start rendszerindításkor
```

### Frissítés PM2-vel

```bash
./deploy.sh  # Automatikusan PM2 restart-tal
```

### PM2 parancsok

```bash
pm2 status                    # Státusz
pm2 logs mechatronics-portfolio  # Logok
pm2 restart mechatronics-portfolio  # Restart
pm2 stop mechatronics-portfolio     # Stop
pm2 delete mechatronics-portfolio   # Törlés
pm2 monit                     # Monitoring
```

---

## 3️⃣ Systemd Service (Linux szerver)

### Service telepítése

```bash
# Service file másolása
sudo cp mechatronics-portfolio.service /etc/systemd/system/

# Szerkeszd az útvonalakat a service file-ban!
sudo nano /etc/systemd/system/mechatronics-portfolio.service

# User, WorkingDirectory, stb.
```

### Service kezelése

```bash
# Engedélyezés és indítás
sudo systemctl daemon-reload
sudo systemctl enable mechatronics-portfolio
sudo systemctl start mechatronics-portfolio

# Státusz
sudo systemctl status mechatronics-portfolio

# Logok
sudo journalctl -u mechatronics-portfolio -f

# Restart
sudo systemctl restart mechatronics-portfolio
```

### Frissítés systemd-vel

```bash
./deploy.sh  # Automatikusan systemctl restart-tal
```

---

## 4️⃣ GitHub Actions (Automatikus deploy)

### GitHub Secrets beállítása

GitHub repo → Settings → Secrets → Add:

- `DEPLOY_HOST`: Szerver IP címe
- `DEPLOY_USER`: SSH user (pl. `ubuntu`, `root`)
- `DEPLOY_KEY`: SSH private key

```bash
# SSH key generálás
ssh-keygen -t rsa -b 4096 -C "deploy@mechatronics"
# Public key hozzáadása a szerverhez
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
# Private key-t add GitHub secret-ként
cat ~/.ssh/id_rsa
```

### Workflow szerkesztése

Nyisd meg: `.github/workflows/deploy.yml`

Változtasd meg:
- `branches: [main]` → a te production branch-ed
- `/path/to/ownite` → a szerveren az app tényleges útvonala

### Használat

```bash
git push origin main  # Automatikus deploy!
```

GitHub Actions → Actions tab → Nézd a deploy logokat

---

## 🔧 Haladó beállítások

### Docker deployment (opcionális)

```dockerfile
# Dockerfile (ha kéred, csinálok)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
CMD ["npm", "start"]
```

### Nginx reverse proxy

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
    }
}
```

---

## 📝 Környezeti változók

Hozz létre `.env.production` fájlt:

```bash
DATABASE_URL="file:./prisma/prod.db"
NEXTAUTH_SECRET="<generált-secret>"
NEXTAUTH_URL="https://yourdomain.com"
```

Generálj secret-et:

```bash
openssl rand -base64 32
```

---

## ⚡ Gyors Reference

| Módszer | Parancs | Sebbesség |
|---------|---------|-----------|
| **Teljes deploy** | `./deploy.sh` | ~30-60s |
| **Gyors update** | `./quick-update.sh` | ~10-20s |
| **PM2 restart** | `pm2 restart mechatronics-portfolio` | ~5s |
| **Systemd restart** | `sudo systemctl restart mechatronics-portfolio` | ~5s |

---

## 🐛 Troubleshooting

### Build hiba

```bash
# Tiszta build
rm -rf .next node_modules
npm install
npm run build
```

### Prisma hiba

```bash
npx prisma generate
npx prisma migrate deploy
```

### Port foglalt

```bash
# Nézd meg mi fut a 3000-es porton
lsof -i :3000
# Öld meg
kill -9 <PID>
```

### Logok

```bash
# PM2
pm2 logs mechatronics-portfolio

# Systemd
sudo journalctl -u mechatronics-portfolio -f

# Next.js
tail -f .next/trace
```

---

## 📞 Support

Kérdés esetén nézd meg a GitHub Issues-t vagy írj a fejlesztőnek!
