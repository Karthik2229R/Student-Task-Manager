import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
    isActive
      ? 'bg-brand-600 text-white shadow-soft'
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
  }`;

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 px-4 py-6 border-r border-slate-200/70 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur">
      <div className="mb-8">
        <h1 className="text-xl font-display font-semibold text-slate-900 dark:text-white">Student Task Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Plan, focus, finish</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink to="/dashboard" className={navItemClass}>
          <span className="text-lg">Dashboard</span>
        </NavLink>
        <NavLink to="/calendar" className={navItemClass}>
          <span className="text-lg">Calendar</span>
        </NavLink>
        <NavLink to="/focus" className={navItemClass}>
          <span className="text-lg">Focus Timer</span>
        </NavLink>
        <NavLink to="/analytics" className={navItemClass}>
          <span className="text-lg">Analytics</span>
        </NavLink>
      </nav>

      <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">Signed in as</p>
        <p className="font-semibold text-slate-800 dark:text-slate-100 mt-1">
          {user?.name || 'Student'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'student@example.com'}</p>
      </div>
    </aside>
  );
}
