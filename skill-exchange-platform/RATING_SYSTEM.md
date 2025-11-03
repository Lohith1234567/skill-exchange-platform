# Rating System Implementation

## Overview
A 1-5 star rating system that allows users to rate their exchange partners after completing a skill exchange. Ratings are stored in Firestore and user average ratings are automatically calculated.

## Features
- ⭐ Interactive 1-5 star rating UI with hover effects
- 💬 Optional comment field for feedback
- 📊 Automatic average rating calculation
- 🔒 Prevents duplicate ratings per exchange
- ✅ Visual confirmation when rating is submitted

## Data Structure

### Firestore Collections

#### `ratings` collection
```javascript
{
  ratedUserId: "user123",        // User being rated
  raterUserId: "user456",        // User giving the rating
  rating: 5,                     // 1-5 stars
  exchangeId: "exchange789",     // Optional: link to specific exchange
  comment: "Great teacher!",     // Optional feedback
  createdAt: Timestamp
}
```

#### `users` collection (updated fields)
```javascript
{
  // ... existing fields
  averageRating: 4.5,           // Calculated average
  totalRatings: 12,             // Total number of ratings received
}
```

## Components

### RatingModal
**Location:** `src/components/modals/RatingModal.jsx`

Interactive modal with star selection and optional comment.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Called when modal is closed
- `partnerName` (string): Name of user being rated
- `onSubmit` (function): Called with `(rating, comment)` when submitted

**Usage:**
```jsx
import RatingModal from '../../components/modals/RatingModal';

<RatingModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  partnerName="Sarah Johnson"
  onSubmit={async (rating, comment) => {
    await addRating(partnerId, currentUserId, rating, exchangeId, comment);
  }}
/>
```

## Services

### addRating
**Location:** `src/services/firebaseService.js`

Creates a rating document and updates the user's average rating.

**Parameters:**
```javascript
addRating(
  ratedUserId,    // string: User being rated
  raterUserId,    // string: User giving rating
  rating,         // number: 1-5 stars
  exchangeId?,    // string: Optional exchange reference
  comment?        // string: Optional feedback text
)
```

**Returns:**
```javascript
{
  success: true,
  averageRating: 4.5,
  totalRatings: 12
}
```

### getUserRatings
Fetch all ratings for a specific user (useful for profile pages).

```javascript
const ratings = await getUserRatings(userId);
// Returns array of rating documents
```

## Integration Example (Dashboard)

```jsx
import { useState } from 'react';
import { useAuth } from '../../contexts';
import { addRating } from '../../services/firebaseService';
import RatingModal from '../../components/modals/RatingModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    exchange: null,
  });
  const [ratedExchanges, setRatedExchanges] = useState(new Set());

  const handleSubmitRating = async (rating, comment) => {
    await addRating(
      ratingModal.exchange.partnerId,
      user.uid,
      rating,
      ratingModal.exchange.id,
      comment
    );
    setRatedExchanges((prev) => new Set([...prev, ratingModal.exchange.id]));
  };

  return (
    <>
      {/* Show rating button for completed exchanges */}
      {exchange.status === 'completed' && !ratedExchanges.has(exchange.id) && (
        <button onClick={() => setRatingModal({ isOpen: true, exchange })}>
          Rate Partner
        </button>
      )}

      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, exchange: null })}
        partnerName={ratingModal.exchange?.partner || ''}
        onSubmit={handleSubmitRating}
      />
    </>
  );
};
```

## Testing

### Manual Testing Steps
1. Navigate to Dashboard (`/dashboard`)
2. Find a completed exchange (progress = 100%)
3. Click "Rate [Partner Name]" button
4. Select 1-5 stars (hover to preview)
5. Optionally add a comment
6. Click "Submit Rating"
7. Verify:
   - Button changes to "Rating submitted" with checkmark
   - Firestore `ratings` collection has new document
   - User's `averageRating` and `totalRatings` fields updated

### Console Verification
```javascript
// Check rating was created
const ratings = await getDocs(collection(db, 'ratings'));
ratings.forEach(doc => console.log(doc.data()));

// Check user's average was updated
const userDoc = await getDoc(doc(db, 'users', userId));
console.log(userDoc.data().averageRating, userDoc.data().totalRatings);
```

## Future Enhancements
- [ ] Display user ratings on profile pages
- [ ] Add rating breakdown (show distribution of 1-5 star ratings)
- [ ] Allow users to edit/delete their ratings within 24 hours
- [ ] Add moderation system for reported ratings
- [ ] Calculate separate ratings for "teaching" vs "learning"
- [ ] Add badges for highly-rated users (5-star teacher, etc.)
- [ ] Send notification to rated user
- [ ] Add rating trends over time chart

## Security Rules

Add to your Firestore security rules:

```javascript
// Allow users to create ratings
match /ratings/{ratingId} {
  allow read: if true; // Public read (consider restricting)
  allow create: if request.auth != null 
    && request.resource.data.raterUserId == request.auth.uid
    && request.resource.data.rating >= 1 
    && request.resource.data.rating <= 5;
  allow update, delete: if false; // Ratings are immutable
}

// Prevent manual manipulation of average rating
match /users/{userId} {
  allow update: if request.auth.uid == userId
    && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['averageRating', 'totalRatings']));
}
```

## Notes
- Ratings are **immutable** once submitted (no edit/delete)
- Average is recalculated on every new rating submission
- For performance with many ratings, consider caching or batch updates
- The modal includes validation to prevent 0-star submissions
- Comment field is optional and not required for submission
