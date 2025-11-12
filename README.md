# Mechatronics Portfolio & Webshop

Professzionális mechatronikai mérnök portfólió weboldal webshoppal és felhasználókezeléssel.

## ✨ Funkciók

### 🏠 Főoldal
- Modern, Apple-ihletésű design
- Mechatronikai szolgáltatások bemutatása
- Kapcsolatfelvételi űrlap
- Figyelemfelkeltő animációk és effektek

### 🔐 Felhasználókezelés
- **Admin funkciók:**
  - Új felhasználók létrehozása közvetlenül
  - Meghívók küldése email címre
  - Felhasználók kezelése (törlés)
  - Összes funkció adminisztrálása

- **Felhasználói funkciók:**
  - Regisztráció csak meghívóval
  - Meghívók küldése ismerősöknek
  - Bejelentkezés és biztonságos autentikáció

### 🛒 Webshop
- Csak bejelentkezett felhasználók számára elérhető
- Termékek böngészése kategóriák szerint
- Keresési funkció
- Modern termékkártyák

### 💼 Admin Panel
- Felhasználók kezelése
- Meghívók nyomon követése
- Termékek hozzáadása/törlése
- Kapcsolati üzenetek megtekintése

## 🚀 Telepítés

### Előfeltételek
- Node.js 18+ és npm telepítve

### Lépések

1. **Függőségek telepítése:**
```bash
npm install
```

2. **Környezeti változók beállítása:**
```bash
cp .env.example .env
```

Szerkessze az `.env` fájlt és állítsa be a következő értékeket:
- `NEXTAUTH_SECRET`: Generáljon egy véletlenszerű stringet (pl. `openssl rand -base64 32`)
- Email beállítások (opcionális, az email küldéshez)

3. **Adatbázis inicializálása:**
```bash
npx prisma migrate dev --name init
```

4. **Mintaadatok betöltése:**
```bash
npx prisma db seed
```

Ez létrehoz egy admin felhasználót:
- Email: `admin@mechatronics.hu`
- Jelszó: `admin123`

⚠️ **Fontos:** Első bejelentkezés után változtassa meg az admin jelszót!

5. **Fejlesztői szerver indítása:**
```bash
npm run dev
```

Az alkalmazás elérhető lesz a `http://localhost:3000` címen.

## 📁 Projekt Struktúra

```
├── app/
│   ├── api/              # API útvonalak
│   │   ├── auth/         # Autentikáció (NextAuth)
│   │   ├── admin/        # Admin API-k
│   │   ├── contact/      # Kapcsolati űrlap
│   │   ├── invitations/  # Meghívók kezelése
│   │   └── products/     # Termékek API
│   ├── admin/            # Admin panel
│   ├── auth/             # Login/Register oldalak
│   ├── shop/             # Webshop
│   ├── components/       # React komponensek
│   ├── globals.css       # Globális stílusok
│   ├── layout.tsx        # Főlayout
│   └── page.tsx          # Főoldal
├── lib/
│   ├── auth.ts           # NextAuth konfiguráció
│   └── prisma.ts         # Prisma client
├── prisma/
│   ├── schema.prisma     # Adatbázis séma
│   └── seed.ts           # Seed script
└── public/               # Statikus fájlok
```

## 🎨 Design

A weboldal Apple-ihletésű minimál designt használ:
- **Színséma:** Szürkeárnyalatok, fekete-fehér
- **Effektek:** Brushed metal textúrák, glass effect
- **Tipográfia:** System font (-apple-system)
- **Elemek:** Lekerekített sarkok (rounded-full, rounded-xl)
- **Animációk:** Framer Motion transitions

## 🔒 Biztonság

- Jelszavak bcrypt-tel titkosítva
- NextAuth session kezelés
- API útvonalak védettek session ellenőrzéssel
- Admin műveletek külön ellenőrizve
- Input validáció Zod sémákkal

## 📊 Adatbázis

SQLite adatbázis Prisma ORM-mel:
- **Users:** Felhasználók (admin és user szerepkörrel)
- **Invitations:** Meghívók (token, lejárat, felhasználás)
- **Products:** Termékek a webshophoz
- **ContactMessages:** Kapcsolati űrlapról érkező üzenetek

## 🛠️ Technológiák

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite + Prisma ORM
- **Authentication:** NextAuth.js
- **Validation:** Zod
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 📝 Használat

### Admin Felhasználóként

1. Jelentkezzen be admin fiókkal
2. Navigáljon az "Admin" menüponthoz
3. Itt tudja:
   - Új felhasználókat létrehozni
   - Meghívókat küldeni
   - Termékeket hozzáadni/törölni
   - Üzeneteket megtekinteni

### Meghívó Küldése

**Admin módszer:**
1. Admin panel → Meghívók tab
2. Email cím megadása
3. Küldés gomb → meghívó link generálása

**Felhasználói módszer:**
1. Webshop → "Meghívó küldése" gomb
2. Email cím megadása
3. Link másolása és továbbítása

### Regisztráció Meghívóval

1. Kattintson a meghívó linkre vagy látogasson el a regisztrációs oldalra
2. Adja meg a meghívó kódot (token)
3. Töltse ki a regisztrációs űrlapot
4. Jelentkezzen be az új fiókkal

## 🚀 Production Build & Deployment

### Quick Start

```bash
# Build készítése
npm run build

# Production szerver indítása
npm start
```

### 🔄 Egy-parancs Frissítés (Production)

**Teljes frissítés** (dependencies, migrations, build):
```bash
./deploy.sh
```

**Gyors frissítés** (csak kód változás):
```bash
./quick-update.sh
```

### Process Management

**PM2 használata (ajánlott):**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

**Systemd service:**
```bash
sudo cp mechatronics-portfolio.service /etc/systemd/system/
sudo systemctl enable mechatronics-portfolio
sudo systemctl start mechatronics-portfolio
```

📘 **Részletes deployment útmutató:** Lásd a [DEPLOYMENT.md](./DEPLOYMENT.md) fájlt!

## 📄 License

Ez a projekt egyedi fejlesztés, minden jog fenntartva.

## 👨‍💻 Fejlesztő

Mechatronikai Mérnök
- 📧 Email: info@mechatronics.hu
- 🌐 Web: [link]

---

**Megjegyzés:** Ez egy portfólió projekt, amely bemutatja a modern webfejlesztési technológiák használatát mechatronikai szolgáltatások népszerűsítésére.
