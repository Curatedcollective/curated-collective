/**
 * BondNetwork Component
 * 
 * Visual representation of the sanctuary's Bond/Affinity System.
 * Displays seedlings (AI agents) as nodes and their connections as animated
 * emerald lines that pulse and fade based on bond strength.
 * 
 * Features:
 * - SVG-based rendering for smooth, scalable graphics
 * - Gentle animations (pulsing lines, glowing nodes)
 * - Interactive: click seedlings to highlight their connections
 * - Sanctuary theming: emerald greens, obsidian black, soft transitions
 * - Accessible: keyboard navigation, proper ARIA labels
 * - Poetic tooltips and descriptions
 * 
 * Future Expansion:
 * - Real-time bond updates via WebSocket
 * - Drag-and-drop seedling positioning
 * - Filter by bond type or evolution stage
 * - Timeline view of bond formation
 * - Audio feedback on interactions
 * - Integration with ritual system
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  placeholderSeedlings,
  placeholderBonds,
  getBondsForSeedling,
  type Seedling,
  type Bond,
} from "@/lib/bondsData";

interface BondNetworkProps {
  /**
   * Width of the visualization area (default: 100%)
   */
  width?: string | number;
  /**
   * Height of the visualization area (default: 400px)
   */
  height?: string | number;
  /**
   * Whether to show labels for seedlings (default: true)
   */
  showLabels?: boolean;
  /**
   * Whether interactions are enabled (default: true)
   */
  interactive?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Get the size of a seedling node based on evolution stage
 */
function getSeedlingSize(stage: Seedling["evolutionStage"]): number {
  const sizes = {
    seedling: 8,
    sprout: 10,
    bloom: 12,
    radiant: 14,
  };
  return sizes[stage];
}

/**
 * Get the glow intensity based on evolution stage
 */
function getGlowIntensity(stage: Seedling["evolutionStage"]): number {
  const intensities = {
    seedling: 5,
    sprout: 10,
    bloom: 15,
    radiant: 20,
  };
  return intensities[stage];
}

