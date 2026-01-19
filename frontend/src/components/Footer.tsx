import { Heart, Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-10">
        {/* Disclaimer */}
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-8 max-w-4xl mx-auto">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-amber-100">
              <strong>Disclaimer:</strong> Ini cuma tool skrining awal, bukan diagnosis resmi dari dokter.
              Hasil di sini berdasarkan jawaban kamu aja. Kalau khawatir, mending konsul langsung ke psikolog anak atau dokter ya!
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* About */}
          <div>
            <h3 className="font-bold text-white text-base mb-3">SmartKid Check</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform sederhana buat bantu ortu deteksi dini kecanduan HP pada anak.
              Pakai metode Forward Chaining yang udah teruji.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white text-base mb-3">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-gray-400 hover:text-primary-400 transition">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/diagnose" className="text-gray-400 hover:text-primary-400 transition">
                  Mulai Tes
                </a>
              </li>
              <li>
                <a href="/articles" className="text-gray-400 hover:text-primary-400 transition">
                  Artikel
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-primary-400 transition">
                  Tentang
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="font-bold text-white text-base mb-3">Butuh Bantuan?</h3>
            <div className="text-sm space-y-2.5">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Hotline Kesehatan Jiwa</p>
                <p className="font-semibold text-white">119 ext. 8</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Sejiwa (Remaja)</p>
                <p className="font-semibold text-white">119</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="flex items-center justify-center text-xs text-gray-500">
            Dibuat dengan <Heart className="w-3 h-3 text-primary-500 mx-1.5" fill="currentColor" /> untuk keluarga Indonesia
          </p>
          <p className="mt-2 text-xs text-gray-600">
            © {new Date().getFullYear()} SmartKid Check
          </p>
        </div>
      </div>
    </footer>
  );
}
