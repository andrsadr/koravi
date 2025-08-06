'use client';

import React, { useState, useRef } from 'react';
import { Client } from '@/lib/types';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit, Calendar, User, DollarSign, FileText, Copy, Plus, X, GripVertical, Camera, Upload, Trash2, MoreVertical, Merge } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/lib/hooks/useToast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ClientProfileProps {
  client: Client;
  onUpdate: (updates: Partial<Client>) => Promise<void>;
  onDelete: () => Promise<void>;
  isEditing: boolean;
  onEditToggle: () => void;
}

interface SortableFieldCardProps {
  fieldId: string;
  config: {
    label: string;
    value: string;
    editable: boolean;
    copyable?: boolean;
    type?: string;
  };
  isCustomizing: boolean;
  editingField: string | null;
  editValues: Record<string, string>;
  onEditField: (field: string, value: string) => void;
  onSaveField: (field: string) => void;
  onCancelEdit: () => void;
  onCopyToClipboard: (text: string) => void;
  setEditValues: (values: Record<string, string>) => void;
}

function SortableFieldCard({
  fieldId,
  config,
  isCustomizing,
  editingField,
  editValues,
  onEditField,
  onSaveField,
  onCancelEdit,
  onCopyToClipboard,
  setEditValues,
}: SortableFieldCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fieldId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isCustomizing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`bg-card border border-border rounded-lg p-3 cursor-move ${
          isDragging ? 'opacity-0' : 'shadow-sm hover:shadow-md'
        } transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {config.label}
            </label>
            <p className={`font-medium text-sm ${config.label === 'Email' ? 'text-blue-600' : ''}`}>
              {config.value}
            </p>
          </div>
          <div
            {...listeners}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing ml-2"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group py-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <label className="text-muted-foreground">{config.label}</label>
          <div className="flex items-center justify-between">
            {config.editable && editingField === fieldId ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  type={config.type || 'text'}
                  value={editValues[fieldId] || ''}
                  onChange={(e) => setEditValues({ ...editValues, [fieldId]: e.target.value })}
                  className="text-sm h-7"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveField(fieldId);
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                  autoFocus
                />
                <button 
                  onClick={() => onSaveField(fieldId)}
                  className="text-green-600 hover:text-green-700 text-xs"
                >
                  Save
                </button>
                <button 
                  onClick={onCancelEdit}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <p className={`font-medium ${config.label === 'Email' ? 'text-blue-600' : ''}`}>
                  {config.value}
                </p>
                <div className="flex items-center space-x-1">
                  {config.copyable && (
                    <button 
                      onClick={() => onCopyToClipboard(config.value)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  )}
                  {config.editable && (
                    <button 
                      onClick={() => onEditField(fieldId, config.value)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientProfile({ 
  client, 
  onUpdate,
  onDelete
}: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameEditValues, setNameEditValues] = useState({
    first_name: client.first_name,
    last_name: client.last_name
  });
  const [newLabel, setNewLabel] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [fieldOrder, setFieldOrder] = useState(['client_id', 'date_of_birth', 'gender', 'email', 'address', 'referred_by', 'phone']);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  
  // New state for avatar upload and status toggle
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Toast for notifications
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatAddress = () => {
    const parts = [];
    if (client.address_line1) parts.push(client.address_line1);
    if (client.address_line2) parts.push(client.address_line2);
    
    const cityStateZip = [];
    if (client.city) cityStateZip.push(client.city);
    if (client.state) cityStateZip.push(client.state);
    if (client.postal_code) cityStateZip.push(client.postal_code);
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No address provided';
  };

  // New handler functions
  const handleStatusToggle = async () => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    await onUpdate({ status: newStatus });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (selectedImage) {
      // In a real app, you would upload to a storage service
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(selectedImage);
      await onUpdate({ avatar_url: imageUrl });
      setIsAvatarDialogOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
      setCropPosition({ x: 0, y: 0 });
      setCropScale(1);
      setIsDragOver(false);
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValues({ ...editValues, [field]: currentValue });
  };

  const handleSaveField = async (field: string) => {
    const value = editValues[field];
    if (value !== undefined) {
      await onUpdate({ [field]: value });
      setEditingField(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValues({});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleNameSave = async () => {
    await onUpdate({
      first_name: nameEditValues.first_name,
      last_name: nameEditValues.last_name
    });
    setIsNameModalOpen(false);
  };

  const handleAddLabel = async () => {
    if (newLabel.trim()) {
      const updatedLabels = [...client.labels, newLabel.trim()];
      await onUpdate({ labels: updatedLabels });
      setNewLabel('');
      setIsAddingLabel(false);
    }
  };

  const handleRemoveLabel = async (labelToRemove: string) => {
    const updatedLabels = client.labels.filter(label => label !== labelToRemove);
    await onUpdate({ labels: updatedLabels });
  };

  const handleDeleteClient = async () => {
    try {
      await onDelete();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Client deleted",
        description: `${client.first_name} ${client.last_name} has been successfully deleted.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMergeClient = () => {
    // TODO: Implement merge functionality
    toast({
      title: "Merge functionality",
      description: "Merge functionality will be implemented in a future update.",
      variant: "default",
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setOverId(over.id as string);
      
      // Throttled real-time reordering during drag for smoother animation
      setFieldOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        
        if (oldIndex !== newIndex) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setOverId(null);
  };

  const getFieldConfig = (fieldId: string) => {
    const fieldConfigs = {
      client_id: {
        label: 'Client ID',
        value: client.client_id?.toString() || 'N/A',
        editable: false,
        copyable: true
      },
      date_of_birth: {
        label: 'DOB',
        value: formatDate(client.date_of_birth || null),
        editable: true,
        type: 'date'
      },
      gender: {
        label: 'Gender',
        value: client.gender || 'Not specified',
        editable: true,
        type: 'text'
      },
      email: {
        label: 'Email',
        value: client.email || 'Not provided',
        editable: true,
        type: 'email'
      },
      address: {
        label: 'Address',
        value: formatAddress(),
        editable: false
      },
      referred_by: {
        label: 'Referred By',
        value: 'Facebook',
        editable: false
      },
      phone: {
        label: 'Mobile / Phone',
        value: client.phone || 'Not provided',
        editable: true,
        type: 'tel'
      }
    };

    return fieldConfigs[fieldId as keyof typeof fieldConfigs];
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: 4 },
    { id: 'financials', label: 'Financials', icon: DollarSign, count: 4 },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-3 p-2 sm:p-3">
      {/* Left Section - Client Info */}
      <div className="w-full lg:w-80 lg:flex-shrink-0 bg-card border border-border rounded-lg p-3 h-fit relative">
        {/* Three-dots menu in top right corner */}
        <div className="absolute top-3 right-3 z-20">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="h-8 w-8 p-0 rounded-md hover:bg-accent transition-colors flex items-center justify-center border border-transparent hover:border-border"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Three-dots menu clicked'); // Debug log
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                type="button"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 min-w-[160px]">
              <DropdownMenuItem 
                onClick={() => {
                  handleMergeClient();
                  setIsDropdownOpen(false);
                }}
              >
                <Merge className="h-4 w-4 mr-2" />
                Merge
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Delete confirmation dialog - separate from dropdown */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {client.first_name} {client.last_name}?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
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
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteClient}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="space-y-2">
          {/* Client Avatar and Basic Info */}
          <div className="text-center relative pt-4 w-full flex flex-col items-center" style={{ textAlign: 'center' }}>
            {/* Avatar with upload functionality */}
            <div className="relative group mx-auto w-24 h-24">
              <Avatar className="h-24 w-24 cursor-pointer" onClick={() => setIsAvatarDialogOpen(true)}>
                <AvatarImage src={client.avatar_url || undefined} alt={`${client.first_name} ${client.last_name}`} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(client.first_name, client.last_name)}
                </AvatarFallback>
              </Avatar>
              {/* Hover indicator for photo upload */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer" 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                onClick={() => setIsAvatarDialogOpen(true)}
              >
                <Camera className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
            </div>
            
            {/* Clickable Name with hover edit icon */}
            <div className="relative group w-full mt-2 perfect-center">
              {/* Multiple centering approaches applied */}
              <div className="perfect-center relative">
                <button
                  onClick={() => setIsNameModalOpen(true)}
                  className={`text-xl font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                    client.status === 'inactive' ? 'text-red-500' : 'text-foreground hover:text-primary'
                  }`}
                  style={{ marginLeft: '0px' }} // Perfectly centered
                >
                  <span>{client.first_name} {client.last_name}</span>
                </button>
                {/* Edit icon positioned absolutely to maintain centering */}
                <Edit className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              
              {/* Dropdown Name Edit Form */}
              {isNameModalOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-top-2">
                  <h3 className="text-sm font-semibold mb-3">Edit Client Name</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={nameEditValues.first_name}
                        onChange={(e) => setNameEditValues({ ...nameEditValues, first_name: e.target.value })}
                        className="w-full text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={nameEditValues.last_name}
                        onChange={(e) => setNameEditValues({ ...nameEditValues, last_name: e.target.value })}
                        className="w-full text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsNameModalOpen(false);
                        setNameEditValues({
                          first_name: client.first_name,
                          last_name: client.last_name
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleNameSave}>
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Active Status - Clickable */}
            <div className="w-full mt-1 flex justify-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="flex items-center justify-center space-x-1 hover:bg-muted rounded px-2 py-1 transition-colors">
                    <div className={`h-2 w-2 rounded-full ${client.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm capitalize ${client.status === 'active' ? 'text-muted-foreground' : 'text-red-500'}`}>
                      {client.status}
                    </span>
                  </button>
                </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {client.status === 'active' ? 'Deactivate Client' : 'Activate Client'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to {client.status === 'active' ? 'deactivate' : 'activate'} {client.first_name} {client.last_name}?
                    {client.status === 'active' && ' This will mark the client as inactive.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStatusToggle()}>
                    {client.status === 'active' ? 'Deactivate' : 'Activate'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
              </AlertDialog>
            </div>  
          
            {/* Labels/Tags */}
            <div className="mt-2 w-full relative perfect-center">
              {/* Multiple centering approaches for labels */}
              <div className="perfect-center">
                <div className="flex flex-col items-center gap-2 perfect-center-text" style={{ textAlign: 'center', margin: '0 auto' }}>
                  {(() => {
                    const labels = client.labels.length === 0 ? ['New Client'] : client.labels;
                    const rows = [];
                    for (let i = 0; i < labels.length; i += 2) {
                      rows.push(labels.slice(i, i + 2));
                    }
                    
                    return (
                      <>
                        {rows.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex items-center justify-center gap-1 perfect-center">
                            {row.map((label) => (
                              <div key={label} className="group relative">
                                <Badge variant="outline" className="text-xs pr-6">
                                  {label}
                                </Badge>
                                {client.labels.length > 0 && (
                                  <button
                                    onClick={() => handleRemoveLabel(label)}
                                    className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <X className="h-2 w-2" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
              
              {/* Add Label Button - Positioned absolutely on the right */}
              <div className="absolute top-0 right-0">
                {isAddingLabel ? (
                  <div className="flex items-center space-x-1">
                    <Input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="New label"
                      className="text-xs h-5 w-16"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddLabel();
                        if (e.key === 'Escape') {
                          setIsAddingLabel(false);
                          setNewLabel('');
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleAddLabel}
                      className="text-green-600 hover:text-green-700 text-xs"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingLabel(false);
                        setNewLabel('');
                      }}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingLabel(true)}
                    className="flex items-center justify-center h-4 w-4 border border-dashed border-muted-foreground rounded-full hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="h-2 w-2" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-3 mt-4">
            <div className="group flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                DETAILS
              </h3>
              <div className={`flex items-center space-x-1 transition-opacity ${
                isCustomizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                  <Edit className="h-3 w-3" />
                </button>
                <button 
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className={`text-xs px-2 py-1 rounded transition-all ${
                    isCustomizing 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  {isCustomizing ? 'Done' : 'Customize fields'}
                </button>
              </div>
            </div>
            
            <div className="space-y-1 text-sm">
              {isCustomizing ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={fieldOrder} strategy={verticalListSortingStrategy}>
                    <motion.div 
                      className="space-y-2" 
                      layout
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <AnimatePresence>
                        {fieldOrder.map((fieldId) => {
                          const config = getFieldConfig(fieldId);
                          if (!config) return null;
                          
                          return (
                            <motion.div
                              key={fieldId}
                              layout
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 150, 
                                damping: 20,
                                layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                              }}
                            >
                              <SortableFieldCard
                                fieldId={fieldId}
                                config={config}
                                isCustomizing={isCustomizing}
                                editingField={editingField}
                                editValues={editValues}
                                onEditField={handleEditField}
                                onSaveField={handleSaveField}
                                onCancelEdit={handleCancelEdit}
                                onCopyToClipboard={copyToClipboard}
                                setEditValues={setEditValues}
                              />
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  </SortableContext>
                  <DragOverlay>
                    {activeId ? (
                      <motion.div 
                        className="bg-card border border-border rounded-lg p-3 shadow-xl"
                        initial={{ rotate: 0, scale: 1 }}
                        animate={{ rotate: 2, scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {getFieldConfig(activeId)?.label}
                            </label>
                            <p className="font-medium text-sm">
                              {getFieldConfig(activeId)?.value}
                            </p>
                          </div>
                          <GripVertical className="h-4 w-4 text-muted-foreground ml-2" />
                        </div>
                      </motion.div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : (
                <div className="space-y-1">
                  {fieldOrder.map((fieldId, index) => {
                    const config = getFieldConfig(fieldId);
                    if (!config) return null;
                    
                    return (
                      <div key={fieldId}>
                        <SortableFieldCard
                          fieldId={fieldId}
                          config={config}
                          isCustomizing={isCustomizing}
                          editingField={editingField}
                          editValues={editValues}
                          onEditField={handleEditField}
                          onSaveField={handleSaveField}
                          onCancelEdit={handleCancelEdit}
                          onCopyToClipboard={copyToClipboard}
                          setEditValues={setEditValues}
                        />
                        {index < fieldOrder.length - 1 && (
                          <div className="border-t border-border mx-3"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Main Content */}
      <div className="flex-1 flex">
        {/* Middle Section - Tabs */}
        <div className="w-64 border-r border-border bg-muted/20 p-2">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-3">
        {activeTab === 'summary' && (
          <div className="space-y-3">
            {/* Alerts & Allergies */}
            {client.alerts && (
              <div className="bg-card border border-border rounded-lg p-3">
                <h3 className="flex items-center space-x-2 text-orange-600 text-lg font-semibold mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Alerts & Allergies</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-800">Staff Alerts</h4>
                    <p className="text-sm text-yellow-700 mt-1">{client.alerts}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Appointments */}
            <div className="bg-card border border-border rounded-lg p-3">
              <h3 className="text-lg font-semibold mb-2">Next appointments</h3>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming appointment</p>
              </div>
            </div>

            {/* History Sections */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Family history</h3>
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No family history</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Social history</h3>
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No Social history</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Medical history</h3>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No medical history</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Medications history</h3>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No medications history</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Appointments</h2>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                <p className="text-muted-foreground">Schedule the first appointment for this client</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Financials</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Lifetime Value</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(client.lifetime_value)}</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Total Visits</h3>
                <p className="text-3xl font-bold">{client.total_visits}</p>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No financial records</h3>
                <p className="text-muted-foreground">Financial history will appear here</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Choose a photo to upload as the client's profile picture.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {/* Upload Button or Preview */}
            {!imagePreview ? (
              <div 
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
                  isDragOver 
                    ? 'border-primary bg-primary/5 scale-105' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={handleFileDragOver}
                onDragLeave={handleFileDragLeave}
                onDrop={handleFileDrop}
              >
                <Upload className={`h-8 w-8 mb-2 transition-colors ${
                  isDragOver ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className={`text-sm mb-4 transition-colors ${
                  isDragOver ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {isDragOver ? 'Drop your image here' : 'Click to upload an image or drag and drop'}
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant={isDragOver ? "default" : "outline"}
                >
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview with Crop Controls */}
                <div className="relative">
                  <div className="w-full h-64 bg-muted rounded-lg overflow-hidden relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale})`,
                        transformOrigin: 'center'
                      }}
                    />
                  </div>
                  
                  {/* Crop Controls - only show if image is not square */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Scale:</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={cropScale}
                        onChange={(e) => setCropScale(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">{cropScale.toFixed(1)}x</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Position X:</label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={cropPosition.x}
                        onChange={(e) => setCropPosition({ ...cropPosition, x: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Position Y:</label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={cropPosition.y}
                        onChange={(e) => setCropPosition({ ...cropPosition, y: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setCropPosition({ x: 0, y: 0 });
                      setCropScale(1);
                    }}
                  >
                    Choose Different Image
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImageUpload}>
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}