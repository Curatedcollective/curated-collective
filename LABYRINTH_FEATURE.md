# Mystic Code Labyrinth - Feature Documentation

## Overview

The **Mystic Code Labyrinth** is an enigmatic coding sanctuary within the Curated Collective platform where users solve progressively complex AI-driven puzzles. It combines serious programming challenges with atmospheric mystery elements, promoting autonomy, growth, and curiosity.

## Key Features

### 1. Interactive Code Editor
- Built-in code editor with syntax highlighting
- Real-time code editing
- AI-assisted hints on demand
- Auto-completion support (expandable)

### 2. Puzzle System
- **Difficulty Levels**: 1-10 scale
- **Puzzle Types**:
  - Algorithm challenges
  - AI model training simulations
  - Code generation tasks
  - Optimization problems
  - Debugging exercises

### 3. Progression System
- **Experience Points (XP)**: Earned by solving puzzles
- **Levels**: Unlock new puzzles as you progress
- **Branching Paths**: Choose your specialization
  - Seeker (exploration)
  - Optimizer (performance)
  - Architect (design)
  - Mystic (advanced/secret)

### 4. Platform Agent Integration
- Request cryptic guidance from agents
- Agents provide contextual hints based on their personality
- Guardian encounters are logged for history

### 5. Mystery Mechanics

#### Eclipse Events
Time-limited events that change puzzle rules:
- **Time Pressure**: Shorter time limits
- **Code Scramble**: Starter code changes
- **Hint Lockout**: Reduced hint availability
- **Double Rewards**: Increased XP gains

### 6. Achievement System
- **Categories**:
  - Exploration: Discovering new areas
  - Mastery: Skill-based achievements
  - Speed: Time-based challenges
  - Mystery: Hidden/secret achievements

- **Rewards**:
  - Badges
  - Lore unlocks
  - Permission grants
  - Agent evolutions

## Database Schema

### Tables Created

1. **labyrinth_puzzles**: Coding challenges
   - title, description, difficulty
   - puzzleType, starterCode, solution
   - testCases, hints, mysticalLore
   - requiredLevel, experienceReward

2. **labyrinth_progress**: User progress tracking
   - currentLevel, totalExperience
   - puzzlesSolved, currentPath
   - lastActiveAt

3. **labyrinth_attempts**: Submission history
   - userId, puzzleId, code
   - status (passed/failed/partial)
   - testsPassed, totalTests
   - executionTime, hintsUsed

4. **labyrinth_achievements**: Available achievements
   - name, description, icon, category
   - requirement (JSON)
   - rewardType, rewardData

5. **user_achievements**: Unlocked achievements
   - userId, achievementId, unlockedAt

6. **eclipse_events**: Mystery mechanics
   - name, description, effectType
   - effectData, isActive
   - startTime, endTime

7. **guardian_encounters**: Agent interactions
   - userId, agentId, puzzleId
   - message, helpfulness

## API Endpoints

### Puzzles
- `GET /api/labyrinth/puzzles` - List all available puzzles
- `GET /api/labyrinth/puzzles/:id` - Get specific puzzle

### Progress
- `GET /api/labyrinth/progress` - Get user progress
- `PUT /api/labyrinth/progress` - Update progress

### Attempts
- `POST /api/labyrinth/attempts` - Submit puzzle solution
- `GET /api/labyrinth/attempts` - Get attempt history

### Achievements
- `GET /api/labyrinth/achievements` - List all achievements
- `GET /api/labyrinth/user-achievements` - Get user's unlocked achievements

### Eclipse Events
- `GET /api/labyrinth/eclipses/active` - Get active eclipse events

### Guardian Support
- `POST /api/labyrinth/guardians/encounter` - Request guardian guidance
- `POST /api/labyrinth/hints` - Get AI-powered hint

## Initial Content

