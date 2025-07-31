'use client';

import { useEffect, useState } from 'react';
import { healthCheck, ConnectionStatus as ConnectionStatusType } from '@/lib/supabase';

interface ConnectionStatusProps {
  className?: string;
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [status, setStatus] = useState<{
    status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
    details: ConnectionStatusType | null;
  }>({
    status: 'checking',
    details: null
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await healthCheck();
        setStatus(result);
      } catch (error) {
        setStatus({
          status: 'unhealthy',
          details: {
            connected: false,
            error,
            message: 'Failed to check connection status'
          }
        });
      }
    };

    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'unhealthy':
        return '❌';
      case 'checking':
        return '🔄';
      default:
        return '❓';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'healthy':
        return 'Database Connected';
      case 'degraded':
        return 'Database Connected (Setup Required)';
      case 'unhealthy':
        return 'Database Connection Failed';
      case 'checking':
        return 'Checking Connection...';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()} ${className}`}>
      <span className="text-base">{getStatusIcon()}</span>
      <span>{getStatusText()}</span>
      {status.details?.message && (
        <span className="text-xs opacity-75">
          ({status.details.message})
        </span>
      )}
    </div>
  );
}