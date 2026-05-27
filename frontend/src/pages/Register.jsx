import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import Spinner from '../components/Spinner';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast({ message: "Passwords don't match", type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      showToast({ message: 'Registered!', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast({ message: err.response?.data?.message || 'Registration error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
      <section className="hidden lg:flex flex-col justify-between rounded-3xl p-10 bg-white/70 dark:bg-slate-900/60 shadow-card">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Get organized</p>
          <h1 className="text-4xl font-display font-semibold text-slate-900 dark:text-white mt-3">
            Build your academic command center.
          </h1>
          <p className="text-slate-500 dark:text-slate-300 mt-4">
            See progress, deadlines, and focus sessions in one personalized workspace.
          </p>
        </div>
        <div className="mt-10 p-6 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">What you get</p>
          <ul className="text-base text-slate-800 dark:text-slate-100 mt-2 space-y-2">
            <li>Modern dashboard insights</li>
            <li>Calendar and reminders</li>
            <li>Focus timer and study analytics</li>
          </ul>
        </div>
      </section>

      <section className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-slate-900 shadow-card">
        <h2 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">Student Register</h2>
        <p className="text-slate-500 dark:text-slate-300 mt-2">Create your account in less than a minute.</p>
        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Student name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="you@campus.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Repeat password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-xl hover:bg-brand-700 flex items-center justify-center h-12 shadow-soft"
          >
            {loading ? <Spinner /> : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            Login here
          </Link>
        </p>
      </section>
    </div>
  );
}
