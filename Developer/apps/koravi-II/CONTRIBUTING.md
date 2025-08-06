# Contributing to Koravi CRM

Thank you for your interest in contributing to Koravi CRM! This document outlines our development workflow using GitHub Flow.

## Development Workflow

We use **GitHub Flow** - a simple, branch-based workflow that supports teams and projects where deployments are made regularly.

### Branch Structure

- **`main`**: The single protected production branch. This always contains deployable code.
- **Feature branches**: Short-lived branches for new work, named `feat/short-description`

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/andrsadr/koravi.git
   cd koravi
   ```

2. **Set up the development environment**
   ```bash
   cd koravi-crm
   pnpm install
   cp .env.example .env.local
   # Configure your environment variables
   node setup-database.js
   ```

### Feature Development Workflow

#### 1. Start a New Feature

Always start from the latest `main` branch:

```bash
# Switch to main and get latest changes
git checkout main
git pull origin main

# Create and switch to your feature branch
git checkout -b feat/your-feature-description
```

**Branch Naming Convention:**
- Use `feat/` prefix for new features
- Use kebab-case for descriptions
- Keep names short but descriptive

Examples:
- `feat/add-user-login`
- `feat/client-search-filters`
- `feat/export-client-data`

#### 2. Develop Your Feature

- Make commits often with clear, descriptive messages
- Run tests frequently to catch issues early
- Follow the established code style and patterns

```bash
# Make your changes
git add .
git commit -m "Add password reset email functionality"

# Push your branch regularly
git push -u origin feat/your-feature-description
```

#### 3. Open a Pull Request

When your feature is complete:

1. Push your final changes
2. Open a Pull Request on GitHub targeting `main`
3. Fill out the PR template completely
4. Request reviews from team members
5. Ensure all CI checks pass

#### 4. Code Review Process

- All PRs require at least one approval
- Address review feedback promptly
- Keep discussions constructive and focused
- Update your branch if `main` has moved forward

#### 5. Merge and Cleanup

After approval and passing CI:

1. Merge the PR (squash merge preferred)
2. Delete the feature branch
3. Pull the latest `main` locally

```bash
git checkout main
git pull origin main
git branch -d feat/your-feature-description
```

## Commit Message Guidelines

Write clear, descriptive commit messages that explain **what** and **why**:

### Format
```
<verb> <description>

Optional longer description explaining why this change was made.
```

### Rules
- Start with a verb in imperative form (Add, Fix, Remove, Update, Refactor)
- Keep the first line under 50 characters
- Use present tense ("Add feature" not "Added feature")
- Be specific about what changed

### Examples

**Good:**
```
Add client search functionality

Implements real-time search across client names, emails, and phone numbers
using debounced input to improve performance.
```

**Bad:**
```
fixed stuff
```

### Common Verbs
- **Add**: New features, files, or functionality
- **Fix**: Bug fixes
- **Update**: Changes to existing functionality
- **Remove**: Deleting code or features
- **Refactor**: Code improvements without changing functionality
- **Test**: Adding or updating tests
- **Docs**: Documentation changes

## Testing Requirements

All code must pass our automated test suite:

```bash
# Run all tests
pnpm test           # Unit tests
pnpm test:e2e       # End-to-end tests
pnpm type-check     # TypeScript checking
pnpm lint           # Code linting
```

### Test Coverage
- Write unit tests for new functions and components
- Add integration tests for new features
- Update E2E tests for user-facing changes
- Maintain or improve overall test coverage

## Code Style Guidelines

- Follow the existing TypeScript and React patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Follow the established file and folder structure

## Release Process

### Semantic Versioning

We use semantic versioning (semver) for releases:

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible
- **Patch** (0.0.1): Bug fixes, backwards compatible

### Creating a Release

1. Update version in `package.json`
2. Merge changes to `main`
3. Create and push a git tag:

```bash
git checkout main
git pull origin main
git tag v0.1.0
git push origin v0.1.0
```

The release workflow will automatically create a GitHub release.

## Branch Protection Rules

The `main` branch is protected with these rules:

- **No direct pushes** - all changes must go through PRs
- **Require PR reviews** - at least one approval required
- **Require status checks** - CI must pass before merging
- **Require branches to be up to date** - must be current with main
- **Include administrators** - rules apply to everyone

## Getting Help

- Check existing issues and PRs first
- Create detailed bug reports with reproduction steps
- Ask questions in PR comments or discussions
- Follow the code of conduct in all interactions

## Quick Reference

```bash
# Start new feature
git checkout main && git pull
git checkout -b feat/my-feature

# Regular development
git add .
git commit -m "Add new functionality"
git push -u origin feat/my-feature

# After PR is merged
git checkout main
git pull origin main
git branch -d feat/my-feature

# Create release
git tag v0.1.0
git push origin v0.1.0
```

Thank you for contributing to Koravi CRM! 🎉