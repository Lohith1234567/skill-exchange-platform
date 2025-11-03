import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { getSkillPosts, createMatch } from '../../services/firebaseService';
import CreateSkillPost from '../../components/forms/CreateSkillPost';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts';
import { isMutualMatch, computeMatchScore } from '../../utils/matching';

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadPosts = async () => {
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
          } catch {
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
  };

  useEffect(() => {
    const load = async () => {
      try {
        await loadPosts();
      } catch (e) {
        console.error('Failed to load posts', e);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    try {
      setActionMsg('');
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
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

      const res = await createMatch({
        userAId: user.uid,
        userBId: post.userId,
        aTeachesB,
        bTeachesA,
        postId: post.id,
      });

      setActionMsg('✅ Match request sent!');
      // Immediately open a one-to-one chat with the post owner
      navigate(`${ROUTES.CHAT}/${post.userId}`);
      return res;
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
          <div className="mb-6 rounded-2xl glass-dark border-2 border-red-500/30 text-red-400 px-6 py-4 font-semibold">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-8 flex items-center gap-4 text-gray-300 glass-dark px-6 py-4 rounded-2xl w-fit">
            <svg className="animate-spin h-6 w-6 gradient-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="font-semibold">Loading posts…</span>
          </div>
        )}
        {/* Header with futuristic design */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Explore <span className="gradient-text">Skills</span>
          </h1>
          <p className="text-xl text-gray-300">Find people to exchange skills with based on what you can offer and want to learn</p>
        </div>

        {/* Create Post (quick access) with glassmorphism */}
        <div className="mb-12">
          <CreateSkillPost onCreated={loadPosts} />
        </div>

        {/* Search and Filter with glassmorphism */}
        <div className="glass-dark rounded-3xl p-8 mb-12 neon-border hover-lift">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 glass border-2 border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 font-medium text-lg"
              />
            </div>
            <div className="md:w-72">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-6 py-4 glass border-2 border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white font-medium text-lg"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-gray-900">
                    {category === 'all' ? '✨ All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-6 text-base text-gray-300 font-semibold">
            Showing <span className="gradient-text text-2xl font-black">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'match' : 'matches'}
          </div>
        </div>

        {/* Skill Posts Grid with futuristic cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="glass-dark rounded-3xl neon-border hover-lift overflow-hidden flex flex-col card-3d"
            >
              {/* Card Header */}
              <div className="p-8 border-b border-white/10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 glow-blue float">
                      {post.user.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-white truncate">{post.user.name}</h3>
                      <p className="text-sm text-gray-400 truncate mt-1">📍 {post.user.location}</p>
                    </div>
                  </div>
                  {typeof post.matchScore === 'number' && (
                    <span className={`px-3 py-2 text-xs font-black rounded-xl whitespace-nowrap ${
                      post.isMutual
                        ? 'glass text-green-400 border-2 border-green-500/30 glow-purple'
                        : 'glass text-gray-300 border-2 border-white/10'
                    }`}>
                      {post.matchScore}% {post.isMutual ? '✨ Mutual' : 'Match'}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-300 font-semibold">
                  <span className="flex items-center gap-2">
                    <span className="text-yellow-400 text-lg">⭐</span>
                    <span className="gradient-text font-black">{post.user.rating}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🤝</span>
                    <span className="gradient-text font-black">{post.user.exchanges}</span>
                  </span>
                  {post.userId === user?.uid && (
                    <span className="px-3 py-1 text-xs glass text-blue-400 rounded-xl font-bold border border-blue-500/30">Your Post</span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8 flex-1 flex flex-col">
                {/* Bio */}
                <p className="text-base text-gray-300 mb-6 line-clamp-2 leading-relaxed">{post.bio}</p>

                {/* Offering */}
                <div className="mb-6">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="text-green-400 text-lg">●</span> Offering
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.offering.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 glass text-green-400 rounded-xl text-sm font-bold border border-green-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {post.offering.length > 3 && (
                      <span className="px-4 py-2 glass text-gray-300 rounded-xl text-sm font-bold">
                        +{post.offering.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Requesting */}
                <div className="mb-6">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="text-blue-400 text-lg">●</span> Looking to learn
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {post.requesting.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 glass text-blue-400 rounded-xl text-sm font-bold border border-blue-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {post.requesting.length > 3 && (
                      <span className="px-4 py-2 glass text-gray-300 rounded-xl text-sm font-bold">
                        +{post.requesting.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => handleMatch(post.id)}
                  disabled={actionLoadingId === post.id || post.userId === user?.uid}
                  className={`w-full py-4 text-white font-black text-lg rounded-2xl transform transition-all duration-200 ${
                    actionLoadingId === post.id || post.userId === user?.uid
                      ? 'glass cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover-lift glow-blue'
                  }`}
                >
                  {post.userId === user?.uid
                    ? '📝 Your Post'
                    : actionLoadingId === post.id
                    ? '⏳ Sending…'
                    : '🤝 Request Match'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find more skill exchange partners
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
              }}
              className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {actionMsg && (
          <div className="mt-6 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3">
            {actionMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
