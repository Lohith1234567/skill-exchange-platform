# XP System Implementation

## Overview
The XP (Experience Points) system rewards users with 50 XP for completing skill exchanges. Users level up every 1,000 XP, with progress displayed in an animated progress bar on the Dashboard.

## Features
- ⚡ **Auto XP Award**: 50 XP automatically added when exchange is completed
- 📊 **Live Progress Bar**: Real-time XP display with percentage progress
- 🎯 **Level System**: 1 level = 1,000 XP (configurable)
- 👥 **Dual Rewards**: Both participants receive XP when exchange completes
- 🔄 **Auto Refresh**: Dashboard stats update immediately after completion

## XP Flow

### 1. Complete Exchange
```
User clicks "Complete Exchange (+50 XP)" button
    ↓
completeExchange(exchangeId) service called
    ↓
Exchange status set to 'completed' in Firestore
    ↓
50 XP awarded to BOTH user1 and user2
    ↓
User levels checked and updated if threshold reached
    ↓
Dashboard stats auto-refresh to show new XP
```

### 2. Level Calculation
```javascript
// Every 1,000 XP = 1 level
newLevel = Math.floor(newXP / 1000) + 1;

// Examples:
// 0 XP = Level 1
// 500 XP = Level 1
// 1,000 XP = Level 2
// 2,500 XP = Level 3
```

## Data Structure

### `users` Collection
```javascript
{
  xp: 1250,              // Current XP total
  level: 2,              // Calculated level
  // ... other fields
}
```

### `exchanges` Collection
```javascript
{
  user1Id: "uid123",
  user2Id: "uid456",
  status: "completed",   // 'active' → 'completed'
  completedAt: Timestamp,
  // ... other fields
}
```

### `xpLogs` Collection (tracking)
```javascript
{
  userId: "uid123",
  amount: 50,
  reason: "Completed exchange exchange789",
  timestamp: Timestamp
}
```

## Service Functions

### completeExchange
**Location:** `src/services/firebaseService.js`

Marks exchange complete and awards XP to both participants.

```javascript
const result = await completeExchange(exchangeId);

// Returns:
{
  success: true,
  xpAwarded: 50,
  user1Result: {
    newXP: 1250,
    newLevel: 2,
    leveledUp: false
  },
  user2Result: {
    newXP: 1000,
    newLevel: 2,
    leveledUp: true  // This user just leveled up!
  }
}
```

### addXP
**Location:** `src/services/firebaseService.js`

Low-level function to add XP to a single user.

```javascript
const result = await addXP(userId, 50, "Completed exchange");

// Returns:
{
  newXP: 1250,
  newLevel: 2,
  leveledUp: false
}
```

### getUserStats
Fetches user's current XP, level, and exchange counts.

```javascript
const stats = await getUserStats(userId);

// Returns:
{
  totalExchanges: 12,
  activeExchanges: 5,
  xp: 1250,
  level: 2,
  skillsToTeach: [...],
  skillsToLearn: [...]
}
```

## Dashboard Integration

### XP Progress Display
```jsx
// Progress bar shows XP toward next level
const xpProgress = (stats.currentXP / stats.nextLevelXP) * 100;
const xpToNext = stats.nextLevelXP - stats.currentXP;

// Visual indicators:
// - Animated gradient progress bar
// - Percentage display
// - "XP to go" counter
// - Current level badge
```

### Complete Exchange Button
- Appears on active exchanges with progress ≥ 90%
- Shows loading spinner during completion
- Displays "+50 XP" in button text
- Automatically refreshes stats after completion

### Real-time Stats
```jsx
useEffect(() => {
  const loadStats = async () => {
    const userStats = await getUserStats(user.uid);
    setStats({
      currentXP: userStats.xp || 0,
      currentLevel: userStats.level || 1,
      nextLevelXP: 1000,
      // ... other stats
    });
  };
  loadStats();
}, [user?.uid]);
```

## Usage Example

