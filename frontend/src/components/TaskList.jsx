import React from 'react';
import TaskCard from './TaskCard';
import { ListPlus, CheckSquare, Sparkles } from 'lucide-react';

const TaskList = ({
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  onNewTask,
  hasActiveFilters = false,
  onResetFilters
}) => {
  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: '24px',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  height: '20px',
                  width: '70%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '10px',
                  animation: 'pulse 1.5s infinite'
                }}
              />
              <div
                style={{
                  height: '14px',
                  width: '90%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            </div>
            <div
              style={{
                height: '24px',
                width: '40%',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 'var(--radius-full)',
                marginTop: '16px'
              }}
            />
          </div>
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.25; }
          }
        `}</style>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '260px'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--primary-gradient-subtle)',
            color: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px'
          }}
        >
          <CheckSquare size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
          {hasActiveFilters ? 'No Tasks Found' : 'No Tasks Yet'}
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '24px', fontSize: '0.92rem' }}>
          {hasActiveFilters
            ? 'No tasks match your current search and filter criteria.'
            : 'You have not created any tasks yet. Get started by creating your first task!'}
        </p>

        {hasActiveFilters && onResetFilters ? (
          <button onClick={onResetFilters} className="btn btn-secondary">
            <span>Clear Filters & Search</span>
          </button>
        ) : (
          <button onClick={onNewTask} className="btn btn-primary">
            <ListPlus size={18} />
            <span>Create First Task</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '18px'
      }}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskList;
