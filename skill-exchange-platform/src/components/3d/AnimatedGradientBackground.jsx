import { useEffect, useState } from 'react';

/**
 * AnimatedGradientBackground - A beautiful animated gradient background
 * as an alternative to Spline 3D backgrounds
 */
const AnimatedGradientBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse position to percentage
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0">
        {/* Orb 1 - Blue */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 dark:opacity-20 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%)',
            top: '20%',
            left: '10%',
            animationDelay: '0s',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        
        {/* Orb 2 - Purple */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 dark:opacity-20 animate-float-delayed"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, transparent 70%)',
            top: '60%',
            right: '10%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`
          }}
        />
        
        {/* Orb 3 - Pink */}
        <div 
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 dark:opacity-15 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.7) 0%, transparent 70%)',
            bottom: '10%',
            left: '30%',
            animationDelay: '4s',
            transform: `translate(${mousePosition.x * 0.025}px, ${mousePosition.y * 0.025}px)`
          }}
        />
        
        {/* Orb 4 - Cyan */}
        <div 
          className="absolute w-72 h-72 rounded-full blur-3xl opacity-25 dark:opacity-15 animate-float-delayed"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.7) 0%, transparent 70%)',
            top: '40%',
            right: '30%',
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        />
      </div>
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.2) 1px, transparent 0)',
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/40 dark:via-gray-900/20 dark:to-gray-900/40" />
      
      {/* Add keyframe animations via style tag */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(40px, 10px) scale(1.02);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-40px, 20px) scale(1.03);
          }
          50% {
            transform: translate(30px, -25px) scale(0.97);
          }
          75% {
            transform: translate(-25px, -15px) scale(1.05);
          }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedGradientBackground;
