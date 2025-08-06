'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { Client } from '@/lib/types';
import { highlightText } from '@/lib/utils/highlightText';
import { getClientInitials, getAvatarBackgroundColor } from '@/lib/utils/avatarUtils';
import { cn } from '@/lib/utils';
import { Plus, GripVertical, Mail, Phone, Calendar, User, Hash, Activity, Tag, Eye, DollarSign, Trash2, Merge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/lib/hooks/useToast';
import { deleteClient } from '@/lib/database';

interface ClientTableProps {
  clients: Client[];
  searchQuery: string;
  onClientClick: (client: Client) => void;
  selectedClients: string[];
  onClientSelect: (clientId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onClientsDeleted?: () => void; // Callback to refresh the client list
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

// Define available columns
export interface TableColumn {
  id: string;
  label: string;
  width?: string;
  sortable?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const DEFAULT_COLUMNS: TableColumn[] = [
  { id: 'client_name', label: 'Client Name', width: '250px', sortable: true, icon: User },
  { id: 'email', label: 'Email', width: '250px', sortable: true, icon: Mail },
  { id: 'client_id', label: 'Client ID', width: '100px', sortable: true, icon: Hash },
  { id: 'phone', label: 'Phone', width: '150px', icon: Phone },
  { id: 'status', label: 'Status', width: '100px', sortable: true, icon: Activity },
  { id: 'labels', label: 'Labels', width: '200px', icon: Tag },
  { id: 'total_visits', label: 'Visits', width: '80px', sortable: true, icon: Eye },
  { id: 'lifetime_value', label: 'Lifetime Value', width: '120px', sortable: true, icon: DollarSign },
  { id: 'last_visit', label: 'Last Visit', width: '120px', sortable: true, icon: Calendar },
];

// Default visible columns for first-time users
const DEFAULT_VISIBLE_COLUMNS = ['client_name', 'email', 'client_id'];

// Animated action bar component
function SelectionActionBar({ 
  selectedCount, 
  onEmailSelected, 
  onDeleteSelected, 
  onMergeSelected 
}: { 
  selectedCount: number;
  onEmailSelected: () => void;
  onDeleteSelected: () => void;
  onMergeSelected: () => void;
}) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-primary text-primary-foreground rounded-lg mb-4 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Email action - icon only */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEmailSelected}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                title="Email selected clients"
              >
                <Mail className="w-4 h-4" />
              </motion.button>

              {/* Delete action - icon only */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDeleteSelected}
                className="p-2 bg-white/20 hover:bg-red-500/30 rounded-md transition-colors group"
                title="Delete selected clients"
              >
                <Trash2 className="w-4 h-4 group-hover:text-red-200 transition-colors" />
              </motion.button>

              {/* Selection count */}
              <span className="font-medium">
                {selectedCount} selected
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Merge action - only show when exactly 2 clients selected, keep text */}
              <AnimatePresence>
                {selectedCount === 2 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0.8, width: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onMergeSelected}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                  >
                    <Merge className="w-4 h-4" />
                    <span className="text-sm font-medium">Merge</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Custom sort icon component (up and down arrows without middle)
function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === null) {
    return (
      <svg className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 1L9 4H3L6 1Z" />
        <path d="M6 11L3 8H9L6 11Z" />
      </svg>
    );
  }
  
  if (direction === 'asc') {
    return (
      <svg className="w-3 h-3 opacity-70" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 1L9 4H3L6 1Z" />
      </svg>
    );
  }
  
  return (
    <svg className="w-3 h-3 opacity-70" viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 11L3 8H9L6 11Z" />
    </svg>
  );
}

// Custom checkbox component for selection states
function SelectionCheckbox({ 
  checked, 
  indeterminate, 
  onCheckedChange 
}: { 
  checked: boolean; 
  indeterminate: boolean; 
  onCheckedChange: (checked: boolean) => void;
}) {
  if (indeterminate) {
    return (
      <button
        onClick={() => onCheckedChange(true)}
        className="w-4 h-4 border border-input rounded-sm bg-background flex items-center justify-center hover:bg-accent transition-colors"
      >
        <div className="w-2 h-2 bg-primary rounded-[2px]" />
      </button>
    );
  }

  if (checked) {
    return (
      <button
        onClick={() => onCheckedChange(false)}
        className="w-4 h-4 border border-primary rounded-sm bg-primary flex items-center justify-center hover:opacity-90 transition-colors"
      >
        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={() => onCheckedChange(true)}
      className="w-4 h-4 border border-input rounded-sm bg-background hover:bg-accent transition-colors"
    />
  );
}

// Sortable column header component
function SortableColumnHeader({ 
  column, 
  children, 
  sortState, 
  onSort 
}: { 
  column: TableColumn; 
  children: React.ReactNode;
  sortState: SortState;
  onSort: (columnId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSortIcon = () => {
    const direction = sortState.column === column.id ? sortState.direction : null;
    return <SortIcon direction={direction} />;
  };

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity cursor-move" />
          {column.icon && <column.icon className="w-4 h-4 text-muted-foreground" />}
          <span>{children}</span>
        </div>
        {column.sortable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSort(column.id);
            }}
            className="p-1 hover:bg-accent rounded transition-colors ml-2"
          >
            {getSortIcon()}
          </button>
        )}
      </div>
    </TableHead>
  );
}

