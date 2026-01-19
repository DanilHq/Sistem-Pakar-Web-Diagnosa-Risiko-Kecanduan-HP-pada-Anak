import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rulesAPI, symptomsAPI } from '../../services/api';
import type { Rule, Symptom } from '../../types';
import { AlertTriangle, ArrowLeft, Loader, AlertCircle, Eye, Plus, Edit2, Trash2, X } from 'lucide-react';
import Toast, { ToastType } from '../../components/Toast';

export default function AdminRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingRule, setViewingRule] = useState<Rule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    priority: 1,
    result: 'RENDAH',
    conditions: [] as string[],
    description: '',
    recommendation: '',
    active: true,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadRules();
    loadSymptoms();
  }, []);

  const loadRules = async () => {
    try {
      const data = await rulesAPI.getAll();
      setRules(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data rules');
      setLoading(false);
    }
  };

  const loadSymptoms = async () => {
    try {
      const data = await symptomsAPI.getAllAdmin();
      setSymptoms(data);
    } catch (err: any) {
      console.error('Gagal memuat symptoms:', err);
    }
  };

  const handleOpenForm = (rule?: Rule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        code: rule.code,
        priority: rule.priority,
        result: rule.result,
        conditions: rule.conditions || [],
        description: rule.description,
        recommendation: rule.recommendation,
        active: rule.active,
      });
    } else {
      setEditingRule(null);
      setFormData({
        code: '',
        priority: 1,
        result: 'RENDAH',
        conditions: [],
        description: '',
        recommendation: '',
        active: true,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRule(null);
    setFormData({
      code: '',
      priority: 1,
      result: 'RENDAH',
      conditions: [],
      description: '',
      recommendation: '',
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.description || !formData.recommendation) {
      showToast('⚠️ Code, deskripsi, dan rekomendasi wajib diisi!', 'warning');
      return;
    }

    try {
      if (editingRule) {
        await rulesAPI.update(editingRule.id, formData);
        showToast('✅ Rule berhasil diperbarui!', 'success');
      } else {
        await rulesAPI.create(formData);
        showToast('✅ Rule berhasil ditambahkan!', 'success');
      }
      loadRules();
      handleCloseForm();
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menyimpan rule', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus rule ini?')) return;

    try {
      await rulesAPI.delete(id);
      loadRules();
      showToast('✅ Rule berhasil dihapus!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menghapus rule', 'error');
    }
  };

  const toggleCondition = (symptomCode: string) => {
    const conditions = formData.conditions.includes(symptomCode)
      ? formData.conditions.filter((c) => c !== symptomCode)
      : [...formData.conditions, symptomCode];
    setFormData({ ...formData, conditions });
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
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kelola Aturan</h1>
                <p className="text-gray-600">Aturan forward chaining untuk diagnosa</p>
              </div>
            </div>
            <button onClick={() => handleOpenForm()} className="btn btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Rule
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-4">
          {rules.map((rule) => (
            <div key={rule.id} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono font-bold text-lg text-primary-600">{rule.code}</span>
                    <span className="badge bg-blue-100 text-blue-800 text-xs">Priority: {rule.priority}</span>
                    <span className="badge bg-purple-100 text-purple-800 text-xs">Result: {rule.result}</span>
                    <span
                      className={`badge text-xs ${rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {rule.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-2">{rule.description}</p>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Kondisi:</span>{' '}
                    {rule.conditions.length > 0 ? rule.conditions.join(', ') : 'Tidak ada kondisi (default)'}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setViewingRule(rule)}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detail
                  </button>
                  <button
                    onClick={() => handleOpenForm(rule)}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="btn btn-danger btn-sm flex items-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rules.length === 0 && (
          <div className="card text-center py-12">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada aturan</p>
          </div>
        )}

        {/* View Modal */}
        {viewingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{viewingRule.code}</h2>
                  <button
                    onClick={() => setViewingRule(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <AlertCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Priority</h3>
                    <p className="text-gray-900">{viewingRule.priority}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Result Code</h3>
                    <p className="text-gray-900">{viewingRule.result}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Kondisi (Gejala)</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingRule.conditions.length > 0 ? (
                        viewingRule.conditions.map((cond) => (
                          <span key={cond} className="badge bg-primary-100 text-primary-800">
                            {cond}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Tidak ada kondisi (default rule)</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Deskripsi</h3>
                    <p className="text-gray-900">{viewingRule.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Rekomendasi</h3>
                    <p className="text-gray-900 whitespace-pre-line">{viewingRule.recommendation}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Status</h3>
                    <span
                      className={`badge ${viewingRule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {viewingRule.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button onClick={() => setViewingRule(null)} className="btn btn-secondary">
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRule ? 'Edit Rule' : 'Tambah Rule Baru'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Code & Priority */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Rule <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                        placeholder="R01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="1"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">1 = tertinggi, semakin besar = semakin rendah</p>
                    </div>
                  </div>

                  {/* Result */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hasil Diagnosa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.result}
                      onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="RENDAH">RENDAH - Risiko rendah kecanduan HP</option>
                      <option value="SEDANG">SEDANG - Risiko sedang kecanduan HP</option>
                      <option value="TINGGI">TINGGI - Risiko tinggi kecanduan HP</option>
                    </select>
                  </div>

                  {/* Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kondisi (Gejala yang Harus Terpenuhi)
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                      {symptoms.length === 0 ? (
                        <p className="text-gray-500 text-sm">Loading symptoms...</p>
                      ) : (
                        <div className="space-y-2">
                          {symptoms.filter(s => s.active).map((symptom) => (
                            <label key={symptom.id} className="flex items-start space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.conditions.includes(symptom.code)}
                                onChange={() => toggleCondition(symptom.code)}
                                className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                              />
                              <div className="flex-1">
                                <span className="font-mono text-sm font-semibold text-primary-600">
                                  {symptom.code}
                                </span>
                                {' - '}
                                <span className="text-sm text-gray-700">{symptom.text}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.conditions.length === 0
                        ? 'Tidak ada kondisi = rule default (fallback)'
                        : `${formData.conditions.length} gejala dipilih`}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Deskripsi hasil diagnosa"
                      required
                    />
                  </div>

                  {/* Recommendation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rekomendasi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.recommendation}
                      onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Rekomendasi dan saran untuk pengguna"
                      required
                    />
                  </div>

                  {/* Active */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                      Rule aktif (digunakan dalam diagnosa)
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="btn btn-secondary"
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingRule ? 'Update Rule' : 'Tambah Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Catatan Penting</h3>
          <p className="text-sm text-gray-700">
            Aturan diurutkan berdasarkan priority (1 = tertinggi). Sistem akan memilih aturan pertama yang
            kondisinya terpenuhi. Perubahan aturan akan langsung berpengaruh pada diagnosa berikutnya tanpa perlu
            redeploy.
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
