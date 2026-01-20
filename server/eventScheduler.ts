/**
 * Constellation Event Scheduler
 * Handles automatic event lifecycle management:
 * - Starting scheduled events at their scheduled time
 * - Sending reminder notifications
 * - Auto-ending events based on duration
 */

import { storage } from './storage';

// Constants
const SCHEDULER_INTERVAL_MS = 60 * 1000; // Check every minute
const REMINDER_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes cooldown between reminders

// Track active intervals for cleanup
const activeIntervals: NodeJS.Timeout[] = [];

/**
 * Start the event scheduler
 * Checks every minute for events that need attention
 */
export function startEventScheduler() {
  console.log('🌟 Starting constellation event scheduler...');
  
  // Run immediately on startup
  checkScheduledEvents();
  
  // Then check every minute
  const interval = setInterval(checkScheduledEvents, SCHEDULER_INTERVAL_MS);
  activeIntervals.push(interval);
  
  return interval;
}

/**
 * Stop the event scheduler (cleanup)
 */
export function stopEventScheduler() {
  console.log('⏸️  Stopping constellation event scheduler...');
  activeIntervals.forEach(interval => clearInterval(interval));
  activeIntervals.length = 0;
}

/**
 * Check for events that need to be started, reminded, or ended
 */
async function checkScheduledEvents() {
  try {
    const now = new Date();
    
    // Get all scheduled and active events
    const scheduledEvents = await storage.getConstellationEvents({ status: 'scheduled' });
    const activeEvents = await storage.getConstellationEvents({ status: 'active' });
    
    // Start scheduled events that are due
    for (const event of scheduledEvents) {
      if (event.scheduledFor && event.scheduledFor <= now) {
        console.log(`🌟 Auto-starting event: ${event.title}`);
        await storage.startConstellationEvent(event.id);
        
        // Send start notification
        await storage.createEventNotification({
          eventId: event.id,
          type: 'update',
          title: `${event.title} Begins`,
          message: event.poeticMessage || `The ritual commences. Join us in this sacred gathering.`,
          theme: event.theme || 'cosmic',
          animationType: 'ripple'
        });
      }
      // Send reminder 15 minutes before start
      else if (event.scheduledFor) {
        const minutesUntilStart = (event.scheduledFor.getTime() - now.getTime()) / (60 * 1000);
        if (minutesUntilStart > 0 && minutesUntilStart <= 15) {
          // Check if we already sent a reminder (avoid spamming)
          const recentNotifications = await storage.getEventNotifications(undefined, event.id);
          const hasRecentReminder = recentNotifications.some(n => 
            n.type === 'reminder' && 
            n.createdAt && 
            (now.getTime() - new Date(n.createdAt).getTime()) < REMINDER_COOLDOWN_MS
          );
          
          if (!hasRecentReminder) {
            console.log(`⏰ Sending reminder for event: ${event.title}`);
            await storage.createEventNotification({
              eventId: event.id,
              type: 'reminder',
              title: `${event.title} Soon`,
              message: `In ${Math.ceil(minutesUntilStart)} minutes, the gathering begins. Prepare yourself.`,
              theme: event.theme || 'cosmic',
              animationType: 'constellation'
            });
          }
        }
      }
    }
    
    // End active events that have exceeded their duration
    for (const event of activeEvents) {
      if (event.duration && event.startedAt) {
        const durationMs = event.duration * 60 * 1000;
        const elapsedMs = now.getTime() - event.startedAt.getTime();
        
        if (elapsedMs >= durationMs) {
          console.log(`✨ Auto-ending event: ${event.title}`);
          await storage.endConstellationEvent(event.id);
        }
      }
    }
  } catch (error) {
    console.error('Error in event scheduler:', error);
  }
}

/**
 * Manually trigger a check (useful for testing)
 */
export async function triggerSchedulerCheck() {
  await checkScheduledEvents();
}
