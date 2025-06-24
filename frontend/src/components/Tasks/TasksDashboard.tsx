import React, { useState, useEffect } from 'react';
import { TasksService } from '../../services/tasks';
import type { Task, TaskStatus, TaskPriority } from '../../services/tasks';
import './Tasks.css';

interface TasksDashboardProps {
  className?: string;
}

const tasksService = new TasksService();

export const TasksDashboard: React.FC<TasksDashboardProps> = ({
  className = ''
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, analyticsData, myTasks] = await Promise.all([
        tasksService.getTasks({ limit: 100 }),
        tasksService.getAnalytics('30'),
        tasksService.getMyTasks({ limit: 50 })
      ]);
      
      setTasks(myTasks.data.tasks || tasksData.tasks);
      setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Failed to load tasks data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await tasksService.updateTaskStatus(taskId, newStatus);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleProgressUpdate = async (taskId: number, progress: number) => {
    try {
      await tasksService.updateTaskProgress(taskId, progress);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, progress } : task
      ));
    } catch (error) {
      console.error('Failed to update task progress:', error);
    }
  };

  const handleTaskAssignment = async (taskId: number, assignmentData: any) => {
    try {
      await tasksService.assignTask(taskId, assignmentData);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign task:', error);
    }
  };

  const handleViewDetails = (taskId: number) => {
    window.location.href = `/tasks/${taskId}`;
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b35';
      case 'medium': return '#ffa502';
      case 'low': return '#26de81';
      default: return '#a4b0be';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return '#a4b0be';
      case 'in_progress': return '#3742fa';
      case 'under_review': return '#f39c12';
      case 'completed': return '#2ed573';
      case 'cancelled': return '#ff4757';
      case 'on_hold': return '#ff7675';
      default: return '#a4b0be';
    }
  };

  if (loading) {
    return (
      <div className={`tasks-dashboard ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`tasks-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Task Management</h1>
          <p>Organize and track your team's work efficiently</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="icon-plus"></i>
          Create Task
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-tasks"></i>
            </div>
            <div className="card-content">
              <h3>{analytics.total_tasks || 0}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-progress"></i>
            </div>
            <div className="card-content">
              <h3>{analytics.in_progress_tasks || 0}</h3>
              <p>In Progress</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-completed"></i>
            </div>
            <div className="card-content">
              <h3>{analytics.completed_tasks || 0}</h3>
              <p>Completed</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="card-icon">
              <i className="icon-percentage"></i>
            </div>
            <div className="card-content">
              <h3>{analytics.completion_rate ? Math.round(analytics.completion_rate * 100) : 0}%</h3>
              <p>Completion Rate</p>
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
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
            className="priority-filter"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <i className="icon-tasks-empty"></i>
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <div className="task-title">
                    <h4>{task.title}</h4>
                    <div className="task-badges">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="task-actions">
                    <button
                      className="btn btn-icon"
                      onClick={() => handleViewDetails(task.id)}
                      title="View Details"
                    >
                      <i className="icon-eye"></i>
                    </button>
                  </div>
                </div>
                
                <p className="task-description">
                  {task.description || 'No description provided'}
                </p>
                
                <div className="task-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{task.progress}%</span>
                </div>
                
                <div className="task-meta">
                  <div className="task-assignment">
                    {task.assigned_to_user_id && (
                      <div className="assigned-user">
                        <i className="icon-user"></i>
                        <span>Assigned to User {task.assigned_to_user_id}</span>
                      </div>
                    )}
                    {task.assigned_to_agent_id && (
                      <div className="assigned-agent">
                        <i className="icon-robot"></i>
                        <span>Assigned to Agent {task.assigned_to_agent_id}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="task-dates">
                    {task.due_date && (
                      <div className="due-date">
                        <i className="icon-calendar"></i>
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="created-date">
                      <i className="icon-clock"></i>
                      <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="task-tags">
                  {task.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="task-footer">
                  <div className="status-controls">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="status-selector"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="under_review">Under Review</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  
                  <div className="progress-controls">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => handleProgressUpdate(task.id, Number(e.target.value))}
                      className="progress-slider"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 