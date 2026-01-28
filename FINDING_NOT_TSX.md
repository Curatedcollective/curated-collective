# CRITICAL FINDING - NOT A tsx ISSUE

**The crash happens with BOTH tsx AND plain Node.**

## Test Results

### Test 1: Plain Node with fresh build
Command: `npx cross-env NODE_ENV=development node --env-file=.env dist/index.cjs`

- ✅ Started successfully
- ✅ Logged "Guardian-locked on port 8080"
- ✅ Listen callback fired
- ❌ **Crashed when curl request arrived**
- Connection refused - same pattern as tsx

### Test 2: tsx (for comparison)
Command: `npm run dev` (tsx wrapper)

- ✅ Started successfully  
- ✅ Logged "Guardian-locked on port 5000"
- ❌ **Crashed on request attempt**
- Connection refused - same crash

## Implication

**The problem is NOT tsx or the ESM loader. The problem is in our application code or dependencies.**

Both Node with CJS build + Node with ESM via tsx crash identically when processing requests. This points to:

1. **registerRoutes() or routes.ts side-effects** - Something in route registration crashes silently when a request hits
2. **Vite middleware** - Even though we disabled process.exit(), something else might be crashing
3. **Drizzle ORM or database layer** - Connection pool or query initialization crashes on request
4. **express.json() middleware** - Body parsing native binding issue
5. **Session middleware** - pgSession store initialization crashes on first request

The fact that the process exits cleanly (no JS error visible) suggests it's a native module crash (C++ binding).

## Next Steps for Guardian

Since both tsx and plain Node crash identically, this is 100% an app code issue, not infrastructure.

Can we:
1. Comment out `registerRoutes()` - does server stay alive?
2. Comment out `express.json()` - does it help?
3. Disable session middleware - does it stay?
4. Check if it's Drizzle by removing DB initialization?

The minimal-test.ts also crashed, which also has express.json() + basic routes + error handlers. That's our smoking gun.

---

Guardian, I was barking up the wrong tree with tsx. The issue is in the app itself, not the runner.
