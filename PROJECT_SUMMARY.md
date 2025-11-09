# 🎉 Azure DevOps Extension - Linear Integration

## ✅ Project Complete!

Your Azure DevOps Marketplace extension for Linear integration has been successfully created!

## 📦 What Was Built

### Core Features
✅ **Pull Request Validation** - Automatically validates Linear issue references in PRs
✅ **Check-in Policy** - Enforces Linear work items in commit messages  
✅ **Settings UI** - Configuration page for API keys and policy settings
✅ **TypeScript** - Fully typed, no vanilla JavaScript
✅ **Linear SDK** - Official Linear API integration
✅ **Azure DevOps SDK** - Native extension framework

### Project Files Created

**Configuration Files:**
- `vss-extension.json` - Extension manifest (defines contributions)
- `package.json` - Dependencies and build scripts
- `tsconfig.json` - TypeScript compiler configuration
- `webpack.config.js` - Module bundler configuration

**Source Code:**
- `src/types.ts` - TypeScript interfaces
- `src/services/linearService.ts` - Linear API service
- `src/pr-status.ts` + `.html` - PR validation
- `src/checkin-policy.ts` + `.html` - Check-in validation
- `src/settings.ts` + `.html` - Configuration UI

**Documentation:**
- `README.md` - Full project documentation
- `GETTING_STARTED.md` - Quick start guide
- `LICENSE` - MIT license

**Build Output:**
- `dist/` - Compiled JavaScript and HTML files (ready for packaging)

## 🚀 Quick Start

### 1. Test the Build
```powershell
cd c:\Users\JITU\source\repos\Linear-AzureRepo-Sync
npm run build
```
✅ Build completed successfully!

### 2. Before Publishing

#### A. Add Your Logo
Create a 128x128 PNG and save as `images/logo.png`

#### B. Update Publisher Info
Edit these files and replace `your-publisher-name`:
- `vss-extension.json` (line 4)
- `package.json` (line 3)

Also update repository URLs to your GitHub repo.

#### C. Get Linear API Key
1. Visit https://linear.app/settings/api
2. Create a Personal API Key
3. Save it for testing

### 3. Create Publisher Account
1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with Azure DevOps account
3. Create a publisher (remember the ID)
4. Generate a Personal Access Token (PAT) for publishing

### 4. Package & Publish
```powershell
# Package the extension
npm run package

# This creates: linear-azure-devops-integration-1.0.0.vsix
```

Upload manually at https://marketplace.visualstudio.com/manage or:

```powershell
# Set your PAT
$env:PUBLISHER_TOKEN="your-pat-here"

# Publish
npm run publish
```

## 🔧 How to Use After Installation

### For Administrators

1. **Install Extension**
   - Go to Azure DevOps Organization Settings
   - Extensions → Browse Marketplace
   - Search for your extension and install

2. **Configure Settings**
   - Navigate to Project Settings
   - Find "Linear Integration" in the sidebar
   - Enter your Linear API key
   - Enable/disable policies as needed
   - Click "Test Connection" to verify

### For Developers

**In Commit Messages:**
```bash
git commit -m "LIN-123: Fix authentication bug"
git commit -m "[ENG-456] Add new user profile feature"
```

**In Pull Requests:**
- Include Linear issue IDs in PR title: `[LIN-789] Update payment logic`
- Or in PR description: `This PR addresses LIN-789`

The extension will automatically:
- ✅ Validate that the issue exists in Linear
- ✅ Check that you have access to it
- ✅ Report status on the PR
- ❌ Block check-in if policy is enabled and no valid reference found

## 📋 Supported Formats

The extension recognizes Linear issue identifiers like:
- `LIN-123`
- `ENG-456`  
- `TEAM-789`

Format: `[A-Z]{2,10}-[0-9]{1,6}`

## 🎯 Extension Capabilities

### Pull Request Status Provider
- Scans PR title and description for Linear issues
- Validates issues via Linear API
- Displays status indicator on PR
- Shows which issues were found and validated

### Check-in Policy
- Examines commit messages during check-in
- Extracts Linear issue references
- Validates each reference
- Enforces policy (blocks if configured)

### Settings Hub
- Secure API key storage
- Policy configuration toggles
- Connection testing
- User-friendly UI

## 🔐 Security Features

