# Getting Started with Linear-Azure DevOps Integration

## 📦 What You Have

A complete Azure DevOps Marketplace extension that integrates Linear issue tracking with Azure Repos. The extension:

- ✅ Validates Linear issue references in pull requests
- ✅ Enforces Linear work item references in commits (check-in policy)
- ✅ Provides a configuration UI in Azure DevOps project settings
- ✅ Built with TypeScript (no vanilla JavaScript)
- ✅ Uses the official Linear SDK for API communication

## 🏗️ Project Structure

```
Linear-AzureRepo-Sync/
├── src/
│   ├── services/
│   │   └── linearService.ts         # Linear API integration service
│   ├── types.ts                     # TypeScript interfaces
│   ├── pr-status.ts                 # PR validation logic
│   ├── pr-status.html               # PR validation UI
│   ├── checkin-policy.ts            # Check-in policy logic
│   ├── checkin-policy.html          # Check-in policy UI
│   ├── settings.ts                  # Settings page logic
│   └── settings.html                # Settings page UI
├── dist/                            # Build output (generated)
├── images/                          # Extension logo (add your own)
├── vss-extension.json               # Extension manifest
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── webpack.config.js                # Webpack bundler config
└── README.md                        # Documentation

```

## 🚀 Next Steps

### 1. Add Your Extension Logo

Create a 128x128 PNG image and save it as:

```
images/logo.png
```

### 2. Update Publisher Information

Edit `vss-extension.json` and `package.json` to replace:

- `your-publisher-name` with your Azure DevOps publisher ID
- Repository URLs with your actual GitHub repository

### 3. Create an Azure DevOps Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your Azure DevOps account
3. Create a new publisher (remember the publisher ID)

### 4. Package the Extension

```powershell
npm run package
```

This creates a `.vsix` file that you can upload to the marketplace.

### 5. Test Locally (Optional)

Before publishing, you can test the extension:

1. Upload the `.vsix` file to your Azure DevOps organization
2. Go to Organization Settings → Extensions → Manage Extensions
3. Upload and install your extension
4. Navigate to Project Settings → Linear Integration
5. Add your Linear API key and test

### 6. Publish to Marketplace

```powershell
# First time: create a personal access token for the marketplace
# Then publish:
npm run publish
```

Or manually upload the `.vsix` file at https://marketplace.visualstudio.com/manage

## 🔑 Getting a Linear API Key

1. Log in to Linear (https://linear.app)
2. Go to Settings → API
3. Create a new Personal API Key
4. Copy the key (starts with `lin_api_`)
5. Paste it in Azure DevOps → Project Settings → Linear Integration

## 💡 How It Works

### Pull Request Validation

When a PR is created or updated, the extension:

1. Extracts the PR title and description
2. Searches for Linear issue references (e.g., `LIN-123`, `ENG-456`)
3. Validates each reference using the Linear API
4. Reports status back to Azure DevOps

### Check-in Policy

When code is committed, the extension:

1. Examines commit messages
2. Looks for Linear issue identifiers
3. Validates that issues exist and are accessible
4. Blocks check-in if validation fails (when policy is enabled)

### Settings Page

Provides a UI to configure:

- Linear API key (required)
- Organization ID (optional)
- Policy toggles (require work items in commits/PRs)

## 🧪 Testing Linear Issue Detection

The extension recognizes these formats:

```
Valid:
- LIN-123
- ENG-456
- TEAM-789

Invalid:
- lin-123 (lowercase)
- TEAM123 (no hyphen)
- T-1 (team key too short)
```

## 🛠️ Development Commands

```powershell
# Install dependencies
npm install

# Build for production
npm run build

# Build and watch for changes (development)
npm run watch

# Package for distribution
npm run package

# Clean build artifacts
npm run clean

# Publish to marketplace
npm run publish
```

## 📝 Customization Ideas

### Enhance Work Item Detection

Edit `src/services/linearService.ts` → `extractWorkItemReferences()` to support:

- Custom team key formats
- Issue URLs
- Multiple issue references per commit

### Add More Validation Rules

In `src/services/linearService.ts` → `validateWorkItem()`:

- Check issue status (e.g., must be "In Progress")
- Validate assignee
- Check priority levels

### Improve UI

Enhance the HTML files in `src/`:

- Add team selector
- Show recent issues
- Display issue status and assignees

## 🐛 Troubleshooting

**Build Errors**

```powershell
# Clean and rebuild
npm run clean
npm install
npm run build
```

**Extension Not Loading**

- Verify `vss-extension.json` has correct publisher ID
- Check browser console for errors
- Ensure Linear API key is valid

**Linear API Issues**

- Test connection in Settings page
- Verify API key permissions
- Check network/firewall settings

## 📚 Resources

- [Azure DevOps Extension Docs](https://docs.microsoft.com/en-us/azure/devops/extend/)
- [Linear API Documentation](https://developers.linear.app/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Need Help?** Create an issue on GitHub or check the README.md for more details!
