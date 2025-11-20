# Admin Security Setup Instructions

## Step 1: Update Firebase Configuration

Open `admin/js/auth-check.js` and replace the Firebase config with your actual credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
    projectId: "YOUR_ACTUAL_PROJECT_ID",
    storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
    messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
    appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 2: Add auth-check.js to ALL admin pages

Add this line in the `<head>` section of every admin HTML file:

```html
<script type="module" src="js/auth-check.js"></script>
```

Files to update:
- admin/dashboard.html
- admin/startups.html
- admin/ip-applications.html
- admin/news-events.html
- admin/team.html
- admin/innovation.html
- admin/sdg.html

## Step 3: Test

1. Open incognito browser
2. Try to access: https://intto-website.vercel.app/admin/metrics.html
3. You should be automatically redirected to /index.html
4. Only users logged in with `isAdmin: true` in Firestore can access admin pages

## How it works:

- Checks if user is logged in (Firebase Auth)
- Checks if user has `isAdmin: true` in Firestore users collection
- If either check fails, redirects to home page
- Runs on every admin page load
- No login page needed - uses existing Firebase authentication

## Security Benefits:

✅ No direct access to admin pages without authentication
✅ Checks admin status in real-time
✅ Works in incognito/private browsing
✅ Uses your existing Firebase user database
✅ No need to create separate login system
