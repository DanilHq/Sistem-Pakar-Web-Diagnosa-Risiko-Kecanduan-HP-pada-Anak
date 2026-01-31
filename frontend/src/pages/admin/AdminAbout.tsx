import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aboutAPI, AboutContent } from '../../services/api';
import { 
  Info, 
  Loader, 
  AlertCircle, 
  Save, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  User,
  Eye,
  Target
} from 'lucide-react';
import Toast, { ToastType } from '../../components/Toast';

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [formData, setFormData] = useState<AboutContent>({
    title: '',
    description: '',
    vision: '',
    mission: '',
    developer_name: '',
    developer_info: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const data = await aboutAPI.get();
      setFormData(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat konten');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await aboutAPI.update(formData);
      showToast('✅ Konten halaman Tentang berhasil disimpan!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menyimpan konten', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof AboutContent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kelola Halaman Tentang</h1>
                  <p className="text-gray-600">Edit konten halaman "Tentang" yang ditampilkan ke pengunjung</p>
                </div>
              </div>
              <Link 
                to="/about" 
                target="_blank"
                className="btn btn-secondary flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Lihat Halaman
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Informasi Utama</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Halaman
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="input"
                    placeholder="Tentang Sistem Pakar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="input"
                    rows={4}
                    placeholder="Deskripsi tentang sistem pakar ini..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Deskripsi singkat tentang sistem pakar yang akan ditampilkan di halaman Tentang</p>
                </div>
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Visi & Misi</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visi
                  </label>
                  <textarea
                    value={formData.vision}
                    onChange={(e) => handleChange('vision', e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Visi dari sistem pakar ini..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Misi
                  </label>
                  <textarea
                    value={formData.mission}
                    onChange={(e) => handleChange('mission', e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Misi dari sistem pakar ini..."
                  />
                </div>
              </div>
            </div>

            {/* Developer Info */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Informasi Pengembang</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pengembang / Tim
                  </label>
                  <input
                    type="text"
                    value={formData.developer_name}
                    onChange={(e) => handleChange('developer_name', e.target.value)}
                    className="input"
                    placeholder="Nama pengembang atau tim"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informasi Pengembang
                  </label>
                  <textarea
                    value={formData.developer_info}
                    onChange={(e) => handleChange('developer_info', e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Informasi tambahan tentang pengembang (institusi, latar belakang, dll)"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="card">
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Informasi Kontak</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="input"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="input"
                    placeholder="+62 xxx xxxx xxxx"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="Alamat lengkap (opsional)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link to="/admin" className="btn btn-secondary">
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
