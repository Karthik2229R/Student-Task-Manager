import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Simple global toast system - you can invoke showToast from anywhere
export const showToast = ({ message, type = 'success', duration = 3000 }) => {
  const event = new CustomEvent('toast', { detail: { message, type, duration } });
  window.dispatchEvent(event);
};

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => setToast(e.detail);
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.duration);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const { message, type } = toast;
  const bg = type === 'error' ? 'bg-rose-600' : 'bg-emerald-600';

  return createPortal(
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl shadow-lg text-white ${bg} animate-fade-up`}>
      {message}
    </div>,
    document.body
  );
}
