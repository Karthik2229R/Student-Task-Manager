import { showToast } from './Toast';

const columns = [
  {
    key: 'Pending',
    title: 'In Progress',
    helper: 'Focus on the next wins',
    tone: 'border-brand-400',
  },
  {
    key: 'Completed',
    title: 'Completed',
    helper: 'Celebrate the finished tasks',
    tone: 'border-emerald-400',
  },
  {
    key: 'Overdue',
    title: 'Overdue',
    helper: 'Needs attention soon',
    tone: 'border-rose-400',
    readOnly: true,
  },
];

export default function TaskBoard({ tasks, onStatusChange }) {
  const handleDrop = (status, isReadOnly) => (event) => {
    event.preventDefault();
    if (isReadOnly) {
      showToast({ message: 'Overdue is auto-set by due dates', type: 'error' });
      return;
    }
    const taskId = event.dataTransfer.getData('text/plain');
    if (!taskId) return;
    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === status) return;
    onStatusChange(task, status);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);
        return (
          <div
            key={column.key}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop(column.key, column.readOnly)}
            className={`rounded-2xl border-t-4 ${column.tone} bg-white dark:bg-slate-900 shadow-card p-4 min-h-[260px]`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">{column.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{column.helper}</p>
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{columnTasks.length}</span>
            </div>

            <div className="mt-4 space-y-3">
              {columnTasks.map((task) => (
                <div
                  key={task._id}
                  draggable={!column.readOnly}
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', task._id)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/60 cursor-grab"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {task.subject || 'General'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span>{task.priority} priority</span>
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && (
                <p className="text-xs text-slate-400">Drag tasks here.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
