# 🚀 Panduan Setup & Running Aplikasi

## ⚠️ Known Issue di Windows

Package `better-sqlite3` memerlukan build tools untuk compile native modules. Jika Anda mengalami error saat `npm install`, ikuti salah satu solusi berikut:

---

## 🔧 Solusi 1: Install Visual Studio Build Tools (Recommended)

### Cara Cepat:
```bash
npm install --global windows-build-tools
```

### Atau Manual:
1. Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
2. Install dengan workload "Desktop development with C++"
3. Restart terminal
4. Jalankan kembali `npm install`

---

## 🔧 Solusi 2: Gunakan Docker (Paling Mudah!)

### Setup dengan Docker:

**1. Buat `docker-compose.yml` di root folder:**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:5000
    command: npm run dev
```

**2. Buat `backend/Dockerfile`:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
```

**3. Buat `frontend/Dockerfile`:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
```

**4. Jalankan:**

```bash
docker-compose up
```

---

## 🔧 Solusi 3: Manual Setup (Tanpa Build Tools)

Jika tidak bisa install build tools, gunakan alternatif:

### Ubah Backend untuk Tidak Pakai SQLite

**Opsi A: Gunakan JSON sebagai database sementara**

1. Edit `backend/package.json`, hapus `better-sqlite3`
2. Gunakan file JSON untuk storage (simple, untuk development only)

**Opsi B: Gunakan PostgreSQL/MySQL (Production-ready)**

1. Install PostgreSQL atau MySQL
2. Ganti `better-sqlite3` dengan `pg` atau `mysql2`
3. Update connection di `backend/src/database.ts`

---

## ✅ Cara Running (Setelah Setup Berhasil)

### Step 1: Install Dependencies

```bash
# Di folder backend
cd backend
npm install

# Di folder frontend
cd ../frontend
npm install
```

### Step 2: Setup Database & Seed Data

```bash
cd backend

# Create tables
npm run migrate

# Insert initial data (15 symptoms, 16 rules, sample users)
npm run seed
```

### Step 3: Jalankan Development Server

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running di: **http://localhost:5000**

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running di: **http://localhost:5173**

### Step 4: Akses Aplikasi

Buka browser ke: **http://localhost:5173**

### Default Login:

**Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`

**User:**
- Email: `user@example.com`
- Password: `User123!`

---

## 🧪 Testing

### Test API dengan cURL:

```bash
# Health check
curl http://localhost:5000/health

# Get symptoms (public)
curl http://localhost:5000/api/symptoms

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# Run diagnosis (public, no auth needed)
curl -X POST http://localhost:5000/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{"selected_symptoms":["G01","G03","G05"]}'
```

---

## 📦 Production Build

### Build Backend:
```bash
cd backend
npm run build
npm start
```

### Build Frontend:
```bash
cd frontend
npm run build
npm run preview
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module..."
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 5000/5173 already in use"
```bash
# Windows: Kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Atau ganti port di .env
```

### Error: "CORS policy"
Pastikan `CORS_ORIGIN` di `backend/.env` sesuai dengan URL frontend:
```
CORS_ORIGIN=http://localhost:5173
```

### Database locked
```bash
# Hapus database dan re-seed
cd backend
rm database.db
npm run migrate
npm run seed
```

---

## 🌐 Deployment

### Deploy ke Vercel (Frontend):
```bash
cd frontend
npm install -g vercel
vercel
```

### Deploy ke Railway/Render (Backend):
1. Push ke GitHub
2. Connect repository ke Railway/Render
3. Set environment variables
4. Deploy!

**Environment Variables untuk Production:**
- `JWT_SECRET` - Generate random string yang kuat
- `DATABASE_PATH` - Path untuk SQLite file
- `CORS_ORIGIN` - URL frontend production
- `NODE_ENV=production`

---

## 📚 Dokumentasi API

Lihat file `openapi.yaml` untuk dokumentasi lengkap API endpoints.

Atau jalankan dengan Swagger UI:
```bash
npm install -g swagger-ui
swagger-ui openapi.yaml
```

---

## 🎯 Features Checklist

✅ Forward Chaining Engine
✅ 15 Symptoms + 16 Rules
✅ User Authentication (JWT)
✅ Admin Panel (CRUD)
✅ Diagnosis History
✅ PDF Export
✅ Articles System
✅ Mobile Responsive
✅ Trace Transparency
✅ Statistics Dashboard

---

## 📞 Support

Jika masih ada masalah:
1. Check `README.md` untuk informasi umum
2. Lihat error log di terminal
3. Check `openapi.yaml` untuk API documentation
4. Buat issue di repository

---

**Happy Coding! 🚀**
