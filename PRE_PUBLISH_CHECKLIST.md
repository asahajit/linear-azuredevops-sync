# 📋 Pre-Publishing Checklist

Use this checklist before publishing your extension to the Azure DevOps Marketplace.

## ✅ Required Steps

### 1. Extension Assets

- [ ] Create extension logo (128x128 PNG)
  - Save as: `images/logo.png`
  - Use Linear and Azure DevOps brand colors
  - Tools: Figma, Canva, or any image editor

### 2. Publisher Configuration

- [ ] Create publisher account at https://marketplace.visualstudio.com/manage
- [ ] Note your publisher ID: `___________________`
- [ ] Update `vss-extension.json`:
  ```json
  "publisher": "YOUR-PUBLISHER-ID"
  ```
- [ ] Update `package.json`:
  ```json
  "publisher": "YOUR-PUBLISHER-ID"
  ```

### 3. Repository Setup

- [ ] Create GitHub repository
- [ ] Update repository URLs in:
  - `vss-extension.json` → `repository.uri`
  - `package.json` → `repository.url`
  - `README.md` → all GitHub links
- [ ] Push code to GitHub:
  ```powershell
  git init
  git add .
  git commit -m "Initial commit: Linear-Azure DevOps integration"
  git remote add origin https://github.com/YOUR-USERNAME/linear-azuredevops-sync.git
  git push -u origin main
  ```

### 4. Linear API Setup

- [ ] Get Linear API key from https://linear.app/settings/api
- [ ] Test API key works:
  ```powershell
  # In PowerShell:
  $headers = @{ "Authorization" = "YOUR-API-KEY" }
  Invoke-RestMethod -Uri "https://api.linear.app/graphql" -Method POST -Headers $headers -Body '{"query":"{ viewer { name } }"}'
  ```

### 5. Build Verification

- [ ] Clean build:
  ```powershell
  npm run clean
  npm install
  npm run build
  ```
- [ ] Verify no errors
- [ ] Check `dist/` folder contains:
  - `pr-status.js` and `pr-status.html`
  - `checkin-policy.js` and `checkin-policy.html`
  - `settings.js` and `settings.html`

### 6. Package Testing

- [ ] Create package:
  ```powershell
  npm run package
  ```
- [ ] Verify `.vsix` file created
- [ ] Note file size: ~1.5-2 MB is normal

### 7. Local Testing (Recommended)

- [ ] Upload `.vsix` to your Azure DevOps org:
  - Organization Settings → Extensions → Browse marketplace → "..." → Upload extension
- [ ] Install extension in a test project
- [ ] Configure Linear integration:
  - Project Settings → Linear Integration
  - Add API key
  - Click "Test Connection"
- [ ] Test PR validation:
  - Create a test PR without Linear reference → should warn
  - Create a test PR with `LIN-123` → should validate
- [ ] Test commit validation:
  - Try commit without Linear reference
  - Try commit with valid Linear reference

### 8. Marketplace Listing

- [ ] Prepare marketing materials:
  - Screenshots (at least 1)
  - Feature highlights
  - Use cases
- [ ] Review `README.md` for marketplace description
- [ ] Prepare support links:
  - GitHub Issues URL
  - Documentation URL

### 9. Publishing

- [ ] Generate Personal Access Token (PAT):
  - https://dev.azure.com → User Settings → Personal Access Tokens
  - Scope: "Marketplace (Publish)"
  - Expiry: 90 days or custom
- [ ] Set environment variable:
  ```powershell
  $env:PUBLISHER_TOKEN="your-pat-here"
  ```
- [ ] Publish:
  ```powershell
  npm run publish
  ```
  Or manually upload at https://marketplace.visualstudio.com/manage

### 10. Post-Publishing

- [ ] Verify extension appears in marketplace
- [ ] Install in production Azure DevOps org
- [ ] Test with real Linear issues
- [ ] Share with team members
- [ ] Gather feedback

## 📝 Optional Enhancements

### Nice-to-Have

- [ ] Add screenshots to README
- [ ] Create animated GIF demo
- [ ] Write blog post about the extension
- [ ] Set up GitHub Actions for CI/CD
- [ ] Add unit tests
- [ ] Create video tutorial

### Future Features

- [ ] Support for multiple Linear workspaces
- [ ] Auto-link commits to Linear issues
- [ ] Sync PR status to Linear
- [ ] Custom validation rules
- [ ] Issue picker UI in commit dialog

## 🔄 Update Workflow

When you need to update the extension:

1. Make code changes
2. Update version in `vss-extension.json` and `package.json`
3. Run `npm run build`
4. Run `npm run package`
5. Upload new `.vsix` to marketplace (overwrites previous)
6. Users will be notified of update

## 🎯 Success Criteria

Your extension is ready when:

- ✅ Build completes without errors
- ✅ Package creates valid `.vsix` file
- ✅ Extension installs in Azure DevOps
- ✅ Settings page loads and saves configuration
- ✅ Linear API connection test succeeds
- ✅ PR validation detects and validates Linear issues
- ✅ Check-in policy enforces Linear references (when enabled)

## 📞 Help & Resources

**If you get stuck:**

1. Check `PROJECT_SUMMARY.md` for troubleshooting
2. Review `GETTING_STARTED.md` for setup details
3. Read `README.md` for feature documentation
4. Search [Azure DevOps Extension Docs](https://docs.microsoft.com/en-us/azure/devops/extend/)
5. Check [Linear API Docs](https://developers.linear.app/)

**Common Issues:**

- Publisher ID mismatch → Update in both config files
- Logo not showing → Check path is `images/logo.png`
- API connection fails → Verify Linear API key
- Extension not loading → Check browser console for errors

---

## ✨ Final Check

Before clicking "Publish":

- [ ] All checklist items above completed
- [ ] Extension tested in dev environment
- [ ] Documentation reviewed and accurate
- [ ] Support/contact info added
- [ ] Ready to support users!

**🎉 You're ready to publish!** Good luck with your extension!

---

_Last updated: November 9, 2025_
