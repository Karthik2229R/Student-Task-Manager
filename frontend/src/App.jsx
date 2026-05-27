import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Focus from './pages/Focus';
import Analytics from './pages/Analytics';
import { AuthContext } from './context/AuthContext';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const RequireAuth = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null; // optional spinner could be placed here
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen text-text">
      <Toast />
      {isAuthRoute ? (
        <main className="px-4 py-10">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <Topbar />
            <main className="px-4 sm:px-6 lg:px-10 py-6">
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/calendar"
                  element={
                    <RequireAuth>
                      <Calendar />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/focus"
                  element={
                    <RequireAuth>
                      <Focus />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <RequireAuth>
                      <Analytics />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
