import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Pencil,
  Trash2,
  AlertCircle
} from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isDone = task.status === 'Done';
  const isInProgress = task.status === 'In Progress';

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });

    let urgency = 'normal';
    let label = formatted;

    if (diffDays < 0 && !isDone) {
      urgency = 'overdue';
      label = `Overdue (${formatted})`;
    } else if (diffDays === 0 && !isDone) {
      urgency = 'today';
      label = 'Due Today';
    } else if (diffDays === 1 && !isDone) {
      urgency = 'tomorrow';
      label = 'Due Tomorrow';
    }

    return { label, urgency };
  };

  const dueInfo = formatDueDate(task.dueDate);

  const handleNextStatus = () => {
    let nextStatus = 'Todo';
    if (task.status === 'Todo') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Done';
    else nextStatus = 'Todo';
    onStatusChange(task._id, nextStatus);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'badge-high';
      case 'Low':
        return 'badge-low';
      case 'Medium':
      default:
        return 'badge-medium';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Done':
        return 'badge-done';
      case 'In Progress':
        return 'badge-in-progress';
      case 'Todo':
      default:
        return 'badge-todo';
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        opacity: isDone ? 0.78 : 1,
        borderLeft: isDone
          ? '4px solid var(--done-color)'
          : isInProgress
          ? '4px solid var(--in-prog-color)'
          : '4px solid var(--primary-light)',
        transition: 'all var(--transition-normal)'
      }}
    >
      {/* Top Section: Status checkbox & Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Quick Toggle Button */}
          <button
            onClick={handleNextStatus}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isDone
                ? 'var(--done-color)'
                : isInProgress
                ? 'var(--in-prog-color)'
                : 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              marginTop: '1px',
              transition: 'color var(--transition-fast)'
            }}
            title={`Status: ${task.status}. Click to advance.`}
            aria-label={`Change status from ${task.status}`}
          >
            {isDone ? (
              <CheckCircle2 size={20} />
            ) : isInProgress ? (
              <Clock size={20} />
            ) : (
              <Circle size={20} />
            )}
          </button>

          {/* Title & Description */}
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                textDecoration: isDone ? 'line-through' : 'none',
                lineHeight: 1.35,
                wordBreak: 'break-word'
              }}
            >
              {task.title}
            </h4>

            {task.description && (
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  marginTop: '6px',
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line'
                }}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Metadata & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        {/* Badges & Due Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className={`badge ${getStatusBadgeClass(task.status)}`}>
            {task.status}
          </span>
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority}
          </span>

          {dueInfo && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: 500,
                color:
                  dueInfo.urgency === 'overdue'
                    ? '#f87171'
                    : dueInfo.urgency === 'today'
                    ? '#fbbf24'
                    : 'var(--text-dim)',
                background:
                  dueInfo.urgency === 'overdue'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : dueInfo.urgency === 'today'
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'transparent',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <Calendar size={13} />
              <span>{dueInfo.label}</span>
            </div>
          )}
        </div>

        {/* Edit & Delete Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => onEdit(task)}
            className="btn btn-ghost btn-sm btn-icon"
            title="Edit task"
            aria-label="Edit task"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="btn btn-ghost btn-sm btn-icon"
            style={{ color: '#f87171' }}
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
