# Linear Integration for Azure DevOps

An Azure DevOps Marketplace extension that seamlessly integrates Linear work items with Azure Repos. This extension validates Linear issue references during pull requests and check-ins, ensuring proper work item tracking across both platforms.

## 🎯 Features

- **Pull Request Validation**: Automatically validates Linear work item references in PR titles and descriptions
- **Check-in Policy**: Enforces Linear issue references in commit messages
- **Real-time Validation**: Verifies that referenced Linear issues exist and are accessible
- **Configurable Policies**: Choose whether to require work items in commits and/or PRs
- **Easy Setup**: Simple configuration through Azure DevOps project settings

## 📋 Prerequisites

- Azure DevOps organization and project
- Linear account with API access
- Linear API key (get from [Linear Settings → API](https://linear.app/settings/api))

## 🚀 Installation

### From Azure DevOps Marketplace

1. Navigate to the [Azure DevOps Marketplace](https://marketplace.visualstudio.com)
2. Search for "Linear Integration"
3. Click "Get it free" and select your Azure DevOps organization
4. Follow the installation prompts

### Manual Installation (Development)

1. Clone this repository:

   ```bash
   git clone https://github.com/aahajit/linear-azuredevops-sync.git
   cd linear-azuredevops-sync
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Package the extension:

   ```bash
   npm run package
   ```

5. Upload the generated `.vsix` file to your Azure DevOps organization

## ⚙️ Configuration

1. Navigate to your Azure DevOps project
2. Go to **Project Settings** → **Linear Integration**
3. Enter your Linear API key
4. Configure policy settings:
   - **Require Linear work item in commits**: Enforces issue references in commit messages
   - **Require Linear work item in pull requests**: Validates issue references in PRs
5. Click **Save Settings**
6. Use **Test Connection** to verify your configuration

## 📝 Usage

### Commit Message Format

Reference Linear issues in your commit messages using the format: `TEAM-123`

Examples:

```
LIN-456: Fix authentication bug
ENG-789: Add new feature for user profiles
```

### Pull Request Format

Include Linear issue references in your PR title or description:

**PR Title**: `[LIN-456] Fix authentication bug`

**PR Description**:

```
This PR fixes the authentication issue reported in LIN-456

Changes:
- Updated auth middleware
- Added error handling

Closes LIN-456
```

### Supported Formats

The extension recognizes Linear issue identifiers in these formats:

- `TEAM-123` (standard format)
- `LIN-456`
- `ENG-789`

Team keys are typically 2-10 uppercase letters followed by a hyphen and 1-6 digits.

## 🔧 Development

### Project Structure

```
linear-azuredevops-sync/
├── src/
│   ├── services/
│   │   └── linearService.ts    # Linear API integration
│   ├── types.ts                 # TypeScript interfaces
│   ├── pr-status.ts             # Pull request validation
│   ├── checkin-policy.ts        # Check-in policy validation
│   ├── settings.ts              # Configuration page logic
│   ├── pr-status.html           # PR status UI
│   ├── checkin-policy.html      # Check-in policy UI
│   └── settings.html            # Settings page UI
├── dist/                        # Compiled output
├── images/                      # Extension icons
├── vss-extension.json           # Extension manifest
├── package.json
├── tsconfig.json
└── webpack.config.js
```

### Build Commands

```bash
# Install dependencies
npm install

# Build TypeScript files
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Package extension
npm run package

# Publish to marketplace
npm run publish
```

### Technologies Used

- **TypeScript**: Type-safe development
- **Azure DevOps Extension SDK**: Integration with Azure DevOps
- **Linear SDK**: Communication with Linear API
- **Webpack**: Module bundling

## 🔐 Security

- API keys are stored securely in Azure DevOps extension data storage
- All communication with Linear API uses HTTPS
- API keys are never exposed in logs or UI (displayed as password fields)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**"Linear API key not configured"**

- Ensure you've entered your API key in Project Settings → Linear Integration
- Verify the API key is valid by using the "Test Connection" button

**"Issue not found"**

- Verify the issue identifier is correct (e.g., LIN-123)
- Check that you have access to the Linear workspace containing the issue
- Ensure the issue hasn't been deleted

**"Connection test failed"**

- Verify your internet connection
- Check that your API key has the necessary permissions
- Ensure your organization allows API access

## 📞 Support

For issues, questions, or contributions:

- GitHub Issues: [Report a bug](https://github.com/aahajit/linear-azuredevops-sync/issues)
- Documentation: [Wiki](https://github.com/aahajit/linear-azuredevops-sync/wiki)

## 🎖️ Acknowledgments

- [Linear](https://linear.app) for their excellent API
- [Azure DevOps](https://azure.microsoft.com/services/devops/) extension framework
- All contributors to this project

---

**Made with ❤️ for better issue tracking**
