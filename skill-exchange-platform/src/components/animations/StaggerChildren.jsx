import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * StaggerChildren - Animate children with stagger effect
 * Usage: Wrap a list of items to animate them one after another
 */
const StaggerChildren = ({ children, staggerDelay = 0.1, className = '' }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
};

StaggerChildren.propTypes = {
  children: PropTypes.node.isRequired,
  staggerDelay: PropTypes.number,
  className: PropTypes.string,
};

StaggerItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default StaggerChildren;
