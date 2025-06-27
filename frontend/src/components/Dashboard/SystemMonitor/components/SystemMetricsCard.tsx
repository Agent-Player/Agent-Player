import React from 'react';
import { Card, Spin } from 'antd';
import { SystemMetricsCardProps } from '../types';

export const SystemMetricsCard: React.FC<SystemMetricsCardProps> = ({
    title,
    icon,
    children,
    loading = false,
    error = null
}) => {
    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {icon}
                    <span>{title}</span>
                </div>
            }
            style={{ height: '100%' }}
            bodyStyle={{ padding: '12px' }}
        >
            {loading ? (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%',
                    minHeight: '100px'
                }}>
                    <Spin />
                </div>
            ) : error ? (
                <div style={{
                    color: '#ff4d4f',
                    textAlign: 'center',
                    padding: '16px'
                }}>
                    {error}
                </div>
            ) : children}
        </Card>
    );
}; 