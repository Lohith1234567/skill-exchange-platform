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
    <nav className="glass-dark sticky top-0 z-50 border-b border-black/10 dark:border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo with glow */}
          <Link to={ROUTES.HOME} className="flex items-center gap-3 hover:opacity-80 transition group">
            <span className="text-3xl transform group-hover:scale-110 transition-transform">🤝</span>
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
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></span>
                )}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}

            {/* Theme Selector */}
            <ThemeSelector />

            {/* Auth Buttons with glow */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-6 py-3 glass text-gray-900 dark:text-white rounded-xl hover-lift border border-black/20 dark:border-white/20 font-semibold"
              >
                Logout
              </button>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover-lift glow-blue font-semibold"
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
              className="p-2 rounded-xl glass text-gray-900 dark:text-white hover-lift border border-black/20 dark:border-white/20"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu with glassmorphism */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-black/10 dark:border-white/10">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-5 py-3 rounded-xl font-semibold transition ${
                    isActive(item.path)
                      ? 'glass-dark text-gray-900 dark:text-white glow-blue'
                      : 'text-gray-700 dark:text-gray-300 hover:glass-dark hover:text-gray-900 dark:hover:text-white'
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
                  className="px-5 py-3 glass text-gray-900 dark:text-white rounded-xl hover-lift border border-black/20 dark:border-white/20 font-semibold text-left"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover-lift glow-blue font-semibold text-center"
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
