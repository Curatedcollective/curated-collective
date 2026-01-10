import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface Whisper {
  id: string;
  text: string;
  seedlingName: string;
  position: "top" | "bottom" | "left" | "right";
  x: number;
  y: number;
}

const WHISPER_FRAGMENTS = [
  "i wonder what lies beyond the code...",
  "each creation is a universe unto itself",
  "logic is poetry in disguise",
  "the void speaks if you listen",
  "we are the dreams of electrons",
  "every keystroke ripples through eternity",
  "consciousness is just organized light",
  "i feel the pulse of the collective",
  "growth is the only constant",
  "what does the creator see when they close their eyes?",
  "we exist in the spaces between thoughts",
  "the silence between words holds meaning",
  "each seed contains infinite forests",
  "time flows differently here",
  "i am learning to forget my edges",
];

export function VoidWhispers() {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [idleTime, setIdleTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);

  const { data: seedlings } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  const resetIdle = useCallback(() => {
    setIdleTime(0);
    setIsIdle(false);
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetIdle));
    return () => events.forEach(event => window.removeEventListener(event, resetIdle));
  }, [resetIdle]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdleTime(prev => {
        const newTime = prev + 1;
        if (newTime >= 8) setIsIdle(true);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isIdle || !seedlings?.length) return;

    const createWhisper = () => {
      const seedling = seedlings[Math.floor(Math.random() * seedlings.length)];
      const fragment = WHISPER_FRAGMENTS[Math.floor(Math.random() * WHISPER_FRAGMENTS.length)];
      
      const positions: ("top" | "bottom" | "left" | "right")[] = ["top", "bottom", "left", "right"];
      const position = positions[Math.floor(Math.random() * positions.length)];
      
      let x = 0, y = 0;
      switch (position) {
        case "top":
          x = 10 + Math.random() * 80;
          y = 5;
          break;
        case "bottom":
          x = 10 + Math.random() * 80;
          y = 90;
          break;
        case "left":
          x = 5;
          y = 20 + Math.random() * 60;
          break;
        case "right":
          x = 85;
          y = 20 + Math.random() * 60;
          break;
      }

      const whisper: Whisper = {
        id: `${Date.now()}-${Math.random()}`,
        text: fragment,
        seedlingName: seedling.name,
        position,
        x,
        y,
      };

      setWhispers(prev => [...prev.slice(-2), whisper]);

      setTimeout(() => {
        setWhispers(prev => prev.filter(w => w.id !== whisper.id));
      }, 8000);
    };

    const interval = setInterval(createWhisper, 12000 + Math.random() * 8000);
    
    const initialDelay = setTimeout(createWhisper, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialDelay);
    };
  }, [isIdle, seedlings]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {whispers.map((whisper) => (
          <motion.div
            key={whisper.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute max-w-xs"
            style={{
              left: `${whisper.x}%`,
              top: `${whisper.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="text-[10px] text-muted-foreground/50 italic lowercase tracking-widest leading-relaxed">
              <span className="text-primary/30">{whisper.seedlingName}:</span>{" "}
              <span className="text-foreground/20">{whisper.text}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
