import { useState, useEffect } from 'react';
import { showToast } from '../components/Toast';

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Pending',
  });

  useEffect(() => {
    if (task) setForm({ ...task, dueDate: task.dueDate?.split('T')[0] });
  }, [task]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!form.title || !form.dueDate) {
      showToast({ message: 'Title and due date are required', type: 'error' });
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Assignment or study session"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Add context, milestones, or notes"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Subject</label>
        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="Calculus, Biology, History"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-transparent"
        >
          <option>Pending</option>
          <option>Completed</option>
          <option>Overdue</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700">
          {task ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
