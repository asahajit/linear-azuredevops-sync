# 🚀 How to Publish Your Azure DevOps Extension

## ✅ Package Created Successfully!

Your deployable file has been generated:

```
📦 Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix
```

This is your extension package that you'll upload to Azure DevOps.

---

## 📋 Two Ways to Publish

### Option 1: Manual Upload (Recommended for First-Time)

#### Step 1: Create/Access Your Publisher Account

1. **Go to Azure DevOps Marketplace**

   - Visit: https://marketplace.visualstudio.com/manage
   - Sign in with your Microsoft/Azure DevOps account

2. **Create a Publisher** (if you haven't already)

   - Click "Create Publisher"
   - Publisher Name: `Asahajit Dalui` (or different name)
   - Publisher ID: This must match what's in your `vss-extension.json`
   - Fill in other details (email, description)
   - Click "Create"

3. **Note**: Your current publisher in `vss-extension.json` is: **`Asahajit Dalui`**

#### Step 2: Upload Your Extension

1. **Navigate to Publisher Management**

   - Go to: https://marketplace.visualstudio.com/manage/publishers/your-publisher-id
   - Or click on your publisher name in the management portal

2. **Upload Extension**

   - Click "New Extension" or "+ New Extension"
   - Select "Azure DevOps"
   - Click "Upload" or drag & drop your `.vsix` file:
     ```
     Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix
     ```

3. **Review Extension Details**

   - Name: Linear Integration for Azure DevOps
   - Version: 1.0.0
   - Description and categories will be pulled from your manifest

4. **Choose Visibility**

   - **Private**: Only visible to you and shared organizations (recommended for testing)
   - **Public Preview**: Visible in marketplace but marked as preview
   - **Public**: Fully public and available to everyone

5. **Click "Upload"**

#### Step 3: Share or Install

**For Private Extensions:**

1. After upload, click "Share"
2. Enter your Azure DevOps organization name
3. Extension will be available in that organization

**To Install in Your Organization:**

1. Go to your Azure DevOps organization
2. Click "Organization Settings" (bottom left)
3. Under "Extensions", click "Shared Extensions"
4. Find your extension and click "Install"
5. Select the projects where you want to enable it

---

### Option 2: Command Line Publishing (For Updates)

#### Prerequisites

1. **Generate a Personal Access Token (PAT)**

   - Go to: https://dev.azure.com/your-org/_usersSettings/tokens
   - Click "New Token"
   - Name: "Marketplace Publishing"
   - Organization: All accessible organizations
   - Scopes:
     - **Marketplace** → ✅ Publish (select "Full access" or "Publish")
   - Expiry: Choose your preference (90 days recommended)
   - Click "Create"
   - **IMPORTANT**: Copy the token immediately (you won't see it again!)

2. **Set Environment Variable**
   ```powershell
   # Set the PAT as an environment variable
   $env:AZURE_DEVOPS_EXT_PAT = "your-personal-access-token-here"
   ```

#### Publish Command

```powershell
# Publish the extension
tfx extension publish --vsix "Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix" --token $env:AZURE_DEVOPS_EXT_PAT
```

Or if the token is in the environment:

```powershell
tfx extension publish --vsix "Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix"
```

---

## 🔧 Install in Your Azure DevOps Organization

### Method 1: Via Organization Settings

1. **Go to Your Azure DevOps Organization**

   ```
   https://dev.azure.com/YOUR-ORG-NAME
   ```

2. **Navigate to Extensions**

   - Click "Organization Settings" (bottom left gear icon)
   - Under "General", click "Extensions"

3. **Browse Marketplace**

   - Click "Browse Marketplace"
   - Search for "Linear Integration" or your extension name
   - Click on your extension
   - Click "Get it free" or "Install"

4. **Select Projects**
   - Choose which projects to enable the extension
   - Click "Install"

### Method 2: Direct Installation (Private Extension)

If you made it private and shared it:

1. Go to: https://marketplace.visualstudio.com/manage
2. Find your extension
3. Click "Share"
4. Enter your organization name
5. Go to your Azure DevOps org
6. Organization Settings → Extensions → Shared Extensions
7. Click "Install" on your extension

---

## ⚙️ Configure the Extension

After installation:

1. **Go to Project Settings**

   - Select a project
   - Click "Project Settings" (bottom left)

2. **Find Linear Integration**

   - Look for "Linear Integration" in the left sidebar
   - It should appear under the project settings menu

3. **Configure Settings**

   - Enter your Linear API key (get from https://linear.app/settings/api)
   - Optional: Enter Organization ID
   - Toggle policies:
     - ✅ Require Linear work item in commits
     - ✅ Require Linear work item in pull requests
   - Click "Save Settings"

4. **Test Connection**
   - Click "Test Connection" button
   - Should show: "Connection successful! Found X issues."

---

## 🧪 Test Your Extension

### Test Pull Request Validation

1. **Create a Test PR**

   ```bash
   # Create a branch and make a change
   git checkout -b test-linear-integration
   echo "test" > test.txt
   git add test.txt
   git commit -m "Test change"
   git push origin test-linear-integration
   ```

2. **Create PR Without Linear Reference**

   - Title: "Test change"
   - Should show warning or validation status

3. **Create PR With Linear Reference**
   - Title: "[LIN-123] Test change"
   - Should validate the Linear issue

### Test Commit Validation

1. **Try committing with Linear reference**

   ```bash
   git commit -m "LIN-123: Fix bug in authentication"
   ```

2. **Try committing without reference** (if policy enabled)
   ```bash
   git commit -m "Fix bug"
   # Should be blocked if policy is enabled
   ```

---

## 🔄 Update Your Extension

When you make changes and want to release a new version:

1. **Update Version Number**

   - Edit `vss-extension.json`: Change `"version": "1.0.0"` to `"version": "1.0.1"`
   - Edit `package.json`: Change `"version": "1.0.0"` to `"version": "1.0.1"`

2. **Rebuild and Package**

   ```powershell
   npm run package
   ```

3. **Publish Update**

   - Go to https://marketplace.visualstudio.com/manage
   - Click on your extension
   - Click "Update"
   - Upload the new `.vsix` file
   - Or use CLI: `tfx extension publish --vsix "new-file.vsix"`

4. **Users Will Be Notified**
   - Existing users will see an update notification
   - They can update from Organization Settings → Extensions

---

## 📊 Monitor Your Extension

### View Analytics

1. Go to: https://marketplace.visualstudio.com/manage
2. Click on your extension
3. View statistics:
   - Downloads
   - Installs
   - Ratings and reviews
   - Acquisition trends

### Respond to Issues

- Monitor GitHub issues: https://github.com/asahajit/linear-azuredevops-sync/issues
- Respond to marketplace reviews
- Update documentation based on feedback

---

## 🎯 Quick Reference

### Important URLs

| Purpose                        | URL                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Marketplace Management         | https://marketplace.visualstudio.com/manage                                                       |
| Create PAT                     | https://dev.azure.com/your-org/_usersSettings/tokens                                              |
| Your Extension (after publish) | https://marketplace.visualstudio.com/items?itemName=AsahajitDalui.linear-azure-devops-integration |
| Linear API Keys                | https://linear.app/settings/api                                                                   |

### Key Files

| File                                                        | Purpose               |
| ----------------------------------------------------------- | --------------------- |
| `Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix` | Deployable package    |
| `vss-extension.json`                                        | Extension manifest    |
| `package.json`                                              | Package configuration |

### Commands

```powershell
# Build and package
npm run package

# Publish (with PAT)
tfx extension publish --vsix "Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix"

# Share extension
tfx extension share --vsix "Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix" --share-with YOUR-ORG
```

---

## ⚠️ Troubleshooting

### "Publisher not found"

- Ensure publisher ID in `vss-extension.json` matches your marketplace publisher
- Create publisher at https://marketplace.visualstudio.com/manage

### "Extension already exists"

- You're trying to publish an extension that's already published
- Use "Update" instead, or change the version number

### "Invalid VSIX package"

- Rebuild the package: `npm run clean && npm run package`
- Check that `dist/` folder contains all required files
- Verify `images/logo.png` exists

### Extension not showing in organization

- Make sure you've shared it (for private extensions)
- Check Organization Settings → Extensions → Shared Extensions
- Verify you have permissions to install extensions

---

## ✨ Success Checklist

- [x] ✅ Package created: `Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix`
- [ ] 🌐 Publisher account created
- [ ] ⬆️ Extension uploaded to marketplace
- [ ] 🔒 Visibility set (Private/Public)
- [ ] 📦 Extension installed in Azure DevOps org
- [ ] ⚙️ Linear API key configured
- [ ] 🧪 PR validation tested
- [ ] 🧪 Commit validation tested
- [ ] 📊 Extension working as expected!

---

## 🎉 You're Ready!

Your extension package is ready to publish! Start with the **Manual Upload** method for your first time, then use command-line publishing for future updates.

**Next Step**: Go to https://marketplace.visualstudio.com/manage and upload your `.vsix` file!

---

**Need Help?**

- Check `PROJECT_SUMMARY.md` for technical details
- Review `README.md` for feature documentation
- Visit Azure DevOps Extension Docs: https://docs.microsoft.com/en-us/azure/devops/extend/
