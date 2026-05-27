import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, toggleTheme, darkMode } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Student Task Manager</Link>
        {user && (
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}>Dashboard</NavLink>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        {user ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
