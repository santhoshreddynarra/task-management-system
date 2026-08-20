import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskAnalytics from '../components/TaskAnalytics';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import Toast from '../components/Toast';
import api from '../services/api';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionPercentage: 0
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

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
      const res = await api.get('/tasks');
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err.message);
      addToast(err.message || 'Failed to load tasks', 'error');
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    fetchTasks();
  }, [fetchAnalytics, fetchTasks]);

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

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px 48px' }}>
      <Navbar onNewTask={handleOpenCreateModal} />

      {/* Analytics Overview Cards */}
      <TaskAnalytics analytics={analytics} loading={loadingAnalytics} />

      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>My Tasks</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Manage, track, and organize your work items
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Task List Grid */}
      <TaskList
        tasks={tasks}
        loading={loadingTasks}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        onNewTask={handleOpenCreateModal}
      />

      {/* Task Modal (Create / Edit) */}
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
