import React from 'react';
import { Spin, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { SystemMonitor } from '../../../components/Dashboard/SystemMonitor';

const iconStyle = {
  fontSize: '20px',
  color: '#1890ff',
  onPointerEnterCapture: () => {},
  onPointerLeaveCapture: () => {}
};

const SystemMonitorTab: React.FC = () => {
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLoadMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/system/health');
      const data = await response.json();
      if (data.success) {
        setIsFirstLoad(false);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      minHeight: '500px',
    }}>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span>🖥️</span>
        System Monitor
      </h2>
      
      {isFirstLoad ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <Button 
            type="primary" 
            size="large"
            icon={<ReloadOutlined {...iconStyle} />}
            onClick={handleLoadMetrics}
            loading={isLoading}
          >
            Load System Metrics
          </Button>
          <div style={{
            fontSize: '14px',
            color: '#666',
            maxWidth: '400px',
          }}>
            <p style={{ margin: 0 }}>
              Click to load current system metrics and monitor your system's performance
            </p>
          </div>
        </div>
      ) : (
        <SystemMonitor />
      )}

      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          zIndex: 1000,
        }}>
          <Spin size="large" />
          <div style={{
            fontSize: '16px',
            color: '#666',
            maxWidth: '400px',
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              Scanning system information...
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
              Please wait while we gather all metrics
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitorTab; 