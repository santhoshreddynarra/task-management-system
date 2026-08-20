import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp, Sparkles } from 'lucide-react';

const TaskAnalytics = ({ analytics, loading }) => {
  const {
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    completionPercentage = 0
  } = analytics || {};

  const cards = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.12)',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      subtitle: 'All tracked tasks'
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      subtitle: `${completionPercentage}% resolution rate`
    },
    {
      title: 'Pending',
      value: pendingTasks,
      icon: Clock,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      subtitle: 'Needs action'
    },
    {
      title: 'Completion Rate',
      value: `${completionPercentage}%`,
      icon: TrendingUp,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.12)',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      subtitle: `${completedTasks} of ${totalTasks} completed`,
      isProgress: true
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card"
            style={{
              padding: '22px 24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '135px'
            }}
          >
            {/* Header row: Icon & Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {card.title}
                </span>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text-main)',
                    marginTop: '4px',
                    lineHeight: 1.1
                  }}
                >
                  {loading ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '50px',
                        height: '28px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 'var(--radius-sm)',
                        animation: 'pulse 1.5s infinite'
                      }}
                    />
                  ) : (
                    card.value
                  )}
                </div>
              </div>

              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: card.bgColor,
                  border: `1px solid ${card.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color
                }}
              >
                <Icon size={22} />
              </div>
            </div>

            {/* Bottom row: Subtitle or Progress Bar */}
            <div style={{ marginTop: '14px' }}>
              {card.isProgress ? (
                <div>
                  <div
                    style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginBottom: '6px'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, Math.max(0, completionPercentage))}%`,
                        background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {card.subtitle}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {card.subtitle}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskAnalytics;
