# Deployment Útmutató - SSH

## Gyors Deployment (Egy parancssorban)

```bash
ssh your-user@your-server << 'ENDSSH'
cd /path/to/ownite
git fetch origin
git checkout claude/fix-admin-user-creation-011CV4JqPpgt9nPFH4u6KTpd
git pull origin claude/fix-admin-user-creation-011CV4JqPpgt9nPFH4u6KTpd
bash fix-deployment.sh
ENDSSH
```

---

## Részletes Lépések

### 1. Kapcsolódj SSH-n a production szerverhez

```bash
ssh your-user@your-server
```

### 2. Navigálj a projekt könyvtárba

```bash
cd /var/www/ownite
# vagy
cd /home/user/ownite
# vagy ahol a projekted van
```

### 3. Töltsd le az új branch-et

```bash
git fetch origin
git checkout claude/fix-admin-user-creation-011CV4JqPpgt9nPFH4u6KTpd
git pull origin claude/fix-admin-user-creation-011CV4JqPpgt9nPFH4u6KTpd
```

### 4. Futtasd a deployment scriptet

```bash
bash fix-deployment.sh
```

Ez automatikusan:
- ✅ Telepíti a függőségeket
- ✅ Frissíti az adatbázis schemát
- ✅ Generálja a Prisma client-et
- ✅ Build-eli az alkalmazást
- ✅ Újraindítja PM2-vel

### 5. Ellenőrizd a működést

```bash
pm2 status
pm2 logs mechatronics-portfolio --lines 50
```

---

## Ha Hiba Történik

### Database hiba:
```bash
npx prisma db push
npx prisma generate
```

### Port foglalt:
```bash
pm2 delete mechatronics-portfolio
pm2 start ecosystem.config.js
```

### Dependency hiba:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Ellenőrző Lista

- [ ] SSH kapcsolat létrejött
- [ ] Git checkout sikeres
- [ ] fix-deployment.sh futott
- [ ] PM2 mutatja az alkalmazást
- [ ] Nincs error a logokban
- [ ] Webes felület elérhető
- [ ] Admin panel → Szállítás tab látható
- [ ] Admin panel → Variánsok tab látható
- [ ] Checkout oldal működik

---

## Új Funkciók Tesztelése

1. **Admin Panel** (http://your-site.com/admin)
   - Lépj be admin userrel (admin@mechatronics.hu / admin123)
   - Nézd meg az új "Szállítás" tabot
   - Adj hozzá egy szállítási módot (pl. "GLS futár", 1500 Ft, "1-2 nap")
   - Nézd meg a "Variánsok" tabot

2. **Kosár Oldal**
   - Adj hozzá terméket a kosárhoz
   - Menj a kosárhoz - látnod kell a szállítási opciókat

3. **Checkout**
   - Kosár → "Tovább a fizetéshez"
   - Töltsd ki a szállítási címet
   - Válassz szállítási módot
   - Válassz fizetési módot (PayPal/Revolut/Utánvét)
   - Próbáld ki az utánvétet (ez már működik!)

---

## Rollback (Ha Valami Nem Működik)

```bash
# Vissza az előző branch-re
git checkout claude/mechatronics-portfolio-site-011CV3jJP27o3dVvQuGGN34X
git pull origin claude/mechatronics-portfolio-site-011CV3jJP27o3dVvQuGGN34X
bash fix-deployment.sh
```
