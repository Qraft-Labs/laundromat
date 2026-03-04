import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

/**
 * ScrollReveal component - Animates children when they come into view
 * 
 * @param children - Content to animate
 * @param delay - Delay before animation starts (in seconds)
 * @param direction - Direction of slide animation (default: 'up')
 * @param className - Additional CSS classes
 */
export default function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = ''
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: 50, y: 0 },
    right: { x: -50, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0,
        ...directions[direction]
      }}
      animate={isInView ? { 
        opacity: 1,
        x: 0,
        y: 0
      } : {
        opacity: 0,
        ...directions[direction]
      }}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.21, 0.45, 0.27, 0.9] // Custom easing for smooth feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
