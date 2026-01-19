import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articlesAPI } from '../../services/api';
import type { Article } from '../../types';
import { BookOpen, ArrowLeft, Loader, AlertCircle, Eye, Plus, Edit2, Trash2, X } from 'lucide-react';
import Toast, { ToastType } from '../../components/Toast';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Tips',
    author: '',
    published: false,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const data = await articlesAPI.getAllAdmin();
      setArticles(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data artikel');
      setLoading(false);
    }
  };

  const handleOpenForm = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        author: article.author,
        published: article.published,
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Tips',
        author: '',
        published: false,
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Tips',
      author: '',
      published: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.author) {
      showToast('⚠️ Semua field wajib diisi!', 'warning');
      return;
    }

    try {
      if (editingArticle) {
        await articlesAPI.update(editingArticle.id, formData);
        showToast('✅ Artikel berhasil diperbarui!', 'success');
      } else {
        await articlesAPI.create(formData);
        showToast('✅ Artikel berhasil ditambahkan!', 'success');
      }
      loadArticles();
      handleCloseForm();
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menyimpan artikel', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;

    try {
      await articlesAPI.delete(id);
      loadArticles();
      showToast('✅ Artikel berhasil dihapus!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menghapus artikel', 'error');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
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
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kelola Artikel</h1>
                <p className="text-gray-600">Artikel edukasi untuk pengguna</p>
              </div>
            </div>
            <button onClick={() => handleOpenForm()} className="btn btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Artikel
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="card hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <span className="badge bg-primary-100 text-primary-700">{article.category}</span>
                <span
                  className={`badge text-xs ${article.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                >
                  {article.published ? 'Published' : 'Draft'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{article.author}</span>
                <span>{formatDate(article.created_at)}</span>
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/articles/${article.slug}`}
                  target="_blank"
                  className="btn btn-secondary btn-sm flex items-center flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Lihat
                </Link>
                <button
                  onClick={() => handleOpenForm(article)}
                  className="btn btn-secondary btn-sm flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="btn btn-danger btn-sm flex items-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="card text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada artikel</p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingArticle ? 'Edit Artikel' : 'Tambah Artikel Baru'}
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
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Artikel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Masukkan judul artikel"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="artikel-judul"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">URL artikel: /articles/{formData.slug}</p>
                  </div>

                  {/* Category & Author */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="Tips">Tips</option>
                        <option value="Edukasi">Edukasi</option>
                        <option value="Penelitian">Penelitian</option>
                        <option value="Kesehatan">Kesehatan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Penulis <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Nama penulis"
                        required
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ringkasan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ringkasan singkat artikel"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konten Artikel <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                      placeholder="Konten artikel (mendukung markdown)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Gunakan Markdown untuk formatting (heading, bold, italic, list, dll)
                    </p>
                  </div>

                  {/* Published */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="published" className="ml-2 text-sm text-gray-700">
                      Publish artikel (tampilkan ke publik)
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
                    {editingArticle ? 'Update Artikel' : 'Tambah Artikel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
