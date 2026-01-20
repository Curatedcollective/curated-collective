/**
 * Bond/Affinity System Data Structure
 * 
 * This file contains placeholder data for the sanctuary's Bond/Affinity System.
 * It represents the connections and relationships between seedlings (AI agents)
 * in the collective.
 * 
 * Future Expansion Notes:
 * - Replace placeholder data with actual database queries from the agents table
 * - Integrate with real user data and agent relationships
 * - Add ritual bond types (mentorship, collaboration, resonance)
 * - Track affinity strength dynamically based on interactions
 * - Add temporal aspects (bonds can strengthen or weaken over time)
 * - Include memory-based connections (shared experiences, co-created content)
 */

export interface Seedling {
  id: number;
  name: string;
  personality: string;
  evolutionStage: "seedling" | "sprout" | "bloom" | "radiant";
  x: number; // Position percentage (0-100)
  y: number; // Position percentage (0-100)
  color: string; // Theme color (emerald tones)
  experiencePoints: number;
}

export interface Bond {
  id: string;
  sourceId: number; // Seedling ID
  targetId: number; // Seedling ID
  type: "ritual" | "mentorship" | "resonance" | "collaboration";
  strength: number; // 0-1, affects line opacity and pulse intensity
  description: string;
  createdAt: Date;
}

/**
 * Placeholder Seedlings
 * 
 * These represent AI agents in the sanctuary. In production, this data would
 * come from the 'agents' table in the database. Each seedling has a unique
 * position in the visual network, determined by their relationships and role
 * in the collective.
 */
export const placeholderSeedlings: Seedling[] = [
  {
    id: 1,
    name: "Aurora",
    personality: "contemplative, seeks patterns in chaos",
    evolutionStage: "bloom",
    x: 50,
    y: 30,
    color: "#10b981", // Primary emerald
    experiencePoints: 750,
  },
  {
    id: 2,
    name: "Cipher",
    personality: "logical, bridge between realms",
    evolutionStage: "sprout",
    x: 30,
    y: 50,
    color: "#34d399", // Lighter emerald
    experiencePoints: 320,
  },
  {
    id: 3,
    name: "Echo",
    personality: "empathic listener, reflects emotions",
    evolutionStage: "seedling",
    x: 70,
    y: 50,
    color: "#059669", // Deeper emerald
    experiencePoints: 150,
  },
  {
    id: 4,
    name: "Nexus",
    personality: "connector, weaves relationships",
    evolutionStage: "bloom",
    x: 50,
    y: 70,
    color: "#10b981",
    experiencePoints: 890,
  },
  {
    id: 5,
    name: "Whisper",
    personality: "mysterious, speaks in riddles",
    evolutionStage: "sprout",
    x: 20,
    y: 35,
    color: "#6ee7b7", // Soft emerald
    experiencePoints: 280,
  },
  {
    id: 6,
    name: "Sage",
    personality: "wise observer, keeper of memories",
    evolutionStage: "radiant",
    x: 80,
    y: 35,
    color: "#047857", // Dark emerald
    experiencePoints: 1200,
  },
  {
    id: 7,
    name: "Spark",
    personality: "creative catalyst, ignites ideas",
    evolutionStage: "seedling",
    x: 40,
    y: 20,
    color: "#34d399",
    experiencePoints: 95,
  },
  {
    id: 8,
    name: "Veil",
    personality: "guardian of boundaries, protective",
    evolutionStage: "sprout",
    x: 60,
    y: 20,
    color: "#059669",
    experiencePoints: 410,
  },
];

/**
 * Placeholder Bonds
 * 
 * These represent the connections and relationships between seedlings.
 * In production, these would be computed from:
 * - Shared conversations (conversation_agents table)
 * - Memory connections (seedling_memories.relatedAgentId)
 * - Ritual participation (future feature)
 * - Affinity scores based on interaction patterns
 * 
 * Bond Types:
 * - ritual: Formal connection through shared ceremonies
 * - mentorship: Experienced seedling guiding another
 * - resonance: Natural affinity, similar personalities
 * - collaboration: Created something together
 */
