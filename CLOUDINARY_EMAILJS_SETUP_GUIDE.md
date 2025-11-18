# 🚀 Complete Setup Guide: Cloudinary + EmailJS Integration

## 📋 Overview

Your project submission system now has:
1. **Cloudinary API** - Cloud image hosting (with base64 fallback)
2. **EmailJS** - Email notifications to admin
3. **Admin Approval System** - Approve/Reject/Pending workflow

---

## 1️⃣ Cloudinary Setup (Required for Image Uploads)

### Step 1: Create Unsigned Upload Preset

1. **Login to Cloudinary**: https://cloudinary.com/console/dy9tykp58u
2. **Navigate to Settings**:
   - Click "Settings" (gear icon) in the top right
   - Click "Upload" tab

3. **Create Upload Preset**:
   - Scroll to "Upload presets" section
   - Click "Add upload preset"

4. **Configure Preset**:
   ```
   Preset name: ucolab_project
   Signing mode: Unsigned ⚠️ CRITICAL - Must be "Unsigned"
   Access mode: Public
   Folder: ucolab_projects (optional but recommended)
   Use filename or externally defined Public ID: Toggle ON
   Unique filename: Toggle ON
   Overwrite: Toggle OFF
   ```

5. **Save** the preset

### Step 2: Verify Configuration

Your code already has the correct settings:
- Cloud Name: `dy9tykp58u` ✅
- API Key: `975855525185299` ✅
- Upload Preset: `ucolab_project` ✅

### Step 3: Test Upload

1. Go to `/ucolab/submit-project.html`
2. Upload an image
3. Check console for: `✅ Image 1 uploaded to Cloudinary`
4. If it fails, images will auto-fallback to base64 storage

---

## 2️⃣ EmailJS Setup (Required for Admin Notifications)

### Step 1: Create EmailJS Account

1. Go to: https://www.emailjs.com/
2. Click "Sign Up" (free plan: 200 emails/month)
3. Verify your email

### Step 2: Add Email Service

1. **Dashboard** → **Email Services** → **Add New Service**
2. Choose your email provider:
   - **Gmail** (recommended)
   - Outlook
   - Yahoo
   - Custom SMTP

3. **For Gmail**:
   - Click "Connect Account"
   - Login with your Gmail
   - Allow EmailJS access
   - Service ID will be auto-generated (e.g., `service_abc123`)

### Step 3: Create Email Template

1. **Dashboard** → **Email Templates** → **Create New Template**
2. **Template Settings**:
   ```
   Template Name: Project Submission Notification
   Template ID: (auto-generated, e.g., template_xyz789)
   ```

3. **Template Content** (copy/paste):

**Subject:**
```
🚀 New Project Submission: {{project_name}}
```

**Body:**
```html
<h2>New Project Submission Received</h2>

<p>A new project has been submitted to UCoLab and is pending your review.</p>

<h3>Project Details:</h3>
<ul>
  <li><strong>Project Name:</strong> {{project_name}}</li>
  <li><strong>Founder:</strong> {{founder_name}}</li>
  <li><strong>Email:</strong> {{founder_email}}</li>
  <li><strong>Industry:</strong> {{industry}}</li>
  <li><strong>College:</strong> {{college}}</li>
  <li><strong>TRL Level:</strong> {{trl}}</li>
  <li><strong>Submission Date:</strong> {{submission_date}}</li>
</ul>

<p>
  <a href="{{admin_link}}" style="background-color: #155E4A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
    Review in Admin Panel →
  </a>
</p>

<hr>
<p style="color: #666; font-size: 12px;">
  This is an automated notification from UC InTTO UCoLab system.
</p>
```

4. **To Email**: Set your admin email (e.g., `admin@uc-bcf.edu.ph`)
5. **Save Template**

### Step 4: Get Your Keys

1. **Dashboard** → **Account** → **General**
2. Copy these values:
   - **Service ID**: `service_abc123`
   - **Template ID**: `template_xyz789`
   - **Public Key**: `your_public_key_here`

### Step 5: Update Code

Edit `/ucolab/js/submit-project.js` (lines 5-10):

```javascript
// --- EmailJS Configuration ---
const EMAILJS_SERVICE_ID = 'service_abc123'; // Replace with YOUR service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz789'; // Replace with YOUR template ID
const EMAILJS_PUBLIC_KEY = 'your_public_key_here'; // Replace with YOUR public key
```

Also update `/ucolab/submit-project.html` (around line 368):

```javascript
if (typeof emailjs !== 'undefined') {
    emailjs.init('your_public_key_here'); // Replace with YOUR public key
}
```

### Step 6: Test Email

1. Submit a test project
2. Check your admin email inbox
3. Console should show: `✅ Email notification sent to admin`

---

## 3️⃣ Admin Approval System (Already Configured)

### How It Works

1. **User submits project** → Saved with `status: 'pending'`
2. **Admin receives email** notification
3. **Admin opens** `/admin/startups.html`
4. **Pending projects** show yellow badge "⏳ Pending Review"
5. **Admin has 4 options**:
   - ✅ **Approve** - Changes status to `active` (publicly visible)
   - ❌ **Reject** - Changes status to `rejected` (hidden)
   - ✏️ **Edit** - Modify project details
   - 🗑️ **Delete** - Permanently remove

