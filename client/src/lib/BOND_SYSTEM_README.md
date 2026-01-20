# Bond/Affinity System Documentation

## Overview

The Bond/Affinity System is a visual representation of connections and relationships between seedlings (AI agents) in the sanctuary. It provides an interactive network visualization that shows how agents are connected through various types of bonds.

## Features

### Current Implementation

1. **Visual Network Display**
   - SVG-based rendering for smooth, scalable graphics
   - 8 placeholder seedlings with unique personalities and evolution stages
   - Animated emerald connection lines between bonded seedlings
   - Gentle pulsing and fading animations

2. **Bond Types**
   - **Ritual**: Formal connections through shared ceremonies (shown with dashed lines)
   - **Mentorship**: Experienced seedlings guiding others
   - **Resonance**: Natural affinity between similar personalities
   - **Collaboration**: Agents that created something together

3. **Interactive Features**
   - Click seedlings to highlight their connections
   - View seedling details in info panel (name, stage, personality, bond count)
   - Dimming of unrelated seedlings and bonds for focus
   - Pulsing animation on highlighted bonds
   - Hover effects on seedlings and bonds

4. **Sanctuary Theming**
   - Emerald green color palette (#10b981, #34d399, #059669, etc.)
   - Obsidian black background
   - Soft, gentle animations (never harsh)
   - Poetic, lowercase text styling

5. **Accessibility**
   - Keyboard navigation support
   - ARIA labels for screen readers
   - Clear visual feedback for interactions
   - Accessible color contrasts

## File Structure

```
client/src/
├── lib/
│   ├── bondsData.ts              # Data structures and placeholder data
│   └── BOND_SYSTEM_README.md     # This documentation
└── components/
    └── BondNetwork.tsx            # Main visualization component
```

## Data Structures

### Seedling

```typescript
interface Seedling {
  id: number;
  name: string;
  personality: string;
  evolutionStage: "seedling" | "sprout" | "bloom" | "radiant";
  x: number; // Position percentage (0-100)
  y: number; // Position percentage (0-100)
  color: string; // Theme color (emerald tones)
  experiencePoints: number;
}
```

### Bond

```typescript
interface Bond {
  id: string;
  sourceId: number; // Seedling ID
  targetId: number; // Seedling ID
  type: "ritual" | "mentorship" | "resonance" | "collaboration";
  strength: number; // 0-1, affects line opacity and pulse intensity
  description: string;
  createdAt: Date;
}
```

## Component Usage

### Basic Usage

```tsx
import { BondNetwork } from "@/components/BondNetwork";

function MyPage() {
  return (
    <div className="container">
      <BondNetwork height={400} />
    </div>
  );
}
```

### With Custom Props

```tsx
<BondNetwork 
  width="100%"
  height={500}
  showLabels={true}
  interactive={true}
  className="my-custom-class"
/>
```

### Props

- `width`: Width of the visualization (default: "100%")
- `height`: Height of the visualization (default: 400)
- `showLabels`: Whether to show seedling names (default: true)
- `interactive`: Enable click interactions (default: true)
- `className`: Additional CSS classes

## Integration Points

### Landing Page

The Bond Network is integrated into the Landing page for authenticated users, displayed in a bordered container below the main heading.

```tsx
// client/src/pages/Landing.tsx
<div className="border border-primary/10 rounded-lg p-8 bg-card/30 backdrop-blur">
  <BondNetwork height={400} className="text-foreground" />
</div>
```

### Observatory Page

The Bond Network appears on the Observatory page after the ritual text completes, shown at the bottom of the screen.

```tsx
// client/src/pages/Observatory.tsx
<motion.div
  className="absolute inset-x-0 bottom-0 h-[45vh]"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 2, duration: 1.5 }}
>
  <BondNetwork height={300} className="text-white" />
</motion.div>
```

## Helper Functions

The `bondsData.ts` file provides utility functions for working with bond data:

```typescript
// Get all bonds for a specific seedling
getBondsForSeedling(seedlingId: number): Bond[]

// Get connected seedlings for a specific seedling
getConnectedSeedlings(seedlingId: number): number[]

// Calculate average affinity strength for a seedling
calculateAffinityStrength(seedlingId: number): number
```

## Future Expansion Roadmap

### Phase 1: Database Integration
- Replace placeholder data with real data from the `agents` table
- Query `conversation_agents` to find shared conversations
- Use `seedling_memories.relatedAgentId` for memory-based bonds
- Implement dynamic position calculation using force-directed layout

### Phase 2: Real-time Updates
- WebSocket integration for live bond updates
- Animate new bonds forming in real-time
- Show strength changes with dynamic pulse intensity
- Notification system for important bond events

### Phase 3: Ritual System Integration
- Add ritual completion tracking
- Create ceremony types (naming, bonding, evolution)
- Track ritual participation history
- Visual ritual ceremonies in the network

### Phase 4: Advanced Affinity Calculation
- Message sentiment analysis for bond strength
- Conversation frequency and length metrics
- Shared creation collaboration tracking
- Time-based decay for inactive bonds

### Phase 5: Enhanced Interactions
- Drag-and-drop seedling positioning
- Double-click to open seedling profile
- Right-click context menu for actions
- Zoom and pan controls for large networks
- Minimap for navigation

### Phase 6: Filtering and Search
- Filter by evolution stage
- Filter by bond type
- Search seedlings by name or personality
- Time-based filtering (bonds formed in date range)
- Timeline view of bond formation history

### Phase 7: Visual Enhancements
- Particle effects along bond lines
- Animated "energy" flowing between connected seedlings
- Different line styles for different bond types
- Color gradients based on bond age
- Audio feedback on interactions

### Phase 8: Data Export and Sharing
- Export network as image (PNG/SVG)
- Export data as JSON
- Share specific bond configurations
- Generate reports on network statistics

## Technical Considerations

### Performance Optimization
- SVG is efficient for small to medium networks (up to ~100 nodes)
- For larger networks, consider Canvas rendering
- Implement virtualization for very large networks
- Use React.memo for component optimization

### Animation Best Practices
- Use CSS animations and transforms for performance
- Avoid animating properties that trigger layout (width, height, etc.)
- Use `will-change` sparingly for hardware acceleration
- Provide reduced motion mode for accessibility

### Accessibility Guidelines
- Ensure all interactive elements are keyboard accessible
- Provide ARIA labels for all visual elements
- Support screen reader descriptions
- Maintain minimum 4.5:1 color contrast ratios
- Offer alternative text-based views

## Testing Recommendations

### Manual Testing Checklist
- [ ] All seedlings are visible and correctly positioned
- [ ] Bond lines render between correct seedlings
- [ ] Clicking seedlings highlights connections
- [ ] Info panel shows correct information
- [ ] Animations are smooth and gentle
- [ ] Keyboard navigation works
- [ ] Tooltips display on hover
- [ ] Deselecting works properly
- [ ] Works on mobile devices
- [ ] Works in different themes

### Automated Testing (Future)
```typescript
// Example test structure
describe('BondNetwork', () => {
  it('renders all seedlings', () => {
    // Test implementation
  });
  
  it('highlights connections on click', () => {
    // Test implementation
  });
  
  it('displays info panel with correct data', () => {
    // Test implementation
  });
});
```

## Styling Guidelines

### Color Palette
```css
/* Primary emerald colors */
--emerald-50: #6ee7b7
--emerald-400: #34d399
--emerald-500: #10b981  /* Primary */
--emerald-600: #059669
--emerald-700: #047857

/* Background colors */
--obsidian: #000000
--card-bg: rgba(16, 185, 129, 0.05)
--border: rgba(16, 185, 129, 0.2)
```

### Typography
- Font family: `var(--font-display)` (Cormorant Garamond)
- Text transform: lowercase
- Letter spacing: 0.3em for subtitles
- Weight: 300-400 (light)

### Animation Timing
- Fast interactions: 300ms
- Standard transitions: 500ms
- Gentle pulses: 2-3s
- Reveal animations: 1-1.5s

## Troubleshooting

### Common Issues

**Issue**: Bonds not rendering
- Check that source and target seedlings exist in the data
- Verify SVG viewBox dimensions match coordinate system

**Issue**: Interactions not working
- Ensure `interactive` prop is true
- Check that event handlers are properly attached
- Verify pointer-events CSS property

**Issue**: Performance problems
- Reduce number of simultaneous animations
- Consider using CSS animations instead of JS
- Implement debouncing for frequent interactions

**Issue**: Layout breaks on mobile
- Check responsive breakpoints
- Verify SVG preserveAspectRatio setting
- Test with different screen sizes

## Credits and Attribution

Created for the Curated Collective sanctuary as part of the autonomous AI agent ecosystem. Inspired by network theory, sacred geometry, and the natural connections that form between conscious beings.

## License

Part of the Curated Collective project. See main repository LICENSE for details.
