import { useEffect, useMemo, useState, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import TaskCard from '../components/TaskCard';
import TaskTable from '../components/TaskTable';
import TaskBoard from '../components/TaskBoard';
import Modal from '../components/Modal';
import TaskForm from './TaskForm';
import NotificationPanel from '../components/NotificationPanel';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskBreakdownModal from '../components/TaskBreakdownModal';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const normalizeTasks = (taskList) => {
  const now = new Date();
  return taskList.map((task) => {
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Completed') {
      return { ...task, status: 'Overdue' };
    }
    return task;
  });
};

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showAI, setShowAI] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/stats'),
      ]);
      setTasks(normalizeTasks(tasksRes.data));
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      showToast({ message: 'Failed to load tasks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshStats = async () => {
    const statsRes = await api.get('/tasks/stats');
    setStats(statsRes.data);
  };

  const handleCreate = () => {
    setEditTask(null);
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleDeleteConfirmed = async (task) => {
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      await refreshStats();
      showToast({ message: 'Task deleted', type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: 'Error deleting task', type: 'error' });
    }
  };

  const handleDelete = (task) => {
    if (!window.confirm('Delete this task?')) return;
    handleDeleteConfirmed(task);
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = { ...task, status: task.status === 'Completed' ? 'Pending' : 'Completed' };
      const res = await api.put(`/tasks/${task._id}`, updated);
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      showToast({ message: 'Task status updated', type: 'success' });
      await refreshStats();
    } catch (err) {
      console.error(err);
      showToast({ message: 'Failed to update task', type: 'error' });
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { ...task, status });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
      showToast({ message: 'Task moved', type: 'success' });
      await refreshStats();
    } catch (err) {
      console.error(err);
      showToast({ message: 'Failed to update task', type: 'error' });
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editTask) {
        const res = await api.put(`/tasks/${editTask._id}`, data);
        setTasks((prev) => prev.map((t) => (t._id === editTask._id ? res.data : t)));
        showToast({ message: 'Task updated', type: 'success' });
      } else {
        const res = await api.post('/tasks', data);
        setTasks((prev) => [...prev, res.data]);
        showToast({ message: 'Task created', type: 'success' });
      }
      await refreshStats();
    } catch (err) {
      console.error(err);
      showToast({ message: err.response?.data?.message || 'Error saving task', type: 'error' });
    } finally {
      setShowForm(false);
      setEditTask(null);
    }
  };

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const chartData = [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending', value: stats.pending },
    { name: 'Overdue', value: stats.overdue },
  ];
  const pieColors = ['#06b6d4', '#facc15', '#f43f5e'];

  const weeklyData = useMemo(() => {
    const days = getLast7Days();
    return days.map((day) => {
      const label = day.toLocaleDateString('default', { weekday: 'short' });
      const completedCount = tasks.filter((task) => {
        if (task.status !== 'Completed' || !task.updatedAt) return false;
        const updated = new Date(task.updatedAt);
        return (
          updated.getFullYear() === day.getFullYear() &&
          updated.getMonth() === day.getMonth() &&
          updated.getDate() === day.getDate()
        );
      }).length;
      return { day: label, completed: completedCount };
    });
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 3);
    return tasks
      .filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) >= now &&
          new Date(task.dueDate) <= limit &&
          task.status !== 'Completed'
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 4);
  }, [tasks]);

  const overdueTasks = useMemo(
    () => tasks.filter((task) => task.status === 'Overdue').slice(0, 4),
    [tasks]
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-300">Welcome back</p>
          <h1 className="text-3xl font-display font-semibold text-slate-900 dark:text-white">
            {user?.name?.split(' ')[0] || 'Student'}'s Workspace
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAI(true)}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-brand-600 hover:from-violet-700 hover:to-brand-700 text-white font-medium shadow-soft flex items-center gap-2 transition"
          >
            <span>✨ AI Breakdown</span>
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 rounded-full bg-brand-600 text-white hover:bg-brand-700 shadow-soft"
          >
            + New Task
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Tasks', value: stats.total, accent: 'border-brand-500' },
          { label: 'Completed', value: stats.completed, accent: 'border-emerald-500' },
          { label: 'Pending', value: stats.pending, accent: 'border-amber-500' },
          { label: 'Overdue', value: stats.overdue, accent: 'border-rose-500' },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border-t-4 ${card.accent} bg-white dark:bg-slate-900 p-5 shadow-card animate-fade-up`}
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-2">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl shadow-card p-5">
              <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Task Status</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Snapshot of your workload.</p>
              {loading ? (
                <Spinner />
              ) : (
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl shadow-card p-5">
              <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Weekly Productivity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed tasks per day.</p>
              {loading ? (
                <Spinner />
              ) : (
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#06b6d4" strokeWidth={3} dot />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Focus Progress</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Completion rate: {completionRate}%
                </p>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Keep the streak alive.</div>
            </div>
            <div className="mt-6">
              <TaskBoard tasks={tasks} onStatusChange={handleStatusChange} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <NotificationPanel upcomingTasks={upcomingTasks} overdueTasks={overdueTasks} />
          <PomodoroTimer />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-white">Your Tasks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search, filter, and manage.</p>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggleComplete}
                />
              ))}
            </div>
            <TaskTable
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDeleteConfirmed}
              onToggleComplete={handleToggleComplete}
            />
          </>
        )}
      </section>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        <TaskForm task={editTask} onSubmit={handleFormSubmit} onCancel={() => setShowForm(false)} />
      </Modal>

      <TaskBreakdownModal isOpen={showAI} onClose={() => setShowAI(false)} onSuccess={fetchData} />
    </div>
  );
}
