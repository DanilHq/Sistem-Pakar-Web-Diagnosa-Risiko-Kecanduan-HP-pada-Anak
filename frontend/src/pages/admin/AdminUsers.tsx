import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { User } from '../../types';
import { 
  Users, 
  Loader, 
  AlertCircle, 
  Shield, 
  User as UserIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import Toast, { ToastType } from '../../components/Toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
  });

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search and role filter
    let filtered = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user: User) => 
          user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term)
      );
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter((user: User) => user.role === filterRole);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getAllUsers();
      setUsers(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data pengguna');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setShowPassword(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createUser(formData);
      resetForm();
      setShowAddForm(false);
      loadUsers();
      showToast('✅ Pengguna berhasil ditambahkan!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menambah pengguna', 'error');
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowEditPassword(false);
  };

  const handleUpdate = async (id: number) => {
    try {
      const updatePayload: any = {
        name: editData.name,
        email: editData.email,
        role: editData.role,
      };
      
      // Only include password if it's been changed
      if (editData.password) {
        updatePayload.password = editData.password;
      }

      await adminAPI.updateUser(id, updatePayload);
      setEditingId(null);
      loadUsers();
      showToast('✅ Pengguna berhasil diperbarui!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal mengupdate pengguna', 'error');
    }
  };

  const handleDelete = async (id: number, userName: string) => {
    if (!confirm(`Yakin ingin menghapus pengguna "${userName}"?\n\nTindakan ini tidak dapat dibatalkan.`)) return;

    try {
      await adminAPI.deleteUser(id);
      loadUsers();
      showToast('✅ Pengguna berhasil dihapus!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || '❌ Gagal menghapus pengguna', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', email: '', password: '', role: 'user' });
    setShowEditPassword(false);
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
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
                  <p className="text-gray-600">CRUD pengguna sistem</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  if (!showAddForm) resetForm();
                }} 
                className="btn btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tambah Pengguna
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
              <h3 className="text-lg font-semibold mb-4">Tambah Pengguna Baru</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input pr-10"
                        placeholder="Minimal 6 karakter"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                      className="input"
                      required
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-success">
                    <Save className="w-4 h-4 mr-2 inline" />
                    Simpan
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }} 
                    className="btn btn-secondary"
                  >
                    <X className="w-4 h-4 mr-2 inline" />
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Filter */}
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">Semua Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Terdaftar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user: User) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      {editingId === user.id ? (
                        // Edit Mode
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="input py-1 text-sm w-full"
                              placeholder="Nama"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                              className="input py-1 text-sm w-full"
                              placeholder="Email"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editData.role}
                              onChange={(e) => setEditData({ ...editData, role: e.target.value as 'user' | 'admin' })}
                              className="input py-1 text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <input
                                type={showEditPassword ? 'text' : 'password'}
                                value={editData.password}
                                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                                className="input py-1 text-sm w-full pr-8"
                                placeholder="Kosongkan jika tidak diubah"
                              />
                              <button
                                type="button"
                                onClick={() => setShowEditPassword(!showEditPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                              >
                                {showEditPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleUpdate(user.id)}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="Simpan"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-600 hover:text-gray-700 p-1"
                                title="Batal"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  user.role === 'admin' ? 'bg-primary-100' : 'bg-gray-100'
                                }`}
                              >
                                {user.role === 'admin' ? (
                                  <Shield className="w-5 h-5 text-primary-600" />
                                ) : (
                                  <UserIcon className="w-5 h-5 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-primary-100 text-primary-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id, user.name)}
                                className="text-red-600 hover:text-red-700 p-1"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || filterRole !== 'all' 
                    ? 'Tidak ada pengguna yang sesuai filter' 
                    : 'Belum ada pengguna terdaftar'}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Pengguna</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total User</p>
              <p className="text-2xl font-bold text-blue-600">
                {users.filter((u: User) => u.role === 'user').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-600">Total Admin</p>
              <p className="text-2xl font-bold text-primary-600">
                {users.filter((u: User) => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
