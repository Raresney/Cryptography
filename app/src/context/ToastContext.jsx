import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const ToastContext = createContext();

const ICON_MAP = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const COLOR_MAP = {
  success: 'var(--green)',
  error: 'var(--red)',
  info: 'var(--cyan)',
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  const containerStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 9999,
    pointerEvents: 'none',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={containerStyle}>
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type] || FiInfo;
          const color = COLOR_MAP[toast.type] || 'var(--cyan)';
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--bg-card, #16161f)',
                border: `1px solid ${color}`,
                borderRadius: '999px',
                color: 'var(--text-bright, #e0e0f0)',
                fontFamily: 'var(--mono)',
                fontSize: '13px',
                boxShadow: `0 0 12px ${color}33`,
                pointerEvents: 'auto',
                animation: toast.exiting
                  ? 'toastSlideOut 0.3s ease-in forwards'
                  : 'toastSlideIn 0.3s ease-out forwards',
              }}
            >
              <Icon size={16} color={color} />
              {toast.message}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(100%); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
