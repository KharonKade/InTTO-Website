# 👑 Admin Redirect Implementation - Testing Guide

## ✅ What's Been Implemented

Users with `isAdmin: true` in the Firestore "Registered Accounts" collection will be automatically redirected to `/admin/dashboard.html` upon login.

---

## 🔧 How It Works

### Sign In with Email/Password:
1. User enters credentials
2. Firebase authenticates
3. System checks Firestore document: `Registered Accounts/{uid}`
4. Reads `isAdmin` field
5. **If `isAdmin: true`** → Redirect to `/admin/dashboard.html`
6. **If `isAdmin: false`** → Close modal, stay on current page

### Sign In with Google:
1. User signs in with Google
2. System checks Firestore document: `Registered Accounts/{uid}`
3. Reads `isAdmin` field
4. **If `isAdmin: true`** → Redirect to `/admin/dashboard.html`
5. **If `isAdmin: false`** → Close modal, stay on current page

### Sign Up (New Users):
- All new users have `isAdmin: false` by default
- Must be manually changed in Firebase Console

---

## 🧪 Testing Steps

### Test 1: Create a Test Admin User

#### Step 1: Sign Up a Test Account
1. Go to `/ucolab/index.html`
2. Click "Sign In" → "Sign Up"
3. Create account with test credentials:
   - Email: `testadmin@uc-bcf.edu.ph`
   - Password: `admin123456`
   - First Name: `Admin`
   - Last Name: `Test`
   - Affiliation: `Administration`

#### Step 2: Make User an Admin
**Option A: Use Admin Manager Tool**
1. Open `/ucolab/admin-manager.html`
2. Find the test user
3. Click "Make Admin" button

**Option B: Firebase Console**
1. Go to Firebase Console → Firestore Database
2. Navigate to `Registered Accounts` collection
3. Find document with your test user's UID
4. Edit the `isAdmin` field
5. Change from `false` to `true`
6. Save

#### Step 3: Sign Out
1. If still logged in, sign out
2. Or use incognito/private browsing window

#### Step 4: Sign In as Admin
1. Go to `/ucolab/index.html`
2. Click "Sign In"
3. Enter test admin credentials
4. Submit

**Expected Result:** Should automatically redirect to `/admin/dashboard.html`

---

### Test 2: Verify Regular User (Non-Admin)

#### Step 1: Sign In as Regular User
1. Create or use existing regular user account
2. Make sure `isAdmin: false` in Firestore
3. Sign in

**Expected Result:** Modal closes, stays on current page (no redirect)

---

### Test 3: Google Sign-In Admin

#### Step 1: Make Google User an Admin
1. Sign in with Google once (to create account)
2. Go to Firebase Console → Firestore → `Registered Accounts`
3. Find your Google account document
4. Set `isAdmin: true`

#### Step 2: Sign Out and Sign In Again
1. Sign out
2. Sign in with Google again

**Expected Result:** Should redirect to `/admin/dashboard.html`

---

## 📋 Console Messages to Watch For

### Successful Admin Login:
```
User signed in successfully. UID: abc123xyz
User isAdmin status: true
Admin user detected, redirecting to admin dashboard...
```

### Successful Regular User Login:
```
User signed in successfully. UID: xyz789abc
User isAdmin status: false
Regular user, closing modal...
```

### Google Admin Login:
```
Google Sign-in successful: Admin User admin@example.com New user: false
Existing user found. isAdmin: true
Admin user detected, redirecting to admin dashboard...
```

---

## 🔍 Troubleshooting

### Issue: Admin not redirecting
**Check:**
1. Open browser console (F12)
2. Look for console logs
3. Verify `isAdmin` field exists in Firestore
4. Verify `isAdmin` is boolean `true` (not string "true")
5. Check if `/admin/dashboard.html` exists

### Issue: "User profile not found"
**Solution:**
- User exists in Authentication but not in Firestore
- Complete signup process or manually create Firestore document

### Issue: Redirects to wrong path
**Check:**
- Path is relative: `../admin/dashboard.html` from `/ucolab/`
- Verify file structure matches
- Check browser console for 404 errors

---

## 📁 File Structure Required

```
/home/jong/InTTO-Website/
├── ucolab/
│   ├── index.html (user pages)
│   └── js/
│       ├── main.js (handles modal login)
│       └── authuC.js (handles separate login pages)
└── admin/
    └── dashboard.html (admin dashboard)
```

---

## 🔐 Security Notes

1. **Client-Side Check Only:**
   - This is a UI redirect only
   - Backend/API should ALWAYS verify `isAdmin` from Firestore
   - Never trust client-side checks for security

2. **Firestore Security Rules:**
   - Users should NOT be able to modify their own `isAdmin` field
   - Example rule:
   ```javascript
   match /Registered Accounts/{userId} {
     allow update: if request.auth.uid == userId 
                   && !request.resource.data.diff(resource.data)
                      .affectedKeys().hasAny(['isAdmin', 'uid']);
   }
   ```

3. **Admin Pages:**
   - `/admin/dashboard.html` should also verify `isAdmin` on page load
   - Redirect non-admins back to home page

---

## 💡 Next Steps

1. ✅ Test admin redirect with test account
2. ✅ Verify regular users stay on current page
3. ⬜ Add `isAdmin` check to admin pages themselves
4. ⬜ Update Firestore security rules
5. ⬜ Create admin-only features/pages

---

## 🛠️ Code Locations

### main.js (Modal Login)
- **Line ~483-520:** `handleSignIn()` function
- **Line ~527-580:** `handleGoogleSignIn()` function

### authuC.js (Separate Login Pages)
- **Line ~29-35:** `redirectUser()` helper function
- **Line ~60-90:** Email/Password sign-in handler
- **Line ~95-150:** Google sign-in handler

---

## 📞 Testing Checklist

- [ ] Created test admin account
- [ ] Set `isAdmin: true` in Firestore
- [ ] Signed out
- [ ] Signed in with admin credentials
- [ ] Verified redirect to `/admin/dashboard.html`
- [ ] Tested regular user (no redirect)
- [ ] Tested Google sign-in admin
- [ ] Checked browser console for correct logs
- [ ] Verified all paths are correct

---

**Status:** ✅ Implementation Complete
**Ready for Testing:** Yes
**Requires Backend Validation:** Yes (for production security)
