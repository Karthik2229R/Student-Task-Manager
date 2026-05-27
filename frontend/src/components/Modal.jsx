export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg mx-4 p-6 relative shadow-card">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          aria-label="Close modal"
        >
          X
        </button>
        {title && <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
