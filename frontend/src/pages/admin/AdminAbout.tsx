import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aboutAPI, AboutContent } from '../../services/api';
import { 
  Info, 
  Loader, 
  AlertCircle, 
  Save, 
  ArrowLeft,
  Plus,
  Trash2,
  User
} from 'lucide-react';
import Toast, { ToastType } from '../../components/Toast';

interface TeamMember {
  name: string;
  role: string;
  image?: string;
}

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const [formData, setFormData] = useState<AboutContent>({
    title: '',
    content: '',
    vision: '',
    mission: '',
    team: [],
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
      showToast('✅ Konten berhasil disimpan!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menyimpan konten', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      team: [...(formData.team || []), { name: '', role: '', image: '' }],
    });
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const newTeam = [...(formData.team || [])];
    newTeam[index] = { ...newTeam[index], [field]: value };
    setFormData({ ...formData, team: newTeam });
  };

  const removeTeamMember = (index: number) => {
    const newTeam = (formData.team || []).filter((_, i) => i !== index);
    setFormData({ ...formData, team: newTeam });
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
            <div className="flex items-center space-x-3">
              <Info className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kelola Halaman Tentang</h1>
                <p className="text-gray-600">Edit konten halaman tentang aplikasi</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Informasi Utama</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="Tentang Sistem Pakar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input"
                    rows={4}
                    placeholder="Deskripsi tentang sistem pakar ini..."
                  />
                </div>
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Visi & Misi</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visi</label>
                  <textarea
                    value={formData.vision || ''}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Visi sistem pakar..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Misi</label>
                  <textarea
                    value={formData.mission || ''}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Misi sistem pakar..."
                  />
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tim Pengembang</h3>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="btn btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah Anggota
                </button>
              </div>

              {(formData.team || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Belum ada anggota tim</p>
                  <button
                    type="button"
                    onClick={addTeamMember}
                    className="text-primary-600 hover:text-primary-700 mt-2"
                  >
                    Tambah anggota pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(formData.team || []).map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-500">Anggota #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            className="input"
                            placeholder="Nama anggota"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Peran/Jabatan</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                            className="input"
                            placeholder="Developer, Designer, dll"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto (opsional)</label>
                        <input
                          type="url"
                          value={member.image || ''}
                          onChange={(e) => updateTeamMember(index, 'image', e.target.value)}
                          className="input"
                          placeholder="https://example.com/photo.jpg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
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
