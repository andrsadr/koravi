'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client } from '@/lib/types';
import { cn } from '@/lib/utils';
import { highlightText } from '@/lib/utils/highlightText';
import { getClientInitials, getAvatarBackgroundColor } from '@/lib/utils/avatarUtils';
import { AlertTriangle, Mail, Phone, Calendar } from 'lucide-react';

interface ClientListItemProps {
  client: Client;
  onClick: (client: Client) => void;
  searchQuery?: string;
}

export function ClientListItem({ client, onClick, searchQuery = '' }: ClientListItemProps) {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-400';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div 
      className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-accent/50 group"
      role="button"
      onClick={() => onClick(client)}
    >
      {/* Left section - Main info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={client.avatar_url || undefined} alt={`${client.first_name} ${client.last_name}`} />
            <AvatarFallback className={cn(
              'text-white font-medium text-sm',
              getAvatarBackgroundColor(client.first_name, client.last_name)
            )}>
              {getClientInitials(client.first_name, client.last_name)}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator overlay */}
          <div 
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
              getStatusColor(client.status)
            )}
            data-testid="status-indicator"
            title={`Status: ${client.status}`}
          />
        </div>
        
        {/* Name and contact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">
              {highlightText(`${client.first_name} ${client.last_name}`, searchQuery)}
            </h3>
            {client.alerts && (
              <div title={client.alerts}>
                <AlertTriangle 
                  className="w-4 h-4 text-amber-500 flex-shrink-0" 
                  data-testid="alert-indicator"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {client.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span className="truncate max-w-[200px]">
                  {highlightText(client.email, searchQuery)}
                </span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{highlightText(client.phone, searchQuery)}</span>
              </div>
            )}
            {client.last_visit && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Last visit: {formatDate(client.last_visit)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle section - Labels */}
      <div className="flex items-center gap-2 px-4">
        {client.labels && client.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {client.labels.slice(0, 3).map((label) => (
              <Badge 
                key={label} 
                variant="secondary" 
                className="text-xs"
              >
                {highlightText(label, searchQuery)}
              </Badge>
            ))}
            {client.labels.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{client.labels.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Right section - Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <div className="font-medium">{client.total_visits}</div>
          <div className="text-muted-foreground">visits</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{formatCurrency(client.lifetime_value)}</div>
          <div className="text-muted-foreground">lifetime</div>
        </div>
      </div>
    </div>
  );
}