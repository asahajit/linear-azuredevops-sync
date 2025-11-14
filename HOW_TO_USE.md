# 🎉 Using Your Linear Integration Extension

## Congratulations! Your extension is now in the Azure DevOps Marketplace!

---

## 📥 Step 1: Install the Extension in Your Organization

### Option A: From Azure DevOps

1. **Go to Your Azure DevOps Organization**
   ```
   https://dev.azure.com/YOUR-ORG-NAME
   ```

2. **Navigate to Organization Settings**
   - Click the **⚙️ gear icon** (Organization Settings) at the bottom left
   - Under "General", select **"Extensions"**

3. **Browse Marketplace**
   - Click **"Browse Marketplace"** button
   - Search for **"Linear Integration"** or your extension name
   - Click on your extension

4. **Install**
   - Click **"Get it free"** or **"Install"** button
   - Select which **projects** you want to enable it for
   - Click **"Install"**

### Option B: From Marketplace Website

1. **Go to Marketplace**
   ```
   https://marketplace.visualstudio.com/items?itemName=AsahajitDalui.linear-azure-devops-integration
   ```

2. **Click "Get it free"**
   - Select your Azure DevOps organization from dropdown
   - Choose projects to install
   - Click "Install"

---

## ⚙️ Step 2: Configure Linear API Key

After installation, you need to configure the extension:

### Get Your Linear API Key

1. **Log in to Linear**
   ```
   https://linear.app
   ```

2. **Go to Settings**
   - Click your profile icon (top right)
   - Select **"Settings"**
   - Go to **"API"** section

3. **Create Personal API Key**
   - Click **"Create new key"**
   - Name it: "Azure DevOps Integration"
   - Click **"Create"**
   - **📋 Copy the key** (starts with `lin_api_`)
   - ⚠️ Save it somewhere safe - you won't see it again!

### Configure in Azure DevOps

1. **Go to Your Project**
   ```
   https://dev.azure.com/YOUR-ORG/YOUR-PROJECT
   ```

2. **Open Project Settings**
   - Click **⚙️ Project Settings** (bottom left)

3. **Find Linear Integration**
   - Scroll down in the left sidebar
   - Look for **"Linear Integration"** (might be under Extensions section)
   - Click on it

4. **Enter Configuration**
   - **Linear API Key**: Paste your API key (`lin_api_...`)
   - **Organization ID**: (Optional) Leave blank unless you want to restrict
   - **Require Linear work item in commits**: ✅ Check to enforce
   - **Require Linear work item in pull requests**: ✅ Check to enforce

5. **Test Connection**
   - Click **"Test Connection"** button
   - Should show: ✅ "Connection successful! Found X issues."

6. **Save Settings**
   - Click **"Save Settings"** button

---

## 🚀 Step 3: Start Using It!

### Using in Commits

When committing code, include a Linear issue reference in your commit message:

```bash
# ✅ Valid formats:
git commit -m "LIN-123: Fix authentication bug"
git commit -m "[ENG-456] Add user profile feature"
git commit -m "TEAM-789 Update payment logic"

# ❌ Invalid (will be rejected if policy is enabled):
git commit -m "Fix bug"
git commit -m "Updated code"
```

**What happens:**
- Extension extracts the Linear issue ID (e.g., `LIN-123`)
- Validates it exists in Linear using your API key
- ✅ Allows commit if valid
- ❌ Blocks commit if invalid (when policy is enabled)

### Using in Pull Requests

Include Linear issue references in your PR title or description:

**PR Title Examples:**
```
✅ [LIN-123] Fix authentication bug
✅ LIN-456: Add new user dashboard
✅ Fix payment issue (LIN-789)
```

**PR Description Examples:**
```markdown
This PR addresses the authentication issue reported in LIN-123.

## Changes
- Updated auth middleware
- Added error handling

Closes LIN-123
```

