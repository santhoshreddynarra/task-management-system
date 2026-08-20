import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  const { page = 1, limit = 12, totalTasks = 0, totalPages = 0 } = pagination || {};

  if (totalTasks === 0) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = totalTasks > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, totalTasks);
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages || totalPages === 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '28px',
        paddingTop: '20px',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '16px'
      }}
    >
      {/* Showing X to Y of Z tasks & Limit selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{startItem}</strong>-
          <strong style={{ color: 'var(--text-main)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: 'var(--text-main)' }}>{totalTasks}</strong> tasks
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="per-page-select" style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            Per page:
          </label>
          <select
            id="per-page-select"
            className="form-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{ padding: '4px 8px', fontSize: '0.82rem', width: 'auto' }}
            aria-label="Tasks per page"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {/* Page Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={isFirstPage}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 10px',
            opacity: isFirstPage ? 0.45 : 1,
            cursor: isFirstPage ? 'not-allowed' : 'pointer'
          }}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '4px 8px',
                  color: 'var(--text-dim)',
                  fontSize: '0.85rem'
                }}
              >
                ...
              </span>
            );
          }

          const isCurrent = p === page;
          return (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              style={{
                minWidth: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isCurrent
                  ? '1px solid var(--primary-light)'
                  : '1px solid var(--border-subtle)',
                background: isCurrent
                  ? 'var(--primary-gradient-subtle)'
                  : 'rgba(255, 255, 255, 0.04)',
                color: isCurrent ? '#fff' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={isLastPage}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 10px',
            opacity: isLastPage ? 0.45 : 1,
            cursor: isLastPage ? 'not-allowed' : 'pointer'
          }}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
