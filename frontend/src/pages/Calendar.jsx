import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import CalendarView from '../components/CalendarView';
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

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks');
      setTasks(normalizeTasks(data));
    } catch (err) {
      console.error(err);
      showToast({ message: 'Unable to load calendar tasks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const selectedTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      return (
        due.getFullYear() === selectedDate.getFullYear() &&
        due.getMonth() === selectedDate.getMonth() &&
        due.getDate() === selectedDate.getDate()
      );
    });
  }, [tasks, selectedDate]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {loading ? (
          <Spinner />
        ) : (
          <CalendarView tasks={tasks} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        )}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-card p-5">
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Tasks on {selectedDate.toLocaleDateString()}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Stay ahead of each deadline.</p>
        </div>
        {loading ? (
          <Spinner />
        ) : selectedTasks.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-card p-5 text-sm text-slate-500">
            No tasks scheduled for this day.
          </div>
        ) : (
          selectedTasks.map((task) => (
            <TaskCard key={task._id} task={task} showActions={false} />
          ))
        )}
      </div>
    </div>
  );
}
