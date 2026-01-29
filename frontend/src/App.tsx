import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User Pages
import DiagnosePage from './pages/DiagnosePage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSymptoms from './pages/admin/AdminSymptoms';
import AdminRules from './pages/admin/AdminRules';
import AdminArticles from './pages/admin/AdminArticles';
import AdminUsers from './pages/admin/AdminUsers';

// Protected Route - Hanya untuk user yang sudah login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// Admin Route - Hanya untuk admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// User Route - Untuk user biasa (bukan admin)
function UserRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Jika admin, redirect ke admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
}

// Guest Route - Hanya untuk yang belum login
function GuestRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Jika sudah login, redirect sesuai role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

// Layout untuk halaman publik dan user
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Router>
      <Routes>
        {/* ============ ADMIN ROUTES (dengan AdminLayout) ============ */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/symptoms"
          element={
            <AdminRoute>
              <AdminSymptoms />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/rules"
          element={
            <AdminRoute>
              <AdminRules />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/articles"
          element={
            <AdminRoute>
              <AdminArticles />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        {/* ============ PUBLIC & USER ROUTES (dengan Navbar + Footer) ============ */}
        
        {/* Public Routes - Bisa diakses siapa saja */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/articles"
          element={
            <PublicLayout>
              <ArticlesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/articles/:slug"
          element={
            <PublicLayout>
              <ArticleDetailPage />
            </PublicLayout>
          }
        />

        {/* Guest Routes - Hanya untuk yang belum login */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <PublicLayout>
                <RegisterPage />
              </PublicLayout>
            </GuestRoute>
          }
        />

        {/* User Routes - Harus login sebagai user biasa */}
        <Route
          path="/diagnose"
          element={
            <UserRoute>
              <PublicLayout>
                <DiagnosePage />
              </PublicLayout>
            </UserRoute>
          }
        />
        <Route
          path="/result/:id"
          element={
            <UserRoute>
              <PublicLayout>
                <ResultPage />
              </PublicLayout>
            </UserRoute>
          }
        />
        <Route
          path="/history"
          element={
            <UserRoute>
              <PublicLayout>
                <HistoryPage />
              </PublicLayout>
            </UserRoute>
          }
        />

        {/* Catch all - redirect ke home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;