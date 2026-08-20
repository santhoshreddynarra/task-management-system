import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

const Navbar = ({ onNewTask }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header
      className="glass-card"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 28px',
        marginBottom: '28px',
        position: 'sticky',
        top: '16px',
        zIndex: 100
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-gradient)',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <CheckSquare size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              TaskFlow
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary-gradient-subtle)',
                color: 'var(--primary-light)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontWeight: 600
              }}
            >
              PRO
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '-2px' }}>
            Task Management System
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* User Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px 6px 8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem'
            }}
          >
            {getInitials(user?.name)}
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign out of TaskFlow"
          style={{ height: '38px', borderRadius: 'var(--radius-md)' }}
        >
          <LogOut size={16} />
          <span className="hide-mobile">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