**What happens:**
- Extension scans PR title and description
- Finds Linear issue references
- Validates each one via Linear API
- Shows status on the PR:
  - ✅ Green check if all issues are valid
  - ⚠️ Yellow warning if no issues found
  - ❌ Red X if issues are invalid

---

## 📋 Step 4: Test It Works

### Test 1: Create a Test Commit

```bash
# Clone your repo or navigate to existing one
cd your-azure-repo

# Create a test file
echo "test" > test-linear.txt

# Commit with Linear reference
git add test-linear.txt
git commit -m "LIN-123: Test Linear integration"

# Push to Azure DevOps
git push origin main
```

**Expected Result:**
- If `LIN-123` exists in Linear: ✅ Commit succeeds
- If `LIN-123` doesn't exist: ❌ Commit blocked (if policy enabled)

### Test 2: Create a Test PR

```bash
# Create a feature branch
git checkout -b test-linear-pr

# Make a change
echo "more test" >> test-linear.txt
git add test-linear.txt
git commit -m "LIN-456: Test PR validation"

# Push and create PR
git push origin test-linear-pr
```

Then:
1. Go to Azure DevOps → Repos → Pull Requests
2. Click **"New Pull Request"**
3. Set title: `[LIN-456] Test Linear integration in PR`
4. Create PR
5. Look for Linear validation status on the PR page

---

## 🎯 Understanding the Features

### Feature 1: Pull Request Validation

**Where you'll see it:**
- On the PR page, look for status indicators
- Shows which Linear issues were found and validated
- Provides links to Linear issues

**Status Indicators:**
- ✅ **Passed**: All Linear issues are valid
- ⚠️ **Warning**: No Linear issues found (when not required)
- ❌ **Failed**: Invalid Linear issues (when required)

### Feature 2: Check-in Policy

**What it does:**
- Validates commit messages before allowing check-in
- Ensures developers link work to Linear issues
- Helps maintain traceability

**When it triggers:**
- Every time code is pushed to Azure Repos
- Blocks commits without valid Linear references (if enabled)

### Feature 3: Settings Page

**Where to find it:**
- Project Settings → Linear Integration

**What you can do:**
- Add/update Linear API key
- Toggle policies on/off
- Test connection
- Configure optional organization ID

---

## 💡 Tips & Best Practices

### Commit Message Format

Use these patterns for best results:

```bash
# Pattern: TEAM-NUMBER: Description
git commit -m "LIN-123: Fix login bug"

# Multiple issues
git commit -m "LIN-123 ENG-456: Major refactor"

# In brackets
git commit -m "[LIN-789] Update documentation"
```

### Team Key Format

Linear issue identifiers follow this pattern:
- **Team Key**: 2-10 uppercase letters (e.g., `LIN`, `ENG`, `TEAM`)
- **Hyphen**: `-`
- **Issue Number**: 1-6 digits (e.g., `123`, `4567`)

Examples:
- ✅ `LIN-123`
- ✅ `ENG-4567`
- ✅ `DESIGN-89`
- ❌ `lin-123` (lowercase)
- ❌ `L-1` (team key too short)

### Policy Configuration

**Strict Mode** (Recommended for production):
- ✅ Require Linear work item in commits
- ✅ Require Linear work item in pull requests
- Forces developers to always link work

**Flexible Mode** (Recommended for testing):
- ❌ Don't require in commits
- ✅ Require Linear work item in pull requests
- Allows experimentation, enforces PR linking

---

## 🔍 Finding Your Extension Settings

If you can't find the Linear Integration settings:

1. **Check Project Settings** (not Organization Settings)
   - Go to specific project
   - Click Project Settings (bottom left)

2. **Look in Extensions Section**
   - May be under "Extensions" or "Boards"
   - Or directly in the settings list

3. **Search for "Linear"**
   - Use browser search (Ctrl+F)
   - Type "Linear" to find it quickly

---

## 🐛 Troubleshooting

### "Linear API key not configured"

