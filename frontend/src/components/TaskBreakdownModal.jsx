import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { showToast } from './Toast';

// Premium pulsing skeleton loader representing task checkpoints
function SkeletonLoader() {
  return (
    <div className="space-y-4 py-3">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
      </div>
      <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '150ms' }}>
        <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-5/6"></div>
      </div>
      <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '300ms' }}>
        <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3"></div>
      </div>
      <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '450ms' }}>
        <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-4/5"></div>
      </div>
    </div>
  );
}

export default function TaskBreakdownModal({ isOpen, onClose, onSuccess }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Configuration for imported subtasks
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showToast({ message: 'Please enter a task title', type: 'error' });
      return;
    }

    setLoading(true);
    setFeedbackMsg('');
    setSubtasks([]);
    
    try {
      const res = await api.post('/tasks/breakdown', { taskTitle });
      const items = res.data.subtasks || [];
      setSubtasks(items.map((item) => ({ text: item, checked: true })));
      setIsMock(res.data.isMock || false);
      if (res.data.isMock) {
        setFeedbackMsg(res.data.message || 'Offline Fallback mode activated.');
      }
      showToast({ message: 'Subtasks successfully broken down!', type: 'success' });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Failed to connect to subtask generator';
      showToast({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubtask = (index) => {
    setSubtasks((prev) =>
      prev.map((sub, i) => (i === index ? { ...sub, checked: !sub.checked } : sub))
    );
  };

  const handleSelectAll = (checked) => {
    setSubtasks((prev) => prev.map((sub) => ({ ...sub, checked })));
  };

  const handleImport = async () => {
    const selected = subtasks.filter((s) => s.checked);
    if (selected.length === 0) {
      showToast({ message: 'Please select at least one subtask to save', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      // Create separate pending task boards for each checked subtask
      await Promise.all(
        selected.map((sub) =>
          api.post('/tasks', {
            title: sub.text,
            description: `Subtask of: ${taskTitle}`,
            subject: subject.trim() || 'General',
            priority,
            dueDate: dueDate || undefined,
            status: 'Pending',
          })
        )
      );

      showToast({
        message: `Successfully imported ${selected.length} tasks to your board!`,
        type: 'success',
      });
      onSuccess();
      onClose();
      // Reset state
      setTaskTitle('');
      setSubtasks([]);
      setSubject('');
      setPriority('Medium');
      setDueDate('');
    } catch (err) {
      console.error(err);
      showToast({ message: 'Failed to import subtasks to your board', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const allChecked = subtasks.length > 0 && subtasks.every((s) => s.checked);
  const someChecked = subtasks.length > 0 && subtasks.some((s) => s.checked);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6 md:p-10">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 md:p-8 overflow-hidden z-10"
          >
            {/* Top Glowing Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-brand-500 to-emerald-500" />

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>✨ AI Task Breakdown</span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Enter a heavy exam study schedule or a complex assignment to instantly divide it into digestible chunks.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6">
              {/* Task input form */}
              <form onSubmit={handleGenerate} className="space-y-3">
                <label htmlFor="ai-task-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  What complex study task or assignment are you tackling?
                </label>
                <div className="flex gap-3">
                  <input
                    id="ai-task-input"
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Prepare for Operating Systems exam, Draft Psychology term paper..."
                    disabled={loading || saving}
                    className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50 placeholder-slate-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || saving || !taskTitle.trim()}
                    className="px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-brand-600 text-white font-semibold hover:from-violet-700 hover:to-brand-700 shadow-soft flex items-center justify-center gap-2 disabled:opacity-40 transition whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>✨ Generate</>
                    )}
                  </button>
                </div>
              </form>

              {/* Loader or Subtasks List */}
              <div className="min-h-[140px] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-900/30">
                {loading && <SkeletonLoader />}

                {!loading && subtasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-500 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Your Actionable Steps await</p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Enter your project or exam theme above to break down massive tasks into immediate subtask goals.
                    </p>
                  </div>
                )}

                {!loading && subtasks.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          id="select-all"
                          type="checkbox"
                          checked={allChecked}
                          ref={(el) => {
                            if (el) {
                              el.indeterminate = someChecked && !allChecked;
                            }
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 bg-transparent"
                        />
                        <label htmlFor="select-all" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          Select All Subtasks
                        </label>
                      </div>
                      {isMock && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                          Offline Mock Mode
                        </span>
                      )}
                    </div>

                    {/* Action checklist with Framer Motion */}
                    <motion.ul className="space-y-2">
                      {subtasks.map((sub, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 transition hover:bg-slate-100/50 dark:hover:bg-slate-800/30 ${
                            sub.checked ? 'bg-white dark:bg-slate-800/20' : 'opacity-60 bg-transparent'
                          }`}
                        >
                          <input
                            id={`subtask-${idx}`}
                            type="checkbox"
                            checked={sub.checked}
                            onChange={() => handleToggleSubtask(idx)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 bg-transparent"
                          />
                          <label
                            htmlFor={`subtask-${idx}`}
                            className={`flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer ${
                              sub.checked ? '' : 'line-through text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {sub.text}
                          </label>
                        </motion.li>
                      ))}
                    </motion.ul>

                    {feedbackMsg && (
                      <p className="text-[11px] text-slate-400 italic text-right mt-1">
                        {feedbackMsg}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Subtask Customizing Options */}
              {subtasks.length > 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-4 sm:grid-cols-3 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <div className="space-y-1">
                    <label htmlFor="subtask-subject" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      id="subtask-subject"
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Computer Science"
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subtask-priority" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      id="subtask-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subtask-due" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Due Date
                    </label>
                    <input
                      id="subtask-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold transition"
              >
                Cancel
              </button>
              {subtasks.length > 0 && (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={saving || loading || !subtasks.some((s) => s.checked)}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-semibold rounded-xl flex items-center gap-2 shadow-soft transition"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Tasks...
                    </>
                  ) : (
                    <>
                      Import Checked ({subtasks.filter((s) => s.checked).length})
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
