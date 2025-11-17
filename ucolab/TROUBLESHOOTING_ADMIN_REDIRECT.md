# 🚨 ADMIN REDIRECT NOT WORKING? - TROUBLESHOOTING GUIDE

## 🔧 Debug Steps to Follow

### Step 1: Open the Debug Tool
1. Navigate to: `/ucolab/check-admin-status.html`
2. This will show you:
   - Your current login status
   - Your isAdmin field value
   - The exact data type of isAdmin
   - What the redirect logic will do

### Step 2: Check Your Browser Console
1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Sign in with your account
4. Look for these messages:

**For Admin Users (should see):**
```
🔵 Starting email/password sign in...
✅ User signed in successfully. UID: [your-uid]
📧 Email: [your-email]
🔍 Checking Firestore for user document...
✅ User document found in Firestore
📄 User data: {...}
🛡️  isAdmin (raw): true
🛡️  isAdmin (type): boolean
🛡️  isAdmin || false: true
🛡️  isAdmin === true: true
⏰ Updating last login timestamp...
✅ Last login updated
👑 ADMIN USER DETECTED!
🚀 Redirecting to: ../admin/dashboard.html
```

**For Regular Users (should see):**
```
🔵 Starting email/password sign in...
✅ User signed in successfully. UID: [your-uid]
📧 Email: [your-email]
🔍 Checking Firestore for user document...
✅ User document found in Firestore
📄 User data: {...}
🛡️  isAdmin (raw): false
🛡️  isAdmin (type): boolean
🛡️  isAdmin || false: false
🛡️  isAdmin === true: false
⏰ Updating last login timestamp...
✅ Last login updated
👤 Regular user detected
✅ Closing modal and staying on page
```

### Step 3: Verify isAdmin Field in Firestore

Go to Firebase Console and check:

1. **Navigate to Firestore Database:**
   - Go to: https://console.firebase.google.com
   - Select project: **uc-intto**
   - Click: **Firestore Database**

2. **Find Your User Document:**
   - Collection: `Registered Accounts`
   - Document ID: Your UID (shown in console logs or debug tool)

3. **Check isAdmin Field:**
   - Field name: `isAdmin`
   - **Type MUST be:** `boolean` (NOT string)
   - **Value MUST be:** `true` (NOT "true" as text)

### ⚠️ COMMON MISTAKES

#### ❌ Wrong - isAdmin as STRING:
```
isAdmin: "true"  ← This is text, not boolean
```

#### ✅ Correct - isAdmin as BOOLEAN:
```
isAdmin: true  ← This is a boolean value
```

### Step 4: Fix isAdmin Field if Wrong

**If isAdmin is a string "true" instead of boolean true:**

1. In Firebase Console → Firestore
2. Click on your user document
3. Click the pencil/edit icon next to `isAdmin`
4. **Delete the field** completely
5. Click "Add field"
6. Field name: `isAdmin`
7. Type: Select **"boolean"** from dropdown
8. Value: Check the box for `true`
9. Save

### Step 5: Test Again

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Sign out** completely
3. **Close all browser tabs** with the site
4. **Open a new incognito/private window**
5. Navigate to `/ucolab/index.html`
6. Sign in with your admin account
7. Watch the console for the logs above

### Step 6: Check File Paths

Make sure your file structure is correct:

```
/home/jong/InTTO-Website/
├── ucolab/
│   ├── index.html         ← You are here
│   └── js/
│       └── main.js        ← Contains redirect: ../admin/dashboard.html
└── admin/
    └── dashboard.html     ← Should redirect here
```

From `/ucolab/index.html`, the path `../admin/dashboard.html` should resolve to:
`/home/jong/InTTO-Website/admin/dashboard.html`

### Step 7: Check for JavaScript Errors

In the Console tab, look for any **RED error messages**:

**Common errors:**
- `db is not defined` → Firebase not initialized properly
- `auth is not defined` → Firebase Auth not loaded
- `Cannot read property 'collection' of undefined` → Firestore not available
- `404 Not Found: ../admin/dashboard.html` → Dashboard file doesn't exist

### Step 8: Test the Redirect Manually

In the browser console, while logged in, type:

```javascript
// Check if db and auth are available
console.log('auth:', window.auth);
console.log('db:', window.db);

// Get current user
firebase.auth().currentUser

// Manually check isAdmin
db.collection('Registered Accounts').doc(firebase.auth().currentUser.uid).get()
  .then(doc => {
    console.log('User data:', doc.data());
    console.log('isAdmin:', doc.data().isAdmin);
    console.log('Type:', typeof doc.data().isAdmin);
  });

// Test redirect
window.location.href = '../admin/dashboard.html';
```

## 🎯 Quick Checklist

Before asking for help, verify:

- [ ] I opened `/ucolab/check-admin-status.html` and it shows my status
- [ ] I checked the browser console (F12) for log messages
- [ ] My isAdmin field is **boolean type** (not string)
- [ ] My isAdmin value is `true` (not "true")
- [ ] I cleared browser cache and tested in incognito mode
- [ ] The file `/admin/dashboard.html` exists
- [ ] I see the alert "Welcome Admin! Redirecting to dashboard..."
- [ ] No red errors appear in the console

## 🆘 Still Not Working?

If you've completed all steps above and it's still not working:

1. **Take a screenshot** of:
   - The browser console logs
   - The Firestore document showing isAdmin field
   - The `/ucolab/check-admin-status.html` page

2. **Note these details:**
   - Which browser are you using?
   - Are you on `/ucolab/index.html` or `/ucolab/signupform.html`?
   - Do you see the alert popup "Welcome Admin! Redirecting to dashboard..."?
   - Does the redirect happen but goes to the wrong page?

3. **Check if it's a caching issue:**
   ```bash
   # Hard refresh the page
   Ctrl + Shift + R  (Windows/Linux)
   Cmd + Shift + R   (Mac)
   ```

## 📱 Testing on Different Pages

The redirect works on:
- ✅ `/ucolab/index.html` - Modal login (uses main.js)
- ✅ `/ucolab/signupform.html` - Separate login page (uses authuC.js)

Both should redirect admin users to `/admin/dashboard.html`

## 🔐 Security Note

Remember: This is a **client-side redirect only**. 

When you access `/admin/dashboard.html`, it should ALSO check if you're an admin and kick you out if not. Otherwise, anyone who types the URL directly can access it!

## 🧪 Test Accounts

Create test accounts to verify:

1. **Admin Test Account:**
   - Email: `admin@test.com`
   - Set `isAdmin: true` in Firestore
   - Should redirect to `/admin/dashboard.html`

2. **Regular Test Account:**
   - Email: `user@test.com`
   - Leave `isAdmin: false` in Firestore
   - Should stay on current page (modal closes)

---

**Last Updated:** After adding detailed console logging
**Files Modified:** 
- `/ucolab/js/main.js` - Enhanced logging
- `/ucolab/check-admin-status.html` - Debug tool created
