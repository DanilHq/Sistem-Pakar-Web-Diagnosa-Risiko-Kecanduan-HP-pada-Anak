import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { diagnosisAPI, symptomsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { exportDiagnosisToPDF } from '../utils/pdfExport';
import type { DiagnosisResponse, Symptom } from '../types';
import {
  AlertCircle,
  CheckCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Home,
  FileText,
  Loader,
} from 'lucide-react';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(
    location.state?.diagnosisData || null
  );
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [showTrace, setShowTrace] = useState(false);
  const [loading, setLoading] = useState(!diagnosis);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSymptoms();
    if (!diagnosis && id) {
      loadDiagnosis();
    }
  }, [id]);

  const loadSymptoms = async () => {
    try {
      const data = await symptomsAPI.getAll();
      setSymptoms(data);
    } catch (err) {
      console.error('Failed to load symptoms', err);
    }
  };

  const loadDiagnosis = async () => {
    if (!id) return;

    try {
      const data = await diagnosisAPI.getById(parseInt(id));
      // Transform to DiagnosisResponse format
      setDiagnosis({
        diagnosis_id: data.id,
        result_code: data.result,
        matched_rule_code: data.matched_rule_code,
        matched_description: undefined, // Will be filled from trace
        recommendation: undefined, // Will be filled from trace
        trace: data.trace,
        active_symptoms: data.selected_symptoms,
        category: data.category,
        message: 'Diagnosis loaded successfully',
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat hasil diagnosa.');
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!diagnosis) return;

    const activeSymptomsText = symptoms
      .filter((s) => diagnosis.active_symptoms.includes(s.code))
      .map((s) => ({ code: s.code, text: s.text }));

    exportDiagnosisToPDF(diagnosis, activeSymptomsText);
  };

  const getCategoryBadgeClass = (level: number) => {
    switch (level) {
      case 0:
        return 'badge-normal';
      case 1:
        return 'badge-ringan';
      case 2:
        return 'badge-sedang';
      case 3:
        return 'badge-berat';
      default:
        return 'badge-normal';
    }
  };

  const getCategoryCardClass = (level: number) => {
    switch (level) {
      case 0:
        return 'border-green-500 bg-green-50';
      case 1:
        return 'border-yellow-500 bg-yellow-50';
      case 2:
        return 'border-orange-500 bg-orange-50';
      case 3:
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !diagnosis) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 mb-4">{error || 'Hasil diagnosa tidak ditemukan.'}</p>
          <Link to="/diagnose" className="btn btn-primary">
            Mulai Diagnosa Baru
          </Link>
        </div>
      </div>
    );
  }

  const categoryLevel = diagnosis.category?.level ?? 0;
  const activeSymptomsText = symptoms.filter((s) => diagnosis.active_symptoms.includes(s.code));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Diagnosa</h1>
          <p className="text-gray-600">
            Hasil skrining risiko kecanduan HP berdasarkan Forward Chaining
          </p>
        </div>

        {/* Result Card */}
        <div className={`card border-l-8 mb-8 ${getCategoryCardClass(categoryLevel)}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kategori Risiko</h2>
              <span className={`badge text-lg ${getCategoryBadgeClass(categoryLevel)}`}>
                {diagnosis.category?.name || diagnosis.result_code}
              </span>
            </div>
            {categoryLevel === 0 ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-orange-500" />
            )}
          </div>

          {diagnosis.category && (
            <p className="text-gray-700 mb-4">{diagnosis.category.description}</p>
          )}

          {diagnosis.matched_description && (
            <div className="bg-white/50 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Alasan:</h3>
              <p className="text-gray-700">{diagnosis.matched_description}</p>
            </div>
          )}
        </div>

        {/* Active Symptoms */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Gejala yang Terdeteksi ({diagnosis.active_symptoms.length})
          </h3>

          {diagnosis.active_symptoms.length === 0 ? (
            <p className="text-gray-600">Tidak ada gejala yang terdeteksi. Anak Anda dalam kondisi sehat!</p>
          ) : (
            <ul className="space-y-3">
              {activeSymptomsText.map((symptom, index) => (
                <li key={symptom.code} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-gray-900 font-medium">{symptom.text}</p>
                    {symptom.help_text && <p className="text-sm text-gray-600 mt-1">{symptom.help_text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommendation */}
        <div className="card mb-8 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="text-xl font-semibold mb-4 text-blue-900">Rekomendasi Tindakan</h3>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {diagnosis.recommendation || 'Tidak ada rekomendasi khusus.'}
          </p>
        </div>

        {/* Trace */}
        <div className="card mb-8">
          <button
            onClick={() => setShowTrace(!showTrace)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-xl font-semibold">Trace Inferensi (Forward Chaining)</h3>
            {showTrace ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showTrace && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Berikut adalah trace dari proses inferensi forward chaining. Setiap aturan dievaluasi berdasarkan
                prioritas (1 = tertinggi). Aturan yang terpenuhi akan ditandai dengan label hijau.
              </p>

              {diagnosis.trace.map((trace) => (
                <div
                  key={trace.rule_code}
                  className={`border rounded-lg p-4 ${
                    trace.matched ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{trace.rule_code}</span>
                      <span className="text-xs text-gray-600">Priority: {trace.priority}</span>
                    </div>
                    <span
                      className={`badge text-xs ${
                        trace.matched ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {trace.matched ? 'TERPENUHI' : 'TIDAK TERPENUHI'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Kondisi:</span>{' '}
                    {trace.conditions.length > 0 ? trace.conditions.join(', ') : 'Tidak ada kondisi (default rule)'}
                  </p>
                </div>
              ))}

              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Kesimpulan:</span> Sistem memilih aturan{' '}
                  <span className="font-semibold text-primary-600">
                    {diagnosis.matched_rule_code || 'R16 (Default)'}
                  </span>{' '}
                  karena merupakan aturan dengan prioritas tertinggi yang kondisinya terpenuhi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleExportPDF} className="btn btn-primary flex items-center justify-center">
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </button>

          <Link to="/" className="btn btn-secondary flex items-center justify-center">
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>

          {isAuthenticated && (
            <Link to="/history" className="btn btn-secondary flex items-center justify-center">
              <FileText className="w-5 h-5 mr-2" />
              Lihat Riwayat
            </Link>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-900 mb-2">DISCLAIMER PENTING</p>
              <p className="text-gray-700 leading-relaxed">
                Hasil diagnosa ini adalah <strong>skrining awal</strong> dan <strong>BUKAN pengganti diagnosis profesional</strong>.
                Untuk diagnosis yang akurat dan penanganan yang tepat, silakan konsultasi dengan psikolog anak, dokter
                anak, atau tenaga kesehatan mental profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
