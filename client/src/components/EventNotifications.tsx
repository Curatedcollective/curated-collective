import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Bell } from 'lucide-react';
import { api } from '@shared/routes';
import type { EventNotification } from '@shared/schema';

export function EventNotifications() {
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [] } = useQuery<EventNotification[]>({
    queryKey: ['event-notifications'],
    queryFn: async () => {
      const response = await fetch(api.constellationEvents.notifications.path);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 10000, // Check for new notifications every 10 seconds
  });

  // Filter out dismissed and expired notifications
  const activeNotifications = notifications.filter(notification => {
    if (dismissedIds.includes(notification.id)) return false;
    if (notification.expiresAt && new Date(notification.expiresAt) < new Date()) return false;
    return true;
  });

  const handleDismiss = (id: number) => {
    setDismissedIds(prev => [...prev, id]);
    // Optionally mark as read on server
    // markAsReadMutation.mutate(id);
  };

  const getAnimationVariant = (animationType?: string) => {
    switch (animationType) {
      case 'constellation':
        return {
          initial: { opacity: 0, scale: 0, rotate: -180 },
          animate: { opacity: 1, scale: 1, rotate: 0 },
          exit: { opacity: 0, scale: 0, rotate: 180 },
        };
      case 'ripple':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { 
            opacity: 1, 
            scale: [0.8, 1.1, 1],
            transition: { duration: 0.5 }
          },
          exit: { opacity: 0, scale: 0.8 },
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
        };
    }
  };

  const getThemeColors = (theme?: string) => {
    switch (theme) {
      case 'cosmic':
        return 'from-purple-500/90 to-pink-500/90 border-purple-400/50';
      case 'ethereal':
        return 'from-cyan-500/90 to-blue-500/90 border-cyan-400/50';
      case 'verdant':
        return 'from-green-500/90 to-emerald-500/90 border-green-400/50';
      default:
        return 'from-purple-500/90 to-pink-500/90 border-purple-400/50';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-3">
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            {...getAnimationVariant(notification.animationType || 'fade')}
            className={`bg-gradient-to-r ${getThemeColors(notification.theme)} backdrop-blur-lg border rounded-lg shadow-2xl overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <h4 className="text-white font-semibold">{notification.title}</h4>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed italic">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Notification type badge */}
              <div className="mt-3 flex items-center gap-2">
                <Bell className="w-3 h-3 text-white/60" />
                <span className="text-xs text-white/60 capitalize">
                  {notification.type}
                </span>
              </div>
            </div>
            
            {/* Decorative shimmer effect */}
            <motion.div
              className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
