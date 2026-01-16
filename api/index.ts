// Vercel serverless function wrapper
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import the built server
// Note: This requires the server to export the Express app
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // For now, this is a placeholder
  // Your Express app needs to be refactored for serverless
  res.status(200).json({ 
    message: 'API is running',
    note: 'Full Express integration requires refactoring for serverless'
  });
}
