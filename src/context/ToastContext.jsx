import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    container: 'bg-white/95 border-emerald-200 text-slate-800 shadow-emerald-950/10',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    title: 'Success',
    Icon: CheckCircle2
  },
  error: {
    container: 'bg-white/95 border-rose-200 text-slate-800 shadow-rose-950/10',
    iconWrap: 'bg-rose-100 text-rose-700',
    title: 'Error',
    Icon: AlertCircle
  },
  warning: {
    container: 'bg-white/95 border-amber-200 text-slate-800 shadow-amber-950/10',
    iconWrap: 'bg-amber-100 text-amber-700',
    title: 'Notice',
    Icon: AlertTriangle
  },
  info: {
    container: 'bg-white/95 border-sky-200 text-slate-800 shadow-sky-950/10',
    iconWrap: 'bg-sky-100 text-sky-700',
    title: 'Info',
    Icon: Info
  }
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type, message, title) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = type === 'error' ? 4500 : 3200;
      setToasts((prev) => [...prev.slice(-3), { id, type, message, title }]);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const toast = {
    success: (msg, title) => addToast('success', msg, title),
    error: (msg, title) => addToast('error', msg, title),
    warning: (msg, title) => addToast('warning', msg, title),
    info: (msg, title) => addToast('info', msg, title)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Stack */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((item) => {
          const style = TOAST_STYLES[item.type] || TOAST_STYLES.info;
          const IconComp = style.Icon;
          return (
            <div
              key={item.id}
              className={`pointer-events-auto backdrop-blur-md border rounded-2xl p-3.5 shadow-xl flex items-start gap-3 transition-all duration-200 ${style.container}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${style.iconWrap}`}>
                <IconComp className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="text-xs font-bold tracking-tight text-slate-900">
                  {item.title || style.title}
                </div>
                <div className="text-xs text-slate-600 mt-0.5 leading-snug break-words">
                  {item.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

