'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client } from '@/lib/types';
import { cn } from '@/lib/utils';
import { highlightText } from '@/lib/utils/highlightText';
import { getClientInitials, getAvatarBackgroundColor } from '@/lib/utils/avatarUtils';
import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClientCardProps {
  client: Client;
  onClick: (client: Client) => void;
  searchQuery?: string;
}

export function ClientCard({ client, onClick, searchQuery = '' }: ClientCardProps) {
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

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg group border-border/50 hover:border-border h-full"
        role="button"
        onClick={() => onClick(client)}
      >
      <CardContent className="px-4 py-3 h-full flex flex-col">
        {/* Avatar and Status */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={client.avatar_url || undefined} alt={`${client.first_name} ${client.last_name}`} />
              <AvatarFallback className={cn(
                'text-white font-medium text-lg',
                getAvatarBackgroundColor(client.first_name, client.last_name)
              )}>
                {getClientInitials(client.first_name, client.last_name)}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator overlay */}
            <div 
              className={cn(
                'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                getStatusColor(client.status)
              )}
              data-testid="status-indicator"
              title={`Status: ${client.status}`}
            />
          </div>
        </div>

        {/* Client Name */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="font-semibold text-lg truncate max-w-full">
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
        </div>

        {/* Contact Information - Always show both slots for consistency */}
        <div className="space-y-2 mb-4 min-h-[3rem]">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {client.email ? highlightText(client.email, searchQuery) : 'No email'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {client.phone ? highlightText(client.phone, searchQuery) : 'No phone'}
            </span>
          </div>
        </div>

        {/* Labels - Fixed height container for consistency */}
        <div className="mb-4 min-h-[2rem] flex items-center justify-center">
          {client.labels && client.labels.length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-center">
              {client.labels.slice(0, 2).map((label) => (
                <Badge 
                  key={label} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {highlightText(label, searchQuery)}
                </Badge>
              ))}
              {client.labels.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{client.labels.length - 2}
                </Badge>
              )}
            </div>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              No labels
            </Badge>
          )}
        </div>

        {/* Stats - Always show both for consistency */}
        <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-3 mt-auto">
          <div className="text-center">
            <div className="font-medium text-foreground">{client.total_visits}</div>
            <div>visits</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-foreground">
              {formatCurrency(client.lifetime_value)}
            </div>
            <div>lifetime</div>
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}