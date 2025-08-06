'use client';

import { useEffect, useState } from 'react';
import { healthCheck, ConnectionStatus as ConnectionStatusType } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
  showAlert?: boolean;
  onRetry?: () => void;
}

export default function ConnectionStatus({ 
  className = '', 
  showAlert = false,
  onRetry 
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<{
    status: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
    details: ConnectionStatusType | null;
  }>({
    status: 'checking',
    details: null
  });
  const [isOnline, setIsOnline] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

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

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkStatus();
    onRetry?.();
    setIsRetrying(false);
  };

  useEffect(() => {
    // Check online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    setIsOnline(navigator.onLine);
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600 bg-red-50 border-red-200';
    
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
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    
    switch (status.status) {
      case 'healthy':
        return <Wifi className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy':
        return <WifiOff className="h-4 w-4" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (status.status) {
      case 'healthy':
        return 'Connected';
      case 'degraded':
        return 'Limited Connection';
      case 'unhealthy':
        return 'Connection Failed';
      case 'checking':
        return 'Connecting...';
      default:
        return 'Unknown Status';
    }
  };

  const shouldShowAlert = showAlert && (!isOnline || status.status === 'unhealthy');

  if (shouldShowAlert) {
    return (
      <Alert variant="destructive" className={className}>
        {getStatusIcon()}
        <AlertTitle>
          {!isOnline ? 'You are offline' : 'Database connection failed'}
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            {!isOnline 
              ? 'Some features may not work properly while offline.'
              : 'Unable to connect to the database. Please check your connection and try again.'
            }
          </span>
          {isOnline && (
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              variant="outline" 
              size="sm"
              className="ml-2"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Retry'
              )}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {status.details?.message && status.status !== 'healthy' && (
        <span className="text-xs opacity-75 ml-1">
          ({status.details.message})
        </span>
      )}
    </div>
  );
}