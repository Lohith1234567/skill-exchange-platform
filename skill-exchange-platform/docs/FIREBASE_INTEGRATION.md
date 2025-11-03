# Firebase Integration Guide

## 🔥 What We've Integrated

### 1. Firebase Authentication ✅
- **Email/Password authentication** implemented in AuthContext
- **Real-time auth state management** with `onAuthStateChanged`
- **Auto-login on page refresh** - users stay logged in
- **Error handling** for common Firebase auth errors
- **Loading states** for better UX

### 2. Firestore Database ✅
- **User profiles** stored in `/users/{userId}` collection
- **Skill posts** stored in `/skillPosts` collection
- **Exchanges/Matches** stored in `/exchanges` collection
- **XP and gamification** tracking
- **Real-time queries** with filters

### 3. Realtime Database ✅
- **Chat messages** stored in `/messages/{chatId}`
- **Chat metadata** stored in `/chats/{chatId}`
- **Real-time subscriptions** for live chat updates
- **Presence system** ready for online/offline status

---

## 📁 Files Updated

### Core Configuration
- ✅ `src/config/firebase.js` - Firebase initialization
- ✅ `.env` - Environment variables (fill with your Firebase config)

### Authentication
- ✅ `src/contexts/AuthContext.jsx` - Firebase Auth integration
  - `login()` - Sign in with email/password
  - `signup()` - Create new account
  - `logout()` - Sign out
  - Auto-sync with Firestore user data

### Services
- ✅ `src/services/firebaseService.js` - Complete Firebase operations
  - User profile CRUD
  - Skill post operations
  - Exchange/match management
  - Real-time chat functions
  - XP and gamification

### Pages
- ✅ `src/pages/Login/Login.jsx` - Firebase auth integration
  - Error display
  - Loading states
  - Form validation
  
- ✅ `src/pages/Profile/Profile.jsx` - Firebase profile sync
  - Save to Firestore
  - Load from Firestore
  - Success/error messages

---

## 🚀 How to Use

### Step 1: Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore Database (test mode)
5. Create Realtime Database (test mode)

### Step 2: Get Firebase Config
1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to register a web app
4. Copy the `firebaseConfig` object

### Step 3: Update Environment Variables
Edit `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### Step 4: Restart Development Server
```powershell
npm run dev
```

---

## 🔐 Security Rules

### Firestore Security Rules
Go to Firestore → Rules tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone authenticated can read skill posts
    match /skillPosts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Exchanges visible to both participants
    match /exchanges/{exchangeId} {
      allow read: if request.auth != null && 
        (resource.data.user1Id == request.auth.uid || 
         resource.data.user2Id == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.user1Id == request.auth.uid || 
         resource.data.user2Id == request.auth.uid);
    }
    
    // XP logs readable by owner
    match /xpLogs/{logId} {
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### Realtime Database Security Rules
Go to Realtime Database → Rules tab:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "chats": {
      "$chatId": {
        ".read": "auth != null && (data.child('user1Id').val() === auth.uid || data.child('user2Id').val() === auth.uid)",
        ".write": "auth != null && (data.child('user1Id').val() === auth.uid || data.child('user2Id').val() === auth.uid)"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "$messageId": {
          ".validate": "newData.hasChildren(['senderId', 'text', 'timestamp'])"
        }
      }
    },
    "users": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && $userId === auth.uid"
      }
    }
  }
}
```

---

## 📊 Database Structure

### Firestore Collections

#### `/users/{userId}`
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  avatar: "JD",
  bio: "I love coding!",
  skillsToTeach: ["React", "JavaScript"],
  skillsToLearn: ["Python", "Machine Learning"],
  xp: 1250,
  level: 3,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `/skillPosts/{postId}`
