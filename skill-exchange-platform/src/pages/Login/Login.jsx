import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes';
import { auth } from '../../firebase/config';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  
  // SEO: Update document title
  useEffect(() => {
    document.title = activeTab === 'login' 
      ? 'Login - Access Your SkillSwap Account'
      : 'Sign Up - Join SkillSwap Today';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = activeTab === 'login'
        ? 'Login to SkillSwap to continue your learning journey, connect with partners, and exchange skills.'
        : 'Create your free SkillSwap account to start exchanging skills with learners and teachers worldwide.';
    }
  }, [activeTab]);
  
  // Check if Firebase is configured
  const isFirebaseConfigured = !!auth;

  // If already authenticated, redirect away from login
  if (isAuthenticated) {
    // Avoid redirect loops during initial render
    setTimeout(() => navigate(ROUTES.DASHBOARD), 0);
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  setLoading(true);

    console.log('📝 Form submitted:', { 
      tab: activeTab, 
      email: formData.email,
      hasPassword: !!formData.password 
    });

    try {
      if (activeTab === 'login') {
        // Login with Firebase
        console.log('🔑 Calling login function...');
        const result = await login(formData.email, formData.password);
        console.log('✅ Login successful, navigating to dashboard...', result);
        navigate(ROUTES.DASHBOARD);
      } else {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        
        // Signup with Firebase
        console.log('📝 Calling signup function...');
        const result = await signup(formData.name, formData.email, formData.password);
        console.log('✅ Signup successful, navigating to dashboard...', result);
        navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      
      // Handle Firebase errors
      let errorMessage = 'An error occurred. Please try again.';
      
      const errorCode = err.code || '';
      const errorMsg = err.message || '';
      
      console.log('🔍 Error details:', { code: errorCode, message: errorMsg });
      
      if (errorCode === 'auth/email-already-in-use' || errorMsg.includes('auth/email-already-in-use')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (errorCode === 'auth/invalid-email' || errorMsg.includes('auth/invalid-email')) {
        errorMessage = 'Invalid email address format.';
      } else if (errorCode === 'auth/weak-password' || errorMsg.includes('auth/weak-password')) {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (errorCode === 'auth/user-not-found' || errorMsg.includes('auth/user-not-found')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (errorCode === 'auth/wrong-password' || errorMsg.includes('auth/wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorCode === 'auth/invalid-credential' || errorMsg.includes('auth/invalid-credential')) {
        errorMessage = 'Invalid email or password. If you don\'t have an account, please sign up first.';
      } else if (errorCode === 'auth/user-disabled' || errorMsg.includes('auth/user-disabled')) {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (errorCode === 'auth/too-many-requests' || errorMsg.includes('auth/too-many-requests')) {
        errorMessage = 'Too many failed attempts. Please try again later or reset your password.';
      } else if (errorCode === 'auth/operation-not-allowed' || errorMsg.includes('auth/operation-not-allowed')) {
        errorMessage = 'Email/Password authentication is not enabled. Please contact the administrator.';
      } else if (errorCode === 'auth/network-request-failed' || errorMsg.includes('auth/network-request-failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = errorMsg || errorCode || 'An error occurred. Please try again.';
      }
      
      console.log('📢 Displaying error:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      console.log('🔐 Starting Google sign-in...');
      await loginWithGoogle();
      console.log('✅ Google sign-in successful, redirecting...');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('❌ Google sign-in failed:', error);
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked. Please allow pop-ups for this site.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in is in progress. Please wait.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition">
            <span className="text-4xl">🤝</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">SkillSwap</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SkillSwap
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Start exchanging skills and grow together
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 text-center font-semibold transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {/* Firebase Not Configured Warning */}
            {!isFirebaseConfigured && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                      Firebase Not Configured
                    </h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-500 mb-2">
                      Authentication features are currently disabled. Please configure Firebase to enable login and signup.
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-600">
                      Check the browser console for setup instructions.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="label block mb-2 text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="login-password" className="label text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <a href="#forgot" className="body-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold">
                      Forgot?
                    </a>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="remember" className="ml-2 body-sm text-gray-700 dark:text-gray-300">
                    Remember me for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isFirebaseConfigured}
                  className="btn btn-primary btn-lg w-full"
                >
                  {!isFirebaseConfigured ? (
                    'Firebase Not Configured'
                  ) : loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Social Login Options */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 body-sm">
                      Or continue with
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || !isFirebaseConfigured}
                  className="btn btn-secondary btn-lg w-full"
                  aria-label="Sign in with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </button>
                
                {/* First-time user hint */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="body-sm text-blue-700 dark:text-blue-400 text-center">
                    💡 <strong>First time here?</strong> Click the <strong>"Sign Up"</strong> tab above to create your account.
                  </p>
                </div>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded focus:ring-indigo-500 mt-1"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <a href="#terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isFirebaseConfigured}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {!isFirebaseConfigured ? (
                    'Firebase Not Configured'
                  ) : loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Social Signup Options */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Signing up...' : 'Continue with Google'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link to={ROUTES.HOME} className="text-gray-600 hover:text-gray-900 text-sm font-medium inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
