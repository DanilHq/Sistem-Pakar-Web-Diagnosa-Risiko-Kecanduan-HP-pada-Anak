import { Link } from 'react-router-dom';
import {
  Brain,
  ClipboardCheck,
  Shield,
  ArrowRight,
  Heart,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-200 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <Logo className="w-20 h-20 md:w-24 md:h-24 relative z-10" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 text-center leading-tight">
            Pantau Kesehatan Digital<br/>
            <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Anak Anda
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto text-center">
            Khawatir anak terlalu lama main HP? Yuk coba tes sederhana ini.
            Cuma 5 menit, langsung tau hasilnya. Gratis kok!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {isAuthenticated ? (
              <Link to="/diagnose" className="btn btn-primary text-base px-7 py-3 inline-flex items-center shadow-lg hover:shadow-xl">
                Mulai Tes Sekarang
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary text-base px-7 py-3 inline-flex items-center shadow-lg hover:shadow-xl">
                <LogIn className="w-4 h-4 mr-2" />
                Login untuk Mulai Tes
              </Link>
            )}
            <Link to="/about" className="btn btn-secondary text-base px-7 py-3">
              Pelajari Dulu
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            {isAuthenticated
              ? '*Data diagnosis Anda akan tersimpan dengan aman'
              : '*Silakan login terlebih dahulu untuk memulai tes'
            }
          </p>
        </div>
      </section>

      {/* Info Alert */}
      <section className="bg-amber-50 border-l-4 border-amber-400 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Catatan penting:</strong> Ini bukan diagnosis medis resmi ya.
                Kalau hasilnya mengkhawatirkan, sebaiknya konsultasi ke psikolog anak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Kenapa Pakai Sistem Ini?
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Sistem Pakar</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pakai metode Forward Chaining dengan 15 gejala yang disusun berdasarkan
                penelitian. Jadi ga asal-asalan!
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-50 p-2.5 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Cepat & Mudah</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cukup jawab 15 pertanyaan simpel tentang perilaku anak.
                Hasilnya langsung keluar, ga perlu nunggu lama.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-50 p-2.5 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">100% Aman</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Data kamu aman. Bisa pakai tanpa login kalau mau.
                Atau daftar kalau pengen simpan riwayat tes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Cara Kerjanya Gampang Banget
          </h2>

          <div className="max-w-3xl mx-auto space-y-5">
            <div className="flex items-start gap-4 bg-gray-50 p-5 rounded-lg">
              <div className="flex-shrink-0 w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1.5">Isi Kuesioner</h3>
                <p className="text-sm text-gray-600">
                  Jawab 15 pertanyaan tentang kebiasaan anak pakai HP dalam 2 minggu terakhir.
                  Tinggal centang aja, gampang!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-50 p-5 rounded-lg">
              <div className="flex-shrink-0 w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1.5">Sistem Analisis Otomatis</h3>
                <p className="text-sm text-gray-600">
                  Sistem bakal cocok-cocokin gejala dengan 16 aturan pakar.
                  Prosesnya cepet, ga sampai 1 detik!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-50 p-5 rounded-lg">
              <div className="flex-shrink-0 w-9 h-9 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1.5">Dapat Hasil & Saran</h3>
                <p className="text-sm text-gray-600">
                  Langsung dapet kategorinya (Normal, Ringan, Sedang, atau Berat)
                  plus saran praktis buat ngatasinnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">15</div>
              <p className="text-sm text-primary-100">Gejala</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">16</div>
              <p className="text-sm text-primary-100">Aturan</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">4</div>
              <p className="text-sm text-primary-100">Kategori</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">100%</div>
              <p className="text-sm text-primary-100">Gratis</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block mb-4">
              <Heart className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Deteksi Sekarang, Cegah Masalah Nanti
            </h2>
            <p className="text-gray-600 mb-7 leading-relaxed">
              Makin cepat tau, makin gampang ngatasinnya. Ga perlu ribet,
              cukup 5 menit buat tes ini. Yuk mulai sekarang!
            </p>
            {isAuthenticated ? (
              <Link
                to="/diagnose"
                className="inline-flex items-center bg-primary-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-primary-700 transition shadow-md hover:shadow-lg"
              >
                Mulai Tes Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="inline-flex items-center bg-primary-600 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-primary-700 transition shadow-md hover:shadow-lg"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Login Dulu Yuk!
                </Link>
                <p className="text-sm text-gray-500">
                  Belum punya akun?{' '}
                  <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                    Daftar gratis
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
