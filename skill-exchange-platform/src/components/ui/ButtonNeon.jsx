import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';

const gradients = {
  blue: ['#3b82f6', '#8b5cf6'],
  indigo: ['#6366f1', '#8b5cf6'],
  emerald: ['#10b981', '#22c55e'],
  orange: ['#f97316', '#fb923c'],
  pink: ['#ec4899', '#a78bfa'],
};

function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

/**
 * ButtonNeon
 * - Futuristic neon/glass button using utilities from index.css
 * Props:
 *  - to: string (use Link if provided)
 *  - onClick: function
 *  - variant: 'solid' | 'outline'
 *  - color: keyof typeof gradients
 *  - size: 'sm' | 'md' | 'lg'
 *  - as: component type (default: auto-detect based on 'to' prop)
 *  - className: string
 */
export default function ButtonNeon({
  to,
  onClick,
  children,
  variant = 'solid',
  color = 'blue',
  size = 'md',
  as,
  className,
  ...rest
}) {
  const [from, toColor] = gradients[color] || gradients.blue;

  const handleMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  }, []);

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  const solidBase = classNames(
    'btn-neon',
    sizes[size],
    className
  );

  const outlineBase = classNames(
    'btn-neon-outline',
    sizes[size],
    className
  );

  const style = variant === 'solid'
    ? { backgroundImage: `linear-gradient(135deg, ${from}, ${toColor})` }
    : undefined;

  // Determine the component type
  const Component = as || (to ? Link : 'button');

  return (
    <Component
      to={to}
      onClick={onClick}
      className={variant === 'solid' ? solidBase : outlineBase}
      onMouseMove={handleMove}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}
