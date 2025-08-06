---
inclusion: manual
---

# Supabase MCP Server Usage

## When to Use
Use the Supabase MCP server for database operations, schema management, and data queries during Koravi CRM implementation.

## Key Capabilities
- Database schema creation and management
- Table operations (create, modify, query)
- Real-time subscriptions setup
- Row Level Security (RLS) configuration
- Database migrations and seeding

## Implementation Guidelines

### Database Schema Tasks (Task 2)
- Use Supabase MCP to create the `clients` table with proper schema
- Set up indexes for search optimization
- Configure full-text search capabilities
- Verify database connection and test queries

### Data Operations (Tasks 4.1, 4.2)
- Use MCP server to test CRUD operations before implementing in code
- Validate search functionality using PostgreSQL full-text search
- Test error scenarios and connection handling
- Verify data integrity and constraints

### Development Workflow
1. Use Supabase MCP to prototype database operations
2. Test queries and schema changes before coding
3. Validate data models and relationships
4. Ensure proper error handling for database operations

## Best Practices
- Always test database operations through MCP before implementing
- Use MCP to validate schema changes and migrations
- Leverage MCP for debugging database connectivity issues
- Test search functionality and performance through MCP tools