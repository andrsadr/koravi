# Branch Protection Setup

Since branch protection rules must be configured through GitHub's web interface or API, follow these steps to set up the required protections for the `main` branch.

## GitHub Web Interface Setup

1. Go to your repository on GitHub: https://github.com/andrsadr/koravi
2. Click on **Settings** tab
3. Click on **Branches** in the left sidebar
4. Click **Add rule** next to "Branch protection rules"
5. Configure the following settings:

### Branch Name Pattern
```
main
```

### Protection Settings

**Protect matching branches:**
- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require a pull request before merging
  - ✅ Require approvals: 1
  - ✅ Dismiss stale PR approvals when new commits are pushed
  - ✅ Require review from code owners (if you have a CODEOWNERS file)
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Add these required status checks:
    - `test (18.x)`
    - `test (20.x)` 
    - `e2e-test`
- ✅ Require conversation resolution before merging
- ✅ Include administrators (applies rules to repo admins too)
- ✅ Allow force pushes: **Disabled**
- ✅ Allow deletions: **Disabled**

6. Click **Create** to save the protection rule

## Verification

After setting up branch protection, verify it's working:

1. Try to push directly to main (should be blocked):
   ```bash
   git checkout main
   echo "test" >> test.txt
   git add test.txt
   git commit -m "Test direct push"
   git push origin main  # This should fail
   ```

2. Clean up the test:
   ```bash
   git reset --hard HEAD~1
   ```

## GitHub CLI Alternative

If you have GitHub CLI installed and authenticated:

```bash
gh api repos/andrsadr/koravi/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test (18.x)","test (20.x)","e2e-test"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## Troubleshooting

- If status checks aren't appearing, make sure you've pushed the CI workflow and it has run at least once
- Status check names must match exactly what appears in the GitHub Actions workflow
- You may need to wait for the first CI run to complete before the checks appear in the branch protection settings