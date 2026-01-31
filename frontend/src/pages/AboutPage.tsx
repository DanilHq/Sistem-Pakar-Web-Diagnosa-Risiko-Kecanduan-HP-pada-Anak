import { useState, useEffect } from 'react';
import { Brain, Target, GitBranch, Shield, AlertCircle, Loader, Mail, Phone, MapPin, User } from 'lucide-react';
import { aboutAPI, AboutContent } from '../services/api';

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const data = await aboutAPI.get();
      setAboutContent(data);
    } catch (error) {
      console.error('Failed to load about content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        {aboutContent?.title || 'Tentang Sistem Pakar'}
      </h1>

      {/* Introduction */}
      <div className="card mb-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          {aboutContent?.description || 
            'Sistem Pakar Diagnosa Risiko Kecanduan HP pada Anak adalah aplikasi web yang dikembangkan untuk membantu orang tua mendeteksi dini tanda-tanda kecanduan gadget pada anak. Sistem ini menggunakan pendekatan Forward Chaining, sebuah metode inferensi dalam kecerdasan buatan yang bekerja dari fakta-fakta yang diketahui menuju kesimpulan.'}
        </p>
      </div>

      {/* Vision & Mission */}
      {(aboutContent?.vision || aboutContent?.mission) && (
        <section className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold">Visi & Misi</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {aboutContent?.vision && (
              <div className="card border-l-4 border-purple-500">
                <h3 className="font-semibold text-lg mb-3 text-purple-600">Visi</h3>
                <p className="text-gray-700 text-sm">{aboutContent.vision}</p>
              </div>
            )}
            {aboutContent?.mission && (
              <div className="card border-l-4 border-blue-500">
                <h3 className="font-semibold text-lg mb-3 text-blue-600">Misi</h3>
                <p className="text-gray-700 text-sm">{aboutContent.mission}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Forward Chaining Explanation */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <GitBranch className="w-8 h-8 text-primary-600" />
          <h2 className="text-2xl font-bold">Forward Chaining</h2>
        </div>
        <div className="card">
          <p className="text-gray-700 mb-4">
            <strong>Forward Chaining</strong> (pelacakan maju) adalah metode inferensi yang dimulai dari data atau
            fakta yang diketahui, kemudian menggunakan aturan (rules) untuk menghasilkan kesimpulan baru.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold text-blue-900 mb-2">Cara Kerja dalam Sistem Ini:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Sistem memuat 16 aturan yang telah didefinisikan, diurutkan berdasarkan prioritas</li>
              <li>User menjawab 15 pertanyaan tentang gejala yang dialami anak</li>
              <li>
                Sistem mencocokkan gejala-gejala tersebut dengan kondisi (conditions) pada setiap aturan
              </li>
              <li>Jika semua kondisi pada suatu aturan terpenuhi, maka aturan tersebut "fired" (terpicu)</li>
              <li>Sistem memilih aturan dengan prioritas tertinggi yang terpenuhi sebagai kesimpulan</li>
              <li>Jika tidak ada aturan yang cocok, sistem mengembalikan hasil "Normal" (K01)</li>
            </ol>
          </div>

          <p className="text-gray-700">
            Kelebihan forward chaining: <strong>transparan</strong> (dapat dilihat trace-nya), <strong>efisien</strong>{' '}
            untuk kasus dengan banyak data awal, dan <strong>mudah dipahami</strong>.
          </p>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold">Basis Pengetahuan</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-lg mb-3 text-primary-600">15 Gejala (G01-G15)</h3>
            <p className="text-gray-700 text-sm">
              Sistem mengenali 15 gejala kecanduan HP pada anak, meliputi aspek perilaku (penggunaan berlebihan,
              marah saat HP diambil), dampak sosial (isolasi, berbohong), dampak akademik (prestasi menurun), dan
              dampak kesehatan (gangguan tidur, mata lelah, kurang aktivitas fisik).
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-lg mb-3 text-green-600">16 Aturan (R01-R16)</h3>
            <p className="text-gray-700 text-sm">
              16 aturan didefinisikan berdasarkan kombinasi gejala yang mengarah pada 4 kategori risiko: Normal (K01),
              Kecanduan Ringan (K02), Kecanduan Sedang (K03), dan Kecanduan Berat (K04). Setiap aturan memiliki
              prioritas, di mana prioritas 1 adalah yang tertinggi.
            </p>
          </div>
        </div>
      </section>

      {/* Risk Categories */}
      <section className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-8 h-8 text-orange-600" />
          <h2 className="text-2xl font-bold">Kategori Risiko</h2>
        </div>
        <div className="space-y-4">
          <div className="card border-l-4 border-green-500">
            <h3 className="font-semibold text-lg mb-2">K01 - Normal</h3>
            <p className="text-gray-700 text-sm">
              Tidak ada indikasi kecanduan HP. Penggunaan HP anak masih dalam batas wajar dan sehat.
            </p>
          </div>

          <div className="card border-l-4 border-yellow-500">
            <h3 className="font-semibold text-lg mb-2">K02 - Kecanduan Ringan</h3>
            <p className="text-gray-700 text-sm">
              Terdapat beberapa gejala awal kecanduan HP yang perlu diwaspadai. Intervensi dini diperlukan seperti
              membatasi waktu layar dan mencari aktivitas alternatif.
            </p>
          </div>

          <div className="card border-l-4 border-orange-500">
            <h3 className="font-semibold text-lg mb-2">K03 - Kecanduan Sedang</h3>
            <p className="text-gray-700 text-sm">
              Anak menunjukkan beberapa gejala kecanduan yang mulai berdampak pada kehidupan sehari-hari. Perlu
              tindakan korektif segera dan konsultasi dengan guru atau konselor sekolah.
            </p>
          </div>

          <div className="card border-l-4 border-red-500">
            <h3 className="font-semibold text-lg mb-2">K04 - Kecanduan Berat</h3>
            <p className="text-gray-700 text-sm">
              Anak menunjukkan banyak gejala kecanduan HP yang serius. Konsultasi dengan psikolog anak atau profesional
              kesehatan mental sangat disarankan. Intervensi terstruktur diperlukan.
            </p>
          </div>
        </div>
      </section>

      {/* Developer Info */}
      {(aboutContent?.developer_name || aboutContent?.developer_info) && (
        <section className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold">Pengembang</h2>
          </div>
          <div className="card">
            {aboutContent?.developer_name && (
              <h3 className="font-semibold text-lg mb-2 text-primary-600">{aboutContent.developer_name}</h3>
            )}
            {aboutContent?.developer_info && (
              <p className="text-gray-700">{aboutContent.developer_info}</p>
            )}
          </div>
        </section>
      )}

      {/* Contact Info */}
      {(aboutContent?.contact_email || aboutContent?.contact_phone || aboutContent?.address) && (
        <section className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold">Kontak</h2>
          </div>
          <div className="card">
            <div className="space-y-3">
              {aboutContent?.contact_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <a href={`mailto:${aboutContent.contact_email}`} className="text-primary-600 hover:underline">
                    {aboutContent.contact_email}
                  </a>
                </div>
              )}
              {aboutContent?.contact_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <a href={`tel:${aboutContent.contact_phone}`} className="text-primary-600 hover:underline">
                    {aboutContent.contact_phone}
                  </a>
                </div>
              )}
              {aboutContent?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <span className="text-gray-700">{aboutContent.address}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section>
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
          <h2 className="text-2xl font-bold">Disclaimer Penting</h2>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-6">
          <p className="text-gray-700 leading-relaxed">
            Sistem ini adalah <strong>alat skrining awal</strong> dan <strong>BUKAN pengganti diagnosis profesional</strong>.
            Hasil yang diberikan hanya berdasarkan gejala yang Anda laporkan dan tidak mempertimbangkan konteks klinis
            yang lebih luas. Untuk diagnosis yang akurat dan penanganan yang tepat, silakan{' '}
            <strong>konsultasi dengan psikolog anak, dokter anak, atau tenaga kesehatan mental profesional</strong>.
          </p>

          <p className="text-gray-700 mt-4">
            Sistem ini dikembangkan untuk tujuan edukasi dan kesadaran, bukan sebagai pengganti layanan kesehatan
            mental profesional.
          </p>
        </div>
      </section>

      {/* Transparency */}
      <section className="mt-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold">Transparansi & Keamanan</h2>
        </div>
        <div className="card">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>
                <strong>Open Source:</strong> Kode sumber sistem ini terbuka dan dapat diaudit untuk memastikan tidak
                ada bias atau kesalahan.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>
                <strong>Trace Lengkap:</strong> Setiap hasil diagnosa disertai dengan trace yang menunjukkan aturan
                mana yang terpenuhi dan bagaimana sistem sampai pada kesimpulan.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>
                <strong>Privasi Terjaga:</strong> Data Anda disimpan dengan aman. Dapat digunakan tanpa login untuk
                anonimitas penuh.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>
                <strong>Gratis:</strong> Tidak ada biaya untuk menggunakan sistem ini. Kami percaya kesehatan mental
                anak harus dapat diakses oleh semua orang.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
