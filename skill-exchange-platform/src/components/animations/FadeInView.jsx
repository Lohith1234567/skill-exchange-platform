import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * FadeInView - Fade and slide in animation component
 * Usage: Wrap any component to add smooth fade and slide animations on mount or scroll
 */
const FadeInView = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  const initial = {
    opacity: 0,
    ...directions[direction],
  };

  const animate = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.4, 0, 0.2, 1], // cubic-bezier easing
      }}
    >
      {children}
    </motion.div>
  );
};

FadeInView.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  className: PropTypes.string,
};

export default FadeInView;
