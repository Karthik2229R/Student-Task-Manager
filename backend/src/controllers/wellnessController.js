import asyncHandler from 'express-async-handler';
import Wellness from '../models/Wellness.js';
import Task from '../models/Task.js';

const ALLOWED_MOODS = ['Productive', 'Neutral', 'Exhausted'];

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getDateKey = (date) => new Date(date).toISOString().split('T')[0];

const getLastNDays = (days) => {
  const list = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    list.push(d);
  }
  return list;
};

const getWellnessLogs = async (userId, days = 7) => {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  const logs = await Wellness.find({ userId }).sort({ date: -1 });
  return logs.filter((entry) => new Date(entry.date) >= start);
};

const calculateBurnoutScore = async (userId) => {
  const [pending, overdue, completed, total] = await Promise.all([
    Task.countDocuments({ userId, status: { $ne: 'Completed' } }),
    Task.countDocuments({ userId, status: 'Overdue' }),
    Task.countDocuments({ userId, status: 'Completed' }),
    Task.countDocuments({ userId })
  ]);

  const recentLogs = await getWellnessLogs(userId, 7);
  const focusHours = recentLogs.reduce((sum, entry) => sum + (entry.focusHours || 0), 0);

  let score = 0;
  if (pending > 10) score += 20;
  if (overdue > 5) score += 25;
  if (focusHours > 20) score += 20;
  const completionRate = total ? (completed / total) * 100 : 0;
  if (completionRate < 50) score += 20;
  if (score > 100) score = 100;

  const risk = score < 35 ? 'Low' : score < 70 ? 'Moderate' : 'High';
  return { score, risk, focusHours };
};

/**
 * @desc    Get aggregated wellness data for dashboard
 * @route   GET /api/wellness
 */
export const getWellnessData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [burnout, weekly, focusBreak, recommendations, logs] = await Promise.all([
    calculateBurnoutScore(userId),
    (async () => {
      const dates = getLastNDays(7);
      const start = dates[0];
      const tasks = await Task.find({ userId, createdAt: { $gte: start } });
      const wellnessLogs = await Wellness.find({ userId, date: { $gte: start } });

      const taskCountByDay = {};
      tasks.forEach((task) => {
        const key = getDateKey(task.createdAt);
        taskCountByDay[key] = (taskCountByDay[key] || 0) + 1;
      });

      const focusHoursByDay = {};
      wellnessLogs.forEach((entry) => {
        const key = getDateKey(entry.date);
        focusHoursByDay[key] = (focusHoursByDay[key] || 0) + (entry.focusHours || 0);
      });

      return {
        tasksPerDay: dates.map((d) => ({ date: getDateKey(d), count: taskCountByDay[getDateKey(d)] || 0 })),
        focusPerDay: dates.map((d) => ({ date: getDateKey(d), hours: focusHoursByDay[getDateKey(d)] || 0 })),
      };
    })(),
    (async () => {
      const logs = await getWellnessLogs(userId, 7);
      const focusHours = logs.reduce((sum, entry) => sum + (entry.focusHours || 0), 0);
      const breakHours = logs.reduce((sum, entry) => sum + (entry.sleepHours || 0), 0);
      return {
        focusHours,
        breakHours,
        ratio: breakHours > 0 ? Number((focusHours / breakHours).toFixed(2)) : null,
      };
    })(),
    (async () => {
      const { score, risk, focusHours } = await calculateBurnoutScore(userId);
      const suggestions = [];
      if (risk === 'High') suggestions.push('Reduce your workload for the next few days.');
      if (risk === 'Moderate') suggestions.push('Plan short breaks between study sessions.');
      if (focusHours > 20) suggestions.push('Aim for at least one rest block each day.');
      if (!suggestions.length) suggestions.push('Keep up the steady pace and stay consistent.');
      return suggestions;
    })(),
    getWellnessLogs(userId, 14),
  ]);

  res.json({
    burnout: { score: burnout.score, risk: burnout.risk },
    weekly,
    focusBreak,
    recommendations,
    moodLogs: logs,
  });
});

/**
 * @desc    Log daily mood and focus hours
 * @route   POST /api/wellness/log
 */
export const logMood = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { mood, focusHours, sleepHours, notes } = req.body;
  if (!ALLOWED_MOODS.includes(mood)) {
    return res.status(400).json({ message: 'Invalid mood value' });
  }

  const entry = await Wellness.create({
    userId,
    mood,
    focusHours: normalizeNumber(focusHours, 0),
    sleepHours: normalizeNumber(sleepHours, 0),
    notes: typeof notes === 'string' ? notes.trim() : undefined,
  });

  res.status(201).json(entry);
});

/**
 * @desc    Get burnout score for user
 * @route   GET /api/wellness/burnout
 */
export const getBurnoutScore = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { score, risk } = await calculateBurnoutScore(userId);
  res.json({ score, risk });
});

/**
 * @desc    Weekly workload stats
 * @route   GET /api/wellness/weekly
 */
export const getWeeklyWorkload = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const dates = getLastNDays(7);
  const start = dates[0];

  const [tasks, wellnessLogs] = await Promise.all([
    Task.find({ userId, createdAt: { $gte: start } }),
    Wellness.find({ userId, date: { $gte: start } }),
  ]);

  const taskCountByDay = {};
  tasks.forEach((task) => {
    const key = getDateKey(task.createdAt);
    taskCountByDay[key] = (taskCountByDay[key] || 0) + 1;
  });

  const focusHoursByDay = {};
  wellnessLogs.forEach((entry) => {
    const key = getDateKey(entry.date);
    focusHoursByDay[key] = (focusHoursByDay[key] || 0) + (entry.focusHours || 0);
  });

  res.json({
    tasksPerDay: dates.map((d) => ({ date: getDateKey(d), count: taskCountByDay[getDateKey(d)] || 0 })),
    focusPerDay: dates.map((d) => ({ date: getDateKey(d), hours: focusHoursByDay[getDateKey(d)] || 0 })),
  });
});

/**
 * @desc    Focus vs break ratio
 * @route   GET /api/wellness/focus-break
 */
export const getFocusBreakRatio = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const logs = await getWellnessLogs(userId, 7);
  const focusHours = logs.reduce((sum, entry) => sum + (entry.focusHours || 0), 0);
  const breakHours = logs.reduce((sum, entry) => sum + (entry.sleepHours || 0), 0);
  const ratio = breakHours > 0 ? Number((focusHours / breakHours).toFixed(2)) : null;
  res.json({ focusHours, breakHours, ratio });
});

/**
 * @desc    Smart recommendations
 * @route   GET /api/wellness/recommendations
 */
export const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { score, risk, focusHours } = await calculateBurnoutScore(userId);
  const tips = [];

  if (risk === 'High') tips.push('Reduce your workload this week and schedule recovery time.');
  if (risk === 'Moderate') tips.push('Balance hard tasks with short breaks every 60-90 minutes.');
  if (focusHours > 20) tips.push('Aim for at least one rest block each day.');
  if (!tips.length) tips.push('You are on a healthy pace. Keep the streak going.');

  res.json({ score, risk, recommendations: tips });
});
