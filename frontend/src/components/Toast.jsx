import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ toasts = [], onRemove }) => {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`toast ${
              isSuccess ? 'toast-success' : isError ? 'toast-error' : 'toast-info'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 size={18} style={{ color: 'var(--done-color)', flexShrink: 0 }} />
            ) : isError ? (
              <AlertCircle size={18} style={{ color: 'var(--priority-high)', flexShrink: 0 }} />
            ) : (
              <Info size={18} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
            )}

            <div style={{ flex: 1, fontSize: '0.88rem' }}>{toast.message}</div>

            <button
              onClick={() => onRemove(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
