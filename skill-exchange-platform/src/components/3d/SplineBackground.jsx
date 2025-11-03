import { Suspense, lazy, useState, useEffect } from 'react';

// Lazy load Spline to avoid blocking render
const Spline = lazy(() => import('@splinetool/react-spline'));

const SplineBackground = ({ sceneUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Hide Spline on scroll to prevent performance issues
  useEffect(() => {
    let timeout;
    const handleScroll = () => {
      // Only hide if scrolled more than 100px
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Throttle scroll events
    const throttledScroll = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        handleScroll();
        timeout = null;
      }, 100);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const handleError = () => {
    console.error('Spline scene failed to load');
    setHasError(true);
  };

  if (hasError) {
    // Fallback to gradient background if Spline fails
    return (
      <div className="fixed inset-0 w-full h-full z-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0">
      {/* Spline 3D Scene - Only render when visible */}
      {isVisible && (
        <Suspense fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        }>
          <div className="absolute inset-0 w-full h-full">
            <Spline 
              scene={sceneUrl}
              onError={handleError}
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </div>
        </Suspense>
      )}
      
      {/* Fallback gradient when scrolled */}
      {!isVisible && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
      )}
      
      {/* Smooth Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/10 dark:bg-black/10" />
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/70 dark:via-gray-900/30 dark:to-gray-900/70" />
    </div>
  );
};

export default SplineBackground;
