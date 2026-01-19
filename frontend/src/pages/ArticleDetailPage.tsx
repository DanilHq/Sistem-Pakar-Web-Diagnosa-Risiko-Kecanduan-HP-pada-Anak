import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import type { Article } from '../types';
import { Calendar, User, ArrowLeft, Loader, AlertCircle, BookOpen } from 'lucide-react';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (slug: string) => {
    try {
      const data = await articlesAPI.getBySlug(slug);
      setArticle(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Artikel tidak ditemukan.');
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

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 mb-4">{error}</p>
          <Link to="/articles" className="btn btn-primary">
            Kembali ke Artikel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/articles"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Artikel
          </Link>

          {/* Article Card */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {article.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
              <p className="text-primary-100 text-lg mb-6">{article.excerpt}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-100">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>

          {/* CTA Box */}
          <div className="mt-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-8 text-white text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Ingin Tahu Tingkat Risiko Anak Anda?</h2>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Gunakan sistem pakar kami untuk melakukan skrining risiko kecanduan HP pada anak dengan metode Forward
              Chaining yang akurat dan terpercaya
            </p>
            <Link to="/diagnose" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Mulai Diagnosa Sekarang
            </Link>
          </div>

          {/* Related Articles Note */}
          <div className="mt-8 text-center">
            <Link to="/articles" className="text-primary-600 hover:text-primary-700 font-medium">
              Lihat Artikel Lainnya
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