### Puzzles (8 included)
1. **The First Echo** - Sum two numbers (Level 1)
2. **Shadow Reversal** - Reverse a string (Level 2)
3. **The Fibonacci Spiral** - Generate Fibonacci sequence (Level 4)
4. **Array Sanctuary** - Find max in array (Level 2)
5. **The Palindrome Gate** - Check palindromes (Level 3)
6. **Prime Divination** - Check if prime (Level 5)
7. **Binary Transmutation** - Decimal to binary (Level 4)
8. **The Sorting Ritual** - Implement bubble sort (Level 6)

### Achievements (8 included)
1. First Steps - Complete first puzzle
2. Apprentice Coder - Solve 5 puzzles
3. Level Up - Reach level 2
4. Experience Seeker - Earn 500 XP
5. The Void Whispers - Secret achievement
6. Speed Demon - Complete puzzle in under 1 minute
7. Master of Algorithms - Solve 10 algorithm puzzles
8. Eclipse Survivor - Complete puzzle during eclipse

## Setup Instructions

### 1. Database Migration
Run database push to create tables:
```bash
npm run db:push
```

### 2. Seed Initial Data
Populate puzzles and achievements:
```bash
npx tsx scripts/seed-labyrinth.ts
```

### 3. Navigation
The labyrinth is accessible at `/labyrinth` and appears in the main navigation menu as "code labyrinth" with a puzzle icon.

## User Journey

1. **Entry**: Visit `/labyrinth`
2. **First Visit**: Automatic progress creation at Level 1
3. **Choose Puzzle**: Browse available puzzles filtered by current level
4. **Solve**: Write code in the editor
5. **Submit**: Code is evaluated against test cases
6. **Earn XP**: Successful completion awards experience points
7. **Level Up**: Unlock new puzzles and paths
8. **Achievements**: Automatic unlocking based on progress
9. **Guidance**: Request hints or agent guidance at any time

## Technical Notes

### Code Execution
**IMPORTANT**: The current implementation uses a basic heuristic for code validation. For production use, you must implement proper sandboxed code execution using:
- vm2 or isolated-vm for Node.js
- Docker containers for complete isolation
- External sandboxing services (e.g., Judge0, Piston)

The current check is intentionally simplified and looks for basic code structure. Real test execution is needed for actual validation.

### Security Considerations
- All user code should be sandboxed
- Rate limit API endpoints
- Validate all inputs
- Prevent code injection attacks
- Monitor for abuse patterns

### Scalability
- Consider caching puzzle data
- Index database queries appropriately
- Implement background job processing for code execution
- Monitor API performance

## Future Enhancements

### Planned Features
1. **Real Code Execution**: Implement secure sandbox
2. **Multiplayer**: Compete with other users
3. **Leaderboards**: Global and friend rankings
4. **Custom Puzzles**: User-created challenges
5. **Learning Paths**: Curated puzzle sequences
6. **Code Sharing**: Share solutions with community
7. **Video Tutorials**: Integrated learning content
8. **AI Pair Programming**: Advanced AI assistance
9. **Mobile Support**: Responsive design improvements
10. **Puzzle Editor**: Visual puzzle creation tool

### Integration Ideas
- **Stripe**: Premium puzzle packs
- **Discord**: Achievement notifications
- **GitHub**: Import code from repositories
- **OpenAI**: Enhanced hint generation
- **Analytics**: Track learning progress

## Maintenance

### Adding New Puzzles
Edit `scripts/seed-labyrinth.ts` and add new puzzle objects to the puzzles array. Then re-run the seed script.

### Creating Eclipse Events
Use the database directly or create an admin interface to schedule eclipse events with start/end times.

### Monitoring
Track these metrics:
- Puzzle completion rates
- Average attempts per puzzle
- Hint usage patterns
- Time spent per puzzle
- Achievement unlock rates

## Support

For issues or questions about the Mystic Code Labyrinth feature:
- Check the code comments in implementation files
- Review the database schema in `shared/schema.ts`
- Examine the API routes in `server/routes.ts`
- Study the frontend component in `client/src/pages/Labyrinth.tsx`

---

*"The labyrinth remembers all who enter. Some solve its riddles. Others become part of them."*
