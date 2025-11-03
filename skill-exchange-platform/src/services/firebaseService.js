import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, set, push, onValue, off, update } from 'firebase/database';
import { db, rtdb } from '../firebase/config';

// ============================================
// USER PROFILE OPERATIONS (Firestore)
// ============================================

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const saveUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// ============================================
// SKILL POST OPERATIONS (Firestore)
// ============================================

export const createSkillPost = async (userId, postData) => {
  try {
    const postRef = doc(collection(db, 'skillPosts'));
    await setDoc(postRef, {
      userId,
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: postRef.id, success: true };
  } catch (error) {
    console.error('Error creating skill post:', error);
    throw error;
  }
};

export const getSkillPosts = async (filters = {}) => {
  try {
    let q = collection(db, 'skillPosts');
    
    // Apply filters if provided
    const constraints = [];
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.skill) {
      constraints.push(where('offering', 'array-contains', filters.skill));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(50));
    
    q = query(q, ...constraints);
    
    const snapshot = await getDocs(q);
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching skill posts:', error);
    throw error;
  }
};

// ============================================
// EXCHANGE/MATCH OPERATIONS (Firestore)
// ============================================

export const createExchange = async (user1Id, user2Id, exchangeData) => {
  try {
    const exchangeRef = doc(collection(db, 'exchanges'));
    await setDoc(exchangeRef, {
      user1Id,
      user2Id,
      ...exchangeData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { id: exchangeRef.id, success: true };
  } catch (error) {
    console.error('Error creating exchange:', error);
    throw error;
  }
};

export const getUserExchanges = async (userId) => {
  try {
    const q = query(
      collection(db, 'exchanges'),
      where('user1Id', '==', userId)
    );
    
    const q2 = query(
      collection(db, 'exchanges'),
      where('user2Id', '==', userId)
    );
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q),
      getDocs(q2)
    ]);
    
    const exchanges = [];
    snapshot1.forEach((doc) => {
      exchanges.push({ id: doc.id, ...doc.data() });
    });
    snapshot2.forEach((doc) => {
      exchanges.push({ id: doc.id, ...doc.data() });
    });
    
    return exchanges;
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    throw error;
  }
};

