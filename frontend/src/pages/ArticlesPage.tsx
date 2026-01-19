import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import type { Article } from '../types';
import { BookOpen, Calendar, User, Loader, AlertCircle, ArrowRight } from 'lucide-react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await articlesAPI.getAll();
      setArticles(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat artikel.');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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
    <div className="bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-3 rounded-full">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artikel Edukasi</h1>
          <p className="text-lg text-gray-600">
            Baca artikel-artikel edukasi tentang kecanduan HP pada anak, tips parenting digital, dan panduan kesehatan
            mental anak
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="max-w-6xl mx-auto">
          {articles.length === 0 ? (
            <div className="card text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Artikel</h2>
              <p className="text-gray-600">Artikel edukasi akan segera hadir!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article key={article.id} className="card hover:shadow-xl transition flex flex-col">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="badge bg-primary-100 text-primary-700">{article.category}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 flex-grow">
                    {article.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{article.excerpt}</p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.created_at)}</span>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <Link
                    to={`/articles/${article.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold flex items-center space-x-1 mt-auto"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto mt-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Khawatir dengan Penggunaan HP Anak Anda?</h2>
          <p className="text-primary-100 mb-6">
            Lakukan skrining awal dengan sistem pakar kami untuk mendeteksi risiko kecanduan HP pada anak
          </p>
          <Link
            to="/diagnose"
            className="inline-flex items-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Mulai Diagnosa Sekarang
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
