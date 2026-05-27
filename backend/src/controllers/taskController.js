import Task from '../models/Task.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, description, subject, priority, dueDate, status } = req.body;
  const isOverdue = dueDate && new Date(dueDate) < new Date();
  const nextStatus = status === 'Completed' ? 'Completed' : isOverdue ? 'Overdue' : status || 'Pending';
  const task = await Task.create({
    userId: req.user.id,
    title,
    description,
    subject,
    priority,
    dueDate,
    status: nextStatus,
  });
  res.status(201).json(task);
});

// @desc    Get tasks (with optional filters)
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, subject, search } = req.query;
  await Task.updateMany(
    {
      userId: req.user.id,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() },
    },
    { $set: { status: 'Overdue' } }
  );
  const filter = { userId: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (subject) filter.subject = subject;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const tasks = await Task.find(filter).sort({ dueDate: 1 });
  res.json(tasks);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  const allowedFields = ['title', 'description', 'subject', 'priority', 'dueDate', 'status'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed') {
    task.status = 'Overdue';
  }

  if (task.dueDate && new Date(task.dueDate) >= new Date() && task.status === 'Overdue') {
    task.status = 'Pending';
  }

  await task.save();
  res.json(task);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.json({ message: 'Task deleted' });
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await Task.updateMany(
    {
      userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() },
    },
    { $set: { status: 'Overdue' } }
  );
  const total = await Task.countDocuments({ userId });
  const completed = await Task.countDocuments({ userId, status: 'Completed' });
  const pending = await Task.countDocuments({ userId, status: 'Pending' });
  const overdue = await Task.countDocuments({ userId, dueDate: { $lt: new Date() }, status: { $ne: 'Completed' } });
  res.json({ total, completed, pending, overdue });
});

// @desc    Get detailed task analytics (heatmap, streaks, consistency, etc.)
// @route   GET /api/tasks/analytics
// @access  Private
export const getTaskAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Make sure tasks statuses are updated in case any became overdue in the background
  await Task.updateMany(
    {
      userId,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() },
    },
    { $set: { status: 'Overdue' } }
  );

  const tasks = await Task.find({ userId });

  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const totalTasks = tasks.length;
  
  // 1. Calculate Total Completed
  const totalCompleted = completedTasks.length;

  // 2. Completion Rate
  const completionRate = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // 3. Focus Hours (estimate: Low=1h, Medium=2h, High=3.5h)
  let focusHours = 0;
  completedTasks.forEach((t) => {
    if (t.priority === 'High') focusHours += 3.5;
    else if (t.priority === 'Medium') focusHours += 2;
    else focusHours += 1;
  });

  // 4. Heatmap: completions by date ("YYYY-MM-DD")
  const heatmap = {};
  completedTasks.forEach((t) => {
    if (t.updatedAt) {
      const dateStr = new Date(t.updatedAt).toISOString().split('T')[0];
      heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
    }
  });

  // 5. Streaks (consecutive days with at least 1 completed task)
  // Sort completed dates ascending
  const uniqueDatesSorted = Object.keys(heatmap).sort();
  
  let currentStreak = 0;
  let bestStreak = 0;
  
  if (uniqueDatesSorted.length > 0) {
    let tempStreak = 1;
    bestStreak = 1;

    for (let i = 1; i < uniqueDatesSorted.length; i++) {
      const prevDate = new Date(uniqueDatesSorted[i - 1]);
      const currDate = new Date(uniqueDatesSorted[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    // Check if the current streak is still active (i.e. last completion was today or yesterday)
    const lastCompletionDate = new Date(uniqueDatesSorted[uniqueDatesSorted.length - 1]);
    const today = new Date();
    // Normalize hours to check days difference accurately
    const todayCopy = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastCompCopy = new Date(lastCompletionDate.getFullYear(), lastCompletionDate.getMonth(), lastCompletionDate.getDate());
    const diffTime = Math.abs(todayCopy - lastCompCopy);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      currentStreak = tempStreak;
    }
  }

  // 6. Consistency: percentage of days with at least 1 completion in the last 30 days
  const activeDaysCount = Object.keys(heatmap).filter((dateStr) => {
    const diffTime = Math.abs(new Date() - new Date(dateStr));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;
  const consistency = Math.round((activeDaysCount / 30) * 100);

  // 7. Most Productive Day of Week
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  
  completedTasks.forEach((t) => {
    if (t.updatedAt) {
      const dayIndex = new Date(t.updatedAt).getDay();
      dayCounts[dayIndex]++;
    }
  });

  let maxDayIndex = 0;
  let maxCount = 0;
  dayCounts.forEach((count, idx) => {
    if (count > maxCount) {
      maxCount = count;
      maxDayIndex = idx;
    }
  });
  const mostProductiveDay = maxCount > 0 ? weekdayNames[maxDayIndex] : 'No completions yet';

  // 8. Motivational Message
  let motivationalMessage = 'Welcome to your study dashboard! Create tasks and check them off to build your heatmap!';
  if (currentStreak >= 5) {
    motivationalMessage = `🔥 You're unstoppable! An active streak of ${currentStreak} consecutive study days. Keep pushing!`;
  } else if (currentStreak >= 3) {
    motivationalMessage = `✨ Solid consistency! ${currentStreak} days in a row. Keep the momentum going!`;
  } else if (completionRate >= 80 && totalCompleted > 0) {
    motivationalMessage = '🎯 Exceptional accuracy! You complete almost everything you plan. Keep aiming high!';
  } else if (totalCompleted > 5) {
    motivationalMessage = '💪 Great job! You are consistently checking off tasks. Dedication yields success.';
  } else if (totalCompleted > 0) {
    motivationalMessage = '🚀 Off to a great start! Continue taking small daily actions toward your goals.';
  }

  res.json({
    totalCompleted,
    completionRate,
    focusHours: Math.round(focusHours * 10) / 10,
    currentStreak,
    bestStreak,
    consistency,
    mostProductiveDay,
    heatmap,
    motivationalMessage,
  });
});

