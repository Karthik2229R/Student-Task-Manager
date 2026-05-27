export default function TaskCard({ task, onEdit, onDelete, onToggle, showActions = true }) {
  const { title, subject, priority, dueDate, status } = task;

  const priorityColors = {
    Low: 'bg-emerald-100 text-emerald-700',
    Medium: 'bg-amber-100 text-amber-700',
    High: 'bg-rose-100 text-rose-700',
  };

  const statusColors = {
    Pending: 'bg-slate-100 text-slate-700',
    Completed: 'bg-cyan-100 text-cyan-700',
    Overdue: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card p-5 hover:-translate-y-1 transition">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">{subject || 'General studies'}</p>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[priority] || 'bg-slate-200 text-slate-700'}`}>
            {priority}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-slate-200 text-slate-700'}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>Due: {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}</span>
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onToggle(task)}
              className="px-3 py-1.5 bg-brand-600 text-white rounded-full hover:bg-brand-700"
            >
              {status === 'Completed' ? 'Undo' : 'Done'}
            </button>
            <button
              onClick={() => onEdit(task)}
              className="px-3 py-1.5 bg-slate-700 text-white rounded-full hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task)}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