### Admin Actions

**Approve Project:**
```javascript
// Click green checkmark button
// Confirms: "Approve [Project Name]? This will make it publicly visible."
// Status changes: pending → active
```

**Reject Project:**
```javascript
// Click red X button
// Prompts for rejection reason (optional)
// Status changes: pending → rejected
// Logs reason and date
```

### Status Badges

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| Pending | 🟨 Yellow | Awaiting admin review |
| Active | 🟩 Green | Approved & publicly visible |
| Graduated | 🟦 Blue | Completed incubation |
| Rejected | 🟥 Red | Not approved |

---

## 4️⃣ Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Submits Project                      │
│                  (/ucolab/submit-project.html)              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Upload Images to Cloudinary │
              │  (Falls back to base64)      │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Save to localStorage:       │
              │  - pendingProjects           │
              │  - ucInttoStartupsData       │
              │  Status: 'pending'           │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Send Email via EmailJS      │
              │  To: admin@uc-bcf.edu.ph     │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Admin Opens                 │
              │  /admin/startups.html        │
              └──────────────┬───────────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
          ┌─────────┐  ┌─────────┐  ┌─────────┐
          │ Approve │  │  Reject │  │  Edit   │
          │ Status: │  │ Status: │  │ Update  │
          │ active  │  │rejected │  │ Details │
          └─────────┘  └─────────┘  └─────────┘
```

---

## 5️⃣ Testing Checklist

### Cloudinary Test
- [ ] Upload preset `ucolab_project` created
- [ ] Preset signing mode is "Unsigned"
- [ ] Test image upload in submit form
- [ ] Check console for Cloudinary URL
- [ ] Verify image appears in Cloudinary dashboard

### EmailJS Test
- [ ] EmailJS account created
- [ ] Email service connected (Gmail/etc)
- [ ] Template created with project variables
- [ ] Public key, Service ID, Template ID copied
- [ ] Keys pasted in submit-project.js
- [ ] Test submission sends email
- [ ] Email received in admin inbox

### Admin Approval Test
- [ ] Submit test project (appears as pending)
- [ ] Open `/admin/startups.html`
- [ ] See yellow "⏳ Pending Review" badge
- [ ] Click approve button → Status changes to active
- [ ] Submit another test project
- [ ] Click reject button → Status changes to rejected
- [ ] Try editing a project
- [ ] Try deleting a project

---

## 6️⃣ Troubleshooting

### Cloudinary 401 Error
```
❌ Upload failed: Unknown API key
```
**Solution**: 
- Preset doesn't exist or is "Signed" mode
- Go to Cloudinary dashboard → Upload → Create preset
- Set signing mode to "Unsigned"

### EmailJS Not Sending
```
⚠️ EmailJS not configured or loaded
```
**Solutions**:
1. Check public key is correct in both files
2. Verify service ID and template ID are correct
3. Check browser console for EmailJS errors
4. Ensure you haven't exceeded 200 emails/month (free plan)
5. Check spam folder

### Images Using Base64 (Large Storage)
**Why**: Cloudinary failed, fallback activated
**Solution**: 
- Fix Cloudinary setup
- Refresh page and re-upload
- Check console for Cloudinary error details

### Project Not Showing in Admin
**Check**:
1. localStorage key: `ucInttoStartupsData`
2. Browser console: `localStorage.getItem('ucInttoStartupsData')`
3. Ensure submission completed (no errors)
4. Refresh admin page

---

## 7️⃣ Quick Start Commands

### View All Pending Projects (Browser Console)
```javascript
JSON.parse(localStorage.getItem('ucInttoStartupsData'))
  .filter(p => p.status === 'pending')
```

### Clear All Data (Reset)
```javascript
localStorage.removeItem('ucInttoStartupsData');
localStorage.removeItem('pendingProjects');
location.reload();
```

### Check Cloudinary Config
```javascript
// In submit-project.js console
console.log('Cloudinary URL:', CLOUDINARY_URL);
console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
```

---

## 8️⃣ Important Notes

### Security
- ⚠️ **Never commit** EmailJS private keys to Git
- ✅ Public keys are safe (they're meant to be public)
- ✅ Cloudinary upload preset must be "Unsigned" for client upload
- 🔒 Consider adding backend validation for production

### Storage Limits
- localStorage: ~5-10MB per domain
- Base64 images: 33% larger than original
- Cloudinary free tier: 25GB storage, 25GB bandwidth/month
- EmailJS free tier: 200 emails/month

### Production Recommendations
1. Move EmailJS keys to environment variables
2. Add server-side image validation
3. Implement rate limiting on submissions
4. Add email confirmation to users
5. Store data in Firebase/Database instead of localStorage

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all configuration keys are correct
3. Test each component individually
4. Check this guide's troubleshooting section

---

**Status**: ✅ Ready to use once Cloudinary preset and EmailJS are configured

**Last Updated**: November 18, 2025