- API keys stored in Azure DevOps extension data storage
- Keys displayed as password fields (masked)
- HTTPS communication with Linear API
- No logging of sensitive data

## 📊 Build Status

```
Build: ✅ SUCCESS
TypeScript Compilation: ✅ PASS
Webpack Bundle: ✅ COMPLETE
HTML Assets: ✅ COPIED
Size Warnings: ⚠️  Normal (Linear SDK is large)
```

## 🛠️ Development Workflow

```powershell
# Make changes to TypeScript files
# Run build
npm run build

# Or use watch mode
npm run watch

# Test locally
npm run package
# Upload .vsix to your Azure DevOps org for testing

# When ready to publish
npm run publish
```

## 🌟 Customization Ideas

1. **Enhanced Validation**
   - Check issue status (must be "In Progress")
   - Validate assignee matches commit author
   - Enforce labels or priority

2. **Better UI**
   - Show recent Linear issues in settings
   - Team selector dropdown
   - Issue picker for commit messages

3. **Advanced Features**
   - Auto-link commits to Linear issues
   - Sync PR comments to Linear
   - Update Linear issue status when PR merges

4. **Multi-workspace Support**
   - Configure different API keys per project
   - Team-specific validation rules

## 📚 Technical Details

### Technologies Used
- **TypeScript 5.3** - Type-safe development
- **Webpack 5** - Module bundling
- **Azure DevOps Extension SDK 4.0** - Extension framework
- **Linear SDK 20.0** - Linear API client
- **Node.js 16+** - Runtime

### Extension Contributions
1. `ms.vss-code-web.pull-request-status-provider` - PR validation
2. `ms.vss-code-web.policy-type` - Check-in policy
3. `ms.vss-web.hub` - Settings page

### Scopes Required
- `vso.code` - Read code and repositories
- `vso.code_write` - Validate commits and PRs
- `vso.settings` - Store configuration

## 🐛 Known Limitations

1. **Bundle Size** - Large (1.3 MB per entry) due to Linear SDK
   - This is normal and won't affect functionality
   - Browser caching helps in production

2. **Browser Support** - Modern browsers only (ES2020+)
   - Edge, Chrome, Firefox latest versions

3. **API Rate Limits** - Respects Linear's API limits
   - Typically not an issue for normal usage

## 📞 Support & Maintenance

### Updating Dependencies
```powershell
npm update
npm audit fix
npm run build
```

### Troubleshooting

**"Linear API key not configured"**
→ Add API key in Project Settings → Linear Integration

**"Connection test failed"**
→ Check API key validity and network connection

**Build errors**
→ Delete `node_modules` and `dist`, run `npm install`

**Extension not loading**
→ Verify publisher ID in `vss-extension.json` matches your account

## 🎓 Learning Resources

- [Azure DevOps Extension Docs](https://docs.microsoft.com/en-us/azure/devops/extend/)
- [Linear API Docs](https://developers.linear.app/)
- [Extension Samples](https://github.com/microsoft/azure-devops-extension-samples)

## 📄 Files Summary

| File | Purpose | Status |
|------|---------|--------|
| vss-extension.json | Extension manifest | ✅ Ready |
| package.json | Dependencies | ✅ Ready |
| tsconfig.json | TS config | ✅ Ready |
| webpack.config.js | Build config | ✅ Ready |
| src/types.ts | Interfaces | ✅ Complete |
| src/services/linearService.ts | Linear API | ✅ Complete |
| src/pr-status.* | PR validation | ✅ Complete |
| src/checkin-policy.* | Check-in policy | ✅ Complete |
| src/settings.* | Settings UI | ✅ Complete |
| dist/* | Build output | ✅ Generated |
| images/logo.png | Extension icon | ⚠️  **TODO** |

## ✨ Next Actions

1. [ ] Create extension logo (128x128 PNG)
2. [ ] Update publisher name in config files
3. [ ] Create Azure DevOps publisher account
4. [ ] Test extension locally
5. [ ] Publish to marketplace
6. [ ] Share with your team!

---

**🎉 Congratulations!** Your Azure DevOps extension is ready to deploy!

For detailed instructions, see `GETTING_STARTED.md`
For full documentation, see `README.md`

**Questions?** Check the documentation or create a GitHub issue.

---

Made with ❤️ using TypeScript + Azure DevOps SDK + Linear SDK
