import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { createChat, getChatMessages, sendMessage, listUserChats } from '../../services/firebaseService';
import { ROUTES } from '../../routes';

const Chat = () => {
  const { conversationId } = useParams(); // other user's uid if provided
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null); // chatId
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const messagesUnsubRef = useRef(null);
  const listUnsubRef = useRef(null);
  const bottomRef = useRef(null);

  const formatDayLabel = useCallback((ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString();
  }, []);

  const formatTimeShort = useCallback((ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // The currently selected conversation object (compute before using it in other hooks)
  const currentConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedChat);
  }, [conversations, selectedChat]);

  // Resolve a friendly display name for a given uid (self, other, fallback)
  const getDisplayName = useCallback(
    (uid) => {
      if (!uid) return 'User';
      if (uid === user?.uid) {
        // Prefer profile/display name if available
        return user?.displayName || 'You';
      }
      if (currentConversation?.otherUserId === uid) {
        return currentConversation?.name || uid;
      }
      // Fallback to trimmed uid
      return uid;
    },
    [user?.uid, user?.displayName, currentConversation?.otherUserId, currentConversation?.name]
  );

  // SEO: Update document title
  useEffect(() => {
    const otherUserName = currentConversation?.name || 'User';
    document.title = selectedChat 
      ? `Chat with ${otherUserName} | SkillSwap`
      : 'Messages - Connect and Learn | SkillSwap';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = 'Chat with your skill exchange partners, coordinate learning sessions, and build meaningful connections on SkillSwap.';
    }
  }, [selectedChat, currentConversation]);

  // Derive chatId for a pair of users
  const makeChatId = useCallback((a, b) => [a, b].sort().join('_'), []);

  // Subscribe to the user's chat list and handle deep links
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;
    
    // Subscribe to user's chats (sidebar)
    const unsubscribe = listUserChats(user.uid, async (items) => {
      if (!isMounted) return;
      
      // Fetch user profiles for each conversation
      const { getUserProfile } = await import('../../services/firebaseService');
      const enrichedItems = await Promise.all(
        items.map(async (it) => {
          try {
            const otherUserProfile = await getUserProfile(it.otherUserId);
            const userName = otherUserProfile?.name || it.otherUserId;
            return {
              id: it.chatId,
              name: userName,
              avatar: userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
              lastMessage: it.lastMessage || '',
              time: formatTimeShort(it.lastMessageTime),
              unread: 0,
              online: false,
              skills: '',
              otherUserId: it.otherUserId,
            };
          } catch (error) {
            console.error('Error fetching user profile:', error);
            return {
              id: it.chatId,
              name: it.otherUserId,
              avatar: (it.otherUserId || 'U').slice(0, 2).toUpperCase(),
              lastMessage: it.lastMessage || '',
              time: formatTimeShort(it.lastMessageTime),
              unread: 0,
              online: false,
              skills: '',
              otherUserId: it.otherUserId,
            };
          }
        })
      );
      
      setConversations(enrichedItems);
    });
    
    listUnsubRef.current = unsubscribe;

    // If deep-linked to another user, ensure chat exists and select it
    if (conversationId) {
      const cid = makeChatId(user.uid, conversationId);
      setSelectedChat(cid);
      createChat(user.uid, conversationId).catch(() => {});
      
      // Fetch the user profile for the deep-linked conversation
      (async () => {
        try {
          const { getUserProfile } = await import('../../services/firebaseService');
          const otherUserProfile = await getUserProfile(conversationId);
          const userName = otherUserProfile?.name || conversationId;
          
          // Ensure it shows up in the sidebar with the actual user name
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === cid);
            if (exists) {
              // Update existing conversation with user name
              return prev.map((c) => 
                c.id === cid 
                  ? { ...c, name: userName, avatar: userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }
                  : c
              );
            }
            return [
              {
                id: cid,
                name: userName,
                avatar: userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
                lastMessage: '',
                time: '',
                unread: 0,
                online: false,
                skills: '',
                otherUserId: conversationId,
              },
              ...prev,
            ];
          });
        } catch (error) {
          console.error('Error fetching user profile for deep link:', error);
          // Fallback to user ID
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === cid);
            if (exists) return prev;
            return [
              {
                id: cid,
                name: conversationId,
                avatar: (conversationId || 'U').slice(0, 2).toUpperCase(),
                lastMessage: '',
                time: '',
                unread: 0,
                online: false,
                skills: '',
                otherUserId: conversationId,
              },
              ...prev,
            ];
          });
        }
      })();
    }

    return () => {
      isMounted = false;
      if (listUnsubRef.current) {
        listUnsubRef.current();
        listUnsubRef.current = null;
      }
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
        messagesUnsubRef.current = null;
      }
    };
  }, [user?.uid, conversationId]);

  // Default selection when list loads and none selected
  useEffect(() => {
    if (selectedChat) return;
    if (conversations.length) {
      setSelectedChat(conversations[0].id);
    }
  }, [conversations, selectedChat]);

  // Subscribe to messages for the selected chat
  useEffect(() => {
    const isRealChat = typeof selectedChat === 'string' && selectedChat.includes('_');
    if (!isRealChat) return;
    if (messagesUnsubRef.current) messagesUnsubRef.current();
    messagesUnsubRef.current = getChatMessages(selectedChat, setCurrentMessages);
    return () => {
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
        messagesUnsubRef.current = null;
      }
    };
  }, [selectedChat]);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendError('');
    if (!message.trim() || !user?.uid) return;

    // If selectedChat is a mock (no underscore), try to promote it to a real chat
    let chatId = selectedChat;
    const seemsMock = typeof chatId !== 'string' || (typeof chatId === 'string' && !chatId.includes('_'));
    if ((!chatId || seemsMock) && conversationId) {
      // Create or open real chat with conversationId from route
      chatId = [user.uid, conversationId].sort().join('_');
      try {
        await createChat(user.uid, conversationId);
        setSelectedChat(chatId);
        if (messagesUnsubRef.current) messagesUnsubRef.current();
        messagesUnsubRef.current = getChatMessages(chatId, setCurrentMessages);
      } catch (err) {
        setSendError(err?.message || 'Unable to start chat');
        return;
      }
    } else if (!chatId || seemsMock) {
      setSendError('This is a demo conversation. Start a real chat from Explore or a Match.');
      return;
    }
    try {
      setLoading(true);
      await sendMessage(chatId, user.uid, message.trim());
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Left Sidebar - Conversations List */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Messages</h2>
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No conversations yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Start a conversation from the Explore page to see it here</p>
            </div>
          )}
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`relative group w-full border-b border-gray-100 dark:border-gray-700 ${
                selectedChat === conversation.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-600 dark:border-l-indigo-400' : ''
              }`}
            >
              <button
                onClick={() => {
                  setSelectedChat(conversation.id);
                }}
                className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar - Clickable to profile */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${ROUTES.PROFILE}/${conversation.otherUserId}`);
                    }}
                    className="relative flex-shrink-0 hover:opacity-80 transition"
                    title="View profile"
                  >
                    <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {conversation.avatar}
                    </div>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{conversation.time}</span>
                    </div>
                    
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 font-medium">{conversation.skills}</p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{conversation.lastMessage}</p>
                  </div>

                {/* Unread Badge */}
                {conversation.unread > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-600 dark:bg-indigo-500 rounded-full text-white text-xs font-bold">
                      {conversation.unread}
                    </span>
                  </div>
                )}
              </div>
            </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-gray-900`}>
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition -ml-2"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Clickable Profile Section */}
                <button 
                  onClick={() => navigate(`${ROUTES.PROFILE}/${currentConversation.otherUserId}`)}
                  className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -ml-2 transition"
                  title="View profile"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {currentConversation.avatar}
                    </div>
                    {currentConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      {currentConversation.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentConversation.online ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          Online
                        </span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition font-medium text-sm">
                  View Profile
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {/* Date Divider */}
              {currentMessages.length > 0 && (
                <div className="flex items-center justify-center">
                  <span className="px-4 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300 font-medium shadow-sm">
                    {formatDayLabel(currentMessages[0]?.timestamp)}
                  </span>
                </div>
              )}

              {/* Messages */}
              {currentMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md lg:max-w-lg xl:max-w-xl ${m.senderId === user?.uid ? 'order-2' : 'order-1'}`}>
                    {m.senderId !== user?.uid && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1">{getDisplayName(m.senderId)}</p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        m.senderId === user?.uid
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{m.text}</p>
                    </div>
                    <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${m.senderId === user?.uid ? 'text-right mr-1' : 'ml-1'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {currentMessages.length === 0 && (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No messages yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Start the conversation by sending a message below</p>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <button
                  type="button"
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex-shrink-0"
                  title="Attach file"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  type="button"
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition flex-shrink-0"
                  title="Add emoji"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                {sendError && (
                  <div className="text-red-600 dark:text-red-400 text-sm mr-2 self-center">{sendError}</div>
                )}
                <button
                  type="submit"
                  disabled={!message.trim() || loading || (typeof selectedChat !== 'string' && !conversationId)}
                  className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>{loading ? 'Sending…' : 'Send'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose a conversation from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
