import { useState } from 'react';
import { useAuth } from '../../contexts';
import { createSkillPost } from '../../services/firebaseService';

// A reusable form for creating a skill post
// Fields: offerSkill, requestSkill, description
// Saves to Firestore collection `skillPosts`
export default function CreateSkillPost({ onCreated }) {
  const { user, isAuthenticated } = useAuth();
  const [offerSkill, setOfferSkill] = useState('');
  const [requestSkill, setRequestSkill] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setOfferSkill('');
    setRequestSkill('');
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAuthenticated || !user?.uid) {
      setError('You must be signed in to create a post.');
      return;
    }

    if (!offerSkill.trim() || !requestSkill.trim() || !description.trim()) {
      setError('Please fill all fields.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        offering: [offerSkill.trim()],
        requesting: [requestSkill.trim()],
        description: description.trim(),
        status: 'open',
      };

      const res = await createSkillPost(user.uid, payload);
      setSuccess('Skill post created successfully.');
      if (typeof onCreated === 'function') onCreated(res);
      resetForm();
    } catch (err) {
      const msg = err?.message || 'Failed to create post. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create a Skill Post</h3>

      {!isAuthenticated && (
        <div className="mb-4 rounded-lg border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-4 py-3">
          Please sign in to create a post.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I can teach</label>
          <input
            type="text"
            value={offerSkill}
            onChange={(e) => setOfferSkill(e.target.value)}
            placeholder="e.g., React, Guitar, Spanish"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">I want to learn</label>
          <input
            type="text"
            value={requestSkill}
            onChange={(e) => setRequestSkill(e.target.value)}
            placeholder="e.g., Node.js, Piano, French"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share a bit more about your experience, availability, and expectations."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !isAuthenticated}
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium text-white transition ${
              loading || !isAuthenticated
                ? 'bg-indigo-300 dark:bg-indigo-700/50 cursor-not-allowed'
                : 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'
            }`}
          >
            {loading ? 'Creating…' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