export function ClientTable({
  clients,
  searchQuery,
  onClientClick,
  selectedClients,
  onClientSelect,
  onSelectAll,
  onClientsDeleted,
}: ClientTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    DEFAULT_VISIBLE_COLUMNS
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(
    DEFAULT_COLUMNS.map(col => col.id)
  );

  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get ordered and visible columns
  const orderedColumns = useMemo(() => {
    return columnOrder
      .map(id => DEFAULT_COLUMNS.find(col => col.id === id))
      .filter((col): col is TableColumn => col !== undefined && visibleColumns.includes(col.id));
  }, [columnOrder, visibleColumns]);

  // Handle column reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle column visibility toggle
  const handleColumnToggle = (columnId: string, visible: boolean) => {
    if (visible) {
      setVisibleColumns(prev => [...prev, columnId]);
    } else {
      setVisibleColumns(prev => prev.filter(id => id !== columnId));
    }
  };

  // Handle sorting
  const handleSort = (columnId: string) => {
    setSortState(prev => {
      if (prev.column === columnId) {
        // Cycle through: asc -> desc -> null
        const newDirection = prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc';
        return { column: newDirection ? columnId : null, direction: newDirection };
      } else {
        return { column: columnId, direction: 'asc' };
      }
    });
  };

  // Sort clients based on current sort state
  const sortedClients = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return clients;
    }

    return [...clients].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortState.column) {
        case 'client_name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'client_id':
          aValue = a.client_id || Math.abs(a.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10000;
          bValue = b.client_id || Math.abs(b.id.split('-')[0].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 10000;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'total_visits':
          aValue = a.total_visits;
          bValue = b.total_visits;
          break;
        case 'lifetime_value':
          aValue = a.lifetime_value;
          bValue = b.lifetime_value;
          break;
        case 'last_visit':
          aValue = a.last_visit ? new Date(a.last_visit).getTime() : 0;
          bValue = b.last_visit ? new Date(b.last_visit).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [clients, sortState]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render cell content
  const renderCellContent = (client: Client, column: TableColumn) => {

    switch (column.id) {
      case 'client_name':
        return (
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={client.avatar_url || undefined} alt={`${client.first_name} ${client.last_name}`} />
              <AvatarFallback className={cn(
                'text-white font-medium text-xs',
                getAvatarBackgroundColor(client.first_name, client.last_name)
              )}>
                {getClientInitials(client.first_name, client.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium min-w-0 flex-1">
              {highlightText(`${client.first_name} ${client.last_name}`, searchQuery)}
            </div>
          </div>
        );

      case 'client_id':
        const clientIdNumber = client.client_id || Math.abs(client.id.split('-')[0].split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10000;
        return (
          <span className="font-mono text-sm font-medium">
            #{clientIdNumber.toString().padStart(4, '0')}
          </span>
        );

      case 'email':
        return client.email ? (
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-muted-foreground" />
            <span className="truncate">
              {highlightText(client.email, searchQuery)}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );

      case 'phone':
        return client.phone ? (
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span>{highlightText(client.phone, searchQuery)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );

      case 'status':
        return (
          <Badge variant="secondary" className={cn('capitalize', getStatusColor(client.status))}>
            {client.status}
          </Badge>
        );

      case 'labels':
        return client.labels && client.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {client.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
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
          <span className="text-muted-foreground">-</span>
        );

      case 'total_visits':
        return <span className="font-medium">{client.total_visits}</span>;

      case 'lifetime_value':
        return <span className="font-medium">{formatCurrency(client.lifetime_value)}</span>;

      case 'last_visit':
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span>{formatDate(client.last_visit)}</span>
          </div>
        );

      default:
        return null;
    }
  };

  const allSelected = clients.length > 0 && selectedClients.length === clients.length;
  const someSelected = selectedClients.length > 0 && selectedClients.length < clients.length;

  // Action handlers for the selection bar
  const handleEmailSelected = () => {
    console.log('Email selected clients:', selectedClients);
    // TODO: Implement email functionality
    toast({
      title: "Email functionality",
      description: "Email functionality will be implemented in a future update.",
      variant: "default",
    });
  };

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete all selected clients
      await Promise.all(selectedClients.map(clientId => deleteClient(clientId)));
      
      // Clear selection
      onSelectAll(false);
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      
      // Refresh the client list
      if (onClientsDeleted) {
        onClientsDeleted();
      }
      
      // Show success toast
      toast({
        title: "Clients deleted",
        description: `${selectedClients.length} client${selectedClients.length === 1 ? '' : 's'} deleted successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting clients:', error);
      toast({
        title: "Error",
        description: "Failed to delete clients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMergeSelected = () => {
    console.log('Merge selected clients:', selectedClients);
    // TODO: Implement merge functionality
    toast({
      title: "Merge functionality",
      description: "Merge functionality will be implemented in a future update.",
      variant: "default",
    });
  };

  return (
    <div className="relative">
      {/* Selection Action Bar */}
      <SelectionActionBar
        selectedCount={selectedClients.length}
        onEmailSelected={handleEmailSelected}
        onDeleteSelected={handleDeleteSelected}
        onMergeSelected={handleMergeSelected}
      />

      {/* Column Management Button */}
      <div className="absolute -top-3 -right-3 z-10">
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-6 h-6 rounded-full border border-border bg-background hover:bg-accent transition-colors shadow-sm flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Visible Columns</h4>
              {DEFAULT_COLUMNS.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-${column.id}`}
                    checked={visibleColumns.includes(column.id)}
                    onCheckedChange={(checked) => 
                      handleColumnToggle(column.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`column-${column.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                {/* Fixed checkbox column */}
                <TableHead className="w-12">
                  <div className="flex justify-center">
                    <SelectionCheckbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={onSelectAll}
                    />
                  </div>
                </TableHead>
                
                {/* Sortable columns */}
                <SortableContext items={orderedColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
                  {orderedColumns.map((column) => (
                    <SortableColumnHeader 
                      key={column.id} 
                      column={column}
                      sortState={sortState}
                      onSort={handleSort}
                    >
                      {column.label}
                    </SortableColumnHeader>
                  ))}
                </SortableContext>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedClients.map((client, index) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors duration-200"
                  onClick={() => onClientClick(client)}
                >
                  {/* Fixed checkbox column */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center">
                      <SelectionCheckbox
                        checked={selectedClients.includes(client.id)}
                        indeterminate={false}
                        onCheckedChange={(checked) => 
                          onClientSelect(client.id, checked)
                        }
                      />
                    </div>
                  </TableCell>
                  
                  {/* Data columns */}
                  {orderedColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      style={{ width: column.width }}
                      className="py-2"
                    >
                      {renderCellContent(client, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedClients.length === 1 
                ? `Delete ${clients.find(c => c.id === selectedClients[0])?.first_name || 'client'}?`
                : `Delete ${selectedClients.length} clients?`
              }
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {selectedClients.length === 1 ? (
                // Single client deletion - detailed warning
                <>
                  <p className="text-red-600 font-medium">This will permanently delete this client</p>
                  <p className="text-muted-foreground">
                    Any appointments associated with this client will be removed from the calendar and archived.
                  </p>
                  <p className="text-muted-foreground">
                    Other related information associated with this client will also be permanently deleted. This includes:
                  </p>
                  <div className="text-muted-foreground ml-4">
                    <p>• Client profile and contact information</p>
                    <p>• Service history and notes</p>
                    <p>• Financial records and transactions</p>
                    <p>• Photos and documents</p>
                    <p>• ...and more</p>
                  </div>
                  <p className="text-red-600 font-medium">
                    This action is not reversible. None of this client information will be recoverable.
                  </p>
                </>
              ) : (
                // Multiple clients deletion - simple warning like reference image
                <p className="text-muted-foreground">
                  {selectedClients.length} clients will be deleted. This action is irreversible
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting 
                ? 'Deleting...' 
                : selectedClients.length === 1 
                  ? 'Delete' 
                  : 'Yes, delete'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}