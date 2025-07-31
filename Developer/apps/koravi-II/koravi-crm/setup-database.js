#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Koravi CRM database...');
    
    // Create the clients table directly
    console.log('📝 Creating clients table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth DATE,
        gender VARCHAR(20),
        occupation VARCHAR(100),
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        postal_code VARCHAR(20),
        country VARCHAR(50) DEFAULT 'US',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
        labels TEXT[],
        notes TEXT,
        alerts TEXT,
        last_visit DATE,
        total_visits INTEGER DEFAULT 0,
        lifetime_value DECIMAL(10,2) DEFAULT 0.00
      );
    `;
    
    // Use the REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql: createTableSQL })
    });
    
    if (!response.ok) {
      console.log('⚠️  Direct SQL execution not available. Please run the schema manually in Supabase dashboard.');
      console.log('📋 Copy this SQL to your Supabase SQL Editor:');
      console.log('---');
      console.log(createTableSQL);
      console.log('---');
      return;
    }
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    const { error: insertError } = await supabase.from('clients').insert([
      {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0123',
        status: 'active',
        labels: ['VIP', 'Regular'],
        notes: 'Prefers morning appointments',
        total_visits: 5,
        lifetime_value: 450.00
      },
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0124',
        status: 'active',
        labels: ['New Client'],
        notes: 'First appointment scheduled',
        total_visits: 1,
        lifetime_value: 85.00
      },
      {
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.j@example.com',
        phone: '+1-555-0125',
        status: 'inactive',
        labels: ['Former Regular'],
        notes: 'Moved to different city',
        total_visits: 12,
        lifetime_value: 1200.00
      }
    ]);
    
    if (insertError) {
      console.warn('⚠️  Sample data insertion failed:', insertError.message);
    } else {
      console.log('✅ Sample data inserted successfully!');
    }
    
    // Test the setup
    const { data, error } = await supabase.from('clients').select('*').limit(1);
    
    if (error) {
      console.error('❌ Database test failed:', error.message);
    } else {
      console.log('✅ Database setup completed successfully!');
      console.log('🎉 You can now run your Koravi CRM application');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('📋 Please run the schema manually in your Supabase dashboard.');
  }
}

setupDatabase();