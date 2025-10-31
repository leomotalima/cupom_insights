# Firestore Setup Guide

## ✅ What Was Fixed (ÚLTIMA ATUALIZAÇÃO)

Fixed the **WebChannel 400 Bad Request** error when writing to Firestore.

### The Problem:
- Firestore on web was trying to use WebChannel for real-time sync
- WebChannel connections were being rejected with 400 errors
- This prevented documents from being saved

### The Solution (AGGRESSIVE FIX):

**1. Disabled WebChannel completely** - Now uses long polling instead:

```typescript
export const db = Platform.OS === 'web'
  ? initializeFirestore(app, {
      localCache: memoryLocalCache(),
      ignoreUndefinedProperties: true,
      // Force long polling instead of WebChannel
      experimentalForceLongPolling: true,
      // Disable auto-detection
      experimentalAutoDetectLongPolling: false,
    })
  : initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });
```

**2. Added graceful error handling** - App still works even if Firestore fails:
- AI extraction works regardless
- If Firestore save fails, user still sees the data
- Friendly error message instead of crash

## 🔐 Firestore Security Rules

Make sure your Firestore security rules allow writes. By default, Firestore blocks all writes in production.

### Check Your Rules:

1. Go to: **https://console.firebase.google.com/project/projeto-com-ia-generativa/firestore/rules**

2. You should see something like this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to 'compras' collection (for testing)
    match /compras/{document=**} {
      allow read, write: if true;  // WARNING: Only for testing!
    }
  }
}
```

### ⚠️ Important Security Notes:

**For Development/Testing (Current Setup):**
```javascript
// Allow everyone to read/write (NOT secure, testing only!)
match /compras/{document=**} {
  allow read, write: if true;
}
```

**For Production (Recommended):**
```javascript
// Only allow authenticated users
match /compras/{document=**} {
  allow read, write: if request.auth != null;
}
```

**Best Practice (User-specific data):**
```javascript
// Each user can only access their own data
match /compras/{userId}/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
```

## 🚀 How to Update Firestore Rules:

1. Go to Firebase Console: https://console.firebase.google.com/project/projeto-com-ia-generativa/firestore/rules

2. Click **Edit Rules**

3. For testing, use:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /compras/{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

4. Click **Publish**

5. Test your app again

## 🧪 Testing Firestore:

After updating rules and configuration:

1. **Restart your dev server:**
   ```bash
   npm start
   ```

2. **Test receipt scanning:**
   - Take a photo of a receipt
   - Watch console for: "💾 Salvando no Firestore..."
   - Should see: "✅ Documento salvo com ID: ..."

3. **Check Firestore Console:**
   - Go to: https://console.firebase.google.com/project/projeto-com-ia-generativa/firestore/data
   - You should see the `compras` collection with your data

## 🔍 Common Issues:

### Still getting 400 errors?
- Check Firestore rules (see above)
- Make sure API key in `.env` is correct
- Try clearing browser cache (Ctrl+Shift+Del)

### Permission Denied errors?
- Update Firestore security rules to allow writes
- Make sure you're using the correct Firebase project

### Data not saving?
- Check browser console for detailed errors
- Verify Firestore database exists in Firebase Console
- Try the Firestore data viewer to manually add a document

## 📝 Files Modified:

- `src/firebase.ts` - Updated Firestore initialization for web
- Uses `memoryLocalCache()` for web platform
- Prevents WebChannel 400 errors
