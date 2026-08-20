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
      setPage(1); // Reset to first page on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page on filter/sort change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, sortBy, sortOrder]);

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
      const params = { page, limit, sortBy, sortOrder };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks || []);
      setPagination({
        page: res.data.page || page,
        limit: res.data.limit || limit,
        totalTasks: res.data.totalTasks || 0,
        totalPages: res.data.totalPages || 0
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

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const handlePageChange = (newPage) => setPage(newPage);
  const handleLimitChange = (newLimit) => { setLimit(newLimit); setPage(1); };

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
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
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
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
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
