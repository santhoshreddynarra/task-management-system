import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskAnalytics from '../components/TaskAnalytics';
import api from '../services/api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionPercentage: 0
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

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

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px 48px' }}>
      {/* Top Navigation */}
      <Navbar />

      {/* Analytics Overview Cards */}
      <TaskAnalytics analytics={analytics} loading={loadingAnalytics} />

      {/* Main Content Area Placeholder for Task Management */}
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
        <h3 style={{ marginBottom: '8px' }}>Task Management Board</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Real-time analytics and statistics enabled.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
