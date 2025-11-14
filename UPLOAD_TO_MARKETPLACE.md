# 🚨 Extension NOT Yet Published - Here's How to Publish It

## Current Status

❌ **Extension is NOT in the marketplace yet**  
✅ **You have the .vsix file created**  
📦 **File:** `AsahajitDalui.linear-azure-devops-integration-1.0.0.vsix`

**Important:** Having the `.vsix` file compiled does NOT mean it's published. You need to manually upload it!

---

## 🎯 Step-by-Step Publishing Guide

### Step 1: Create a Publisher Account (If You Haven't Already)

1. **Go to Visual Studio Marketplace**
   ```
   https://marketplace.visualstudio.com/manage
   ```

2. **Sign in** with your Microsoft/Azure DevOps account

3. **Create a Publisher** (if you don't have one)
   - Click **"Create Publisher"**
   - Fill in details:
     - **Publisher Name**: Asahajit Dalui (display name)
     - **Publisher ID**: `AsahajitDalui` (MUST match exactly what's in your vss-extension.json)
     - **Email**: Your email
     - **Description**: Brief description about you/company
   - Click **"Create"**

   ⚠️ **CRITICAL**: The Publisher ID MUST be exactly: `AsahajitDalui`

### Step 2: Upload Your Extension

1. **After creating publisher, click "New Extension"**
   - Or click the **"+"** button
   - Select **"Azure DevOps"**

2. **Upload your .vsix file**
   - Click **"Select file"** or **drag and drop**
   - Choose: `AsahajitDalui.linear-azure-devops-integration-1.0.0.vsix`
   - From folder: `C:\Users\JITU\source\repos\Linear-AzureRepo-Sync\`

3. **Review Extension Details**
   - Name: Linear Integration for Azure DevOps
   - Version: 1.0.0
   - Description: (from your manifest)
   - All details are pulled from your .vsix file

4. **Choose Visibility**
   
   **Option A: Private (Recommended for first time)**
   - Only you can see it
   - You manually share with specific organizations
   - Good for testing
   - Click **"Upload as Private"**
   
   **Option B: Public**
   - Everyone can see and install it
   - Appears in marketplace search
   - Requires certification for first public extension
   - Click **"Upload as Public"**

5. **Click Upload/Publish**

---

## ⚠️ If Publisher ID Doesn't Match

If you get an error like "Publisher 'AsahajitDalui' not found":

**You have 2 options:**

### Option A: Create Publisher with Exact ID

When creating publisher, use EXACTLY:
- Publisher ID: `AsahajitDalui` (no spaces, case-sensitive)

### Option B: Change Your Manifest (Easier)

1. **Check what your actual publisher ID is** on marketplace
2. **Update vss-extension.json** to match it
3. **Recompile** the extension

Let me know your actual publisher ID and I can update the manifest for you.

---

## 📸 Visual Guide - What You Should See

### At https://marketplace.visualstudio.com/manage

**If you don't have a publisher:**
```
[Create Publisher] button
```

**If you have a publisher:**
```
Your Publisher Name
├── [+ New Extension] button
└── (Your existing extensions if any)
```

**After clicking New Extension:**
```
Upload extension for Azure DevOps
┌─────────────────────────────┐
│  Drag .vsix file here       │
│  or click to select file    │
└─────────────────────────────┘
```

---

## 🔍 Verify It's Published

After successful upload, you should see:

1. **In Marketplace Manager:**
   - Your extension listed under your publisher
   - Shows version 1.0.0
   - Status: Private or Public

2. **Can search for it:**
   - Private: Only visible when you're logged in
   - Public: Anyone can find it

3. **Has a URL:**
   ```
   https://marketplace.visualstudio.com/items?itemName=AsahajitDalui.linear-azure-devops-integration
   ```

---

## 🎬 Quick Action Plan

**Do this now:**

1. ✅ Open https://marketplace.visualstudio.com/manage
2. ✅ Sign in
3. ✅ Check if you have a publisher
   - **YES**: Go to step 4
   - **NO**: Create one (use ID: `AsahajitDalui`)
4. ✅ Click "New Extension" → "Azure DevOps"
5. ✅ Upload: `AsahajitDalui.linear-azure-devops-integration-1.0.0.vsix`
6. ✅ Choose "Private" (for testing) or "Public"
7. ✅ Click "Upload"

**That's it!** Your extension will be published.

---

## 🚨 Common Mistakes

| Mistake | Fix |
|---------|-----|
| "I created the .vsix file" | That's NOT publishing - you must upload it |
| "I can't find it in marketplace" | Because you haven't uploaded it yet |
| "Publisher not found" error | Create publisher first OR change publisher ID |
| "I uploaded but can't find it" | If private, you need to share it with your org |

---

## 📞 Need Help?

**Which step are you stuck on?**

1. Can't access https://marketplace.visualstudio.com/manage?
2. Don't see "Create Publisher" button?
3. Get an error when uploading?
4. Extension uploaded but can't find it?

**Let me know and I'll help you troubleshoot!**

---

## 🎯 Alternative: Publish Via Command Line

If you have issues with the web interface:

### Prerequisites

1. **Create Personal Access Token (PAT)**
   - Go to: https://dev.azure.com/YOUR-ORG/_usersSettings/tokens
   - Click "New Token"
   - Name: "Marketplace Publishing"
   - Scopes: **Marketplace → Publish**
   - Copy the token

2. **Set environment variable:**
   ```powershell
   $env:AZURE_DEVOPS_EXT_PAT = "your-token-here"
   ```

3. **Publish:**
   ```powershell
   cd C:\Users\JITU\source\repos\Linear-AzureRepo-Sync
   
   tfx extension publish --vsix "AsahajitDalui.linear-azure-devops-integration-1.0.0.vsix" --token $env:AZURE_DEVOPS_EXT_PAT
   ```

---

## ✅ Success Indicators

You'll know it's published when:

1. ✅ You see it in https://marketplace.visualstudio.com/manage
2. ✅ You can open the extension's marketplace page
3. ✅ You can share/install it to your Azure DevOps org
4. ✅ It appears in your org's Extensions list

---

**Bottom line: Go to https://marketplace.visualstudio.com/manage and upload your .vsix file!**

Let me know what you see when you open that URL, and I'll guide you from there! 🚀
