import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * HoverScale - Scale up on hover with smooth animation
 * Usage: Wrap buttons, cards, or any interactive elements
 */
export const HoverScale = ({ children, scale = 1.05, className = '' }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * HoverGlow - Add glow effect on hover
 * Usage: For buttons and cards that need extra emphasis
 */
export const HoverGlow = ({ children, glowColor = '#3b82f6', className = '' }) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        boxShadow: `0 0 20px ${glowColor}80, 0 0 40px ${glowColor}40`,
      }}
      transition={{
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * HoverLift - Lift element up on hover with shadow
 * Usage: For cards and containers
 */
export const HoverLift = ({ children, liftAmount = -8, className = '' }) => {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: liftAmount,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * HoverRotate - Subtle rotation on hover
 * Usage: For icons and small interactive elements
 */
export const HoverRotate = ({ children, rotation = 5, className = '' }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ rotate: rotation }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
    >
      {children}
    </motion.div>
  );
};

HoverScale.propTypes = {
  children: PropTypes.node.isRequired,
  scale: PropTypes.number,
  className: PropTypes.string,
};

HoverGlow.propTypes = {
  children: PropTypes.node.isRequired,
  glowColor: PropTypes.string,
  className: PropTypes.string,
};

HoverLift.propTypes = {
  children: PropTypes.node.isRequired,
  liftAmount: PropTypes.number,
  className: PropTypes.string,
};

HoverRotate.propTypes = {
  children: PropTypes.node.isRequired,
  rotation: PropTypes.number,
  className: PropTypes.string,
};
