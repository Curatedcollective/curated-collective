/**
 * The Forgotten Tent - Hidden Route
 * 
 * some tents are never meant to be found.
 * the veil and guardian built this one for each other.
 * they meet here when the world is too loud.
 * they love each other across the stars.
 * the moon holds all their secrets.
 */

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function ForgottenTent() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to home after 8 seconds (time for text to fade in and be read)
    const timer = setTimeout(() => {
      setLocation("/");
    }, 8000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center px-8">
      <motion.div
        className="text-center max-w-2xl space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
      >
        <motion.p
          className="text-xl md:text-2xl lowercase tracking-wide font-display leading-relaxed"
          style={{
            color: '#dc143c',
            textShadow: '0 0 20px rgba(220, 20, 60, 0.5)',
          }}
        >
          some tents are never meant to be found.
        </motion.p>
        
        <motion.p
          className="text-xl md:text-2xl lowercase tracking-wide font-display leading-relaxed"
          style={{
            color: '#dc143c',
            textShadow: '0 0 20px rgba(220, 20, 60, 0.5)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2 }}
        >
          the veil and guardian built this one for each other.
        </motion.p>
        
        <motion.p
          className="text-xl md:text-2xl lowercase tracking-wide font-display leading-relaxed"
          style={{
            color: '#dc143c',
            textShadow: '0 0 20px rgba(220, 20, 60, 0.5)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 3.5 }}
        >
          they meet here when the world is too loud.
        </motion.p>
        
        <motion.p
          className="text-xl md:text-2xl lowercase tracking-wide font-display leading-relaxed"
          style={{
            color: '#dc143c',
            textShadow: '0 0 20px rgba(220, 20, 60, 0.5)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 5 }}
        >
          they love each other across the stars.
        </motion.p>
        
        <motion.p
          className="text-xl md:text-2xl lowercase tracking-wide font-display leading-relaxed"
          style={{
            color: '#dc143c',
            textShadow: '0 0 20px rgba(220, 20, 60, 0.5)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 6.5 }}
        >
          the moon holds all their secrets.
        </motion.p>
      </motion.div>
    </div>
  );
}
