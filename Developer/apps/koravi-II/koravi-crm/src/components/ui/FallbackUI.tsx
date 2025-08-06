"use client"

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { RefreshCw, Database, AlertTriangle, Wifi } from 'lucide-react';

interface FallbackUIProps {
  type: 'database' | 'network' | 'loading' | 'empty';
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  children?: React.ReactNode;
}

export function FallbackUI({
  type,
  title,
  message,
  onRetry,
  isRetrying = false,
  children
}: FallbackUIProps) {
  const getIcon = () => {
    switch (type) {
      case 'database':
        return <Database className="h-8 w-8 text-muted-foreground" />;
      case 'network':
        return <Wifi className="h-8 w-8 text-muted-foreground" />;
      case 'loading':
        return <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />;
      case 'empty':
        return <AlertTriangle className="h-8 w-8 text-muted-foreground" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'database':
        return 'Database Unavailable';
      case 'network':
        return 'Network Error';
      case 'loading':
        return 'Loading...';
      case 'empty':
        return 'No Data Available';
      default:
        return 'Something went wrong';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'database':
        return 'Unable to connect to the database. Please check your connection and try again.';
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'loading':
        return 'Please wait while we load your data.';
      case 'empty':
        return 'There is no data to display at the moment.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-lg">
            {title || getDefaultTitle()}
          </CardTitle>
          <CardDescription>
            {message || getDefaultMessage()}
          </CardDescription>
        </CardHeader>
        
        {(onRetry || children) && (
          <CardContent className="text-center space-y-4">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                disabled={isRetrying}
                variant="outline"
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            )}
            {children}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Specific fallback components for common scenarios
export function DatabaseFallback({ onRetry, isRetrying }: { 
  onRetry?: () => void; 
  isRetrying?: boolean; 
}) {
  return (
    <FallbackUI
      type="database"
      title="Database Connection Failed"
      message="We're having trouble connecting to the database. This might be a temporary issue."
      onRetry={onRetry}
      isRetrying={isRetrying}
    >
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Working Offline</AlertTitle>
        <AlertDescription>
          Some features may be limited while the database is unavailable.
        </AlertDescription>
      </Alert>
    </FallbackUI>
  );
}

export function NetworkFallback({ onRetry, isRetrying }: { 
  onRetry?: () => void; 
  isRetrying?: boolean; 
}) {
  return (
    <FallbackUI
      type="network"
      title="No Internet Connection"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}

export function LoadingFallback({ message }: { message?: string }) {
  return (
    <FallbackUI
      type="loading"
      title="Loading"
      message={message || "Please wait while we load your data..."}
    />
  );
}

export function EmptyStateFallback({ 
  title, 
  message, 
  action 
}: { 
  title?: string; 
  message?: string; 
  action?: React.ReactNode; 
}) {
  return (
    <FallbackUI
      type="empty"
      title={title || "No Data Found"}
      message={message || "There's nothing to display here yet."}
    >
      {action}
    </FallbackUI>
  );
}