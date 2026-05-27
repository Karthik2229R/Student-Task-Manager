import { useEffect, useState, useMemo } from 'react';
import api from '../api/api';
import { showToast } from '../components/Toast';
import Spinner from '../components/Spinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Renders the date in standard locale format
const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/analytics');
      setData(res.data);
    } catch (err) {
      console.error(err);
      showToast({ message: 'Failed to load analytics data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Generate the last 24 weeks of calendar dates for the GitHub contribution heatmap (7 rows x 24 cols)
  const heatmapGrid = useMemo(() => {
    const grid = [];
    const today = new Date();
    // Start from the Sunday of 24 weeks ago
    const startDay = new Date();
    startDay.setDate(today.getDate() - 24 * 7 - today.getDay());

    // We generate 7 rows (Sunday to Saturday), 24 columns (weeks)
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const row = [];
      for (let week = 0; week < 24; week++) {
        const d = new Date(startDay);
        d.setDate(startDay.getDate() + week * 7 + dayOfWeek);
        const dateStr = d.toISOString().split('T')[0];
        row.push({
          date: d,
          dateStr,
          isFuture: d > today,
        });
      }
      grid.push(row);
    }
    return grid;
  }, []);

  // Aggregate stats for the Recharts daily completions graph over the last 14 days
  const chartData = useMemo(() => {
    if (!data || !data.heatmap) return [];
    const list = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = data.heatmap[dateStr] || 0;
      list.push({
        day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Completions: count,
      });
    }
    return list;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  // Compute color intensity for heatmap contribution cells
  const getContributionColor = (count, isFuture) => {
    if (isFuture) return 'bg-slate-100/30 dark:bg-slate-800/10 cursor-not-allowed';
    if (!count || count === 0) return 'bg-slate-100 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600';
    if (count === 1) return 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200/50 hover:bg-emerald-200';
    if (count === 2) return 'bg-emerald-300 dark:bg-emerald-800/70 text-white hover:bg-emerald-400';
    if (count === 3) return 'bg-emerald-400 dark:bg-emerald-600/90 text-white hover:bg-emerald-500';
    return 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-soft hover:bg-emerald-700';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner with Custom Gradient and Motivations */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600/80 via-brand-600/80 to-emerald-600/80 p-6 sm:p-8 text-white shadow-soft backdrop-blur-md border border-white/10">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-black/10 blur-2xl" />
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Consistency Engine</span>
          <h1 className="text-2xl sm:text-4xl font-display font-bold">Your Academic Performance</h1>
          <p className="text-sm sm:text-base max-w-2xl opacity-90 italic">
            {data.motivationalMessage}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Tasks Completed',
            value: data.totalCompleted,
            desc: 'Checked off tasks',
            gradient: 'from-emerald-500 to-cyan-500',
            bg: 'emerald',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Current Streak',
            value: `${data.currentStreak} Days`,
            desc: `Best streak: ${data.bestStreak} days`,
            gradient: 'from-orange-500 to-amber-500',
            bg: 'amber',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
          {
            label: 'Estimated Focus',
            value: `${data.focusHours} Hours`,
            desc: 'Based on task priorities',
            gradient: 'from-violet-500 to-fuchsia-500',
            bg: 'violet',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Study Consistency',
            value: `${data.consistency}%`,
            desc: 'Completions in last 30d',
            gradient: 'from-blue-500 to-brand-500',
            bg: 'blue',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="group relative rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 shadow-card p-6 backdrop-blur-md hover:-translate-y-1 transition duration-300"
          >
            {/* Glowing top line hover animation */}
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition duration-300`} />
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-slate-800 dark:text-white mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{card.desc}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 group-hover:scale-110 transition duration-300">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* GitHub-Style Contribution Heatmap calendar */}
      <section className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 shadow-card backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5 mb-6">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📅 Study Contribution Grid</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your daily completions over the past 6 months. Consistency builds habits.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Less</span>
            <span className="w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-100 dark:bg-emerald-950/40" />
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-300 dark:bg-emerald-800/70" />
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-400 dark:bg-emerald-600/90" />
            <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Wrapper with responsive scroll container */}
        <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <div className="flex gap-2 min-w-[700px] justify-between">
            {/* Row Header Weekday indicators */}
            <div className="flex flex-col justify-between py-1 text-[10px] font-bold text-slate-400/80 uppercase select-none w-8">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Grid Canvas */}
            <div className="flex-1 grid grid-rows-7 grid-flow-col gap-1.5">
              {heatmapGrid.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  const completions = data.heatmap[cell.dateStr] || 0;
                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`relative w-4 h-4 rounded-sm border border-transparent transition-all group/cell duration-200 cursor-pointer ${getContributionColor(
                        completions,
                        cell.isFuture
                      )}`}
                    >
                      {/* Floating tooltip block on hover */}
                      {!cell.isFuture && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-1 w-44 bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/60 text-white rounded-xl py-2 px-3 text-center text-xs opacity-0 invisible group-hover/cell:opacity-100 group-hover/cell:visible transition-all duration-200 pointer-events-none z-20 shadow-xl backdrop-blur-md">
                          <p className="font-semibold text-[11px] text-emerald-400 uppercase tracking-wider">
                            {completions} {completions === 1 ? 'task' : 'tasks'} completed
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {formatDate(cell.date)}
                          </p>
                          {/* Triangle caret */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-950" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-2 font-medium">
            <span>🚀</span>
            <span>
              Most productive day: <strong className="text-slate-800 dark:text-slate-200">{data.mostProductiveDay}</strong>
            </span>
          </p>
          <p className="flex items-center gap-2 sm:justify-end font-medium">
            <span>🔥</span>
            <span>
              Best study streak: <strong className="text-slate-800 dark:text-slate-200">{data.bestStreak} days</strong>
            </span>
          </p>
        </div>
      </section>

      {/* Weekly Charts and Performance Breakdown */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Productivity Recharts LineChart */}
        <div className="lg:col-span-2 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 p-6 shadow-card backdrop-blur-md">
          <div className="mb-6">
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">🚀 Study Velocity Chart</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daily completions trend line over the past 14 days.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(51, 65, 85, 0.8)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="Completions" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study consistency analysis */}
        <div className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 p-6 shadow-card backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">🏆 Consistency Stats</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">A detailed breakdown of completion rates.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>Task Completion Accuracy</span>
                  <span className="text-brand-500 dark:text-brand-400 font-bold">{data.completionRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-brand-500 transition-all duration-1000"
                    style={{ width: `${data.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>Study Streak Target</span>
                  <span className="text-orange-500 dark:text-orange-400 font-bold">{Math.min(100, Math.round((data.currentStreak / 10) * 100))}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000"
                    style={{ width: `${Math.min(100, (data.currentStreak / 10) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">Target: 10-day streak milestones.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 mt-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Productivity Tier</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-lg font-bold shadow-soft">
                {data.totalCompleted >= 20 ? '👑' : data.totalCompleted >= 10 ? '⭐' : '🚀'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {data.totalCompleted >= 20 ? 'Grand Master' : data.totalCompleted >= 10 ? 'Consistent Scholar' : 'Rising Scholar'}
                </p>
                <p className="text-xs text-slate-400 font-medium">Keep completing tasks to rank up!</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
