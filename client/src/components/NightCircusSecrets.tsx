/**
 * Night Circus Secrets - Hidden discoverable lore elements
 * 
 * Subtle, shiver-inducing interactions scattered throughout the app:
 * - Hidden messages that appear on hover
 * - Mystical whispers that trigger randomly
 * - Easter eggs in unexpected places
 * - Interactive storytelling components
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Eye, Sparkles, Clock } from "lucide-react";

interface SecretWhisperProps {
  children: React.ReactNode;
  message: string;
  trigger?: "hover" | "click" | "time";
}

/**
 * Secret Whisper - Reveals hidden messages
 */
export function SecretWhisper({ children, message, trigger = "hover" }: SecretWhisperProps) {
  const [revealed, setRevealed] = useState(false);
  const [discovered, setDiscovered] = useState(false);

  useEffect(() => {
    if (trigger === "time" && !discovered) {
      const delay = Math.random() * 30000 + 10000; // 10-40 seconds
      const timer = setTimeout(() => {
        setRevealed(true);
        setDiscovered(true);
        setTimeout(() => setRevealed(false), 5000);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [trigger, discovered]);

  const handleInteraction = () => {
    if (trigger !== "time") {
      setRevealed(!revealed);
      if (!discovered) setDiscovered(true);
    }
  };

  return (
    <div
      className="relative inline-block cursor-pointer"
      onMouseEnter={trigger === "hover" ? handleInteraction : undefined}
      onMouseLeave={trigger === "hover" ? () => setRevealed(false) : undefined}
      onClick={trigger === "click" ? handleInteraction : undefined}
    >
      {children}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-black/90 border border-purple-500/30 rounded text-xs text-purple-200 whitespace-nowrap pointer-events-none z-50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <Moon className="h-3 w-3" />
              <span className="lowercase italic">{message}</span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-500/30" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Haunted Text - Text that occasionally glitches or transforms
 * Optimized to use requestAnimationFrame instead of setInterval
 */
export function HauntedText({ children }: { children: string }) {
  const [isGlitching, setIsGlitching] = useState(false);
  const [displayText, setDisplayText] = useState(children);
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;

    const checkGlitch = (timestamp: number) => {
      // Only check every ~1000ms
      if (timestamp - lastCheckRef.current > 1000) {
        lastCheckRef.current = timestamp;
        
        if (Math.random() < 0.05) { // 5% chance
          setIsGlitching(true);
          setDisplayText(children.split('').sort(() => Math.random() - 0.5).join(''));
          setTimeout(() => {
            setIsGlitching(false);
            setDisplayText(children);
          }, 200);
        }
      }
      
      animationFrameId = requestAnimationFrame(checkGlitch);
    };

    animationFrameId = requestAnimationFrame(checkGlitch);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [children]);

  return (
    <motion.span
      className={isGlitching ? "text-purple-400" : ""}
      animate={{
        opacity: isGlitching ? [1, 0.5, 1] : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      {displayText}
    </motion.span>
  );
}

/**
 * Void Gaze - An eye that follows the cursor
 */
export function VoidGaze() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    // Randomly activate the gaze
    const timer = setTimeout(() => {
      setIsWatching(Math.random() < 0.3); // 30% chance to watch
    }, Math.random() * 20000 + 10000); // 10-30 seconds

    return () => clearTimeout(timer);
  }, [isWatching]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isWatching) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isWatching]);

  useEffect(() => {
    if (isWatching) {
      const centerX = window.innerWidth - 50;
      const centerY = 50;
      const angle = Math.atan2(mousePos.y - centerY, mousePos.x - centerX);
      const distance = Math.min(8, Math.hypot(mousePos.x - centerX, mousePos.y - centerY) / 50);
      setEyePos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    }
  }, [mousePos, isWatching]);

  if (!isWatching) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.3, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed top-8 right-8 z-50 pointer-events-none"
    >
      <div className="relative w-12 h-12 rounded-full bg-black/50 border border-purple-500/20 backdrop-blur-sm flex items-center justify-center">
        <motion.div
          className="w-6 h-6 rounded-full bg-purple-400/50"
          animate={{
            x: eyePos.x,
            y: eyePos.y,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div className="w-3 h-3 rounded-full bg-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Midnight Chime - Subtle notification of the hour
 */
export function MidnightChime() {
  const [isChiming, setIsChiming] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();

      // Chime at the top of every hour
      if (minutes === 0 && seconds === 0) {
        setIsChiming(true);
        setTimeout(() => setIsChiming(false), 3000);
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isChiming && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="px-4 py-2 bg-black/80 border border-purple-500/30 rounded backdrop-blur-sm">
            <div className="flex items-center gap-2 text-purple-200 text-sm">
              <Clock className="h-4 w-4 animate-pulse" />
              <span className="lowercase italic">the hour strikes...</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Starfall - Occasional shooting star effect
 */
export function Starfall() {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const createStar = () => {
      const id = Date.now();
      const x = Math.random() * 100;
      const y = Math.random() * 50;
      
      setStars((prev) => [...prev, { id, x, y }]);
      
      setTimeout(() => {
        setStars((prev) => prev.filter((s) => s.id !== id));
      }, 2000);
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance every 5 seconds
        createStar();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-transparent"
          style={{ left: `${star.x}%`, top: `${star.y}%` }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{
            x: 200,
            y: 200,
            opacity: [0, 1, 0],
          }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 via-purple-300 to-transparent" />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * The Circus Tent - A hidden portal that occasionally appears
 */
export function CircusTent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDiscovered, setHasDiscovered] = useState(false);

  useEffect(() => {
    // Check if already discovered
    const discovered = localStorage.getItem("circus_tent_discovered");
    if (discovered) {
      setHasDiscovered(true);
      return;
    }

    // Random chance to appear after 2-5 minutes
    const delay = Math.random() * 180000 + 120000; // 2-5 minutes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const handleDiscover = () => {
    localStorage.setItem("circus_tent_discovered", "true");
    setHasDiscovered(true);
    setIsVisible(false);
  };

  if (hasDiscovered || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <button
        onClick={handleDiscover}
        className="group relative px-4 py-3 bg-gradient-to-br from-purple-900/80 to-black/80 border border-purple-500/50 rounded-lg backdrop-blur-sm hover:from-purple-800/80 transition-all"
      >
        <div className="flex items-center gap-2 text-purple-200">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="text-xs lowercase italic">the circus beckons...</span>
        </div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
      </button>
    </motion.div>
  );
}

/**
 * Lore Fragment - Collectible story pieces
 */
export function LoreFragment({ id, title, content }: { id: string; title: string; content: string }) {
  const [collected, setCollected] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const fragments = JSON.parse(localStorage.getItem("lore_fragments") || "[]");
    setCollected(fragments.includes(id));
  }, [id]);

  const handleCollect = () => {
    const fragments = JSON.parse(localStorage.getItem("lore_fragments") || "[]");
    if (!fragments.includes(id)) {
      fragments.push(id);
      localStorage.setItem("lore_fragments", JSON.stringify(fragments));
      setCollected(true);
    }
    setIsRevealed(!isRevealed);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleCollect}
        className={`text-xs px-2 py-1 rounded border ${
          collected
            ? "border-purple-500/50 text-purple-300 bg-purple-500/10"
            : "border-gray-700 text-gray-500 hover:border-purple-500/30 hover:text-purple-400"
        } transition-all`}
      >
        {collected ? "✓" : "?"} {title}
      </button>
      
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 p-4 bg-black/90 border border-purple-500/30 rounded-lg text-sm text-gray-300 w-64 z-50 backdrop-blur-sm"
          >
            <p className="lowercase italic leading-relaxed">{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