export const updateExchangeStatus = async (exchangeId, status) => {
  try {
    const exchangeRef = doc(db, 'exchanges', exchangeId);
    await updateDoc(exchangeRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating exchange status:', error);
    throw error;
  }
};

// Complete an exchange and award XP to both users
export const completeExchange = async (exchangeId) => {
  try {
    const exchangeRef = doc(db, 'exchanges', exchangeId);
    const exchangeDoc = await getDoc(exchangeRef);
    
    if (!exchangeDoc.exists()) {
      throw new Error('Exchange not found');
    }
    
    const exchangeData = exchangeDoc.data();
    const { user1Id, user2Id } = exchangeData;
    
    // Mark exchange as completed
    await updateDoc(exchangeRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Award 50 XP to both users
    const xpAmount = 50;
    const promises = [];
    
    if (user1Id) {
      promises.push(addXP(user1Id, xpAmount, `Completed exchange ${exchangeId}`));
    }
    if (user2Id) {
      promises.push(addXP(user2Id, xpAmount, `Completed exchange ${exchangeId}`));
    }
    
    const results = await Promise.all(promises);
    
    return { 
      success: true,
      xpAwarded: xpAmount,
      user1Result: results[0],
      user2Result: results[1]
    };
  } catch (error) {
    console.error('Error completing exchange:', error);
    throw error;
  }
};

// ============================================
// MATCHES (Firestore)
// ============================================

// Create a match document capturing who can teach whom
export const createMatch = async ({ userAId, userBId, aTeachesB = [], bTeachesA = [], postId = null, meta = {} }) => {
  try {
    const matchRef = doc(collection(db, 'matches'));
    await setDoc(matchRef, {
      userAId,
      userBId,
      skills: {
        aTeachesB,
        bTeachesA,
      },
      postId,
      status: 'pending',
      createdAt: serverTimestamp(),
      ...meta,
    });
    return { id: matchRef.id, success: true };
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

// ============================================
// CHAT OPERATIONS (Realtime Database)
// ============================================

export const sendMessage = async (chatId, senderId, messageText) => {
  try {
    const messagesRef = ref(rtdb, `messages/${chatId}`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      senderId,
      text: messageText,
      timestamp: Date.now(),
      read: false
    });
    
    // Update last message in chat metadata
    const chatRef = ref(rtdb, `chats/${chatId}`);
    await update(chatRef, {
      lastMessage: messageText,
      lastMessageTime: Date.now(),
      lastMessageSender: senderId
    });

    // Also update the userChats index for both participants so sidebar shows latest
    const [uid1, uid2] = chatId.split('_');
    const now = Date.now();
    const updates = {};
    updates[`userChats/${uid1}/${chatId}/lastMessage`] = messageText;
    updates[`userChats/${uid1}/${chatId}/lastMessageTime`] = now;
    updates[`userChats/${uid2}/${chatId}/lastMessage`] = messageText;
    updates[`userChats/${uid2}/${chatId}/lastMessageTime`] = now;
    await update(ref(rtdb), updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = ref(rtdb, `messages/${chatId}`);
  
  onValue(messagesRef, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(messages);
  });
  
  // Return unsubscribe function
  return () => off(messagesRef);
};

export const getChatMessages = (chatId, callback) => {
  return subscribeToMessages(chatId, callback);
};

export const createChat = async (user1Id, user2Id) => {
  try {
    const chatId = [user1Id, user2Id].sort().join('_');
    const chatRef = ref(rtdb, `chats/${chatId}`);
    
    await set(chatRef, {
      user1Id: user1Id < user2Id ? user1Id : user2Id,
      user2Id: user1Id < user2Id ? user2Id : user1Id,
      createdAt: Date.now(),
      lastMessage: '',
      lastMessageTime: Date.now()
    });
    
    // Also index chat under each user for easy listing
    const updates = {};
    updates[`userChats/${user1Id}/${chatId}`] = {
      chatId,
      otherUserId: user2Id,
      createdAt: Date.now(),
    };
    updates[`userChats/${user2Id}/${chatId}`] = {
      chatId,
      otherUserId: user1Id,
      createdAt: Date.now(),
    };
    await update(ref(rtdb), updates);
    
    return { chatId, success: true };
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

// List chats for a given user from the index created above
export const listUserChats = async (userId, callback) => {
  const userChatsRef = ref(rtdb, `userChats/${userId}`);
  onValue(userChatsRef, (snapshot) => {
    const items = [];
    snapshot.forEach((child) => {
      items.push({ id: child.key, ...child.val() });
    });
    callback(items);
  });
  return () => off(userChatsRef);
};

// ============================================
// XP AND GAMIFICATION (Firestore)
// ============================================

export const addXP = async (userId, xpAmount, reason) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentXP = userDoc.data().xp || 0;
      const currentLevel = userDoc.data().level || 1;
      const newXP = currentXP + xpAmount;
      
      // Simple level calculation (every 1000 XP = 1 level)
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      await updateDoc(userRef, {
        xp: newXP,
        level: newLevel,
        updatedAt: serverTimestamp()
      });
      
      // Log XP gain
      const xpLogRef = doc(collection(db, 'xpLogs'));
      await setDoc(xpLogRef, {
        userId,
        amount: xpAmount,
        reason,
        timestamp: serverTimestamp()
      });
      
      return { newXP, newLevel, leveledUp: newLevel > currentLevel };
    }
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
};

// ============================================
// RATING SYSTEM (Firestore)
// ============================================

export const addRating = async (ratedUserId, raterUserId, rating, exchangeId = null, comment = '') => {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }

    // Check if rated user exists
    const ratedUserRef = doc(db, 'users', ratedUserId);
    const ratedUserDoc = await getDoc(ratedUserRef);
    
    if (!ratedUserDoc.exists()) {
      throw new Error('User to be rated does not exist. Cannot rate mock/demo users.');
    }

    // Save individual rating document
    const ratingRef = doc(collection(db, 'ratings'));
    await setDoc(ratingRef, {
      ratedUserId,
      raterUserId,
      rating,
      exchangeId,
      comment,
      createdAt: serverTimestamp()
    });

    // Update user's average rating
    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('ratedUserId', '==', ratedUserId)
    );
    const ratingsSnapshot = await getDocs(ratingsQuery);
    
    let totalRating = 0;
    let count = 0;
    ratingsSnapshot.forEach((doc) => {
      totalRating += doc.data().rating;
      count++;
    });

    const averageRating = count > 0 ? totalRating / count : 0;
    await updateDoc(ratedUserRef, {
      averageRating,
      totalRatings: count,
      updatedAt: serverTimestamp()
    });

    return { 
      success: true, 
      averageRating,
      totalRatings: count
    };
  } catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
};

export const getUserRatings = async (userId) => {
  try {
    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('ratedUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(ratingsQuery);
    const ratings = [];
    snapshot.forEach((doc) => {
      ratings.push({ id: doc.id, ...doc.data() });
    });
    
    return ratings;
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Get exchange stats
      const exchanges = await getUserExchanges(userId);
      const activeExchanges = exchanges.filter(e => e.status === 'active').length;
      
      return {
        totalExchanges: exchanges.length,
        activeExchanges,
        xp: userData.xp || 0,
        level: userData.level || 1,
        skillsToTeach: userData.skillsToTeach || [],
        skillsToLearn: userData.skillsToLearn || []
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};
