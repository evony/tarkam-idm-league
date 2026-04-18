'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Trophy, Star, Flame, Swords, Award } from 'lucide-react';

interface PlayerProfileProps {
  player: {
    id: string;
    name: string;
    gamertag: string;
    avatar?: string | null;
    tier: string;
    points: number;
    totalWins: number;
    streak: number;
    maxStreak: number;
    totalMvp: number;
    matches: number;
    club?: string;
    division?: string;
  };
  onClose: () => void;
}

export function PlayerProfile({ player, onClose }: PlayerProfileProps) {
  const isMale = player.division === 'male';
  const accentText = isMale ? 'text-amber-400' : 'text-pink-400';
  const accentBg = isMale ? 'bg-amber-500/10' : 'bg-pink-500/10';

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${accentBg} flex items-center justify-center border ${isMale ? 'border-amber-500/30' : 'border-pink-500/30'}`}>
              <span className="text-sm font-bold">{player.gamertag.charAt(0)}</span>
            </div>
            <div>
              <div className="font-bold">{player.gamertag}</div>
              <div className="text-xs text-muted-foreground">{player.name}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Tier {player.tier}</Badge>
            {player.club && <Badge variant="outline" className="text-xs">{player.club}</Badge>}
            <Badge className={`text-xs ${accentBg} ${accentText} border-0`}>{player.points} pts</Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Trophy className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <div className="text-sm font-bold">{player.totalWins}</div>
              <div className="text-[10px] text-muted-foreground">Wins</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Star className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
              <div className="text-sm font-bold">{player.totalMvp}</div>
              <div className="text-[10px] text-muted-foreground">MVP</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Flame className="w-4 h-4 mx-auto text-orange-400 mb-1" />
              <div className="text-sm font-bold">{player.streak}</div>
              <div className="text-[10px] text-muted-foreground">Streak</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Swords className="w-4 h-4 mx-auto text-blue-400 mb-1" />
              <div className="text-sm font-bold">{player.matches}</div>
              <div className="text-[10px] text-muted-foreground">Matches</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <Award className="w-4 h-4 mx-auto text-purple-400 mb-1" />
              <div className="text-sm font-bold">{player.maxStreak}</div>
              <div className="text-[10px] text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
