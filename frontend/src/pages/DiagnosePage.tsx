import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { symptomsAPI, diagnosisAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { Symptom } from '../types';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Loader } from 'lucide-react';

export default function DiagnosePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    try {
      const data = await symptomsAPI.getAll();
      setSymptoms(data);
      setLoading(false);
    } catch (err) {
      setError('Gagal memuat data gejala. Silakan refresh halaman.');
      setLoading(false);
    }
  };

  const handleAnswer = (symptomCode: string, answer: boolean) => {
    const newSelected = new Set(selectedSymptoms);
    if (answer) {
      newSelected.add(symptomCode);
    } else {
      newSelected.delete(symptomCode);
    }
    setSelectedSymptoms(newSelected);
  };

  const handleNext = () => {
    if (currentStep < symptoms.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const result = await diagnosisAPI.create({
        user_id: user?.id,
        selected_symptoms: Array.from(selectedSymptoms),
      });

      // Navigate to result page
      navigate(`/result/${result.diagnosis_id}`, {
        state: { diagnosisData: result },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal melakukan diagnosa. Silakan coba lagi.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error && symptoms.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const currentSymptom = symptoms[currentStep];
  const progress = ((currentStep + 1) / symptoms.length) * 100;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Diagnosa Kecanduan HP</h1>
          <p className="text-gray-600">
            Jawab 15 pertanyaan tentang perilaku anak Anda dalam 2 minggu terakhir
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Pertanyaan {currentStep + 1} dari {symptoms.length}
            </span>
            <span className="text-sm font-semibold text-primary-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentSymptom && (
          <div className="card mb-6">
            <div className="mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  {currentStep + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentSymptom.text}</h2>
                  {currentSymptom.help_text && (
                    <p className="text-sm text-gray-600">{currentSymptom.help_text}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={() => handleAnswer(currentSymptom.code, true)}
                  className={`flex-1 py-5 px-6 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 ${
                    selectedSymptoms.has(currentSymptom.code)
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100'
                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedSymptoms.has(currentSymptom.code)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedSymptoms.has(currentSymptom.code) && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="font-bold text-xl">YA</span>
                  </div>
                  <p className="text-xs text-center text-gray-600">Anak saya mengalami ini</p>
                </button>

                <button
                  onClick={() => handleAnswer(currentSymptom.code, false)}
                  className={`flex-1 py-5 px-6 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 ${
                    !selectedSymptoms.has(currentSymptom.code)
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-lg shadow-red-100'
                      : 'border-gray-300 hover:border-red-400 hover:bg-red-50/30'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      !selectedSymptoms.has(currentSymptom.code)
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-300'
                    }`}>
                      {!selectedSymptoms.has(currentSymptom.code) && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="font-bold text-xl">TIDAK</span>
                  </div>
                  <p className="text-xs text-center text-gray-600">Anak saya tidak mengalami ini</p>
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4 mt-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{selectedSymptoms.size}</span> gejala terpilih dari{' '}
                {symptoms.length}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Sebelumnya</span>
          </button>

          {currentStep < symptoms.length - 1 ? (
            <button onClick={handleNext} className="btn btn-primary flex items-center space-x-2">
              <span>Selanjutnya</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-success flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Selesai & Lihat Hasil</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-1">Catatan Penting:</p>
          <p>
            Hasil diagnosa ini adalah skrining awal dan BUKAN pengganti diagnosis profesional. Konsultasikan dengan
            psikolog anak atau tenaga kesehatan mental untuk diagnosis yang akurat.
          </p>
        </div>
      </div>
    </div>
  );
}
