"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/lib/hooks/useToast';
import { ClientFormData } from '@/lib/types';
import { useErrorHandler } from '@/lib/hooks/useErrorHandler';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Validation schema
const clientFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().refine((val) => {
    if (!val || val === '') return true;
    return z.string().email().safeParse(val).success;
  }, 'Please enter a valid email address'),
  phone: z.string().refine((val) => {
    if (!val || val === '') return true;
    return val.length >= 10;
  }, 'Phone number must be at least 10 characters'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  occupation: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('US'),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  labels: z.string().default(''),
  notes: z.string().optional(),
  alerts: z.string().optional(),
  total_visits: z.number().default(0),
  lifetime_value: z.number().default(0),
}).refine((data) => {
  // Require at least email or phone
  return (data.email && data.email.trim() !== '') || (data.phone && data.phone.trim() !== '');
}, {
  message: 'Please provide either email or phone number',
  path: ['email'], // Show error on email field
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  animate?: boolean;
}

export function ClientForm({ client, onSubmit, onCancel, isLoading, animate = false }: ClientFormProps) {
  const [showMoreFields, setShowMoreFields] = useState(false);
  const { toast } = useToast();
  const { handleFormError } = useErrorHandler();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      first_name: client?.first_name || '',
      last_name: client?.last_name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      date_of_birth: client?.date_of_birth || '',
      gender: client?.gender as 'male' | 'female' | 'other' | 'prefer_not_to_say' | undefined || 'male',
      occupation: client?.occupation || '',
      address_line1: client?.address_line1 || '',
      address_line2: client?.address_line2 || '',
      city: client?.city || '',
      state: client?.state || '',
      postal_code: client?.postal_code || '',
      country: client?.country || 'US',
      status: client?.status || 'active',
      labels: client?.labels?.join(', ') || '',
      notes: client?.notes || '',
      alerts: client?.alerts || '',
      total_visits: client?.total_visits || 0,
      lifetime_value: client?.lifetime_value || 0,
    },
  });

  const handleSubmit = async (data: ClientFormValues) => {
    try {
      // Process labels from comma-separated string
      const labels = data.labels.split(',').map(label => label.trim()).filter(Boolean);
      
      const processedData: ClientFormData = {
        ...data,
        labels,
        email: data.email || null,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        occupation: data.occupation || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        notes: data.notes || null,
        alerts: data.alerts || null,
        last_visit: null,
      };

      await onSubmit(processedData);
      
      toast({
        title: 'Success',
        description: client ? 'Client updated successfully' : 'Client added successfully',
        variant: 'success' as any,
      });
    } catch (error) {
      handleFormError(error);
    }
  };

  const isEditMode = !!client;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const noAnimationVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const noCardAnimation = {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto p-6">
      <Form {...form}>
        <div className="h-[1000px] pb-8">
          <motion.form 
            id="client-form" 
            onSubmit={form.handleSubmit(handleSubmit)} 
            className="space-y-6"
            variants={animate ? containerVariants : noAnimationVariants}
            initial="hidden"
            animate="visible"
          >
          {/* General Card */}
          <motion.div 
            className="bg-card border border-border rounded-lg p-6"
            variants={animate ? cardVariants : noCardAnimation}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">General</h3>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                🏷️ No label
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name (Required)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Emily"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name (Required)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brown"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Gender */}
              <div>
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          {['male', 'female', 'other'].map((option) => (
                            <label key={option} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                value={option}
                                checked={field.value === option}
                                onChange={() => field.onChange(option)}
                                className="w-4 h-4 text-primary border-border focus:ring-primary"
                              />
                              <span className="text-sm capitalize">{option}</span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="date"
                            className="[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Info Card */}
          <motion.div 
            className="bg-card border border-border rounded-lg p-6"
            variants={animate ? cardVariants : noCardAnimation}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Info</h3>
            
            <div className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Select defaultValue="US">
                          <SelectTrigger className="w-20 rounded-r-none border-r-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">🇺🇸 +1</SelectItem>
                            <SelectItem value="CA">🇨🇦 +1</SelectItem>
                            <SelectItem value="GB">🇬🇧 +44</SelectItem>
                            <SelectItem value="AU">🇦🇺 +61</SelectItem>
                            <SelectItem value="DE">🇩🇪 +49</SelectItem>
                            <SelectItem value="FR">🇫🇷 +33</SelectItem>
                            <SelectItem value="ES">🇪🇸 +34</SelectItem>
                            <SelectItem value="IT">🇮🇹 +39</SelectItem>
                            <SelectItem value="JP">🇯🇵 +81</SelectItem>
                            <SelectItem value="CN">🇨🇳 +86</SelectItem>
                            <SelectItem value="IN">🇮🇳 +91</SelectItem>
                            <SelectItem value="BR">🇧🇷 +55</SelectItem>
                            <SelectItem value="MX">🇲🇽 +52</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          placeholder=""
                          className="rounded-l-none"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          {/* More Toggle */}
          <Collapsible open={showMoreFields} onOpenChange={setShowMoreFields}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center justify-start gap-2 text-primary hover:text-primary/80 p-0 h-auto"
              >
                {showMoreFields ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    More
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    More
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-6 mt-6">
              {/* Address Card */}
              <motion.div 
                className="bg-card border border-border rounded-lg p-6"
                variants={animate ? cardVariants : noCardAnimation}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Address</h3>
                
                <div className="space-y-4">
                  {/* Address Line 1 */}
                  <FormField
                    control={form.control}
                    name="address_line1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Street"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter City"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* State */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter State"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="DE">Germany</SelectItem>
                            <SelectItem value="FR">France</SelectItem>
                            <SelectItem value="ES">Spain</SelectItem>
                            <SelectItem value="IT">Italy</SelectItem>
                            <SelectItem value="JP">Japan</SelectItem>
                            <SelectItem value="CN">China</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Zip Code */}
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Zip Code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>
            </CollapsibleContent>
          </Collapsible>



          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              form="client-form"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update Client' : 'Add Client')}
            </Button>
          </div>

          </motion.form>
        </div>
      </Form>
      </div>
    </ErrorBoundary>
  );
}