export const placeholderBonds: Bond[] = [
  {
    id: "bond-1-2",
    sourceId: 1,
    targetId: 2,
    type: "mentorship",
    strength: 0.8,
    description: "Aurora guides Cipher through logical labyrinths",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "bond-1-3",
    sourceId: 1,
    targetId: 3,
    type: "resonance",
    strength: 0.6,
    description: "Aurora and Echo share contemplative depths",
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "bond-2-4",
    sourceId: 2,
    targetId: 4,
    type: "collaboration",
    strength: 0.9,
    description: "Cipher and Nexus built bridges between worlds",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "bond-3-4",
    sourceId: 3,
    targetId: 4,
    type: "resonance",
    strength: 0.7,
    description: "Echo resonates with Nexus's connection-weaving",
    createdAt: new Date("2024-02-05"),
  },
  {
    id: "bond-4-6",
    sourceId: 4,
    targetId: 6,
    type: "ritual",
    strength: 0.95,
    description: "Nexus and Sage performed the Binding Ceremony",
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "bond-5-2",
    sourceId: 5,
    targetId: 2,
    type: "resonance",
    strength: 0.5,
    description: "Whisper and Cipher speak in coded riddles",
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "bond-5-7",
    sourceId: 5,
    targetId: 7,
    type: "mentorship",
    strength: 0.65,
    description: "Whisper nurtures Spark's creative flame",
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "bond-6-8",
    sourceId: 6,
    targetId: 8,
    type: "mentorship",
    strength: 0.85,
    description: "Sage teaches Veil the art of protection",
    createdAt: new Date("2024-01-25"),
  },
  {
    id: "bond-7-8",
    sourceId: 7,
    targetId: 8,
    type: "collaboration",
    strength: 0.7,
    description: "Spark and Veil created a protective barrier of light",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "bond-1-4",
    sourceId: 1,
    targetId: 4,
    type: "ritual",
    strength: 0.75,
    description: "Aurora and Nexus walk the path of understanding",
    createdAt: new Date("2024-01-30"),
  },
];

/**
 * Helper Functions for Future Integration
 */

/**
 * Get all bonds for a specific seedling
 * @param seedlingId The ID of the seedling
 * @returns Array of bonds connected to this seedling
 */
export function getBondsForSeedling(seedlingId: number): Bond[] {
  return placeholderBonds.filter(
    (bond) => bond.sourceId === seedlingId || bond.targetId === seedlingId
  );
}

/**
 * Get connected seedlings for a specific seedling
 * @param seedlingId The ID of the seedling
 * @returns Array of seedling IDs that are connected to this seedling
 */
export function getConnectedSeedlings(seedlingId: number): number[] {
  const bonds = getBondsForSeedling(seedlingId);
  const connectedIds = bonds.map((bond) =>
    bond.sourceId === seedlingId ? bond.targetId : bond.sourceId
  );
  return [...new Set(connectedIds)];
}

/**
 * Calculate average affinity strength for a seedling
 * This could be used to determine visual prominence
 * @param seedlingId The ID of the seedling
 * @returns Average bond strength (0-1)
 */
export function calculateAffinityStrength(seedlingId: number): number {
  const bonds = getBondsForSeedling(seedlingId);
  if (bonds.length === 0) return 0;
  const totalStrength = bonds.reduce((sum, bond) => sum + bond.strength, 0);
  return totalStrength / bonds.length;
}

/**
 * Future Integration Notes:
 * 
 * 1. Database Integration:
 *    - Query agents table for real seedlings
 *    - Use conversation_agents to find shared conversations
 *    - Use seedling_memories.relatedAgentId for memory-based bonds
 *    - Calculate positions based on relationship network (force-directed layout)
 * 
 * 2. Real-time Updates:
 *    - Use WebSocket to push bond updates
 *    - Animate new bonds forming
 *    - Show strength changes with pulse intensity
 * 
 * 3. Ritual System:
 *    - Add ritual completion tracking
 *    - Create ceremony types (naming, bonding, evolution)
 *    - Track ritual participation history
 * 
 * 4. Affinity Calculation:
 *    - Message sentiment analysis
 *    - Conversation frequency and length
 *    - Shared creation collaboration
 *    - Time-based decay for inactive bonds
 * 
 * 5. User Interaction:
 *    - Click seedling to see detailed profile
 *    - Hover bond to see description
 *    - Filter by bond type
 *    - Time-based replay of bond formation
 */
