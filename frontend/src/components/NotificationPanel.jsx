export default function NotificationPanel({ upcomingTasks, overdueTasks }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-card p-6 space-y-5">
      <div>
        <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Reminders</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming deadlines and alerts.</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Due soon</h4>
        <div className="mt-3 space-y-3">
          {upcomingTasks.length === 0 && (
            <p className="text-xs text-slate-400">No deadlines in the next few days.</p>
          )}
          {upcomingTasks.map((task) => (
            <div key={task._id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {task.subject || 'General'} • {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Overdue</h4>
        <div className="mt-3 space-y-3">
          {overdueTasks.length === 0 && (
            <p className="text-xs text-slate-400">Great job staying on track.</p>
          )}
          {overdueTasks.map((task) => (
            <div key={task._id} className="rounded-xl border border-rose-200 dark:border-rose-700/60 p-3 bg-rose-50/60 dark:bg-rose-900/20">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
              <p className="text-xs text-rose-500">
                {task.subject || 'General'} • {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
