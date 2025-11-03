import { Suspense, lazy, useState, useEffect } from 'react';

// Lazy load Spline to avoid blocking render
const Spline = lazy(() => import('@splinetool/react-spline').catch(() => {
  // If Spline fails to load, return a fallback
  return { default: () => null };
}));

const SplineBackground = ({ sceneUrl }) => {
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(true);

  // Validate scene URL
  const isValidUrl = sceneUrl && 
                     typeof sceneUrl === 'string' && 
                     sceneUrl.startsWith('https://prod.spline.design/');

  // Hide Spline on scroll to prevent performance issues
  useEffect(() => {
    setIsMounted(true);
    
    // If URL is invalid, show error immediately
    if (!isValidUrl) {
      console.warn('Invalid or missing Spline scene URL. Using fallback background.');
      setHasError(true);
      return;
    }
    
    let timeout;
    
    const handleScroll = () => {
      if (!isMounted) return;
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

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      setIsMounted(false);
      window.removeEventListener('scroll', throttledScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [isValidUrl, isMounted]);

  const handleError = (error) => {
    console.warn('Spline scene failed to load - using fallback background');
    console.warn('Error details:', error);
    if (isMounted) {
      setHasError(true);
    }
  };

  // Always show gradient if URL is invalid or error occurred
  if (hasError || !isValidUrl) {
    return (
      <div className="fixed inset-0 w-full h-full z-0">
        {/* Beautiful gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-100/30 to-purple-100/30 dark:via-indigo-900/10 dark:to-purple-900/10 animate-pulse" 
             style={{ animationDuration: '3s' }} />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10"
             style={{
               backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0)',
               backgroundSize: '40px 40px'
             }} />
      </div>
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
