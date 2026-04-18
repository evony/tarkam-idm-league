'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, Users, Shield } from 'lucide-react';

interface ClubProfileProps {
  club: {
    id: string;
    name: string;
    logo?: string | null;
    wins: number;
    losses: number;
    draws: number;
    points: number;
    gameDiff: number;
    _count?: { members: number };
    division?: string;
  };
  onClose: () => void;
}

export function ClubProfile({ club, onClose }: ClubProfileProps) {
  const isMale = club.division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';
  const accentBg = isMale ? 'bg-amber-500/10' : 'bg-pink-500/10';

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${accentBg} flex items-center justify-center border ${isMale ? 'border-amber-500/30' : 'border-pink-500/30'}`}>
              <Shield className={`w-5 h-5 ${accentText}`} />
            </div>
            <div>
              <div className="font-bold">{club.name}</div>
              <div className="text-xs text-muted-foreground">{club.division === 'male' ? '🕺 Male' : '💃 Female'} Division</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <div className="text-sm font-bold text-green-400">{club.wins}</div>
              <div className="text-[10px] text-muted-foreground">Wins</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-500/10">
              <div className="text-sm font-bold text-red-400">{club.losses}</div>
              <div className="text-[10px] text-muted-foreground">Losses</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <div className="text-sm font-bold">{club.draws}</div>
              <div className="text-[10px] text-muted-foreground">Draws</div>
            </div>
            <div className={`text-center p-2 rounded-lg ${accentBg}`}>
              <div className={`text-sm font-bold ${accentText}`}>{club.points}</div>
              <div className="text-[10px] text-muted-foreground">Points</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground">Goal Difference</span>
            <span className="text-sm font-bold">{club.gameDiff > 0 ? '+' : ''}{club.gameDiff}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground">Members</span>
            <span className="text-sm font-bold">{club._count?.members || 0}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
