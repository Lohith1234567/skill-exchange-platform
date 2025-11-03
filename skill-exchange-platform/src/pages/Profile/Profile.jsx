import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { saveUserProfile, getUserProfile } from '../../services/firebaseService';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
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
  const { user, refreshUser } = useAuth();
  const { userId } = useParams(); // Get userId from URL if viewing another user's profile
  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === user?.uid;
  const targetUserId = userId || user?.uid;
  
  // SEO: Update document title
  useEffect(() => {
    const displayName = profileData?.name || name || 'User';
    document.title = isOwnProfile 
      ? 'My Profile - Edit Your Skills | SkillSwap'
      : `${displayName}'s Profile | SkillSwap`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = isOwnProfile
        ? 'Manage your SkillSwap profile, update your skills, and showcase what you can teach and want to learn.'
        : `View ${displayName}'s skills and interests on SkillSwap. Connect to exchange knowledge and learn together.`;
    }
  }, [isOwnProfile, profileData, name]);

  // Load user profile from Firebase
  useEffect(() => {
    let isMounted = true;
    
    const loadProfile = async () => {
      if (!targetUserId) return;
      
      setLoading(true);
      setError('');
      
      try {
        if (isOwnProfile && user) {
          // Load from authenticated user context
          if (isMounted) {
            setName(user.name || '');
            setBio(user.bio || 'Share a bit about yourself and what you want to learn or teach!');
            setPhotoURL(user.photoURL || '');
            setTeachSkills(Array.isArray(user.skillsToTeach) ? user.skillsToTeach : []);
            setLearnSkills(Array.isArray(user.skillsToLearn) ? user.skillsToLearn : []);
            setProfileData(user);
          }
        } else {
          // Fetch another user's profile
          const profile = await getUserProfile(targetUserId);
          if (isMounted) {
            if (profile) {
              setName(profile.name || 'User');
              setBio(profile.bio || 'No bio available');
              setPhotoURL(profile.photoURL || '');
              setTeachSkills(Array.isArray(profile.skillsToTeach) ? profile.skillsToTeach : []);
              setLearnSkills(Array.isArray(profile.skillsToLearn) ? profile.skillsToLearn : []);
              setProfileData(profile);
            } else {
              setError('User profile not found');
            }
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        if (isMounted) {
          setError('Failed to load profile');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadProfile();
    
    return () => {
      isMounted = false;
    };
  }, [user, targetUserId, isOwnProfile]);

  const avatar = useMemo(() => getInitials(name || 'User'), [name]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create a storage reference
      const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${file.name}`);

      // Upload with resumable task to get progress/errors
      const task = uploadBytesResumable(storageRef, file, { cacheControl: 'public,max-age=31536000' });

      await new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            // Optionally hook progress UI here
            // const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          },
          (error) => reject(error),
          () => resolve(undefined)
        );
      });

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update local state immediately
      setPhotoURL(downloadURL);
      
      // Save to Firestore
      await saveUserProfile(user.uid, { photoURL: downloadURL });
      
      // Refresh user data in AuthContext
      if (refreshUser) {
        await refreshUser();
      }
      
      setSuccessMessage('Profile photo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      // Friendlier messaging for common storage config/rules errors
      let msg = err?.message || 'Unknown error';
      if (err?.code === 'storage/retry-limit-exceeded') {
        msg = 'Network timed out while uploading. Please check your internet connection, disable any ad/cross-site blockers for *.googleapis.com, then try again.';
      } else if (err?.code === 'storage/bucket-not-found') {
        msg = 'Storage bucket not found. Check VITE_FIREBASE_STORAGE_BUCKET in your .env (should look like <project-id>.appspot.com).';
      } else if (err?.code === 'storage/unauthorized' || err?.code === 'storage/unauthenticated') {
        msg = 'Permission denied by Storage rules. Ensure you are signed in and Storage rules allow user uploads.';
      }
      setError(`Failed to upload photo: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

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
      photoURL: photoURL,
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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          </div>
        )}
        
        {!loading && (
          <>
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
                  {/* Profile Photo */}
                  <div className="relative group">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
                      {photoURL ? (
                        <img 
                          src={photoURL} 
                          alt={name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-2xl md:text-3xl font-bold">
                          {avatar}
                        </span>
                      )}
                    </div>
                    
                    {/* Upload button - only show for own profile */}
                    {isOwnProfile && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          title="Upload photo"
                        >
                          {uploading ? (
                            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isOwnProfile ? 'Display Name' : 'Name'}
                    </label>
                    {isOwnProfile ? (
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{name}</p>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
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
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                {isOwnProfile ? (
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about your experience, interests, and what you hope to learn/teach."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{bio}</p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Skills {isOwnProfile ? 'I' : 'They'} Can Teach
                </h2>
                {isOwnProfile ? (
                  <>
                    <TagInput
                      label="Add skills you can teach"
                      value={teachSkills}
                      onChange={setTeachSkills}
                      placeholder="e.g., React, UI/UX, Guitar"
                    />
                    {teachSkills.length > 0 && (
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Tip: Use specific skills to find better matches.</p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teachSkills.length > 0 ? (
                      teachSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No skills listed</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Skills {isOwnProfile ? 'I' : 'They'} Want to Learn
                </h2>
                {isOwnProfile ? (
                  <>
                    <TagInput
                      label="Add skills you want to learn"
                      value={learnSkills}
                      onChange={setLearnSkills}
                      placeholder="e.g., Python, Photography, Spanish"
                    />
                    {learnSkills.length > 0 && (
                      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Tip: Add multiple to broaden your matches.</p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {learnSkills.length > 0 ? (
                      learnSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No skills listed</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile
