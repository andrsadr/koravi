# Integration Tests Documentation

This directory contains comprehensive integration tests for the Koravi CRM application, covering critical user journeys, database operations, search functionality, and error handling scenarios.

## Test Structure

### Test Files

- **`client-management.spec.ts`** - End-to-end tests for client CRUD operations and user journeys
- **`database-operations.spec.ts`** - Integration tests for database operations with Supabase
- **`search-functionality.spec.ts`** - Comprehensive search testing across different scenarios
- **`error-handling.spec.ts`** - Error handling, edge cases, and resilience testing
- **`homepage.spec.ts`** - Application shell and homepage functionality tests

### Utilities and Fixtures

- **`utils/test-helpers.ts`** - Reusable test helper functions and page object patterns
- **`fixtures/test-data.ts`** - Test data fixtures and mock client data
- **`test-runner.ts`** - Test runner utilities for setup and teardown

## Running Tests

### All Integration Tests
```bash
# Run all integration tests
pnpm test:integration

# Run with UI mode for debugging
pnpm test:integration:ui

# Run in headed mode (visible browser)
pnpm test:integration:headed
```

### Specific Test Suites
```bash
# Client management tests
pnpm test:client-management

# Database operation tests
pnpm test:database

# Search functionality tests
pnpm test:search

# Error handling tests
pnpm test:error-handling
```

### Development and Debugging
```bash
# Run with Playwright UI for interactive debugging
pnpm test:e2e:ui

# Run in debug mode with breakpoints
pnpm test:e2e:debug

# Run specific test file
npx playwright test src/__tests__/e2e/client-management.spec.ts
```

## Test Coverage

### Critical User Journeys

1. **Client List and Search**
   - Display client list with all clients
   - Real-time search across client data
   - Search by name, email, phone, occupation, labels
   - Handle empty search results
   - Loading states during search

2. **Client Creation**
   - Create client with complete form data
   - Create client with minimal required data
   - Form validation and error handling
   - Handle server errors during creation

3. **Client Profile and Editing**
   - Display complete client profile
   - Inline editing functionality
   - Save and cancel edit operations
   - Form validation during editing

4. **Client Deletion**
   - Delete client with confirmation dialog
   - Cancel deletion process
   - Handle deletion errors

5. **Navigation and Global Search**
   - Sidebar navigation between sections
   - Global search from top bar
   - Sidebar collapse/expand functionality
   - Responsive navigation on mobile

### Database Operations

1. **CRUD Operations**
   - Create, read, update, delete clients
   - Handle non-existent client operations
   - Validate required fields
   - Handle database connection errors

2. **Search and Filtering**
   - Full-text search across client data
   - Search with special characters
   - Search result limits and pagination
   - Filter by status and labels

3. **Data Integrity**
   - Concurrent operation handling
   - Invalid data type validation
   - Email format validation
   - Long text field handling

4. **Performance Testing**
   - Large dataset handling
   - Search performance optimization
   - Memory leak prevention

### Error Handling

1. **Network and Database Errors**
   - Database connection failures
   - API timeout errors
   - Server errors during operations
   - Network disconnection handling

2. **Form Validation**
   - Invalid email formats
   - Invalid phone numbers
   - Extremely long input values
   - Special characters in inputs

3. **UI Error States**
   - Component rendering errors
   - Missing client data
   - Empty database states
   - Browser compatibility issues

4. **Security Testing**
   - XSS attempt prevention
   - SQL injection protection
   - Input sanitization

### Search Functionality

1. **Global Search (Top Bar)**
   - Real-time search results
   - Search result dropdown formatting
   - Navigation to client profiles
   - Keyboard navigation in results

2. **Client List Search**
   - Real-time list filtering
   - Multi-field search capability
   - Case-insensitive search
   - Partial word matching
   - Label-based search

3. **Performance and Edge Cases**
   - Very long search queries
   - Whitespace-only searches
   - Special regex characters
   - Concurrent search requests

4. **Accessibility**
   - Keyboard accessibility
   - ARIA labels and roles
   - Screen reader announcements
   - High contrast mode support

## Test Data Management

### Test Data Cleanup
All tests include proper setup and teardown procedures:
- `beforeEach`: Clean up existing test data
- `afterEach`: Remove test data created during tests

### Test Fixtures
Predefined test data includes:
- Multiple client profiles with different statuses
- Clients with various labels and attributes
- Edge case data for validation testing

### Database Test Helpers
Utility functions for:
- Creating test clients
- Bulk client creation
- Test data cleanup
- Database state verification

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names that explain the scenario
- Include both positive and negative test cases
- Test edge cases and error conditions

### Test Reliability
- Use proper wait strategies for async operations
- Clean up test data to prevent test interference
- Handle flaky network conditions
- Use stable selectors for element identification

### Performance Considerations
- Minimize test data creation
- Use efficient cleanup strategies
- Avoid unnecessary page reloads
- Optimize test execution time

### Debugging
- Use Playwright UI mode for interactive debugging
- Add console logs for complex test scenarios
- Take screenshots on test failures
- Use trace viewer for detailed analysis

## Configuration

### Playwright Configuration
Tests are configured in `playwright.config.ts` with:
- Multiple browser support (Chrome, Firefox, Safari)
- Automatic test server startup
- Retry logic for flaky tests
- HTML report generation

### Environment Setup
Tests require:
- Running Next.js development server
- Supabase database connection
- Proper environment variables
- Clean test database state

## Continuous Integration

### CI/CD Integration
Tests can be run in CI environments with:
```bash
pnpm test:all  # Run both unit and integration tests
```

### Test Reports
- HTML reports generated in `playwright-report/`
- Test traces available for failed tests
- Screenshots captured on failures
- Coverage reports for code coverage analysis

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify Supabase configuration
   - Check environment variables
   - Ensure database is accessible

2. **Test Timeouts**
   - Increase timeout values in test configuration
   - Check for slow network conditions
   - Verify test server is running

3. **Flaky Tests**
   - Add proper wait conditions
   - Use stable element selectors
   - Handle race conditions in async operations

4. **Test Data Conflicts**
   - Ensure proper test cleanup
   - Use unique test data identifiers
   - Verify database state between tests

### Debug Commands
```bash
# Run single test with debug output
npx playwright test --debug src/__tests__/e2e/client-management.spec.ts

# Generate trace for failed tests
npx playwright test --trace on

# Show test results in browser
npx playwright show-report
```