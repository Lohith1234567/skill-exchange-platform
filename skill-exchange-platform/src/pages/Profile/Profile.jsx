import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saveUserProfile } from '../../services/firebaseService';
import TagInput from '../../components/common/TagInput';

const getInitials = (name) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .slice(0, 2)
    .join('') || 'U';
};

const Profile = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load user profile from Firebase
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || 'Share a bit about yourself and what you want to learn or teach!');
      setTeachSkills(Array.isArray(user.skillsToTeach) ? user.skillsToTeach : []);
      setLearnSkills(Array.isArray(user.skillsToLearn) ? user.skillsToLearn : []);
    }
  }, [user]);

  const avatar = useMemo(() => getInitials(name || 'User'), [name]);

  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save your profile');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      name: name.trim(),
      bio: bio.trim(),
      skillsToTeach: teachSkills,
      skillsToLearn: learnSkills,
      avatar: getInitials(name.trim() || 'User'),
    };

    try {
      await saveUserProfile(user.uid, payload);
      setSavedAt(new Date().toISOString());
      setSuccessMessage('Profile saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (e) {
      console.error('Failed to save profile', e);
      setError('Failed to save profile. Please try again.');
    } finally {
      // Simulate small delay for UX
      setTimeout(() => setSaving(false), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-400">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                {avatar}
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-end gap-3 md:self-start">
              {savedAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Last saved {new Date(savedAt).toLocaleString()}</p>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about your experience, interests, and what you hope to learn/teach."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills I Can Teach</h2>
            <TagInput
              label="Add skills you can teach"
              value={teachSkills}
              onChange={setTeachSkills}
              placeholder="e.g., React, UI/UX, Guitar"
            />
            {teachSkills.length > 0 && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Tip: Use specific skills to find better matches.</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Skills I Want to Learn</h2>
            <TagInput
              label="Add skills you want to learn"
              value={learnSkills}
              onChange={setLearnSkills}
              placeholder="e.g., Python, Photography, Spanish"
            />
            {learnSkills.length > 0 && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Tip: Add multiple to broaden your matches.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
