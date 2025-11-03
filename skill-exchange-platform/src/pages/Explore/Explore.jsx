import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { getSkillPosts, createMatch } from '../../services/firebaseService';
import CreateSkillPost from '../../components/forms/CreateSkillPost';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth, useDarkMode } from '../../contexts';
import { isMutualMatch, computeMatchScore } from '../../utils/matching';

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // SEO: Update document title
  useEffect(() => {
    document.title = 'Explore Skills - Find Learning Opportunities | SkillSwap';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = 'Browse available skills, find teachers and learners, and connect with people who share your interests. Start exchanging skills today.';
    }
  }, []);
  
  // Load matched posts from localStorage
  const [matchedPosts, setMatchedPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('matchedPosts');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const list = await getSkillPosts();

      // Try to enrich with basic user info (name initials)
      const augmented = await Promise.all(
        list.map(async (p) => {
          try {
            if (!p.userId) return p;
            const snap = await getDoc(doc(db, 'users', p.userId));
            const u = snap.exists() ? snap.data() : null;
            const postUser = {
              ...p,
              user: u
                ? {
                    name: u.name || 'User',
                    avatar: (u.name || 'User')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2),
                    location: u.location || '',
                    rating: u.rating || 4.8,
                    exchanges: u.exchanges || 0,
                  }
                : undefined,
              bio: p.description || '',
            };

            // Compute mutual match and score versus current user, if available
            const aHave = user?.skillsToTeach || [];
            const aWant = user?.skillsToLearn || [];
            const bHave = p.offering || [];
            const bWant = p.requesting || [];

            return {
              ...postUser,
              isMutual: isMutualMatch(aHave, aWant, bHave, bWant),
              matchScore: computeMatchScore(aHave, aWant, bHave, bWant),
            };
          } catch (error) {
            console.error('Error enriching post:', error);
            const aHave = user?.skillsToTeach || [];
            const aWant = user?.skillsToLearn || [];
            const bHave = p.offering || [];
            const bWant = p.requesting || [];
            return {
              ...p,
              bio: p.description || '',
              isMutual: isMutualMatch(aHave, aWant, bHave, bWant),
              matchScore: computeMatchScore(aHave, aWant, bHave, bWant),
            };
          }
        })
      );

      setPosts(augmented);
    } catch (e) {
      console.error('Failed to load posts', e);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [user?.skillsToTeach, user?.skillsToLearn]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const categories = ['all', 'Development', 'Design', 'Data Science', 'Languages', 'Photography', 'Marketing'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = searchTerm === '' || 
      (post.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.offering || []).some(skill => (skill || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.requesting || []).some(skill => (skill || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
  (post.offering || []).some(skill => (skill || '').toLowerCase().includes(filterCategory.toLowerCase())) ||
  (post.requesting || []).some(skill => (skill || '').toLowerCase().includes(filterCategory.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  const handleMatch = async (postId) => {
    if (actionLoadingId) return; // Prevent multiple simultaneous requests
    
    try {
      setActionMsg('');
      setError('');
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        setError('Post not found');
        return;
      }
      if (!user?.uid) {
        navigate(ROUTES.LOGIN);
        return;
      }

      setActionLoadingId(postId);

      const aHave = user?.skillsToTeach || [];
      const aWant = user?.skillsToLearn || [];
      const bHave = post.offering || [];
      const bWant = post.requesting || [];

      // Determine matched skills in both directions
      // We reuse the card's computed score but compute raw skill lists here
      const { intersect } = await import('../../utils/matching');
      const aTeachesB = intersect(aHave, bWant);
      const bTeachesA = intersect(bHave, aWant);

      await createMatch({
        userAId: user.uid,
        userBId: post.userId,
        aTeachesB,
        bTeachesA,
        postId: post.id,
      });

      setActionMsg('✅ Match request sent!');
      // Mark this post as matched and save to localStorage
      setMatchedPosts(prev => {
        const updated = new Set([...prev, postId]);
        try {
          localStorage.setItem('matchedPosts', JSON.stringify([...updated]));
        } catch (storageError) {
          console.error('Failed to save to localStorage:', storageError);
        }
        return updated;
      });
      
      // Wait a bit before navigating so user sees the state change
      const timeoutId = setTimeout(() => {
        navigate(`${ROUTES.CHAT}/${post.userId}`);
      }, 800);
      
      // Store timeout ID in case component unmounts
      return () => clearTimeout(timeoutId);
    } catch (e) {
      console.error('Match failed', e);
      setError(e?.message || 'Failed to create match');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative">
      <div className="container mx-auto relative z-10">
        {error && (
          <div 
            className="mb-6 rounded-2xl glass-dark border-2 border-red-500/30 text-red-400 px-6 py-4 font-semibold"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        {loading && (
          <div 
            className="mb-8 flex items-center gap-4 text-gray-300 glass-dark px-6 py-4 rounded-2xl w-fit"
            role="status"
            aria-live="polite"
          >
            <svg className="animate-spin h-6 w-6 gradient-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="font-semibold">Loading posts…</span>
          </div>
        )}
        {/* Header with futuristic design */}
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ color: isDarkMode ? '#ffffff' : '#111827' }}>
            Explore <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-xl font-medium" style={{ color: isDarkMode ? '#e5e7eb' : '#111827' }}>
            Find people to exchange skills with based on what you can offer and want to learn
          </p>
        </header>

        {/* Create Post (quick access) with glassmorphism */}
        <section className="mb-12" aria-labelledby="create-post-section">
          <h2 id="create-post-section" className="sr-only">Create a new skill post</h2>
          <CreateSkillPost onCreated={loadPosts} />
        </section>

        {/* Search and Filter with glassmorphism */}
        <section 
          className="glass-dark rounded-3xl p-8 mb-12 neon-border hover-lift"
          aria-labelledby="search-filter-section"
        >
          <h2 id="search-filter-section" className="sr-only">Search and filter skills</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label htmlFor="skill-search" className="sr-only">Search by name or skill</label>
              <input
                id="skill-search"
                type="text"
                placeholder="🔍 Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 glass border-2 border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-lg"
                style={{ 
                  color: isDarkMode ? '#ffffff' : '#111827',
                  '--placeholder-opacity': isDarkMode ? '0.6' : '0.5'
                }}
                aria-label="Search skills by keyword"
              />
            </div>
            <div className="md:w-72">
              <label htmlFor="category-filter" className="sr-only">Filter by category</label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-6 py-4 glass border-2 border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-lg"
                style={{ color: isDarkMode ? '#ffffff' : '#111827' }}
                aria-label="Filter skills by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category} style={{ 
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#111827'
                  }}>
                    {category === 'all' ? '✨ All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-6 text-base font-semibold" style={{ color: isDarkMode ? '#d1d5db' : '#374151' }} role="status" aria-live="polite">
            Showing <span className="gradient-text text-2xl font-black">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'match' : 'matches'}
          </div>
        </section>

        {/* Skill Posts Grid with futuristic cards */}
        <section aria-labelledby="skill-posts-section">
          <h2 id="skill-posts-section" className="sr-only">Available skill posts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate-700 hover:scale-[1.02]"
              aria-labelledby={`post-title-${post.id}`}
            >
              {/* Card Header */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md">
                      {post.user.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{post.user.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        {post.user.location}
                      </p>
                    </div>
                  </div>
                  {typeof post.matchScore === 'number' && (
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
                      post.isMutual
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600'
                    }`}>
                      {post.matchScore}% {post.isMutual ? '✨' : ''}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    {post.user.rating}
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                    {post.user.exchanges}
                  </span>
                  {post.userId === user?.uid && (
                    <span className="ml-auto px-2.5 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md font-semibold">You</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-5">
                {/* Bio */}
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">{post.bio}</p>

                {/* Offering */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Offering
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.offering.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-semibold border border-green-200 dark:border-green-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {post.offering.length > 3 && (
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-semibold">
                        +{post.offering.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Requesting */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Looking to learn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.requesting.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {post.requesting.length > 3 && (
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded-lg text-xs font-semibold">
                        +{post.requesting.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleMatch(post.id)}
                  disabled={actionLoadingId === post.id || post.userId === user?.uid || matchedPosts.has(post.id)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    actionLoadingId === post.id || post.userId === user?.uid || matchedPosts.has(post.id)
                      ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]'
                  }`}
                >
                  {post.userId === user?.uid ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Your Post
                    </>
                  ) : matchedPosts.has(post.id) ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Match Sent
                    </>
                  ) : actionLoadingId === post.id ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      Request Match
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16" role="status" aria-live="polite">
            <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search or filters to find more skill exchange partners
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
              }}
              className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
              aria-label="Clear search and filter options"
            >
              Clear Filters
            </button>
          </div>
        )}
        </section>

        {actionMsg && (
          <div 
            className="mt-6 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3"
            role="status"
            aria-live="polite"
          >
            {actionMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
