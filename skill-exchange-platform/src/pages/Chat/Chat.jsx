import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { createChat, getChatMessages, sendMessage, listUserChats } from '../../services/firebaseService';

const Chat = () => {
  const { conversationId } = useParams(); // other user's uid if provided
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null); // chatId
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const messagesUnsubRef = useRef(null);
  const listUnsubRef = useRef(null);
  const bottomRef = useRef(null);

  const formatDayLabel = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (isSameDay(d, today)) return 'Today';
    if (isSameDay(d, yesterday)) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const formatTimeShort = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /* Mock fallback is retained but will be replaced by realtime data */
  const mockConversations = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      lastMessage: 'That sounds great! When can we start our first session?',
      time: '2m ago',
      unread: 2,
      online: true,
      skills: 'React ↔ Python',
    },
    {
      id: 2,
      name: 'Mike Chen',
      avatar: 'MC',
      lastMessage: 'Thanks for the Python tips yesterday!',
      time: '1h ago',
      unread: 0,
      online: false,
      skills: 'Python ↔ Web Dev',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      avatar: 'ER',
      lastMessage: 'I can help you with Figma this weekend',
      time: '3h ago',
      unread: 1,
      online: true,
      skills: 'UI/UX ↔ CSS',
    },
    {
      id: 4,
      name: 'David Kim',
      avatar: 'DK',
      lastMessage: 'Awesome! Let me know when you are free',
      time: '1d ago',
      unread: 0,
      online: false,
      skills: 'Photography ↔ Design',
    },
    {
      id: 5,
      name: 'Lisa Wang',
      avatar: 'LW',
      lastMessage: '¡Perfecto! Nos vemos mañana 😊',
      time: '2d ago',
      unread: 0,
      online: true,
      skills: 'Spanish ↔ French',
    },
  ];

  const messageHistory = {
    1: [
      {
        id: 1,
        sender: 'Sarah Johnson',
        text: 'Hi! I saw your profile and noticed you want to learn Python. I would love to help!',
        time: '10:30 AM',
        isOwn: false,
        date: 'Today',
      },
      {
        id: 2,
        sender: 'You',
        text: 'That is awesome! I have been wanting to learn Python for data science.',
        time: '10:32 AM',
        isOwn: true,
        date: 'Today',
      },
      {
        id: 3,
        sender: 'Sarah Johnson',
        text: 'Perfect! I actually need help with React for a project I am working on. Would you be interested in exchanging?',
        time: '10:35 AM',
        isOwn: false,
        date: 'Today',
      },
      {
        id: 4,
        sender: 'You',
        text: 'Absolutely! I have been working with React for 3 years. Happy to teach you.',
        time: '10:36 AM',
        isOwn: true,
        date: 'Today',
      },
      {
        id: 5,
        sender: 'Sarah Johnson',
        text: 'Great! What is your availability? I am usually free on weekends.',
        time: '10:38 AM',
        isOwn: false,
        date: 'Today',
      },
      {
        id: 6,
        sender: 'You',
        text: 'Weekends work perfectly for me too! How about this Saturday at 2 PM?',
        time: '10:40 AM',
        isOwn: true,
        date: 'Today',
      },
      {
        id: 7,
        sender: 'Sarah Johnson',
        text: 'That sounds great! When can we start our first session?',
        time: '10:42 AM',
        isOwn: false,
        date: 'Today',
      },
    ],
    2: [
      {
        id: 1,
        sender: 'Mike Chen',
        text: 'Hey! Thanks for the Python tips yesterday!',
        time: '2:15 PM',
        isOwn: false,
        date: 'Yesterday',
      },
    ],
  };

  const currentConversation = useMemo(() => {
    const list = conversations.length ? conversations : mockConversations;
    return list.find((c) => c.id === selectedChat);
  }, [conversations, mockConversations, selectedChat]);

  // Derive chatId for a pair of users
  const makeChatId = (a, b) => [a, b].sort().join('_');

  // Subscribe to the user's chat list and handle deep links
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;
    // Subscribe to user's chats (sidebar)
    listUserChats(user.uid, (items) => {
      if (!isMounted) return;
      const mapped = items.map((it) => ({
        id: it.chatId,
        name: it.otherUserId,
        avatar: (it.otherUserId || 'U').slice(0, 2).toUpperCase(),
        lastMessage: it.lastMessage || '',
        time: formatTimeShort(it.lastMessageTime),
        unread: 0,
        online: false,
        skills: '',
        otherUserId: it.otherUserId,
      }));
      setConversations(mapped);
    }).then((unsub) => {
      if (isMounted) {
        listUnsubRef.current = unsub;
      } else if (typeof unsub === 'function') {
        unsub();
      }
    }).catch(() => {});

    // If deep-linked to another user, ensure chat exists and select it
    if (conversationId) {
      const cid = makeChatId(user.uid, conversationId);
      setSelectedChat(cid);
      createChat(user.uid, conversationId).catch(() => {});
      // Also ensure it shows up in the sidebar immediately
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
    } else if (mockConversations.length) {
      const firstMock = mockConversations[0].id;
      setSelectedChat(firstMock);
      setCurrentMessages(
        (messageHistory[firstMock] || []).map((m) => ({
          id: m.id,
          senderId: m.isOwn ? user?.uid : 'other',
          text: m.text,
          timestamp: Date.now(),
        }))
      );
    }
  }, [conversations, mockConversations, selectedChat, user?.uid]);

  // Subscribe to messages for the selected chat (real chats only)
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

  // Load mock messages when a mock conversation is selected
  useEffect(() => {
    if (!selectedChat) return;
    const isRealChat = typeof selectedChat === 'string' && selectedChat.includes('_');
    if (isRealChat) return;
    if (messagesUnsubRef.current) {
      messagesUnsubRef.current();
      messagesUnsubRef.current = null;
    }
    setCurrentMessages(
      (messageHistory[selectedChat] || []).map((m) => ({
        id: m.id,
        senderId: m.isOwn ? user?.uid : 'other',
        text: m.text,
        timestamp: Date.now(),
      }))
    );
  }, [selectedChat, user?.uid]);

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
          {(conversations.length ? conversations : mockConversations).map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setSelectedChat(conversation.id);
              }}
              className={`w-full p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left ${
                selectedChat === conversation.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-600 dark:border-l-indigo-400' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {conversation.avatar}
                  </div>
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>

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
                <div className="relative">
                  <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {currentConversation.avatar}
                  </div>
                  {currentConversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{currentConversation.name}</h3>
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
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1">{m.senderId}</p>
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