**Solution:**
1. Go to Project Settings → Linear Integration
2. Enter your Linear API key
3. Click Save Settings

### "Connection test failed"

**Check:**
- ✅ API key is correct (copy/paste carefully)
- ✅ API key has proper permissions
- ✅ You have internet connection
- ✅ Linear.app is accessible from your network

### "Issue not found" when committing

**Reasons:**
- Issue ID doesn't exist in Linear
- You don't have access to that Linear workspace
- Issue was deleted
- Typo in issue ID

**Fix:**
- Verify issue exists in Linear
- Check your Linear workspace
- Fix the issue ID in commit message

### Extension not showing in Project Settings

**Solutions:**
1. Make sure extension is **installed** (not just in marketplace)
2. Check if it's enabled for your specific project
3. Refresh the page
4. Check Organization Settings → Extensions → Installed

### PR validation not working

**Check:**
1. Linear API key is configured in **project settings**
2. Issue ID is in PR **title** or **description**
3. Issue ID format is correct (e.g., `LIN-123`)
4. You have access to the Linear issue

---

## 📊 Viewing Extension Activity

### In Azure DevOps

- **PR Status**: Check PR page for Linear validation results
- **Commit History**: See which commits have Linear references
- **Extension Settings**: View current configuration

### In Linear

- **Issue Activity**: See when issues are referenced in Azure DevOps
- **External Links**: Linear may show links back to Azure DevOps commits/PRs

---

## 🔄 Common Workflows

### Workflow 1: Starting New Work

```bash
# 1. Create Linear issue first
#    Go to Linear → Create issue → Note the ID (e.g., LIN-123)

# 2. Create branch with reference
git checkout -b feature/LIN-123-add-feature

# 3. Make changes and commit
git commit -m "LIN-123: Implement new feature"

# 4. Push and create PR
git push origin feature/LIN-123-add-feature
# Create PR with title: [LIN-123] Add new feature
```

### Workflow 2: Fixing Bugs

```bash
# 1. Find bug issue in Linear (e.g., LIN-456)

# 2. Create fix branch
git checkout -b bugfix/LIN-456

# 3. Fix and commit
git commit -m "LIN-456: Fix authentication timeout"

# 4. Create PR referencing the bug
# PR Title: [LIN-456] Fix authentication timeout
```

### Workflow 3: Multiple Issues

```bash
# When work touches multiple issues
git commit -m "LIN-123 LIN-456: Refactor auth module"

# Or in PR description:
"""
This PR addresses multiple issues:
- LIN-123: Authentication refactor
- LIN-456: Timeout handling
- ENG-789: Error logging
"""
```

---

## 🎓 Training Your Team

### Quick Team Guide

Share this with your team:

1. **Always include Linear issue ID in commits**
   - Format: `LIN-123: Your message`
   
2. **Include Linear ID in PR title or description**
   - Title: `[LIN-123] Your PR title`
   
3. **Get your issue ID from Linear first**
   - Create Linear issue before starting work
   
4. **If commit is blocked**
   - Check your issue ID is correct
   - Verify issue exists in Linear
   - Ask admin if you need Linear access

---

## 📞 Need Help?

### For Administrators

- Check Project Settings → Linear Integration
- Verify API key is valid
- Test connection
- Review policy settings

### For Developers

- Get Linear issue ID before committing
- Use correct format: `TEAM-123`
- Include in commit message or PR title
- Contact admin if blocked incorrectly

### Documentation

- **Full Docs**: See `README.md` in extension repo
- **Azure DevOps Docs**: https://docs.microsoft.com/azure/devops
- **Linear API Docs**: https://developers.linear.app

---

## ✨ You're All Set!

Your extension is now:
- ✅ Installed in Azure DevOps
- ✅ Configured with Linear API key
- ✅ Ready to validate commits and PRs
- ✅ Helping your team maintain work item traceability

**Start creating commits with Linear references and see it in action! 🚀**

---

**Questions?** Check the troubleshooting section or review your Project Settings.
