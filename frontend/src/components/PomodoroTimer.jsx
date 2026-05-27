import { useEffect, useRef, useState } from 'react';

const presets = {
  focus: 25 * 60,
  break: 5 * 60,
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState('focus');
  const [seconds, setSeconds] = useState(presets.focus);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) {
      setRunning(false);
    }
  }, [seconds, running]);

  const handleReset = () => {
    setRunning(false);
    setSeconds(presets[mode]);
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setRunning(false);
    setSeconds(presets[nextMode]);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold text-slate-900 dark:text-white">Pomodoro</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Stay focused in short bursts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('focus')}
            className={`px-3 py-1 rounded-full text-xs ${
              mode === 'focus'
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300'
            }`}
          >
            Focus
          </button>
          <button
            onClick={() => handleModeChange('break')}
            className={`px-3 py-1 rounded-full text-xs ${
              mode === 'break'
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300'
            }`}
          >
            Break
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="text-4xl font-display font-semibold text-slate-900 dark:text-white">
          {formatTime(seconds)}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {running ? 'Session running' : 'Ready when you are'}
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setRunning((prev) => !prev)}
          className="px-4 py-2 rounded-full bg-brand-600 text-white hover:bg-brand-700"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
