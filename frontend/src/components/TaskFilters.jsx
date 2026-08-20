import React from 'react';
import { Search, X, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';

const TaskFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onResetFilters
}) => {
  const statusOptions = ['All', 'Todo', 'In Progress', 'Done'];
  const priorityOptions = ['All', 'Low', 'Medium', 'High'];

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All';

  return (
    <div
      className="glass-card"
      style={{
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Top Search & Reset Row */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)'
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '42px', paddingRight: search ? '36px' : '14px' }}
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Priority Filter Select */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--primary-light)', padding: '8px 12px' }}
            title="Reset all filters"
          >
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Status Filter Tabs Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        <span
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-dim)',
            fontWeight: 600,
            marginRight: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Status:
        </span>
        {statusOptions.map((opt) => {
          const isSelected = statusFilter === opt;
          return (
            <button
              key={opt}
              onClick={() => onStatusFilterChange(opt)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isSelected
                  ? '1px solid var(--primary-light)'
                  : '1px solid var(--border-subtle)',
                background: isSelected
                  ? 'var(--primary-gradient-subtle)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? '#fff' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap'
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskFilters;
