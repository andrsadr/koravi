---
inclusion: manual
---

# Web Eval Agent MCP Usage

## When to Use
Use the Web Eval Agent for testing and validating the Koravi CRM web application during development and after task completion.

## Key Capabilities
- Automated web application testing
- UI interaction validation
- Performance monitoring
- Cross-browser compatibility testing
- User journey validation

## Implementation Guidelines

### After Each Task Completion
- Use Web Eval Agent to verify the development server runs properly
- Test that new features work correctly in the browser
- Validate UI interactions and animations
- Check for console errors or performance issues

### Navigation Testing (Tasks 3.1, 3.2)
- Test sidebar collapse/expand functionality
- Verify liquid-glass styling renders correctly
- Validate search functionality and dropdown behavior
- Test responsive behavior on different screen sizes

### Client Management Testing (Tasks 4.2, 5.1, 5.2, 6.1, 6.2)
- Test client list search and filtering
- Validate client profile views and data display
- Test form submissions and validation
- Verify CRUD operations work end-to-end

### Animation and Performance Testing (Tasks 7.1, 7.2)
- Test Framer Motion animations perform smoothly
- Validate page transitions and loading states
- Check animation performance across devices
- Test reduced motion preferences

## Best Practices
- Run Web Eval Agent after completing each major task
- Use it to catch issues early before they compound
- Test critical user journeys regularly
- Validate that the app remains functional after each change