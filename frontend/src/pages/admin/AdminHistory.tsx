import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { 
  History, 
  Loader, 
  AlertCircle, 
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Activity,
  Eye,
  X,
  FileText
} from 'lucide-react';

interface DiagnosisRecord {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  selected_symptoms: string[];
  result: string;
  matched_rule_code: string | null;
  trace: any[];
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Mapping kategori hasil
const categoryMap: { [key: string]: { name: string; color: string; bgColor: string } } = {
  'K01': { name: 'Normal', color: 'text-green-700', bgColor: 'bg-green-100' },
  'K02': { name: 'Kecanduan Ringan', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'K03': { name: 'Kecanduan Sedang', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  'K04': { name: 'Kecanduan Berat', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export default function AdminHistory() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [filteredDiagnoses, setFilteredDiagnoses] = useState<DiagnosisRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDiagnoses(currentPage);
  }, [currentPage]);

  useEffect(() => {
    // Filter diagnoses based on search and result filter
    let filtered = diagnoses;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) => 
          (d.user_name?.toLowerCase().includes(term)) || 
          (d.user_email?.toLowerCase().includes(term)) ||
          d.result.toLowerCase().includes(term)
      );
    }
    
    if (filterResult !== 'all') {
      filtered = filtered.filter((d) => d.result === filterResult);
    }
    
    setFilteredDiagnoses(filtered);
  }, [diagnoses, searchTerm, filterResult]);

  const loadDiagnoses = async (page: number) => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllDiagnoses(page, 20);
      setDiagnoses(data.diagnoses);
      setPagination(data.pagination);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data riwayat');
      setLoading(false);
    }
  };

  const getCategoryInfo = (code: string) => {
    return categoryMap[code] || { name: code, color: 'text-gray-700', bgColor: 'bg-gray-100' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDetail = (diagnosis: DiagnosisRecord) => {
    setSelectedDiagnosis(diagnosis);
  };

  const closeModal = () => {
    setSelectedDiagnosis(null);
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <History className="w-8 h-8 text-indigo-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kelola Riwayat Diagnosa</h1>
                  <p className="text-gray-600">Lihat semua riwayat diagnosa pengguna</p>
                </div>
              </div>
              {pagination && (
                <div className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{pagination.total}</span> diagnosa
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Search and Filter */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="md:w-56">
                <select
                  value={filterResult}
                  onChange={(e) => setFilterResult(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">Semua Hasil</option>
                  <option value="K01">Normal</option>
                  <option value="K02">Kecanduan Ringan</option>
                  <option value="K03">Kecanduan Sedang</option>
                  <option value="K04">Kecanduan Berat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-600">Normal</p>
              <p className="text-2xl font-bold text-green-700">
                {diagnoses.filter((d) => d.result === 'K01').length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-yellow-600">Kecanduan Ringan</p>
              <p className="text-2xl font-bold text-yellow-700">
                {diagnoses.filter((d) => d.result === 'K02').length}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <p className="text-sm text-orange-600">Kecanduan Sedang</p>
              <p className="text-2xl font-bold text-orange-700">
                {diagnoses.filter((d) => d.result === 'K03').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-600">Kecanduan Berat</p>
              <p className="text-2xl font-bold text-red-700">
                {diagnoses.filter((d) => d.result === 'K04').length}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Hasil Diagnosa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Gejala
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDiagnoses.map((diagnosis, index) => {
                    const categoryInfo = getCategoryInfo(diagnosis.result);
                    return (
                      <tr key={diagnosis.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {((currentPage - 1) * 20) + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {diagnosis.user_name || 'Guest'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {diagnosis.user_email || 'Tanpa akun'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.bgColor} ${categoryInfo.color}`}>
                            {categoryInfo.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {diagnosis.selected_symptoms.length} gejala
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(diagnosis.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewDetail(diagnosis)}
                            className="text-primary-600 hover:text-primary-700 p-1"
                            title="Lihat Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredDiagnoses.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || filterResult !== 'all' 
                    ? 'Tidak ada riwayat yang sesuai filter' 
                    : 'Belum ada riwayat diagnosa'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Halaman {pagination.page} dari {pagination.total_pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.total_pages))}
                  disabled={currentPage === pagination.total_pages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Detail Diagnosa</h2>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Informasi Pengguna</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nama</p>
                    <p className="font-medium">{selectedDiagnosis.user_name || 'Guest'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedDiagnosis.user_email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Diagnosa</p>
                    <p className="font-medium">{formatDate(selectedDiagnosis.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rule Terpicu</p>
                    <p className="font-medium">{selectedDiagnosis.matched_rule_code || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Hasil Diagnosa</h3>
                <div className={`rounded-lg p-4 ${getCategoryInfo(selectedDiagnosis.result).bgColor}`}>
                  <p className={`text-lg font-bold ${getCategoryInfo(selectedDiagnosis.result).color}`}>
                    {selectedDiagnosis.result} - {getCategoryInfo(selectedDiagnosis.result).name}
                  </p>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Gejala yang Dipilih ({selectedDiagnosis.selected_symptoms.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDiagnosis.selected_symptoms.map((symptom, idx) => (
                    <span key={idx} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trace */}
              {selectedDiagnosis.trace && selectedDiagnosis.trace.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Trace Inferensi</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedDiagnosis.trace.map((t: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border text-sm ${
                          t.matched 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{t.rule_code}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            t.matched ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {t.matched ? 'Cocok' : 'Tidak Cocok'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mt-1">
                          Kondisi: {t.conditions?.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button onClick={closeModal} className="btn btn-primary w-full">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
