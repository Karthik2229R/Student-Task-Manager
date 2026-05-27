import { useMemo, useState } from 'react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function CalendarView({ tasks, selectedDate, onSelectDate }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const leadingBlanks = start.getDay();
    const totalDays = end.getDate();

    const grid = [];
    for (let i = 0; i < leadingBlanks; i += 1) {
      grid.push(null);
    }
    for (let day = 1; day <= totalDays; day += 1) {
      grid.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    return grid;
  }, [month]);

  const taskMap = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const due = new Date(task.dueDate);
      const key = `${due.getFullYear()}-${due.getMonth()}-${due.getDate()}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [tasks]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Monthly View</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pick a date to review tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(addMonths(month, -1))}
            className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            Prev
          </button>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
        {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-4 text-xs text-slate-400">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-3">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-16" />;
          }
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const count = taskMap.get(key) || 0;
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`h-16 rounded-xl border text-left p-2 transition ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200'
              }`}
            >
              <div className="text-xs font-semibold">{day.getDate()}</div>
              {count > 0 && (
                <div className="mt-2 text-[10px] bg-brand-600 text-white rounded-full px-2 py-0.5 inline-block">
                  {count} tasks
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
