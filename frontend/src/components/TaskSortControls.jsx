import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' }
];

const TaskSortControls = ({ sortBy, sortOrder, onSortByChange, onSortOrderChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}
    >
      <span
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-dim)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <ArrowUpDown size={14} />
        Sort:
      </span>

      <select
        id="sort-by-select"
        className="form-select"
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        style={{ padding: '6px 10px', fontSize: '0.84rem', width: 'auto' }}
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="btn btn-secondary btn-sm"
        style={{ padding: '6px 12px', gap: '5px' }}
        title={`Currently: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
        aria-label={`Sort order: ${sortOrder}`}
      >
        {sortOrder === 'asc' ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
        <span style={{ fontSize: '0.83rem' }}>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
      </button>
    </div>
  );
};

export default TaskSortControls;
