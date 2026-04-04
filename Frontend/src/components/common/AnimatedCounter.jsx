import React, { useEffect } from "react";
import { useMotionValue, motion, useTransform, animate } from "framer-motion";

const AnimatedCounter = ({ value, duration = 2, delay = 0, decimals = 0, suffix = "" }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    Number(latest.toFixed(decimals)).toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  );

  useEffect(() => {
    const controls = animate(count, value, {
      duration: duration,
      delay: delay,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, value, duration, delay]);

  return (
    <span className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};

export default AnimatedCounter;
