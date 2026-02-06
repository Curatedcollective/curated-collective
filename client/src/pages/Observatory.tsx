import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Eye } from "lucide-react";
import { useState, useEffect } from "react";

interface Seedling {
  id: number;
  name: string;
  personality: string;
  experiencePoints: number;
  // evolutionStage: string; // REMOVED for minimal platform
}

interface StarNode {
  seedling: Seedling;
  x: number;
  y: number;
  size: number;
  brightness: number;
  pulseSpeed: number;
}

function getEvolutionColor(): string {
  return "rgba(255, 255, 255, 0.4)"; // Always seedling for minimal platform
}

function getEvolutionGlow(): string {
  return "0 0 8px rgba(255, 255, 255, 0.3)"; // Always seedling glow for minimal platform
}

export default function Observatory() {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [starNodes, setStarNodes] = useState<StarNode[]>([]);

  const { data: seedlings, isLoading } = useQuery<Seedling[]>({
    queryKey: ["/api/agents"],
  });

  useEffect(() => {
    if (!seedlings?.length) return;

    const nodes: StarNode[] = seedlings.map((seedling, i) => {
      const angle = (i / seedlings.length) * Math.PI * 2;
      const radius = 25 + Math.random() * 20;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      
      const expNormalized = Math.min((seedling.experiencePoints || 0) / 5000, 1);
      const size = 4 + expNormalized * 8;
      const brightness = 0.5 + expNormalized * 0.5;
      const pulseSpeed = 2 + Math.random() * 2;

      return { seedling, x, y, size, brightness, pulseSpeed };
    });

    setStarNodes(nodes);
  }, [seedlings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50" />
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-20">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Eye className="w-5 h-5 text-primary/50" />
        </div>
        <h1 className="text-4xl font-display font-light text-foreground lowercase tracking-tighter">the observatory</h1>
        <p className="text-[10px] text-muted-foreground lowercase tracking-widest mt-2">a living map of the collective</p>
      </div>

      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {starNodes.map((node, i) => 
            starNodes.slice(i + 1).map((otherNode, j) => {
              const distance = Math.sqrt(
                Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
              );
              if (distance < 25) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={node.x}
                    y1={node.y}
                    x2={otherNode.x}
                    y2={otherNode.y}
                    stroke="currentColor"
                    strokeOpacity={0.05 + (1 - distance / 25) * 0.1}
                    strokeWidth="0.1"
                    className="text-primary"
                  />
                );
              }
              return null;
            })
          )}
        </svg>
      </div>

      <div className="absolute inset-0">
        {starNodes.map((node) => (
          <motion.div
            key={node.seedling.id}
            className="absolute cursor-pointer"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onHoverStart={() => setHoveredStar(node.seedling.id)}
            onHoverEnd={() => setHoveredStar(null)}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [node.brightness, node.brightness + 0.2, node.brightness],
            }}
            transition={{
              duration: node.pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: `${node.size}px`,
                height: `${node.size}px`,
                backgroundColor: getEvolutionColor(),
                boxShadow: getEvolutionGlow(),
              }}
            />
            
            {hoveredStar === node.seedling.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap z-50"
              >
                <div className="bg-card/90 backdrop-blur-sm border border-border px-3 py-2 text-center">
                  <p className="text-sm font-display text-foreground lowercase tracking-tight">{node.seedling.name}</p>
                  <p className="text-[9px] text-muted-foreground lowercase tracking-widest">seedling</p>
                  <p className="text-[8px] text-primary/60 mt-1">{node.seedling.experiencePoints || 0} xp</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[9px] text-muted-foreground lowercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }} />
          <span>seedling</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(134, 239, 172, 0.6)" }} />
          <span>sprout</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(167, 139, 250, 0.7)" }} />
          <span>bloom</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(251, 191, 36, 0.9)" }} />
          <span>radiant</span>
        </div>
      </div>
    </div>
  );
}
