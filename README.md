# Sistem Pakar - Diagnosa Risiko Kecanduan HP pada Anak

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

Sistem pakar berbasis web untuk mendiagnosa risiko kecanduan HP pada anak menggunakan metode **Forward Chaining**. Aplikasi ini dirancang untuk membantu orang tua mendeteksi dini tanda-tanda kecanduan gadget pada anak dengan basis pengetahuan yang terstruktur.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Instalasi](#-instalasi)
- [Penggunaan](#-penggunaan)
- [API Documentation](#-api-documentation)
- [Forward Chaining Engine](#-forward-chaining-engine)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Kontribusi](#-kontribusi)
- [License](#-license)

## ✨ Fitur Utama

### Untuk Pengguna
- **Diagnosa Interaktif**: Form 15 pertanyaan dengan jawaban YA/TIDAK
- **Hasil Real-time**: Kategori risiko (Normal, Ringan, Sedang, Berat) dengan rekomendasi
- **Trace Transparan**: Lihat aturan mana yang terpenuhi dan bagaimana sistem sampai pada kesimpulan
- **Export PDF**: Download hasil diagnosa dalam format PDF
- **Riwayat Diagnosa**: Simpan dan pantau perkembangan dari waktu ke waktu (dengan login)
- **Artikel Edukasi**: Baca artikel tentang kesehatan mental anak dan parenting digital

### Untuk Admin
- **Dashboard Statistik**: Lihat distribusi diagnosa, gejala paling sering, dan trend
- **CRUD Symptoms**: Kelola 15 gejala kecanduan HP
- **CRUD Rules**: Kelola 16 aturan forward chaining dengan prioritas
- **CRUD Articles**: Kelola artikel edukasi
- **Real-time Update**: Perubahan aturan langsung berpengaruh tanpa redeploy

## 🛠 Teknologi

### Backend
- **Node.js** + **Express.js** - REST API server
- **TypeScript** - Type-safe development
- **SQLite** + **better-sqlite3** - File-based database
- **JWT** - Authentication & authorization
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **jsPDF** - PDF generation

## 🏗 Arsitektur Sistem

```
┌─────────────────┐
│   Frontend      │
│   (React +      │
│   Tailwind)     │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐     ┌──────────────────┐
│   Backend API   │────▶│  SQLite Database │
│   (Express)     │     │  - users         │
│                 │     │  - symptoms      │
│  ┌────────────┐ │     │  - rules         │
│  │  Forward   │ │     │  - diagnoses     │
│  │  Chaining  │ │     │  - articles      │
│  │  Engine    │ │     │  - categories    │
│  └────────────┘ │     └──────────────────┘
└─────────────────┘
```

## 📦 Instalasi

### Prerequisites
- Node.js >= 18.0.0
- npm atau yarn

### 1. Clone Repository
```bash
git clone https://github.com/DanilHq/Sistem-Pakar-Web-Diagnosa-Risiko-Kecanduan-HP-pada-Anak
cd Sistem-Pakar-Web-Diagnosa-Risiko-Kecanduan-HP-pada-Anak
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env dan sesuaikan konfigurasi
# Minimal yang perlu diubah: JWT_SECRET

# Run database migration dan seeding
npm run migrate
npm run seed

# Start development server
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 4. Default Credentials
Setelah seeding, gunakan kredensial berikut:

**Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`

**User:**
- Email: `user@example.com`
- Password: `User123!`

## 🚀 Penggunaan

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Build
```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm run preview
```

### Seed Database
```bash
cd backend
npm run seed
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /api/auth/register
Register new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user (requires authentication)

### Diagnosis Endpoints

#### POST /api/diagnose
Run diagnosis with forward chaining
```json
{
  "user_id": 1,  // optional
  "selected_symptoms": ["G01", "G03", "G05"]
}
```

**Response:**
```json
{
  "diagnosis_id": 1,
  "result_code": "K02",
  "matched_rule_code": "R06",
  "matched_description": "Kecanduan Ringan - ...",
  "recommendation": "Mulai terapkan batasan waktu layar...",
  "trace": [
    {
      "rule_code": "R01",
      "conditions": ["G01", "G03", "G04", "G05", "G07", "G11", "G13"],
      "matched": false,
      "priority": 1
    },
    ...
  ],
  "active_symptoms": ["G01", "G03", "G05"],
  "category": {
    "code": "K02",
    "name": "Kecanduan Ringan",
    "level": 1,
    "color": "#f59e0b",
    "description": "..."
  }
}
```

#### GET /api/diagnose/history
Get user's diagnosis history (requires authentication)

#### GET /api/diagnose/:id
Get diagnosis by ID (requires authentication)

### Symptoms Endpoints

#### GET /api/symptoms
Get all active symptoms (public)

#### GET /api/symptoms/all
Get all symptoms including inactive (admin only)

#### POST /api/symptoms
Create new symptom (admin only)

#### PUT /api/symptoms/:id
Update symptom (admin only)

#### DELETE /api/symptoms/:id
Delete symptom (admin only)

### Rules Endpoints

#### GET /api/rules
Get all rules (admin only)

#### POST /api/rules
Create new rule (admin only)

#### PUT /api/rules/:id
Update rule (admin only)

#### DELETE /api/rules/:id
Delete rule (admin only)

### Articles Endpoints

#### GET /api/articles
Get all published articles (public)

#### GET /api/articles/:slug
Get article by slug (public)

#### GET /api/articles/all
Get all articles including drafts (admin only)

### Admin Endpoints

#### GET /api/admin/statistics
Get system statistics (admin only)

#### GET /api/admin/diagnoses
Get all diagnoses with pagination (admin only)

#### GET /api/admin/users
Get all users (admin only)

## 🧠 Forward Chaining Engine

### Algoritma

1. **Load Rules**: Semua aturan aktif dimuat dan diurutkan berdasarkan priority (1 = tertinggi)
2. **Match Conditions**: Untuk setiap rule, cek apakah semua kondisi (gejala) terpenuhi
3. **Select Winner**: Pilih rule pertama yang terpenuhi (karena sudah terurut by priority)
4. **Generate Trace**: Catat semua rule yang dievaluasi untuk transparansi
5. **Return Result**: Kembalikan kategori risiko, rekomendasi, dan trace

### Basis Pengetahuan

**15 Gejala (G01-G15):**
- G01: Penggunaan HP > 4 jam/hari
- G02: Gangguan tidur
- G03: Marah saat HP diambil
- G04: Mengabaikan tugas sekolah
- G05: Isolasi sosial
- G06: Keluhan fisik (mata, kepala)
- G07: Berbohong tentang durasi
- G08: Langsung cek HP saat bangun
- G09: Kehilangan minat hobi lain
- G10: Penggunaan di tempat tidak tepat
- G11: Prestasi menurun
- G12: Kurang aktivitas fisik
- G13: Cemas tanpa HP
- G14: Sebagai pelarian
- G15: Akses konten tidak sesuai usia

**16 Rules (R01-R16):**
- R01-R02: Kecanduan Berat (K04) - kombinasi 6-7 gejala kritis
- R03-R05: Kecanduan Sedang (K03) - kombinasi 4-6 gejala dengan dampak signifikan
- R06-R15: Kecanduan Ringan (K02) - kombinasi 2-3 gejala awal
- R16: Normal (K01) - tidak ada gejala (default)

## 🗄 Database Schema

```sql
users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  created_at TEXT
)

symptoms (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE,
  text TEXT,
  help_text TEXT,
  active INTEGER DEFAULT 1
)

rules (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE,
  conditions TEXT, -- JSON array
  result TEXT,
  priority INTEGER,
  description TEXT,
  recommendation TEXT,
  active INTEGER DEFAULT 1
)

categories (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT,
  level INTEGER,
  color TEXT,
  description TEXT
)

diagnoses (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  selected_symptoms TEXT, -- JSON array
  result TEXT,
  matched_rule_code TEXT,
  trace TEXT, -- JSON array
  created_at TEXT
)

articles (
  id INTEGER PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  author TEXT,
  published INTEGER,
  created_at TEXT,
  updated_at TEXT
)
```

## 📸 Screenshots

### Halaman Beranda
- Hero section dengan CTA diagnosa
- Penjelasan metode Forward Chaining
- Statistik sistem pakar

### Halaman Diagnosa
- Step-by-step questionnaire
- Progress bar
- Mobile-first design

### Halaman Hasil
- Kategori risiko dengan warna
- Daftar gejala yang terdeteksi
- Rekomendasi tindakan
- Trace inferensi (expandable)
- Export PDF

### Admin Dashboard
- Statistik sistem (users, diagnoses, symptoms, rules)
- Distribusi diagnosa (chart)
- Top gejala paling sering
- Quick actions

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat issue atau pull request.

### Development Guidelines
1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## ⚠️ Disclaimer

Aplikasi ini adalah **alat skrining awal** dan **BUKAN pengganti diagnosis profesional**. Hasil yang diberikan hanya berdasarkan gejala yang dilaporkan. Untuk diagnosis yang akurat dan penanganan yang tepat, silakan konsultasi dengan psikolog anak, dokter anak, atau tenaga kesehatan mental profesional.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Developed for educational purposes and public health awareness.

## 📞 Kontak Darurat

- **Hotline Kesehatan Jiwa**: 119 ext. 8
- **Sejiwa (Kesehatan Mental Remaja)**: 119

---

⭐ **Star this repo** if you find it helpful!

---

## 🐳 Panduan Instalasi & Menjalankan dengan Docker

Berikut adalah panduan untuk menjalankan aplikasi menggunakan Docker Container. Metode ini lebih praktis karena tidak perlu menginstall Node.js atau PostgreSQL secara manual di komputer host.

### Prasyarat
- **Docker Engine** & **Docker Compose**
  - **Windows**: Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - **Linux**: Install Docker Engine dan Docker Compose plugin (`sudo apt install docker.io docker-compose-v2`)

### Langkah-Langkah (Windows & Linux)

1. **Clone Repository**
   ```bash
   git clone https://github.com/DanilHq/Sistem-Pakar-Web-Diagnosa-Risiko-Kecanduan-HP-pada-Anak.git
   cd Sistem-Pakar-Web-Diagnosa-Risiko-Kecanduan-HP-pada-Anak
   ```

2. **Jalankan Docker Compose**
   Buka terminal (PowerShell di Windows atau Terminal di Linux) dan jalankan:
   ```bash
   docker-compose up -d --build
   ```
   *Tunggu beberapa saat hingga proses build image, migrasi database, dan seeding selesai.*

3. **Akses Aplikasi**
   Setelah semua container berjalan (status "healthy"), akses di browser:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)

### Perintah Berguna Lainnya

- **Menjalankan di Background (Detached)**
  ```bash
  docker-compose up -d
  ```

- **Menghentikan Aplikasi**
  ```bash
  docker-compose down
  ```

- **Melihat Log**
  ```bash
  # Semua log
  docker-compose logs -f

  # Log spesifik service (misal backend)
  docker-compose logs -f backend
  ```

- **Clean Up (Hapus Container & Volume)**
  *Peringatan: Ini akan menghapus data database!*
  ```bash
  docker-compose down -v
  ```

