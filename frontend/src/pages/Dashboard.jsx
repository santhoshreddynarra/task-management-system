import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, CheckSquare } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      <header
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-gradient-subtle)',
              color: 'var(--primary-light)'
            }}
          >
            <CheckSquare size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            TaskFlow
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Hello, <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong>
          </span>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main>
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <h2>Welcome to TaskFlow Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Authentication and route protection verified.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
