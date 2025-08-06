# GitHub Flow Quick Reference

## 🚀 Starting a New Feature

```bash
git checkout main && git pull
git checkout -b feat/your-feature-name
```

## 💻 Daily Development

```bash
# Make changes, then:
git add .
git commit -m "Add specific functionality"
git push -u origin feat/your-feature-name
```

## 📝 Commit Message Format

```
<Verb> <description>

Optional longer explanation of why this change was made.
```

**Examples:**
- `Add client search functionality`
- `Fix email validation bug`
- `Update user profile component`
- `Remove deprecated API calls`

## 🔄 Pull Request Process

1. Push your feature branch
2. Open PR on GitHub targeting `main`
3. Fill out PR template completely
4. Wait for CI checks to pass ✅
5. Get at least 1 approval ✅
6. Merge (squash merge preferred)
7. Delete feature branch

## 🧪 Before Opening PR

```bash
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests  
pnpm type-check     # TypeScript
pnpm lint           # Code style
pnpm build          # Production build
```

## 🏷️ Creating Releases

```bash
# Update version in package.json first
git checkout main && git pull
git tag v0.1.0
git push origin v0.1.0
```

## 🛡️ Branch Protection Rules

- ❌ No direct pushes to `main`
- ✅ All changes via Pull Requests
- ✅ Require 1+ approvals
- ✅ Require passing CI checks
- ✅ Require up-to-date branches

## 🆘 Common Commands

```bash
# Sync with main
git checkout main && git pull

# Update feature branch with latest main
git checkout feat/my-feature
git rebase main

# Clean up after merge
git checkout main && git pull
git branch -d feat/my-feature

# Check branch status
git status
git log --oneline -10
```

## 📋 PR Checklist

- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Self-reviewed the changes
- [ ] Added/updated documentation
- [ ] No new warnings or errors
- [ ] Feature works as expected

## 🔗 Useful Links

- [Full Contributing Guide](CONTRIBUTING.md)
- [Branch Protection Setup](scripts/setup-branch-protection.md)
- [GitHub Repository](https://github.com/andrsadr/koravi)

---

**Remember:** `main` always contains deployable code! 🎯