import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { Statistics } from '../../types';
import {
  BarChart3,
  Users,
  FileText,
  AlertTriangle,
  BookOpen,
  Activity,
  Loader,
  Shield,
  TrendingUp,
  Info,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await adminAPI.getStatistics();
      setStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat statistik');
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

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Data tidak tersedia'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Kelola sistem pakar dan lihat statistik penggunaan</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Pengguna</p>
                <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* Total Diagnoses */}
          <div className="card bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Diagnosa</p>
                <p className="text-3xl font-bold text-gray-900">{stats.diagnoses.total}</p>
              </div>
              <FileText className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Active Symptoms */}
          <div className="card bg-purple-50 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Gejala Aktif</p>
                <p className="text-3xl font-bold text-gray-900">{stats.symptoms.active}</p>
              </div>
              <Activity className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          {/* Active Rules */}
          <div className="card bg-orange-50 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aturan Aktif</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rules.active}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/symptoms" className="card hover:shadow-lg transition">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Kelola Gejala</h3>
                  <p className="text-sm text-gray-600">CRUD gejala kecanduan</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/rules" className="card hover:shadow-lg transition">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Kelola Aturan</h3>
                  <p className="text-sm text-gray-600">CRUD rules forward chaining</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/articles" className="card hover:shadow-lg transition">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Kelola Artikel</h3>
                  <p className="text-sm text-gray-600">CRUD artikel edukasi</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/about" className="card hover:shadow-lg transition">
              <div className="flex items-center space-x-3">
                <Info className="w-8 h-8 text-cyan-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Kelola Tentang</h3>
                  <p className="text-sm text-gray-600">Edit halaman tentang</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Diagnosis Distribution */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Distribusi Diagnosa</h2>
            </div>

            <div className="space-y-4">
              {stats.diagnoses.distribution.map((item) => {
                const percentage =
                  stats.diagnoses.total > 0 ? (item.count / stats.diagnoses.total) * 100 : 0;
                const colorClass =
                  item.code === 'K01'
                    ? 'bg-green-500'
                    : item.code === 'K02'
                    ? 'bg-yellow-500'
                    : item.code === 'K03'
                    ? 'bg-orange-500'
                    : 'bg-red-500';

                return (
                  <div key={item.code}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">7 hari terakhir:</span>
                <span className="font-semibold text-primary-600 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stats.diagnoses.recent_7_days} diagnosa
                </span>
              </div>
            </div>
          </div>

          {/* Top Symptoms */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Gejala Paling Sering</h2>
            </div>

            <div className="space-y-3">
              {stats.symptoms.top_10.slice(0, 8).map((symptom, index) => (
                <div key={symptom.code} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{symptom.code}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{symptom.count}x</span>
                </div>
              ))}
            </div>

            {stats.symptoms.top_10.length === 0 && (
              <p className="text-gray-500 text-center py-4">Belum ada data gejala</p>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Informasi Sistem</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Database</p>
              <p className="font-semibold text-gray-900">SQLite</p>
            </div>
            <div>
              <p className="text-gray-600">Metode Inferensi</p>
              <p className="font-semibold text-gray-900">Forward Chaining</p>
            </div>
            <div>
              <p className="text-gray-600">Artikel Terpublikasi</p>
              <p className="font-semibold text-gray-900">{stats.articles.published}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
