# Fix Cloudinary 401 Unauthorized Error

## 🚨 Problem: Upload Preset Not Configured

The error `401 (Unauthorized)` means your upload preset `ucolab_project` either doesn't exist or is not configured for unsigned uploads.

---

## ✅ Solution: Configure Upload Preset in Cloudinary

### Step 1: Login to Cloudinary
1. Go to https://cloudinary.com/console
2. Login with your account credentials
3. You should see your dashboard for cloud `dy9tykp58u`

### Step 2: Navigate to Upload Settings
1. Click on **Settings** (gear icon) in the top right
2. Click on **Upload** tab in the left sidebar
3. Scroll down to **Upload presets** section

### Step 3: Create or Edit Upload Preset

#### Option A: Create New Preset
1. Click **"Add upload preset"** button
2. Fill in the following:
   - **Preset name**: `ucolab_project` (MUST match exactly)
   - **Signing Mode**: Select **"Unsigned"** (CRITICAL!)
   - **Folder**: `ucolab_uploads` (optional, for organization)
   - **Access mode**: Public
   - Leave other settings as default
3. Click **"Save"**

#### Option B: Edit Existing Preset
1. Find the preset named `ucolab_project`
2. Click the **edit** button (pencil icon)
3. **IMPORTANT**: Change **Signing Mode** to **"Unsigned"**
4. Ensure **Access mode** is set to **"Public"**
5. Click **"Save"**

---

## 🔍 Verify Configuration

### Check Your Upload Preset Settings:

**REQUIRED SETTINGS:**
```
Preset name: ucolab_project
Signing Mode: Unsigned ← MUST BE UNSIGNED!
Access mode: Public
```

**OPTIONAL SETTINGS:**
```
Folder: ucolab_uploads
Allowed formats: jpg, png, gif, webp
Max file size: 2097152 (2MB in bytes)
Tags: website, ucolab
```

---

## 🧪 Test Upload Preset

### Method 1: Using Browser Console

1. Open your submit-project page
2. Press F12 to open Developer Console
3. Try uploading an image
4. Check the console logs for:
   ```
   📤 Upload URL: https://api.cloudinary.com/v1_1/dy9tykp58u/image/upload
   📝 Upload Preset: ucolab_project
   📦 File size: XX.XX KB
   📡 Response status: XXX
   ```

### Method 2: Using Cloudinary Dashboard

1. Go to Media Library
2. Try uploading an image manually
3. Check if it works
4. If dashboard upload works, but website doesn't, it's a preset issue

---

## 🔧 Alternative: Use Different Upload Method

If you can't configure the preset, you can use a signed upload (requires backend):

### Option 1: Use a Different Preset Name

Try changing the preset name to a default one that might already exist:

```javascript
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Try this default preset
```

### Option 2: Create Backend Signature (More Secure)

This requires a backend server to generate signatures. Not recommended for now if unsigned works.

---

## 📝 Common Issues & Solutions

### Issue 1: "Preset not found"
**Solution**: Create the preset with exact name `ucolab_project`

### Issue 2: "Signing mode is signed"
**Solution**: Change preset to "Unsigned" mode

### Issue 3: "Invalid API key"
**Solution**: API key is not needed for unsigned uploads, remove it from FormData

### Issue 4: "Upload failed, no error message"
**Solution**: Check browser console for CORS errors, ensure domain is allowed

---

## 🎯 Quick Fix Steps

### Immediate Action:

1. **Go to Cloudinary Console**
   ```
   https://cloudinary.com/console/settings/upload
   ```

2. **Create/Edit Preset**
   - Name: `ucolab_project`
   - Mode: **Unsigned** ← CRITICAL!
   - Access: Public

3. **Save Changes**

4. **Refresh Your Page**

5. **Try Upload Again**

---

## 🔐 Security Note

**Unsigned uploads are safe when:**
- ✅ You limit file size (2MB already set)
- ✅ You limit file types (png, jpg, webp already set)
- ✅ You monitor usage in Cloudinary dashboard
- ✅ You use upload presets (already doing this)

**What's NOT exposed:**
- ❌ Your API Secret (not used in unsigned uploads)
- ❌ Account password
- ❌ Billing information

**What IS public:**
- ✅ Cloud name (`dy9tykp58u`) - This is OK
- ✅ Upload preset name (`ucolab_project`) - This is OK
- ✅ API Key (`975855525185299`) - This is OK for unsigned

---

## 📞 Still Not Working?

### Debug Checklist:

1. **Verify Preset Name**
   - [ ] Preset name is exactly `ucolab_project` (case-sensitive)
   - [ ] No typos or extra spaces

2. **Verify Signing Mode**
   - [ ] Preset is set to "Unsigned" (not "Signed")

3. **Verify Access**
   - [ ] Access mode is "Public" (not "Authenticated")

4. **Clear Cache**
   - [ ] Clear browser cache
   - [ ] Hard refresh page (Ctrl+Shift+R)

5. **Check Console**
   - [ ] No CORS errors
   - [ ] Correct URL being called
   - [ ] FormData contains file and upload_preset

---

## 📸 Screenshot Guide

### What You Should See in Cloudinary Settings:

```
Upload Presets
┌─────────────────────────────────────────┐
│ Preset Name: ucolab_project             │
│ Signing Mode: ● Unsigned  ○ Signed      │ ← Must be Unsigned!
│ Folder: ucolab_uploads                  │
│ Access Mode: ● Public  ○ Authenticated  │ ← Must be Public!
│                                         │
│ [Save] [Cancel]                         │
└─────────────────────────────────────────┘
```

---

## ✅ Success Indicators

After fixing, you should see in console:

```
🔄 Uploading image 1 to Cloudinary...
📤 Upload URL: https://api.cloudinary.com/v1_1/dy9tykp58u/image/upload
📝 Upload Preset: ucolab_project
📦 File size: 125.45 KB
📡 Response status: 200
✅ Image 1 uploaded successfully: https://res.cloudinary.com/dy9tykp58u/image/upload/v1234567890/abc123.jpg
```

---

**Fix the upload preset configuration in Cloudinary dashboard and try again!** 🚀

Last Updated: November 18, 2025