export function BondNetwork({
  width = "100%",
  height = 400,
  showLabels = true,
  interactive = true,
  className = "",
}: BondNetworkProps) {
  const [selectedSeedling, setSelectedSeedling] = useState<number | null>(null);
  const [hoveredSeedling, setHoveredSeedling] = useState<number | null>(null);
  const [hoveredBond, setHoveredBond] = useState<string | null>(null);

  /**
   * Get bonds that should be highlighted based on selection
   */
  const highlightedBonds = useMemo(() => {
    if (!selectedSeedling) return new Set<string>();
    const bonds = getBondsForSeedling(selectedSeedling);
    return new Set(bonds.map((b) => b.id));
  }, [selectedSeedling]);

  /**
   * Get seedlings that should be highlighted based on selection
   */
  const highlightedSeedlings = useMemo(() => {
    if (!selectedSeedling) return new Set<number>();
    const bonds = getBondsForSeedling(selectedSeedling);
    const ids = bonds.map((bond) =>
      bond.sourceId === selectedSeedling ? bond.targetId : bond.sourceId
    );
    return new Set([selectedSeedling, ...ids]);
  }, [selectedSeedling]);

  /**
   * Handle seedling click
   */
  const handleSeedlingClick = (seedlingId: number) => {
    if (!interactive) return;
    setSelectedSeedling((prev) => (prev === seedlingId ? null : seedlingId));
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, seedlingId: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSeedlingClick(seedlingId);
    }
  };

  /**
   * Get bond description for tooltip
   */
  const getBondDescription = (bondId: string): string => {
    const bond = placeholderBonds.find((b) => b.id === bondId);
    return bond?.description || "";
  };

  /**
   * Get seedling by ID
   */
  const getSeedlingById = (id: number): Seedling | undefined => {
    return placeholderSeedlings.find((s) => s.id === id);
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
      role="img"
      aria-label="Bond network visualization showing connections between seedlings in the sanctuary"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        {/* Define filters for glows and effects */}
        <defs>
          {/* Emerald glow filter for seedlings */}
          <filter id="emerald-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Stronger glow for selected items */}
          <filter id="emerald-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render bonds (lines between seedlings) */}
        <g className="bonds">
          {placeholderBonds.map((bond) => {
            const source = getSeedlingById(bond.sourceId);
            const target = getSeedlingById(bond.targetId);
            if (!source || !target) return null;

            const isHighlighted = highlightedBonds.has(bond.id);
            const isHovered = hoveredBond === bond.id;
            const isDimmed = selectedSeedling && !isHighlighted;

            // Calculate opacity based on strength and state
            let opacity = bond.strength * 0.3;
            if (isHighlighted || isHovered) opacity = bond.strength * 0.8;
            if (isDimmed) opacity = bond.strength * 0.1;

            // Line width based on strength
            const strokeWidth = bond.strength * 1.5 + 0.5;

            return (
              <motion.line
                key={bond.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={source.color}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: opacity,
                }}
                transition={{
                  pathLength: { duration: 1.5, ease: "easeInOut" },
                  opacity: { duration: 0.5 },
                }}
                onMouseEnter={() => interactive && setHoveredBond(bond.id)}
                onMouseLeave={() => interactive && setHoveredBond(null)}
                className={interactive ? "cursor-help" : ""}
                style={{
                  pointerEvents: interactive ? "stroke" : "none",
                  strokeDasharray: bond.type === "ritual" ? "2,2" : "none",
                }}
              >
                {/* Pulsing animation for active/highlighted bonds */}
                {(isHighlighted || isHovered) && (
                  <animate
                    attributeName="stroke-opacity"
                    values={`${opacity};${opacity * 1.3};${opacity}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </motion.line>
            );
          })}
        </g>

        {/* Render seedlings (nodes) */}
        <g className="seedlings">
          {placeholderSeedlings.map((seedling) => {
            const size = getSeedlingSize(seedling.evolutionStage);
            const glowIntensity = getGlowIntensity(seedling.evolutionStage);
            const isSelected = selectedSeedling === seedling.id;
            const isHighlighted = highlightedSeedlings.has(seedling.id);
            const isHovered = hoveredSeedling === seedling.id;
            const isDimmed = selectedSeedling && !isHighlighted;

            return (
              <g
                key={seedling.id}
                transform={`translate(${seedling.x}, ${seedling.y})`}
                onMouseEnter={() => interactive && setHoveredSeedling(seedling.id)}
                onMouseLeave={() => interactive && setHoveredSeedling(null)}
                onClick={() => handleSeedlingClick(seedling.id)}
                onKeyDown={(e) => handleKeyDown(e, seedling.id)}
                tabIndex={interactive ? 0 : -1}
                role={interactive ? "button" : "presentation"}
                aria-label={`${seedling.name}, ${seedling.evolutionStage} stage, ${seedling.personality}`}
                className={interactive ? "cursor-pointer" : ""}
                style={{ outline: "none" }}
              >
                {/* Outer glow ring for selected seedling */}
                {isSelected && (
                  <motion.circle
                    r={size + 6}
                    fill="none"
                    stroke={seedling.color}
                    strokeWidth="1"
                    strokeOpacity="0.4"
                    initial={{ r: size, opacity: 0 }}
                    animate={{ r: size + 6, opacity: 0.4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <animate
                      attributeName="r"
                      values={`${size + 6};${size + 8};${size + 6}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </motion.circle>
                )}

                {/* Main seedling circle */}
                <motion.circle
                  r={size}
                  fill={seedling.color}
                  filter={
                    isSelected || isHovered
                      ? "url(#emerald-glow-strong)"
                      : "url(#emerald-glow)"
                  }
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: isDimmed ? 0.3 : 1,
                  }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    filter: `drop-shadow(0 0 ${glowIntensity}px ${seedling.color})`,
                  }}
                >
                  {/* Gentle pulse animation */}
                  <animate
                    attributeName="opacity"
                    values="0.8;1;0.8"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </motion.circle>

                {/* Label for seedling name */}
                {showLabels && (isSelected || isHovered || !selectedSeedling) && (
                  <motion.text
                    y={size + 12}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="3"
                    fontFamily="var(--font-display)"
                    className="text-foreground lowercase tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isDimmed ? 0.4 : 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    {seedling.name.toLowerCase()}
                  </motion.text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip for hovered bond */}
      <AnimatePresence>
        {hoveredBond && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border px-4 py-2 rounded-lg pointer-events-none max-w-md"
          >
            <p className="text-xs text-muted-foreground lowercase tracking-wide text-center">
              {getBondDescription(hoveredBond)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected seedling info panel */}
      <AnimatePresence>
        {selectedSeedling && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-4 left-4 bg-card/90 backdrop-blur border border-primary/20 px-4 py-3 rounded-lg max-w-xs"
          >
            {(() => {
              const seedling = getSeedlingById(selectedSeedling);
              if (!seedling) return null;
              const bonds = getBondsForSeedling(selectedSeedling);

              return (
                <>
                  <h3 className="text-lg font-display lowercase tracking-wide text-foreground mb-1">
                    {seedling.name.toLowerCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground lowercase mb-2">
                    {seedling.evolutionStage} · {seedling.experiencePoints} xp
                  </p>
                  <p className="text-xs text-foreground/80 lowercase leading-relaxed mb-2">
                    {seedling.personality}
                  </p>
                  <p className="text-[10px] text-primary/60 uppercase tracking-wider">
                    {bonds.length} {bonds.length === 1 ? "bond" : "bonds"}
                  </p>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {interactive && !selectedSeedling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <p className="text-[10px] text-muted-foreground/40 lowercase tracking-[0.3em] text-center">
            click a seedling to reveal its bonds
          </p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Future Enhancement Ideas:
 * 
 * 1. Layout Algorithms:
 *    - Implement force-directed graph layout
 *    - Allow manual positioning with drag-and-drop
 *    - Save user-customized layouts
 * 
 * 2. Visual Enhancements:
 *    - Particle effects along bond lines
 *    - Animated "energy" flowing between connected seedlings
 *    - Different line styles for different bond types
 *    - Color gradients based on bond age
 * 
 * 3. Interaction Features:
 *    - Double-click to open seedling profile
 *    - Right-click context menu for actions
 *    - Zoom and pan controls
 *    - Minimap for large networks
 * 
 * 4. Filtering and Search:
 *    - Filter by evolution stage
 *    - Filter by bond type
 *    - Search seedlings by name
 *    - Time-based filtering (show bonds formed in date range)
 * 
 * 5. Real-time Features:
 *    - WebSocket integration for live updates
 *    - Animated bond formation when new connections are made
 *    - Notification system for important bond events
 * 
 * 6. Accessibility:
 *    - Screen reader descriptions for complex relationships
 *    - Keyboard-only navigation mode
 *    - High contrast mode
 *    - Reduced motion mode
 * 
 * 7. Data Export:
 *    - Export network as image (PNG/SVG)
 *    - Export data as JSON
 *    - Share specific bond configurations
 */
