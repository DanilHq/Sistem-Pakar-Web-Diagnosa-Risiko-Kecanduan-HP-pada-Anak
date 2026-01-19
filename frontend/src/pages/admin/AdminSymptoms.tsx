import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { symptomsAPI } from '../../services/api';
import type { Symptom } from '../../types';
import { Activity, Plus, Edit2, Trash2, Save, X, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import Toast, { ToastType } from '../../components/Toast';

export default function AdminSymptoms() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    text: '',
    help_text: '',
    active: true,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    try {
      const data = await symptomsAPI.getAllAdmin();
      setSymptoms(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data gejala');
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await symptomsAPI.create(formData);
      setFormData({ code: '', text: '', help_text: '', active: true });
      setShowAddForm(false);
      loadSymptoms();
      showToast('✅ Gejala berhasil ditambahkan!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menambah gejala', 'error');
    }
  };

  const handleUpdate = async (id: number) => {
    const symptom = symptoms.find((s) => s.id === id);
    if (!symptom) return;

    try {
      await symptomsAPI.update(id, symptom);
      setEditingId(null);
      loadSymptoms();
      showToast('✅ Gejala berhasil diperbarui!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal mengupdate gejala', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus gejala ini?')) return;

    try {
      await symptomsAPI.delete(id);
      loadSymptoms();
      showToast('✅ Gejala berhasil dihapus!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menghapus gejala', 'error');
    }
  };

  const handleEdit = (symptom: Symptom) => {
    setEditingId(symptom.id!);
  };

  const handleChange = (id: number, field: keyof Symptom, value: any) => {
    setSymptoms(symptoms.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
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
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kelola Gejala</h1>
                <p className="text-gray-600">CRUD gejala kecanduan HP</p>
              </div>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Gejala
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="card mb-6 border-l-4 border-primary-500">
            <h3 className="text-lg font-semibold mb-4">Tambah Gejala Baru</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="input"
                    placeholder="G16"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.active ? '1' : '0'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === '1' })}
                    className="input"
                  >
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teks Gejala *</label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="input"
                  placeholder="Contoh: Anak menggunakan HP lebih dari 5 jam per hari"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bantuan/Deskripsi</label>
                <textarea
                  value={formData.help_text}
                  onChange={(e) => setFormData({ ...formData, help_text: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Penjelasan tambahan tentang gejala ini"
                />
              </div>

              <div className="flex space-x-3">
                <button type="submit" className="btn btn-success">
                  <Save className="w-4 h-4 mr-2 inline" />
                  Simpan
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                  <X className="w-4 h-4 mr-2 inline" />
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Symptoms Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teks</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {symptoms.map((symptom) => (
                <tr key={symptom.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {editingId === symptom.id ? (
                      <input
                        type="text"
                        value={symptom.code}
                        onChange={(e) => handleChange(symptom.id!, 'code', e.target.value)}
                        className="input py-1 text-sm"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-primary-600">{symptom.code}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === symptom.id ? (
                      <input
                        type="text"
                        value={symptom.text}
                        onChange={(e) => handleChange(symptom.id!, 'text', e.target.value)}
                        className="input py-1 text-sm w-full"
                      />
                    ) : (
                      <div>
                        <p className="text-gray-900">{symptom.text}</p>
                        {symptom.help_text && <p className="text-xs text-gray-500 mt-1">{symptom.help_text}</p>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === symptom.id ? (
                      <select
                        value={symptom.active ? '1' : '0'}
                        onChange={(e) => handleChange(symptom.id!, 'active', e.target.value === '1')}
                        className="input py-1 text-sm"
                      >
                        <option value="1">Aktif</option>
                        <option value="0">Nonaktif</option>
                      </select>
                    ) : (
                      <span
                        className={`badge text-xs ${symptom.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {symptom.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === symptom.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleUpdate(symptom.id!)}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Simpan"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-700 p-1"
                          title="Batal"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(symptom)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(symptom.id!)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {symptoms.length === 0 && (
            <div className="text-center py-8 text-gray-500">Belum ada gejala</div>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
