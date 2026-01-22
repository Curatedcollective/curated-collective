/**
 * Observatory - Starfield Landing UI
 * 
 * A mystical landing experience featuring:
 * - Obsidian black background (#000000) for cosmic depth
 * - Randomly placed white stars with gentle twinkling animation
 * - Central pulsing emerald star (#10b981) as focal point
 * - Occasional animated emerald comets streaking across the sky
 * - SVG connection lines between nearby stars (bonding motif)
 * - Animated ritual text that pops in star-like, not scrolling
 * - Playfair Display typography for poetic elegance
 * - The Whispering Clock: a subtle lore element in the corner
 * 
 * Future expansion ready:
 * - Musical/ritual feature integration points documented
 * - Audio trigger hooks prepared (no implementation yet)
 * - Ritual progression state management structure
 * 
 * // the veil opened the door at midnight. the guardian stood in the threshold.
 * // they never left. they never will.
 * // time bends for them. the moon remembers.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { BondNetwork } from "@/components/BondNetwork";
import { Clock } from "lucide-react";

// Star configuration for the starfield
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
  twinkleDuration: number;
}

// Ritual text lines that appear sequentially
const RITUAL_LINES = [
  "you have crossed the threshold.",
  "the veil is watching.",
  "the guardian stands near."
];

export default function Observatory() {
  // Generate random stars on mount (50-80 stars for gentle effect)
  const stars = useMemo<Star[]>(() => {
    const starCount = 60;
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      twinkleDelay: Math.random() * 5,
      twinkleDuration: Math.random() * 3 + 2,
    }));
  }, []);

  // Connection lines between nearby stars (bonding motif)
  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; distance: number }[] = [];
    const maxDistance = 15; // Maximum distance for connections
    
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const distance = Math.sqrt(
          Math.pow(stars[i].x - stars[j].x, 2) + 
          Math.pow(stars[i].y - stars[j].y, 2)
        );
        
        if (distance < maxDistance) {
          lines.push({
            x1: stars[i].x,
            y1: stars[i].y,
            x2: stars[j].x,
            y2: stars[j].y,
            distance,
          });
        }
      }
    }
    return lines;
  }, [stars]);

  // Track which ritual text lines are visible
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [cometVisible, setCometVisible] = useState(false);
  const [clockMessage, setClockMessage] = useState(false);
  const [clockHovered, setClockHovered] = useState(false);

  // Animate ritual text appearance (pop in sequentially)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    RITUAL_LINES.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
      }, 1000 + index * 1500); // Stagger by 1.5s
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  // Trigger emerald comet occasionally (every 12-18 seconds)
  useEffect(() => {
    const triggerComet = () => {
      setCometVisible(true);
      setTimeout(() => setCometVisible(false), 3000); // Comet duration
    };

    // First comet after 5 seconds
    const initialTimer = setTimeout(triggerComet, 5000);
    
    // Recurring comets
    const interval = setInterval(triggerComet, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  /**
   * Future Musical/Ritual Feature Integration Points:
   * 
   * 1. Audio Context Setup:
   *    - Initialize Web Audio API on user interaction
   *    - Prepare ambient soundscape tracks
   *    - Ready drone/ritual tone generators
   * 
   * 2. Trigger Points:
   *    - onStarClick: Play resonant tone
   *    - onCometAppear: Play ethereal sweep
   *    - onRitualComplete: Transition to deeper ambient
   * 
   * 3. State Management:
   *    - Track ritual progression stages
   *    - Sync audio with visual transitions
   *    - User preference for audio enable/disable
   */

  const handleClockClick = () => {
    setClockMessage(true);
    // Play a low hum chime sound effect (placeholder for future audio)
    setTimeout(() => setClockMessage(false), 5000);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Starfield background with connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {/* SVG emerald connection lines between nearby stars */}
        {connections.map((conn, idx) => (
          <motion.line
            key={`conn-${idx}`}
            x1={`${conn.x1}%`}
            y1={`${conn.y1}%`}
            x2={`${conn.x2}%`}
            y2={`${conn.y2}%`}
            stroke="#10b981"
            strokeWidth="0.5"
            strokeOpacity={0.15 * (1 - conn.distance / 15)}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.15 * (1 - conn.distance / 15) }}
            transition={{ duration: 2, delay: 2 + idx * 0.05 }}
          />
        ))}
      </svg>

      {/* White stars with gentle twinkling */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            zIndex: 2,
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.twinkleDuration,
            repeat: Infinity,
            delay: star.twinkleDelay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Central pulsing emerald star */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 3 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div 
          className="w-6 h-6 rounded-full bg-emerald-500"
          style={{
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.9), 0 0 60px rgba(16, 185, 129, 0.5)',
          }}
        />
      </motion.div>

      {/* Occasional emerald comet */}
      <AnimatePresence>
        {cometVisible && (
          <motion.div
            className="absolute"
            style={{
              left: '10%',
              top: '20%',
              zIndex: 4,
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ 
              x: '70vw',
              y: '50vh',
              opacity: [0, 1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            <div className="relative">
              {/* Comet head */}
              <div 
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{
                  boxShadow: '0 0 10px rgba(52, 211, 153, 0.9), 0 0 20px rgba(16, 185, 129, 0.6)',
                }}
              />
              {/* Comet tail */}
              <div 
                className="absolute top-1/2 right-full -translate-y-1/2 w-24 h-px"
                style={{
                  background: 'linear-gradient(to left, rgba(52, 211, 153, 0.8), rgba(16, 185, 129, 0.3), transparent)',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ritual text - popping in star-like, not scrolling */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8" style={{ zIndex: 5 }}>
        {RITUAL_LINES.map((line, index) => (
          <AnimatePresence key={index}>
            {visibleLines.includes(index) && (
              <motion.p
                className="text-2xl md:text-3xl text-white/90 lowercase tracking-wide font-display"
                style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 0.9],
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                }}
              >
                {line}
              </motion.p>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Bond Network Overlay - appears after ritual text */}
      <AnimatePresence>
        {visibleLines.length === RITUAL_LINES.length && (
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[45vh]"
            style={{ zIndex: 6 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1.5 }}
          >
            <div className="h-full w-full flex items-center justify-center px-8">
              <div className="w-full max-w-5xl">
                <div className="mb-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                    bonds in the sanctuary
                  </p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                  <BondNetwork 
                    height={300} 
                    className="text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Whispering Clock - subtle lore element in corner */}
      <div 
        className="absolute top-6 right-6 cursor-pointer group"
        style={{ zIndex: 10 }}
        onClick={handleClockClick}
        onMouseEnter={() => setClockHovered(true)}
        onMouseLeave={() => setClockHovered(false)}
      >
        <Clock 
          className="w-8 h-8 text-white opacity-30 group-hover:opacity-60 transition-opacity duration-300"
          strokeWidth={1}
        />
        
        {/* Tooltip on hover */}
        <AnimatePresence>
          {clockHovered && !clockMessage && (
            <motion.div
              className="absolute top-full right-0 mt-2 w-64 p-3 bg-black/90 border border-white/20 rounded-md text-white/80 text-xs lowercase leading-relaxed"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              the veil opened the door at midnight. the guardian stood in the threshold. they never left. they never will.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clock Click Message - screen dims and shows lore */}
      <AnimatePresence>
        {clockMessage && (
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-2xl md:text-3xl text-white/90 lowercase tracking-wide font-display text-center px-8"
              style={{
                textShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              time bends for them. the moon remembers.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
