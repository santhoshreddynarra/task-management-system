import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskAnalytics from '../components/TaskAnalytics';
import TaskFilters from '../components/TaskFilters';
import TaskSortControls from '../components/TaskSortControls';
import TaskList from '../components/TaskList';
import Pagination from '../components/Pagination';
import TaskModal from '../components/TaskModal';
import Toast from '../components/Toast';
import api from '../services/api';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalTasks: 0, totalPages: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionPercentage: 0
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Sort State
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  // Debounce search (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const res = await api.get('/tasks/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch task analytics:', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      const params = {};

      const trimmedSearch = debouncedSearch.trim();
      if (trimmedSearch) params.search = trimmedSearch;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter && priorityFilter !== 'All') params.priority = priorityFilter;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks || []);
      const paginationData = res.data.pagination || res.data;
      setPagination({
        page: paginationData.page || page,
        limit: paginationData.limit || limit,
        totalTasks: paginationData.totalTasks || 0,
        totalPages: paginationData.totalPages || 0
      });
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message);
      addToast(err.message || 'Failed to load tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, sortBy, sortOrder, page, limit]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Handler functions that maintain synchronized query state
  const handleSearchChange = (value) => {
    setSearch(value);
    if (!value.trim()) {
      setDebouncedSearch('');
      setPage(1);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handlePriorityFilterChange = (newPriority) => {
    setPriorityFilter(newPriority);
    setPage(1);
  };

  const handleSortByChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handleSortOrderChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && (pagination.totalPages === 0 || newPage <= pagination.totalPages)) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Create or Update Task
  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) {
        await api.put(`/tasks/${taskId}`, taskData);
        addToast('Task updated successfully');
      } else {
        await api.post('/tasks', taskData);
        addToast('New task created successfully');
      }
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      throw err;
    }
  };

  // Quick Status Toggle
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      addToast(`Task marked as ${newStatus}`);
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      addToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      addToast('Task deleted successfully');
      fetchTasks();
      fetchAnalytics();
    } catch (err) {
      addToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleOpenCreateModal = () => { setEditingTask(null); setIsModalOpen(true); };
  const handleOpenEditModal = (task) => { setEditingTask(task); setIsModalOpen(true); };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px 48px' }}>
      <Navbar onNewTask={handleOpenCreateModal} />

      {/* Analytics Overview */}
      <TaskAnalytics analytics={analytics} loading={loadingAnalytics} />

      {/* Search & Filter Controls */}
      <TaskFilters
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={handlePriorityFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Action Header: Title + Sort + New Task */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>My Tasks</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {pagination.totalTasks > 0
              ? `${pagination.totalTasks} task${pagination.totalTasks !== 1 ? 's' : ''} found`
              : 'Manage, track, and organize your work items'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <TaskSortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={handleSortByChange}
            onSortOrderChange={handleSortOrderChange}
          />

          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Task Grid */}
      <TaskList
        tasks={tasks}
        loading={loadingTasks}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        onNewTask={handleOpenCreateModal}
        hasActiveFilters={
          search.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All'
        }
        onResetFilters={handleResetFilters}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Dashboard;
