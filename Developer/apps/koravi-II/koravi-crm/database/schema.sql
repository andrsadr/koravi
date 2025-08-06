-- Koravi CRM Database Schema
-- This file contains the complete database schema for the Koravi CRM application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id SERIAL UNIQUE NOT NULL, -- Unique numeric identifier
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  -- Profile Information
  date_of_birth DATE,
  gender VARCHAR(20),
  occupation VARCHAR(100),
  
  -- Contact Information
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',
  
  -- Business Information
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  labels TEXT[], -- Array of string labels
  notes TEXT,
  alerts TEXT, -- Important alerts or warnings
  
  -- Metadata
  last_visit DATE,
  total_visits INTEGER DEFAULT 0,
  lifetime_value DECIMAL(10,2) DEFAULT 0.00,
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(first_name, '') || ' ' || 
      COALESCE(last_name, '') || ' ' || 
      COALESCE(email, '') || ' ' || 
      COALESCE(phone, '')
    )
  ) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_search ON clients USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_labels ON clients USING GIN(labels);
CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON clients(client_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development (optional)
INSERT INTO clients (
  first_name, 
  last_name, 
  email, 
  phone, 
  status, 
  labels, 
  notes,
  total_visits,
  lifetime_value
) VALUES 
  (
    'Jane', 
    'Smith', 
    'jane.smith@example.com', 
    '+1-555-0123', 
    'active', 
    ARRAY['VIP', 'Regular'], 
    'Prefers morning appointments',
    5,
    450.00
  ),
  (
    'John', 
    'Doe', 
    'john.doe@example.com', 
    '+1-555-0124', 
    'active', 
    ARRAY['New Client'], 
    'First appointment scheduled',
    1,
    85.00
  ),
  (
    'Sarah', 
    'Johnson', 
    'sarah.j@example.com', 
    '+1-555-0125', 
    'inactive', 
    ARRAY['Former Regular'], 
    'Moved to different city',
    12,
    1200.00
  )
ON CONFLICT (id) DO NOTHING;

-- Create a view for client search (optional, for complex queries)
CREATE OR REPLACE VIEW client_search_view AS
SELECT 
  id,
  first_name,
  last_name,
  email,
  phone,
  status,
  labels,
  total_visits,
  lifetime_value,
  created_at,
  updated_at,
  ts_rank(search_vector, plainto_tsquery('english', '')) as search_rank
FROM clients;

-- Grant necessary permissions (adjust based on your Supabase setup)
-- These are typically handled by Supabase RLS policies
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;