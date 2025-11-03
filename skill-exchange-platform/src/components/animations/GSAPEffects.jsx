import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import PropTypes from 'prop-types';

/**
 * MagneticButton - Button that follows cursor with magnetic effect
 * Usage: For primary CTAs and important interactive elements
 */
export const MagneticButton = ({ children, strength = 0.3, className = '' }) => {
  const buttonRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = button.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      // Calculate distance from center
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Only apply effect if cursor is within a reasonable range
      const maxDistance = Math.max(width, height);
      if (distance > maxDistance) return;
      
      const deltaX = distanceX * strength;
      const deltaY = distanceY * strength;

      gsap.to(button, {
        x: deltaX,
        y: deltaY,
        duration: 0.4,
        ease: 'power2.out',
      });

      if (textRef.current) {
        gsap.to(textRef.current, {
          x: deltaX * 0.3,
          y: deltaY * 0.3,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });

      if (textRef.current) {
        gsap.to(textRef.current, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={buttonRef} className={`inline-block ${className}`}>
      <div ref={textRef}>{children}</div>
    </div>
  );
};

/**
 * GlowingCard - Card with animated glow that follows cursor
 * Usage: For feature cards and dashboard elements
 */
export const GlowingCard = ({ children, glowColor = '#3b82f6', className = '' }) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;

      gsap.to(glow, {
        background: `radial-gradient(circle at ${x}% ${y}%, ${glowColor}40, transparent 50%)`,
        duration: 0.3,
      });
    };

    const handleMouseEnter = () => {
      gsap.to(glow, {
        opacity: 1,
        duration: 0.3,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(glow, {
        opacity: 0,
        duration: 0.5,
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [glowColor]);

  return (
    <div ref={cardRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={glowRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      {children}
    </div>
  );
};

/**
 * PulseEffect - Pulsing animation for attention-grabbing elements
 * Usage: For badges, notifications, new features
 */
export const PulseEffect = ({ children, scale = 1.1, className = '' }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      scale: scale,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });

    return () => {
      gsap.killTweensOf(element);
    };
  }, [scale]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

/**
 * ParallaxCard - Card with 3D tilt effect on hover
 * Usage: For premium feature cards and hero sections
 */
export const ParallaxCard = ({ children, intensity = 15, className = '' }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const rotateX = ((e.clientY - centerY) / height) * intensity;
      const rotateY = ((e.clientX - centerX) / width) * intensity;

      gsap.to(card, {
        rotateX: -rotateX,
        rotateY: rotateY,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

MagneticButton.propTypes = {
  children: PropTypes.node.isRequired,
  strength: PropTypes.number,
  className: PropTypes.string,
};

GlowingCard.propTypes = {
  children: PropTypes.node.isRequired,
  glowColor: PropTypes.string,
  className: PropTypes.string,
};

PulseEffect.propTypes = {
  children: PropTypes.node.isRequired,
  scale: PropTypes.number,
  className: PropTypes.string,
};

ParallaxCard.propTypes = {
  children: PropTypes.node.isRequired,
  intensity: PropTypes.number,
  className: PropTypes.string,
};
