import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { diagnosisAPI } from '../services/api';
import type { Diagnosis } from '../types';
import { History, Calendar, Eye, Loader, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await diagnosisAPI.getHistory(20);
      setDiagnoses(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat riwayat diagnosa.');
      setLoading(false);
    }
  };

  const getCategoryBadgeClass = (result: string) => {
    switch (result) {
      case 'K01':
        return 'badge-normal';
      case 'K02':
        return 'badge-ringan';
      case 'K03':
        return 'badge-sedang';
      case 'K04':
        return 'badge-berat';
      default:
        return 'badge-normal';
    }
  };

  const getCategoryName = (result: string) => {
    switch (result) {
      case 'K01':
        return 'Normal';
      case 'K02':
        return 'Kecanduan Ringan';
      case 'K03':
        return 'Kecanduan Sedang';
      case 'K04':
        return 'Kecanduan Berat';
      default:
        return result;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <History className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Diagnosa</h1>
          </div>
          <p className="text-gray-600">
            Lihat kembali hasil diagnosa Anda sebelumnya untuk memantau perkembangan
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {diagnoses.length === 0 ? (
          <div className="card text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Riwayat Diagnosa</h2>
            <p className="text-gray-600 mb-6">
              Anda belum pernah melakukan diagnosa. Mulai diagnosa pertama Anda sekarang!
            </p>
            <Link to="/diagnose" className="btn btn-primary inline-block">
              Mulai Diagnosa
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="card hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`badge ${getCategoryBadgeClass(diagnosis.result)}`}>
                        {getCategoryName(diagnosis.result)}
                      </span>
                      {diagnosis.matched_rule_code && (
                        <span className="text-xs text-gray-500">Rule: {diagnosis.matched_rule_code}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(diagnosis.created_at)}</span>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{diagnosis.selected_symptoms.length}</span> gejala terdeteksi
                      </p>
                      {diagnosis.selected_symptoms.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {diagnosis.selected_symptoms.slice(0, 5).join(', ')}
                          {diagnosis.selected_symptoms.length > 5 && '...'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Link
                      to={`/result/${diagnosis.id}`}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Detail</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Pantau Perkembangan Anak Anda</h3>
          <p className="text-sm text-gray-700">
            Dengan menyimpan riwayat diagnosa, Anda dapat membandingkan hasil dari waktu ke waktu dan melihat apakah
            ada perbaikan atau perburukan dalam pola penggunaan HP anak Anda. Disarankan untuk melakukan diagnosa
            secara berkala (misalnya setiap bulan) untuk monitoring yang lebih baik.
          </p>
        </div>
      </div>
    </div>
  );
}
