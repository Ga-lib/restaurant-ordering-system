import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const transition = {
  duration: 0.4,
  ease: [0.25, 1, 0.5, 1],
};

function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;