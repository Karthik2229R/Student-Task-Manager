import { useState } from 'react';

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
}) {
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    subject: '',
    search: '',
    dueDate: '',
  });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Apply client-side filters (backend also supports query params)
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filter.status ? t.status === filter.status : true;
    const matchesPriority = filter.priority
      ? t.priority === filter.priority
      : true;
    const matchesSubject = filter.subject
      ? (t.subject || '').toLowerCase().includes(filter.subject.toLowerCase())
      : true;
    const matchesSearch = filter.search
      ? t.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(filter.search.toLowerCase())
      : true;
    const matchesDueDate = filter.dueDate
      ? t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === filter.dueDate
      : true;
    return matchesStatus && matchesPriority && matchesSubject && matchesSearch && matchesDueDate;
  });

  const handleDelete = async (task) => {
    if (!window.confirm('Delete this task?')) return;
    onDelete(task);
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-card rounded-2xl p-5">
      {/* Filters */}
      <div className="grid md:grid-cols-5 gap-4 mb-4">
        <select
          name="status"
          value={filter.status}
          onChange={handleFilterChange}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-transparent"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>

        <select
          name="priority"
          value={filter.priority}
          onChange={handleFilterChange}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-transparent"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="text"
          name="subject"
          placeholder="Subject..."
          value={filter.subject}
          onChange={handleFilterChange}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-transparent"
        />

        <input
          type="text"
          name="search"
          placeholder="Search..."
          value={filter.search}
          onChange={handleFilterChange}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-transparent"
        />

        <input
          type="date"
          name="dueDate"
          value={filter.dueDate}
          onChange={handleFilterChange}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="px-2 py-1">Title</th>
              <th className="px-2 py-1">Subject</th>
              <th className="px-2 py-1">Priority</th>
              <th className="px-2 py-1">Due</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr
                key={task._id}
                className="border-b border-slate-200 dark:border-slate-700"
              >
                <td className="px-2 py-1">{task.title}</td>
                <td className="px-2 py-1">{task.subject || 'General'}</td>
                <td className="px-2 py-1">{task.priority}</td>
                <td className="px-2 py-1">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </td>
                <td className="px-2 py-1">{task.status}</td>
                <td className="px-2 py-1 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => onToggleComplete(task)}
                    className="px-2.5 py-1 bg-brand-600 text-white rounded-full hover:bg-brand-700"
                  >
                    {task.status === 'Completed' ? 'Undo' : 'Done'}
                  </button>
                  <button
                    onClick={() => onEdit(task)}
                    className="px-2.5 py-1 bg-slate-700 text-white rounded-full hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No tasks match the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
