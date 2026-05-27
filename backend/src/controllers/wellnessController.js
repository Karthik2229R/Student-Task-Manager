import asyncHandler from 'express-async-handler';
import Burnout from '../models/Wellness.js'; // Using Wellness model for burnout scores
import MoodLog from '../models/MoodLog.js';
import FocusSession from '../models/FocusSession.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import fetch from 'node-fetch';

/**
 * @desc    Calculate burnout risk based on user activity
 * @route   GET /api/wellness/burnout
 */
export const getBurnoutRisk = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Fetch relevant aggregates
  const [pending, overdue, completed, total] = await Promise.all([
    Task.countDocuments({ user: userId, status: { $ne: 'Completed' } }),
    Task.countDocuments({ user: userId, status: 'Overdue' }),
    Task.countDocuments({ user: userId, status: 'Completed' }),
    Task.countDocuments({ user: userId })
  ]);

  // Focus hours in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const focusAgg = await FocusSession.aggregate([
    { $match: { user: userId, start: { $gte: sevenDaysAgo } } },
    { $group: { _id: null, totalMinutes: { $sum: '$duration' } } }
  ]);
  const focusHours = (focusAgg[0]?.totalMinutes || 0) / 60;

  // Simple heuristic to compute a score (0‑100)
  let score = 0;
  if (pending > 10) score += 20;
  if (overdue > 5) score += 25;
  if (focusHours > 20) score += 20; // >20 hrs/week of continuous focus
  const completionRate = total ? (completed / total) * 100 : 0;
  if (completionRate < 50) score += 20;
  if (score > 100) score = 100;

  // Determine risk level
  const risk = score < 35 ? 'Low' : score < 70 ? 'Moderate' : 'High';

  // Store latest burnout score (optional)
  await Burnout.findOneAndUpdate(
    { user: userId, date: { $gte: new Date().setHours(0,0,0,0) } },
    { burnoutScore: score, risk },
    { upsert: true, new: true }
  );

  res.json({ score, risk });
});

/**
 * @desc    Weekly workload data for charts
 * @route   GET /api/wellness/weekly
 */
export const getWeeklyData = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 6); // last 7 days inclusive

  const tasksPerDay = await Task.aggregate([
    { $match: { user: userId, createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $project: { date: '$_id', count: 1, _id: 0 } }
  ]);

  const focusPerDay = await FocusSession.aggregate([
    { $match: { user: userId, start: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$start' } },
        minutes: { $sum: '$duration' }
      }
    },
    { $project: { date: '$_id', hours: { $divide: ['$minutes', 60] }, _id: 0 } }
  ]);

  res.json({ tasksPerDay, focusPerDay });
});

/**
 * @desc    Record daily mood
 * @route   POST /api/wellness/mood
 */
export const postMood = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { mood } = req.body;
  if (!['Productive', 'Neutral', 'Exhausted'].includes(mood)) {
    return res.status(400).json({ message: 'Invalid mood value' });
  }
  const entry = await MoodLog.create({ user: userId, mood });
  res.status(201).json(entry);
});

/**
 * @desc    Get an AI‑generated motivational quote
 * @route   GET /api/wellness/quote
 */
export const getMotivationalQuote = asyncHandler(async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // fallback static list
    const staticQuotes = [
      "Small steps every day lead to big results.",
      "Your effort today builds your future.",
      "Take a deep breath – you’ve got this!"
    ];
    const random = staticQuotes[Math.floor(Math.random() * staticQuotes.length)];
    return res.json({ quote: random, source: 'static' });
  }
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a motivational quote generator for students. Respond with a short, uplifting sentence without any surrounding text.' },
        { role: 'user', content: 'Give me a motivational quote' }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });
  const data = await response.json();
  try {
    const parsed = JSON.parse(data.choices?.[0]?.message?.content);
    res.json({ quote: parsed.quote || parsed, source: 'openai' });
  } catch (e) {
    // fallback if parsing fails
    res.json({ quote: data.choices?.[0]?.message?.content?.trim() || 'Stay focused and keep moving forward.', source: 'openai_raw' });
  }
});
