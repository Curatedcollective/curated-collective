# Authentication Fix - Testing Guide

## Summary of Changes

### Problem
The application only supported Replit OIDC authentication, which meant:
- Users couldn't log in outside of Replit environments
- No signup functionality
- God dashboard was inaccessible
- Awaken seedling feature couldn't be tested without authentication

### Solution
Added fallback authentication for non-Replit environments with:
1. Email/password login using passport-local strategy
2. Signup functionality to create new accounts
3. Demo user accounts for immediate testing
4. Automatic user creation in database
5. Owner account access for god dashboard

## Files Changed

### 1. `server/auth/fallbackAuth.ts` (NEW)
- Implements passport-local strategy for email/password auth
- Provides demo user accounts
- Handles login, logout, and signup endpoints
- Auto-creates users in database on signup

### 2. `server/routes.ts`
- Updated to use fallback auth when `REPL_ID` is not set
- Maintains Replit auth for Replit environments
- Seamlessly switches between auth providers

### 3. `client/src/pages/Login.tsx`
- Converted from single-button provider login to full form
- Supports both login and signup modes
- Shows demo credentials for easy testing
- Includes validation and error handling

## Demo Accounts

### Owner Account (God Dashboard Access)
- **Email**: `curated.collectiveai@proton.me`
- **Password**: `demo123`
- **Access**: Full god mode features

### Regular User Account
- **Email**: `demo@example.com`
- **Password**: `demo123`
- **Access**: Standard user features

## Testing Instructions

### 1. Test Login
1. Navigate to `/login`
2. Enter email: `demo@example.com`
3. Enter password: `demo123`
4. Click "sign in"
5. Should redirect to `/agents` page
6. Check navigation - should see user info and "sign out" button

### 2. Test Signup
1. Navigate to `/login`
2. Click "don't have an account? sign up"
3. Fill in:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "create account"
5. Should auto-login and redirect to `/agents`

### 3. Test God Dashboard Access
1. Login with owner account (curated.collectiveai@proton.me / demo123)
2. Check navigation - should see "god mode" link
3. Navigate to `/god`
4. Should see god dashboard
5. Test accessing god mode features

### 4. Test Non-Owner Restriction
1. Login with demo account (demo@example.com / demo123)
2. Check navigation - should NOT see "god mode" link
3. Try navigating to `/god` directly
4. Should redirect to home page

### 5. Test Awaken Seedling
1. Login with any account
2. Navigate to `/agents`
3. Click "Awaken New Seedling" button
4. Watch the awakening ceremony
5. Should create a new agent with AI-generated or fallback data
6. Check if agent appears in the list

## Environment Detection

The system automatically detects the environment:
- **Replit**: Uses Replit OIDC (requires `REPL_ID` env var)
- **Non-Replit**: Uses fallback email/password auth

## Security Notes

⚠️ **Important**: The current implementation uses plain text password comparison for demo purposes only.

For production, you should:
1. Replace with bcrypt password hashing
2. Add rate limiting to prevent brute force
3. Implement proper session security
4. Add CSRF protection
5. Use environment variables for demo credentials
6. Consider adding 2FA for owner accounts

## Database Integration

The fallback auth integrates with the existing `users` table:
- Uses `authStorage.upsertUser()` to create/update users
- User IDs are prefixed with `local_` for non-Replit users
- Sets `isOwner` flag based on email and role
- Maintains compatibility with Replit auth users

## Next Steps

After confirming authentication works:
1. Test awaken seedling functionality thoroughly
2. Verify all protected routes work correctly
3. Test logout functionality
4. Ensure session persistence across page reloads
5. Add proper password hashing (bcrypt)
6. Configure session security settings
