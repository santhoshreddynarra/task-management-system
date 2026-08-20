import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'var(--bg-primary)'
          }}
        >
          <div
            className="glass-card"
            style={{
              padding: '40px 32px',
              maxWidth: '480px',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
              An unexpected UI error occurred. Please try reloading the application.
            </p>

            <button onClick={this.handleReset} className="btn btn-primary" style={{ width: '100%' }}>
              <RefreshCw size={16} />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
