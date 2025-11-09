# 🎯 QUICK START: Publish Your Extension in 5 Minutes!

## ✅ Your Package is Ready!

```
📦 File: Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix
📍 Location: C:\Users\JITU\source\repos\Linear-AzureRepo-Sync\
📊 Size: ~1.36 MB
✅ Status: Ready to Upload
```

---

## 🚀 Fastest Way to Publish (5 Steps)

### Step 1: Go to Marketplace (30 seconds)

👉 **Open this URL in your browser:**

```
https://marketplace.visualstudio.com/manage
```

- Sign in with your Microsoft/Azure DevOps account

### Step 2: Create Publisher (2 minutes)

If you don't have a publisher yet:

1. Click **"+ Create Publisher"**
2. Fill in:
   - **Publisher Name**: Asahajit Dalui (or your choice)
   - **Publisher ID**: Must match `"Asahajit Dalui"` from your manifest
   - **Email**: Your email
   - **Description**: Brief description
3. Click **"Create"**

⚠️ **IMPORTANT**: The Publisher ID must exactly match what's in your `vss-extension.json`

### Step 3: Upload Extension (1 minute)

1. Click **"+ New Extension"**
2. Select **"Azure DevOps"**
3. **Drag and drop** OR click to upload:
   ```
   Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix
   ```
4. Review the auto-filled details
5. Choose visibility:
   - 🔒 **Private** (Recommended for first time - only you can see it)
   - 🔓 **Public** (Everyone can see and install)

### Step 4: Share with Your Organization (30 seconds)

After upload:

1. Click **"Share"** button
2. Enter your Azure DevOps organization name
3. Click **"Share"**

### Step 5: Install in Azure DevOps (1 minute)

1. Go to your Azure DevOps organization:
   ```
   https://dev.azure.com/YOUR-ORG-NAME
   ```
2. Click **"Organization Settings"** (bottom left ⚙️)
3. Under "General", click **"Extensions"**
4. Click **"Shared Extensions"** tab
5. Find your extension → Click **"Install"**
6. Select projects → Click **"Install"**

---

## ⚙️ Configure & Test (2 minutes)

### Configure Linear API Key

1. Go to your project in Azure DevOps
2. Click **"Project Settings"** (bottom left)
3. Find **"Linear Integration"** in sidebar
4. Enter your **Linear API Key** from: https://linear.app/settings/api
5. Click **"Test Connection"**
6. Click **"Save Settings"**

### Test It Works

Create a test commit:

```bash
git commit -m "LIN-123: Test Linear integration"
```

Or create a PR with `[LIN-123]` in the title!

---

## 📍 Your Files Location

```
C:\Users\JITU\source\repos\Linear-AzureRepo-Sync\
│
├── 📦 Asahajit Dalui.linear-azure-devops-integration-1.0.0.vsix  ← UPLOAD THIS
│
├── 📄 PUBLISHING_GUIDE.md         ← Full publishing instructions
├── 📄 QUICK_START_PUBLISH.md      ← This file
├── 📄 README.md                   ← Documentation
├── 📄 PROJECT_SUMMARY.md          ← Technical overview
└── 📄 PRE_PUBLISH_CHECKLIST.md    ← Pre-publish checklist
```

---

## 🎬 What Happens After Upload?

1. **Extension Appears in Marketplace**

   - Your URL will be: `https://marketplace.visualstudio.com/items?itemName=AsahajitDalui.linear-azure-devops-integration`

2. **You Can Share It**

   - Share with specific Azure DevOps organizations
   - Or make it public for everyone

3. **Users Can Install**
   - They find it in their Organization's Extensions
   - Install with one click
   - Configure Linear API key
   - Start using immediately!

---

## 🔄 Need to Update?

1. **Change version** in `vss-extension.json` and `package.json`:

   ```json
   "version": "1.0.1"
   ```

2. **Rebuild**:

   ```powershell
   npm run package
   ```

3. **Upload new version** (same process as above)

---

## 🆘 Quick Troubleshooting

| Problem                           | Solution                                       |
| --------------------------------- | ---------------------------------------------- |
| "Publisher not found"             | Create publisher first (Step 2 above)          |
| "File too large"                  | Normal - 1.36 MB is fine for Azure DevOps      |
| Can't find extension after upload | Check "Shared Extensions" tab, not "Installed" |
| Extension not working             | Configure Linear API key in Project Settings   |
| "Invalid manifest"                | Publisher ID must match your account           |

---

## 📞 Need More Details?

- 📖 **Full Guide**: Open `PUBLISHING_GUIDE.md`
- 📋 **Checklist**: Open `PRE_PUBLISH_CHECKLIST.md`
- 📚 **Documentation**: Open `README.md`

---

## 🎉 Ready to Go!

Your extension is **production-ready**!

👉 **Next Action**: Open https://marketplace.visualstudio.com/manage

**Time Estimate**: 5-10 minutes from now to having a working extension!

---

**Good luck! 🚀**
