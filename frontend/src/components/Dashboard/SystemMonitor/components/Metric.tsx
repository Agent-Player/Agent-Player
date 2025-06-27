import React from 'react';
import { Typography, Spin } from 'antd';
import type { MetricProps } from '../types';

const { Text } = Typography;

export const Metric: React.FC<MetricProps> = ({
    label,
    value,
    unit,
    status = 'info',
    icon,
    loading = false
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return '#52c41a';
            case 'warning':
                return '#faad14';
            case 'error':
                return '#f5222d';
            default:
                return '#1890ff';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#8c8c8c',
                fontSize: '14px'
            }}>
                {icon}
                <Text type="secondary">{label}</Text>
            </div>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: getStatusColor(status)
            }}>
                {loading ? (
                    <Spin size="small" />
                ) : (
                    <div style={{ 
                        fontSize: '16px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {typeof value === 'string' || typeof value === 'number' ? (
                            <>
                                {value}
                                {unit && <Text type="secondary" style={{ fontSize: '12px' }}>{unit}</Text>}
                            </>
                        ) : (
                            value
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}; 