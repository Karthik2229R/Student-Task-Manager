import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import PomodoroTimer from '../components/PomodoroTimer';
import TaskCard from '../components/TaskCard';
import Spinner from '../components/Spinner';
import { showToast } from '../components/Toast';

const normalizeTasks = (taskList) => {
  const now = new Date();
  return taskList.map((task) => {
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Completed') {
      return { ...task, status: 'Overdue' };
    }
    return task;
  });
};

export default function Focus() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks');
      setTasks(normalizeTasks(data));
    } catch (err) {
      console.error(err);
      showToast({ message: 'Unable to load focus tasks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const focusTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
      .slice(0, 3);
  }, [tasks]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <PomodoroTimer />
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-card p-6">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Focus Queue</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pick a task and start a session.</p>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            {loading ? (
              <Spinner />
            ) : focusTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No pending tasks. Nice work.</p>
            ) : (
              focusTasks.map((task) => <TaskCard key={task._id} task={task} showActions={false} />)
            )}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-card p-6">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Study Analytics</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Daily rhythm suggestions.</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li>Plan two focus sessions before noon.</li>
            <li>Schedule 10-minute breaks between tasks.</li>
            <li>Review overdue items first.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