```javascript
{
  userId: "user123",
  offering: ["React", "CSS"],
  requesting: ["Python"],
  category: "Programming",
  description: "Looking to learn Python...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `/exchanges/{exchangeId}`
```javascript
{
  user1Id: "user123",
  user2Id: "user456",
  user1Teaching: "React",
  user2Teaching: "Python",
  status: "active", // pending, active, completed
  progress: 75,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Realtime Database Structure

#### `/chats/{chatId}`
```javascript
{
  user1Id: "user123",
  user2Id: "user456",
  lastMessage: "See you tomorrow!",
  lastMessageTime: 1234567890,
  lastMessageSender: "user123",
  createdAt: 1234567890
}
```

#### `/messages/{chatId}/{messageId}`
```javascript
{
  senderId: "user123",
  text: "Hello!",
  timestamp: 1234567890,
  read: false
}
```

---

## 🎯 Available Functions

### From `firebaseService.js`

#### User Profile
```javascript
import { getUserProfile, updateUserProfile, saveUserProfile } from './services/firebaseService';

// Get user profile
const profile = await getUserProfile(userId);

// Update profile
await updateUserProfile(userId, { bio: 'New bio' });

// Save profile (merge)
await saveUserProfile(userId, { skillsToTeach: ['React'] });
```

#### Skill Posts
```javascript
import { createSkillPost, getSkillPosts } from './services/firebaseService';

// Create post
await createSkillPost(userId, {
  offering: ['React'],
  requesting: ['Python'],
  category: 'Programming'
});

// Get posts with filters
const posts = await getSkillPosts({ category: 'Programming' });
```

#### Exchanges
```javascript
import { createExchange, getUserExchanges, updateExchangeStatus } from './services/firebaseService';

// Create exchange
await createExchange(user1Id, user2Id, {
  user1Teaching: 'React',
  user2Teaching: 'Python'
});

// Get user exchanges
const exchanges = await getUserExchanges(userId);

// Update status
await updateExchangeStatus(exchangeId, 'completed');
```

#### Real-time Chat
```javascript
import { sendMessage, subscribeToMessages, createChat } from './services/firebaseService';

// Create chat
const { chatId } = await createChat(user1Id, user2Id);

// Send message
await sendMessage(chatId, senderId, 'Hello!');

// Subscribe to messages
const unsubscribe = subscribeToMessages(chatId, (messages) => {
  console.log('New messages:', messages);
});

// Cleanup
unsubscribe();
```

#### XP & Gamification
```javascript
import { addXP, getUserStats } from './services/firebaseService';

// Add XP
await addXP(userId, 50, 'Completed session');

// Get user stats
const stats = await getUserStats(userId);
// Returns: { totalExchanges, activeExchanges, xp, level, ... }
```

---

## ✅ Testing Checklist

- [ ] Create a new account (Sign Up)
- [ ] Login with credentials
- [ ] Update profile (name, bio, skills)
- [ ] Check Firestore for user data
- [ ] Logout and login again
- [ ] Verify data persists
- [ ] Check browser console for errors

---

## 🐛 Common Issues

### 1. Firebase not initialized
**Error:** `Firebase: No Firebase App '[DEFAULT]' has been created`
**Fix:** Make sure `.env` file has correct values and restart dev server

### 2. Permission denied
**Error:** `Missing or insufficient permissions`
**Fix:** Update Firestore/Realtime Database security rules (see above)

### 3. Auth state not persisting
**Issue:** User logged out on refresh
**Fix:** Firebase auth persists automatically. Check if `onAuthStateChanged` is working in AuthContext

### 4. Environment variables not loading
**Error:** Variables are `undefined`
**Fix:** 
- Prefix with `VITE_` (required for Vite)
- Restart dev server after changing `.env`
- Use `import.meta.env.VITE_*` not `process.env`

---

## 🎓 Next Steps

1. **Add more pages:**
   - Update Dashboard to fetch real user stats
   - Update Explore to fetch real skill posts
   - Update Chat to use real-time messages

2. **Enhance features:**
   - Add Google/GitHub OAuth
   - Implement email verification
   - Add password reset
   - Add user search
   - Add notifications

3. **Security:**
   - Update security rules for production
   - Add rate limiting
   - Add input validation
   - Implement CSRF protection

4. **Performance:**
   - Add pagination for large lists
   - Implement query caching
   - Optimize Firestore queries
   - Add offline support

---

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Realtime Database Security](https://firebase.google.com/docs/database/security)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**Remember:** Never commit your `.env` file! It's already in `.gitignore`.
