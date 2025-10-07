import React, { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, XCircle, Clock, Play, AlertCircle, History, BarChart3, X, FileText, TrendingUp } from 'lucide-react'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [pipelines, setPipelines] = useState([])
  const [selectedPipeline, setSelectedPipeline] = useState(null)
  const [pipelineHistory, setPipelineHistory] = useState(null)
  const [taskLogs, setTaskLogs] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [showMetricsModal, setShowMetricsModal] = useState(false)
  const [selectedRun, setSelectedRun] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('pipelines') // 'pipelines' or 'metrics'

  useEffect(() => {
    fetchPipelines()
    const interval = setInterval(() => {
      fetchPipelines()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchPipelines = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/pipelines`)
      const data = await response.json()
      
      if (data.success) {
        setPipelines(data.pipelines)
      }
      setError(null)
    } catch (err) {
      setError('Failed to connect to backend. Make sure Flask is running on port 5000.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPipelineHistory = async (dagId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${dagId}/history`)
      const data = await response.json()
      
      if (data.success) {
        setPipelineHistory(data)
        setSelectedPipeline(pipelines.find(p => p.id === dagId))
        setShowHistoryModal(true)
      }
    } catch (err) {
      alert('Error fetching pipeline history')
      console.error(err)
    }
  }

  const fetchTaskLogs = async (dagId, runId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${dagId}/runs/${runId}/logs`)
      const data = await response.json()
      
      if (data.success) {
        setTaskLogs(data)
        setSelectedRun(runId)
        setShowLogsModal(true)
      }
    } catch (err) {
      alert('Error fetching task logs')
      console.error(err)
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metrics/overview`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data)
        setShowMetricsModal(true)
      }
    } catch (err) {
      alert('Error fetching metrics')
      console.error(err)
    }
  }

  const handleTriggerPipeline = async (dagId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${dagId}/trigger`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`Pipeline "${dagId}" triggered successfully!`)
        setTimeout(() => fetchPipelines(), 2000)
      } else {
        alert(`Failed to trigger pipeline: ${data.error}`)
      }
    } catch (err) {
      alert('Error triggering pipeline')
      console.error(err)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}m ${secs}s`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getStateColor = (state) => {
    const colors = {
      success: '#10b981',
      failed: '#ef4444',
      running: '#3b82f6',
      queued: '#f59e0b',
    }
    return colors[state] || '#6b7280'
  }

  const getStateIcon = (state) => {
    switch (state) {
      case 'success':
        return <CheckCircle size={20} style={{ color: '#10b981' }} />
      case 'failed':
        return <XCircle size={20} style={{ color: '#ef4444' }} />
      case 'running':
        return <Clock size={20} style={{ color: '#3b82f6' }} />
      default:
        return <AlertCircle size={20} style={{ color: '#f59e0b' }} />
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading pipelines...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>ETL Pipeline Dashboard</h1>
              <p style={{ color: '#6b7280', marginTop: '4px' }}>Monitor and manage your data pipelines</p>
            </div>
            <button
              onClick={fetchMetrics}
              style={{
                padding: '10px 20px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              <TrendingUp size={18} />
              View Metrics Dashboard
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} style={{ color: '#dc2626' }} />
              <p style={{ color: '#991b1b', fontWeight: '600' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Pipelines List */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Available Pipelines</h2>
            <button 
              onClick={fetchPipelines}
              style={{ 
                padding: '8px', 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer',
                borderRadius: '9999px'
              }}
            >
              <RefreshCw size={20} style={{ color: '#6b7280' }} />
            </button>
          </div>

          {pipelines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No pipelines found</p>
              <p style={{ fontSize: '14px' }}>Make sure Airflow is running and has DAGs configured</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {pipelines.map((pipeline) => (
                <div 
                  key={pipeline.id}
                  style={{ 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px', 
                    padding: '16px',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{pipeline.name}</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{pipeline.id}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '9999px', 
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: pipeline.is_paused ? '#fef3c7' : '#d1fae5',
                        color: pipeline.is_paused ? '#92400e' : '#065f46'
                      }}>
                        {pipeline.is_paused ? 'Paused' : 'Active'}
                      </span>
                      <button
                        onClick={() => fetchPipelineHistory(pipeline.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#6366f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                      >
                        <History size={16} />
                        History
                      </button>
                      <button
                        onClick={() => handleTriggerPipeline(pipeline.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                      >
                        <Play size={16} />
                        Run
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && pipelineHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {selectedPipeline?.name} - Execution History
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>{pipelineHistory.dag_id}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  padding: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '9999px'
                }}
              >
                <X size={24} style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Runs</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {pipelineHistory.statistics.total_runs}
                </p>
              </div>
              <div style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>Successful</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>
                  {pipelineHistory.statistics.success_count}
                </p>
              </div>
              <div style={{ backgroundColor: '#fee2e2', padding: '16px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Failed</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>
                  {pipelineHistory.statistics.failed_count}
                </p>
              </div>
              <div style={{ backgroundColor: '#dbeafe', padding: '16px', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>Success Rate</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                  {pipelineHistory.statistics.success_rate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Run History Table */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                Recent Runs
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Run ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Start Time</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Duration</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pipelineHistory.runs.map((run) => (
                      <tr key={run.run_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getStateIcon(run.state)}
                            <span style={{ 
                              fontSize: '14px', 
                              fontWeight: '500',
                              color: getStateColor(run.state)
                            }}>
                              {run.state}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#374151', fontFamily: 'monospace' }}>
                          {run.run_id.substring(0, 20)}...
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: run.run_type === 'manual' ? '#fef3c7' : '#e0e7ff',
                            color: run.run_type === 'manual' ? '#92400e' : '#3730a3'
                          }}>
                            {run.run_type}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                          {formatDate(run.start_date)}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                          {formatDuration(run.duration)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => {
                              fetchTaskLogs(pipelineHistory.dag_id, run.run_id)
                              setShowHistoryModal(false)
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FileText size={14} />
                            Logs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && taskLogs && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '1000px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  Task Logs - {taskLogs.dag_id}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px', fontFamily: 'monospace' }}>
                  Run ID: {selectedRun}
                </p>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                style={{
                  padding: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '9999px'
                }}
              >
                <X size={24} style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Task Logs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {taskLogs.tasks.map((task, index) => (
                <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {getStateIcon(task.state)}
                      <span style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>
                        {task.task_id}
                      </span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        Duration: {formatDuration(task.duration)}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600',
                      color: getStateColor(task.state)
                    }}>
                      {task.state}
                    </span>
                  </div>
                  <div style={{ 
                    padding: '16px',
                    backgroundColor: '#1f2937',
                    color: '#d1d5db',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    maxHeight: '300px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {task.logs || 'No logs available'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Dashboard Modal */}
      {showMetricsModal && metrics && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '1100px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>
                  📊 Metrics Dashboard
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Overall performance metrics across all pipelines
                </p>
              </div>
              <button
                onClick={() => setShowMetricsModal(false)}
                style={{
                  padding: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '9999px'
                }}
              >
                <X size={24} style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Overall Statistics */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Overall Statistics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: '#ede9fe', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#6b21a8', marginBottom: '8px', fontWeight: '600' }}>
                    Total Pipelines
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b21a8' }}>
                    {metrics.overview.total_pipelines}
                  </p>
                </div>
                <div style={{ backgroundColor: '#d1fae5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '8px', fontWeight: '600' }}>
                    Active Pipelines
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#065f46' }}>
                    {metrics.overview.active_pipelines}
                  </p>
                </div>
                <div style={{ backgroundColor: '#dbeafe', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '8px', fontWeight: '600' }}>
                    Total Runs
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>
                    {metrics.overview.total_runs}
                  </p>
                </div>
                <div style={{ backgroundColor: '#dcfce7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#166534', marginBottom: '8px', fontWeight: '600' }}>
                    Successful
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534' }}>
                    {metrics.overview.success_count}
                  </p>
                </div>
                <div style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px', fontWeight: '600' }}>
                    Failed
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#991b1b' }}>
                    {metrics.overview.failed_count}
                  </p>
                </div>
                <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px', fontWeight: '600' }}>
                    Success Rate
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e' }}>
                    {metrics.overview.success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Per-Pipeline Metrics */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                Pipeline Performance
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        Pipeline
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        Total Runs
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        Success
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        Failed
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        Success Rate
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        Avg Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.pipeline_metrics.map((pipeline, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                              {pipeline.pipeline_name}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                              {pipeline.pipeline_id}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                          {pipeline.total_runs}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: '#dcfce7',
                            color: '#166534'
                          }}>
                            {pipeline.success_count}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b'
                          }}>
                            {pipeline.failed_count}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '100px', 
                              height: '8px', 
                              backgroundColor: '#e5e7eb', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${pipeline.success_rate}%`,
                                height: '100%',
                                backgroundColor: pipeline.success_rate >= 80 ? '#10b981' : pipeline.success_rate >= 50 ? '#f59e0b' : '#ef4444',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                            <span style={{ 
                              fontSize: '14px', 
                              fontWeight: '600',
                              color: pipeline.success_rate >= 80 ? '#10b981' : pipeline.success_rate >= 50 ? '#f59e0b' : '#ef4444'
                            }}>
                              {pipeline.success_rate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                          {formatDuration(pipeline.avg_duration)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Insights */}
            <div style={{ marginTop: '32px', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#166534', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} />
                Performance Insights
              </h3>
              <ul style={{ marginLeft: '20px', color: '#166534' }}>
                {metrics.overview.success_rate >= 90 && (
                  <li style={{ marginBottom: '8px' }}>
                    🎉 Excellent overall success rate of {metrics.overview.success_rate.toFixed(1)}%
                  </li>
                )}
                {metrics.overview.success_rate < 70 && (
                  <li style={{ marginBottom: '8px' }}>
                    ⚠️ Success rate is below 70%. Consider reviewing failed pipelines.
                  </li>
                )}
                <li style={{ marginBottom: '8px' }}>
                  📈 Total of {metrics.overview.total_runs} pipeline runs executed
                </li>
                {metrics.overview.failed_count > 0 && (
                  <li style={{ marginBottom: '8px' }}>
                    🔍 {metrics.overview.failed_count} failed runs require attention
                  </li>
                )}
                {metrics.overview.running_count > 0 && (
                  <li style={{ marginBottom: '8px' }}>
                    ⏳ {metrics.overview.running_count} pipeline(s) currently running
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default App