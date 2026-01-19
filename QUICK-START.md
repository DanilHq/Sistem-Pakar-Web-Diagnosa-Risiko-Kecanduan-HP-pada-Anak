# 🚀 QUICK START GUIDE

Ikuti langkah-langkah ini untuk menjalankan aplikasi dengan cepat.

---

## ⚡ LANGKAH 1: Install Build Tools (Hanya Sekali)

### Cara Otomatis (Recommended):

1. **Buka PowerShell sebagai Administrator**
   - Tekan `Win + X`
   - Pilih "Windows PowerShell (Admin)" atau "Terminal (Admin)"

2. **Navigasi ke folder project:**
   ```powershell
   cd "C:\Sistem Pakar Web — Diagnosa Risiko Kecanduan HP pada Anak"
   ```

3. **Jalankan script install:**
   ```powershell
   .\install-build-tools.ps1
   ```

4. **Tunggu 5-10 menit** sampai selesai

5. **Tutup PowerShell Admin** setelah selesai

### Cara Manual (Alternatif):

Jika script tidak bisa dijalankan, install manual:

```powershell
npm install --global windows-build-tools
```

---

## ⚡ LANGKAH 2: Setup & Run Aplikasi

Setelah build tools terinstall:

1. **Buka PowerShell baru (TIDAK perlu Admin)**

2. **Navigasi ke folder project:**
   ```powershell
   cd "C:\Sistem Pakar Web — Diagnosa Risiko Kecanduan HP pada Anak"
   ```

3. **Jalankan script setup:**
   ```powershell
   .\setup-and-run.ps1
   ```

Script ini akan:
- ✅ Install dependencies backend
- ✅ Setup database SQLite
- ✅ Seed data awal (15 symptoms, 16 rules, users)
- ✅ Install dependencies frontend
- ✅ Start backend server (port 5000)
- ✅ Start frontend server (port 5173)

4. **Tunggu 30-60 detik**, lalu buka browser:
   ```
   http://localhost:5173
   ```

---

## 🔑 Default Login Credentials

### Admin Account:
```
Email: admin@example.com
Password: Admin123!
```

### Regular User Account:
```
Email: user@example.com
Password: User123!
```

---

## 📝 LANGKAH MANUAL (Jika Script Tidak Berfungsi)

### Terminal 1 - Backend:
```powershell
cd "C:\Sistem Pakar Web — Diagnosa Risiko Kecanduan HP pada Anak\backend"
npm install
npm run migrate
npm run seed
npm run dev
```

✅ Backend running di: **http://localhost:5000**

### Terminal 2 - Frontend:
```powershell
cd "C:\Sistem Pakar Web — Diagnosa Risiko Kecanduan HP pada Anak\frontend"
npm install
npm run dev
```

✅ Frontend running di: **http://localhost:5173**

---

## 🧪 Test API (Optional)

Buka browser atau Postman:

### Health Check:
```
GET http://localhost:5000/health
```

### Get Symptoms:
```
GET http://localhost:5000/api/symptoms
```

### Run Diagnosis (No Login Required):
```
POST http://localhost:5000/api/diagnose
Content-Type: application/json

{
  "selected_symptoms": ["G01", "G03", "G05"]
}
```

---

## 🎯 Fitur yang Bisa Dicoba

### Sebagai Pengunjung (Tanpa Login):
1. ✅ Buka halaman beranda
2. ✅ Baca halaman "Tentang"
3. ✅ Jalankan diagnosa (15 pertanyaan)
4. ✅ Lihat hasil + trace forward chaining
5. ✅ Export hasil ke PDF
6. ✅ Baca artikel edukasi

### Sebagai User (Login):
1. ✅ Semua fitur pengunjung
2. ✅ Simpan riwayat diagnosa
3. ✅ Lihat history diagnosa

### Sebagai Admin (Login admin@example.com):
1. ✅ Semua fitur user
2. ✅ Akses admin dashboard
3. ✅ Lihat statistik sistem
4. ✅ CRUD Symptoms (tambah/edit/hapus gejala)
5. ✅ CRUD Rules (lihat aturan forward chaining)
6. ✅ CRUD Articles (kelola artikel)

---

## 🐛 Troubleshooting

### Error: "Execution Policy"
Jika PowerShell tidak bisa run script:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force
```

### Error: "Port already in use"
Jika port 5000 atau 5173 sudah dipakai:
```powershell
# Kill process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Error: "Cannot find module"
Hapus node_modules dan reinstall:
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

### Database Locked
Hapus database dan re-seed:
```powershell
cd backend
Remove-Item database.db
npm run migrate
npm run seed
```

---

## 📚 Dokumentasi Lengkap

- **README.md** - Overview & features
- **SETUP.md** - Detailed setup guide & alternatives
- **openapi.yaml** - API documentation

---

## 🎉 Selamat Mencoba!

Aplikasi siap digunakan. Jika ada pertanyaan atau error, silakan cek file **SETUP.md** untuk panduan lebih detail.

**Happy Coding! 🚀**
