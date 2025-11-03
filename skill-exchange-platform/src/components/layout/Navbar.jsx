import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES, PUBLIC_NAV_ITEMS, PROTECTED_NAV_ITEMS } from '../../routes';
import { useAuth } from '../../contexts';
import ThemeSelector from '../ThemeSelector';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const navItems = isAuthenticated ? PROTECTED_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav 
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo with glow */}
          <Link 
            to={ROUTES.HOME} 
            className="flex items-center gap-3 hover:opacity-80 transition group"
            aria-label="SkillSwap home"
          >
            <span className="text-3xl transform group-hover:scale-110 transition-transform" aria-hidden="true">🤝</span>
            <span className="text-2xl font-black gradient-text">SkillSwap</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-semibold text-lg transition relative group ${
                  isActive(item.path)
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" aria-hidden="true"></span>
                )}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" aria-hidden="true"></span>
              </Link>
            ))}

            {/* Theme Selector */}
            <ThemeSelector />

            {/* Auth Buttons with glow */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-md"
                aria-label="Logout from your account"
              >
                Logout
              </button>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="btn btn-primary btn-md"
                aria-label="Sign in to your account"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-sm !p-2"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu with glassmorphism */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-6 border-t border-gray-200 dark:border-white/10">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-5 py-3 rounded-xl font-semibold transition ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-blue-200 dark:border-white/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Auth Button */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-secondary btn-md w-full"
                  aria-label="Logout from your account"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-md w-full"
                  aria-label="Sign in to your account"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
