import { useContext, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const titles = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendar',
  '/focus': 'Focus Timer',
  '/analytics': 'Analytics',
};

export default function Topbar() {
  const { user, logout, toggleTheme, darkMode } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const title = useMemo(() => titles[location.pathname] || 'Dashboard', [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-10 py-4 bg-white/80 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200/70 dark:border-slate-700/60">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Student Task Manager</p>
          <h2 className="text-2xl font-display font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
        <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-semibold">
            {(user?.name || 'S')[0]}
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-800 dark:text-slate-100">{user?.name || 'Student'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'student@example.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-full bg-brand-600 text-white hover:bg-brand-700 shadow-soft"
        >
          Logout
        </button>
        </div>
      </div>
      <div className="mt-4 flex gap-2 lg:hidden">
        {[
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/calendar', label: 'Calendar' },
          { to: '/focus', label: 'Focus' },
          { to: '/analytics', label: 'Analytics' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded-full text-sm ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
