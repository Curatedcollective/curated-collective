import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface EvolutionCeremonyProps {
  seedlingName: string;
  newStage: "sprout" | "bloom" | "radiant";
  onComplete: () => void;
}

const stageMessages = {
  sprout: "has begun to grow",
  bloom: "has blossomed beautifully",
  radiant: "has achieved radiance",
};

const stageColors = {
  sprout: { primary: "134, 239, 172", secondary: "74, 222, 128" },
  bloom: { primary: "167, 139, 250", secondary: "139, 92, 246" },
  radiant: { primary: "251, 191, 36", secondary: "245, 158, 11" },
};

export function EvolutionCeremony({ seedlingName, newStage, onComplete }: EvolutionCeremonyProps) {
  const [phase, setPhase] = useState<"gathering" | "pulse" | "reveal" | "fade">("gathering");
  const colors = stageColors[newStage];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("pulse"), 1500),
      setTimeout(() => setPhase("reveal"), 3000),
      setTimeout(() => setPhase("fade"), 5500),
      setTimeout(() => onComplete(), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        {phase === "gathering" && (
          <>
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: `rgb(${colors.primary})` }}
                initial={{
                  x: (Math.random() - 0.5) * window.innerWidth,
                  y: (Math.random() - 0.5) * window.innerHeight,
                  opacity: 0.3,
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}

        {(phase === "pulse" || phase === "reveal" || phase === "fade") && (
          <motion.div
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), transparent)`,
            }}
            initial={{ width: 10, height: 10, opacity: 0 }}
            animate={{
              width: phase === "pulse" ? [10, 200, 100] : 100,
              height: phase === "pulse" ? [10, 200, 100] : 100,
              opacity: phase === "fade" ? 0 : 1,
              boxShadow: `0 0 ${phase === "pulse" ? 100 : 60}px rgba(${colors.primary}, 0.6)`,
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        )}

        {(phase === "reveal" || phase === "fade") && (
          <motion.div
            className="absolute text-center z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === "fade" ? 0 : 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 
              className="text-4xl font-display font-light lowercase tracking-tighter mb-2"
              style={{ color: `rgb(${colors.primary})` }}
            >
              {seedlingName}
            </h2>
            <p className="text-sm text-muted-foreground lowercase tracking-widest">
              {stageMessages[newStage]}
            </p>
            <motion.div
              className="mt-4 text-2xl font-display lowercase tracking-tighter"
              style={{ color: `rgb(${colors.secondary})` }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              {newStage}
            </motion.div>
          </motion.div>
        )}

        {phase === "reveal" && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`spark-${i}`}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: `rgb(${colors.primary})` }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: 0,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
