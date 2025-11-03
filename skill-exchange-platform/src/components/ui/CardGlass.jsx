import React from 'react';

function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

/**
 * CardGlass
 * - Rounded glassmorphism card with neon border and hover lift
 * Props:
 *  - as: element type, default 'div'
 *  - className: extra classes
 *  - padding: 'none' | 'sm' | 'md' | 'lg'
 *  - shadowPulse: boolean
 */
export default function CardGlass({ as: As = 'div', className, padding = 'lg', shadowPulse = false, children, ...rest }) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <As
      className={classNames(
        'card-glass neon-border rounded-2xl hover-lift',
        paddings[padding],
        shadowPulse && 'shadow-pulse',
        className
      )}
      {...rest}
    >
      {children}
    </As>
  );
}
