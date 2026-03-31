import React, { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const MouseGlow = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        left: smoothX,
        top: smoothY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      className="pointer-events-none fixed z-50 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    />
  );
};

export default MouseGlow;
