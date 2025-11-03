# Firebase Security Rules Setup

You're seeing "Missing or insufficient permissions" because your Firebase project needs security rules configured.

## Quick Fix for Development

### 1. Firestore Rules (Firebase Console)

Go to: **Firebase Console → Firestore Database → Rules**

Paste this (allows all reads/writes for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish**.

### 2. Realtime Database Rules (Firebase Console)

Go to: **Firebase Console → Realtime Database → Rules**

Paste this:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

Click **Publish**.

---

## Step-by-Step Instructions

### Firestore Database Rules

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab at the top
5. Replace existing rules with the code above
6. Click **Publish**

### Realtime Database Rules

1. In Firebase Console, click **Realtime Database** in left sidebar
2. Click **Rules** tab
3. Replace existing rules with the JSON above
4. Click **Publish**

---

## Verify It Works

After publishing rules:

1. Reload your app in the browser
2. Try the action that was failing (rating, chat, etc.)
3. Check browser console for any remaining errors

---

## Production Rules (TODO: Implement Later)

⚠️ **Important**: The rules above are for **development only**. Before launching:

### Secure Firestore Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      // Prevent manual rating manipulation
      allow update: if request.auth.uid == userId 
        && !request.resource.data.diff(resource.data)
          .affectedKeys()
          .hasAny(['averageRating', 'totalRatings']);
    }
    
    // Anyone can read skill posts
    match /skillPosts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    // Exchanges
    match /exchanges/{exchangeId} {
      allow read: if request.auth != null 
        && (resource.data.user1Id == request.auth.uid 
          || resource.data.user2Id == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null 
        && (resource.data.user1Id == request.auth.uid 
          || resource.data.user2Id == request.auth.uid);
    }
    
    // Matches
    match /matches/{matchId} {
      allow read: if request.auth != null 
        && (resource.data.userAId == request.auth.uid 
          || resource.data.userBId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null 
        && (resource.data.userAId == request.auth.uid 
          || resource.data.userBId == request.auth.uid);
    }
    
    // Ratings - create only, no edits
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.resource.data.raterUserId == request.auth.uid
        && request.resource.data.ratedUserId != request.auth.uid
        && request.resource.data.rating >= 1 
        && request.resource.data.rating <= 5;
      allow update, delete: if false; // Immutable
    }
  }
}
```

### Secure Realtime Database Rules Example

```json
{
  "rules": {
    "chats": {
      "$chatId": {
        ".read": "auth != null && (data.child('user1Id').val() == auth.uid || data.child('user2Id').val() == auth.uid)",
        ".write": "auth != null && (data.child('user1Id').val() == auth.uid || data.child('user2Id').val() == auth.uid)"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "userChats": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

---

## Common Issues

### "Missing or insufficient permissions"
- Rules not published yet → Publish in Firebase Console
- User not authenticated → Check auth state in console
- Wrong rule syntax → Check for typos in rules editor

### Rules not taking effect
- Wait 10-30 seconds after publishing
- Hard refresh browser (Ctrl+Shift+R)
- Check Firebase Console for rule validation errors

---

## Testing Your Rules

In Firebase Console → Rules → **Playground**:

Test read/write operations with different auth states to verify security.

Example test:
```
Location: /users/testUserId
Auth: Authenticated as testUserId
Operation: get
Result: Should allow ✓
```

---

**TL;DR**: Copy the development rules above into Firebase Console → Rules → Publish. Takes 30 seconds and fixes the error immediately.
