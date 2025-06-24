import React, { useState, useEffect } from 'react';
import { trainingLabService } from '../../services';
import type { TrainingWorkspace, TrainingAnalytics } from '../../types/trainingLab';
import './TrainingLab.css';

interface TrainingLabDashboardProps {
  className?: string;
}

export const TrainingLabDashboard: React.FC<TrainingLabDashboardProps> = ({
  className = ''
}) => {
  const [workspaces, setWorkspaces] = useState<TrainingWorkspace[]>([]);
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workspacesData, analyticsData] = await Promise.all([
        trainingLabService.getWorkspaces({ limit: 50 }),
        trainingLabService.getAnalytics('30')
      ]);
      
      setWorkspaces(workspacesData.data.workspaces);
      setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Failed to load training lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workspace.training_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateWorkspace = () => {
    // Navigate to create workspace page or open modal
    window.location.href = '/training-lab/create';
  };

  const handleEditWorkspace = (workspaceId: number) => {
    window.location.href = `/training-lab/workspace/${workspaceId}`;
  };

  const handleTestWorkspace = async (workspaceId: number) => {
    try {
      const testResult = await trainingLabService.testWorkspace(workspaceId, {
        test_scenarios: [
          {
            input: "Hello, I need help with my order",
            expected_output: "Professional customer service response"
          }
        ],
        llm_config_id: 1,
        evaluation_mode: "automatic"
      });
      
      console.log('Test results:', testResult);
      // Show test results in modal or navigate to results page
    } catch (error) {
      console.error('Failed to test workspace:', error);
    }
  };

  if (loading) {
    return (
      <div className={`training-lab-dashboard ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Training Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`training-lab-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Training Lab</h1>
          <p>Train and optimize your AI agents with advanced scenarios</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleCreateWorkspace}
        >
          <i className="icon-plus"></i>
          Create Workspace
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-workspace"></i>
            </div>
            <div className="card-content">
              <h3>{analytics.total_workspaces}</h3>
              <p>Total Workspaces</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-play"></i>
            </div>
            <div className="card-content">
              <h3>{analytics.completed_sessions}</h3>
              <p>Training Sessions</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-chart"></i>
            </div>
            <div className="card-content">
              <h3>{(analytics.success_rate * 100).toFixed(1)}%</h3>
              <p>Success Rate</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-clock"></i>
            </div>
            <div className="card-content">
              <h3>{Math.round(analytics.average_session_duration / 60)}m</h3>
              <p>Avg Duration</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="icon-search"></i>
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Workspaces Grid */}
      <div className="workspaces-grid">
        {filteredWorkspaces.length === 0 ? (
          <div className="empty-state">
            <i className="icon-workspace-empty"></i>
            <h3>No workspaces found</h3>
            <p>Create your first training workspace to get started</p>
            <button 
              className="btn btn-primary"
              onClick={handleCreateWorkspace}
            >
              Create Workspace
            </button>
          </div>
        ) : (
          filteredWorkspaces.map(workspace => (
            <div key={workspace.id} className="workspace-card">
              <div className="workspace-header">
                <h4>{workspace.name}</h4>
                <div className={`status-badge status-${workspace.training_status}`}>
                  {workspace.training_status}
                </div>
              </div>
              
              <p className="workspace-description">
                {workspace.description || 'No description provided'}
              </p>
              
              <div className="workspace-tags">
                {workspace.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="workspace-meta">
                <span className="version">v{workspace.version}</span>
                <span className="date">
                  {new Date(workspace.updated_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="workspace-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => handleEditWorkspace(workspace.id)}
                >
                  <i className="icon-edit"></i>
                  Edit
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleTestWorkspace(workspace.id)}
                >
                  <i className="icon-test"></i>
                  Test
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 