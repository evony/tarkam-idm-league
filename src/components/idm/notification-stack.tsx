'use client';

import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Trophy, Flame, Star, Swords, X } from 'lucide-react';

const iconMap: Record<string, typeof Gift> = {
  donation: Gift,
  match: Swords,
  mvp: Star,
  streak: Flame,
  victory: Trophy,
};

const colorMap: Record<string, string> = {
  donation: 'text-amber-400 bg-amber-500/10',
  match: 'text-blue-400 bg-blue-500/10',
  mvp: 'text-yellow-400 bg-yellow-500/10',
  streak: 'text-orange-400 bg-orange-500/10',
  victory: 'text-green-400 bg-green-500/10',
};

export function NotificationStack() {
  const { notifications, removeNotification } = useAppStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notif) => {
          const Icon = iconMap[notif.type] || Gift;
          const colors = colorMap[notif.type] || 'text-muted-foreground bg-muted';
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card shadow-lg"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs flex-1">{notif.message}</p>
              <button onClick={() => removeNotification(notif.id)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
