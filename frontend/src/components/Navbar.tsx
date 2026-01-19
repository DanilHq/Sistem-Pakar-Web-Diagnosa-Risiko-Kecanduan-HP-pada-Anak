import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Menu, X, LogOut, User, Shield } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-gray-900 font-bold text-lg hover:opacity-80 transition">
            <Logo className="w-9 h-9" />
            <span className="hidden sm:inline bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">SmartKid Check</span>
            <span className="sm:hidden bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">SmartKid</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition text-sm font-medium">
              Beranda
            </Link>
            <Link to="/diagnose" className="text-gray-700 hover:text-primary-600 transition text-sm font-medium">
              Tes
            </Link>
            <Link to="/articles" className="text-gray-700 hover:text-primary-600 transition text-sm font-medium">
              Artikel
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 transition text-sm font-medium">
              Tentang
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/history" className="text-gray-700 hover:text-primary-600 transition text-sm font-medium">
                  Riwayat
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition text-sm font-medium"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 transition text-xs font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition text-sm font-medium">
                  Masuk
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-primary-600 transition text-sm"
              >
                Beranda
              </Link>
              <Link
                to="/diagnose"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-primary-600 transition text-sm"
              >
                Tes
              </Link>
              <Link
                to="/articles"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-primary-600 transition text-sm"
              >
                Artikel
              </Link>
              <Link
                to="/about"
                onClick={closeMobileMenu}
                className="text-gray-700 hover:text-primary-600 transition text-sm"
              >
                Tentang
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/history"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-primary-600 transition text-sm"
                  >
                    Riwayat
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="pt-3 border-t border-gray-100 mt-1">
                    <div className="flex items-center gap-1.5 text-gray-700 mb-3">
                      <User className="w-4 h-4" />
                      <span className="text-xs">{user?.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 transition text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 mt-1">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="text-gray-700 hover:text-primary-600 transition text-sm"
                  >
                    Masuk
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition inline-block text-center">
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