### Complete an Exchange
```jsx
const handleCompleteExchange = async (exchangeId) => {
  try {
    const result = await completeExchange(exchangeId);
    console.log(`Awarded ${result.xpAwarded} XP!`);
    
    // Check for level up
    if (result.user1Result?.leveledUp) {
      showLevelUpNotification(result.user1Result.newLevel);
    }
    
    // Refresh stats
    const updatedStats = await getUserStats(user.uid);
    setStats(updatedStats);
  } catch (error) {
    console.error('Failed to complete exchange:', error);
  }
};
```

## Configuration

### Adjust XP Rewards
Edit `completeExchange` in `firebaseService.js`:
```javascript
const xpAmount = 50; // Change to any value
```

### Adjust Level Threshold
Edit `addXP` in `firebaseService.js`:
```javascript
// Change from 1000 to any value
const newLevel = Math.floor(newXP / 1000) + 1;
```

### Custom XP Rewards
Award XP for other actions:
```javascript
// Award XP for creating a post
await addXP(userId, 10, "Created skill post");

// Award XP for completing profile
await addXP(userId, 25, "Completed profile");

// Award XP for first chat message
await addXP(userId, 5, "Sent first message");
```

## UI States

### Active Exchange (≥90% progress)
```
┌────────────────────────────────────┐
│ Mike Chen                          │
│ Teaching: JavaScript               │
│ [████████████████░░] 90%          │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ✓ Complete Exchange (+50 XP)   │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Completed Exchange (awaiting rating)
```
┌────────────────────────────────────┐
│ Sarah Johnson                      │
│ Teaching: React                    │
│ [████████████████████] 100%       │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ ⭐ Rate Sarah                   │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

## Testing

### Manual Test Flow
1. Navigate to Dashboard
2. Find an active exchange with 90%+ progress
3. Click "Complete Exchange (+50 XP)"
4. Watch for:
   - ✅ Button shows loading spinner
   - ✅ XP bar animates upward
   - ✅ Level updates if threshold crossed
   - ✅ Button changes to "Rate Partner"
   - ✅ Console logs XP award

### Console Verification
```javascript
// Check user's XP was updated
const userDoc = await getDoc(doc(db, 'users', userId));
console.log('Current XP:', userDoc.data().xp);
console.log('Current Level:', userDoc.data().level);

// Check XP log was created
const logsQuery = query(
  collection(db, 'xpLogs'),
  where('userId', '==', userId),
  orderBy('timestamp', 'desc'),
  limit(5)
);
const logs = await getDocs(logsQuery);
logs.forEach(doc => console.log(doc.data()));
```

## Future Enhancements

### Gamification Ideas
- [ ] **Bonus XP multipliers** for streaks (daily login bonus)
- [ ] **XP badges** for milestones (100 XP earned, 500 XP earned)
- [ ] **Leaderboards** showing top XP earners this week/month
- [ ] **XP decay** if inactive for 30+ days (optional)
- [ ] **Variable XP** based on exchange difficulty/duration
- [ ] **XP shop** to spend XP on profile customization
- [ ] **Level perks** (higher levels unlock features)
- [ ] **XP multipliers** for teaching in-demand skills

### Notification System
- [ ] Browser notification on level up
- [ ] Email summary of XP earned this week
- [ ] Congratulations modal with confetti on level up
- [ ] Achievement unlock notifications

### Analytics
- [ ] Track XP earning patterns over time
- [ ] Show XP breakdown by activity type
- [ ] Display XP per skill category
- [ ] Compare XP with network average

## Security Rules

Protect XP from manual manipulation:

```javascript
match /users/{userId} {
  allow update: if request.auth.uid == userId
    && (!request.resource.data.diff(resource.data)
      .affectedKeys()
      .hasAny(['xp', 'level']));
  // XP can only be updated by backend functions
}

match /xpLogs/{logId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow write: if false; // Only server can write logs
}
```

## Notes
- XP is awarded to **both** users when exchange completes
- Progress bar only appears for exchanges ≥90% complete
- Level up detection is automatic and logged
- XP changes are immediate (no caching delay)
- Mock exchanges in Dashboard won't award real XP (needs real user IDs)

---

**TL;DR**: Complete an exchange → Both users get +50 XP → Level up every 1,000 XP → Progress bar updates live → Works automatically! 🎉
