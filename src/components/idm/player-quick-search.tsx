'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, X, Loader2, Shield, User, Sparkles, ArrowRight } from 'lucide-react';
import { TierBadge } from './tier-badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';
import { getAvatarUrl } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface PlayerQuickSearchProps {
  onSelectPlayer: (player: any) => void;
}

interface SearchResultPlayer {
  id: string;
  gamertag: string;
  division: string;
  tier: string;
  points: number;
  totalWins: number;
  totalMvp: number;
  avatar?: string | null;
  club: { id: string; name: string; logo?: string | null } | null;
  rank: number;
}

/** localStorage key for "last viewed player" quick access */
const LAST_PLAYER_KEY = 'idm-last-player';

export function saveLastViewedPlayer(player: { id: string; gamertag: string; tier: string; points: number; totalWins: number; totalMvp: number; avatar?: string | null; club?: string; division?: string }) {
  try {
    localStorage.setItem(LAST_PLAYER_KEY, JSON.stringify({
      id: player.id,
      gamertag: player.gamertag,
      tier: player.tier,
      points: player.points,
      totalWins: player.totalWins,
      totalMvp: player.totalMvp,
      avatar: player.avatar,
      club: player.club,
      division: player.division,
      savedAt: Date.now(),
    }));
  } catch { /* ignore */ }
}

export function getLastViewedPlayer(): {
  id: string; gamertag: string; tier: string; points: number;
  totalWins: number; totalMvp: number; avatar?: string | null;
  club?: string; division?: string; savedAt: number;
} | null {
  try {
    const raw = localStorage.getItem(LAST_PLAYER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 7 days
    if (Date.now() - data.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(LAST_PLAYER_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

export function PlayerQuickSearch({ onSelectPlayer }: PlayerQuickSearchProps) {
  const dt = useDivisionTheme();
  const division = useAppStore(s => s.division);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // "My Profile" quick access from localStorage
  const [lastPlayer, setLastPlayer] = useState<ReturnType<typeof getLastViewedPlayer>>(null);
  useEffect(() => {
    setLastPlayer(getLastViewedPlayer());
  }, []);

  // Refresh last player when a player is selected
  const handleSelect = useCallback((player: SearchResultPlayer) => {
    saveLastViewedPlayer(player);
    setLastPlayer({
      id: player.id,
      gamertag: player.gamertag,
      tier: player.tier,
      points: player.points,
      totalWins: player.totalWins,
      totalMvp: player.totalMvp,
      avatar: player.avatar,
      club: player.club?.name,
      division: player.division,
      savedAt: Date.now(),
    });
    onSelectPlayer(player);
    setQuery('');
    setResults([]);
    setFocused(false);
    inputRef.current?.blur();
  }, [onSelectPlayer]);

  const handleMyProfile = useCallback(() => {
    if (lastPlayer) {
      onSelectPlayer(lastPlayer);
    }
  }, [lastPlayer, onSelectPlayer]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(q.trim())}&division=${division}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.players || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [division]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 250);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocused(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const showDropdown = focused && (query.length > 0 || lastPlayer);
  const hasResults = results.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className={`relative rounded-xl transition-all duration-200 ${dt.casinoCard} border ${focused ? `${dt.border} shadow-lg shadow-idm-gold/5` : 'border-border/50'}`}>
        <div className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3`}>
          {/* Icon */}
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${dt.iconBg} flex items-center justify-center shrink-0`}>
            <Search className={`w-4 h-4 ${dt.neonText}`} />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            placeholder="Cari nama kamu di sini..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
          />

          {/* Loading or Clear */}
          {loading ? (
            <Loader2 className={`w-4 h-4 animate-spin ${dt.neonText} shrink-0`} />
          ) : query ? (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="p-1 rounded-full hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : null}

          {/* "Cari Saya" label */}
          {!query && !focused && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${dt.bg} text-[10px] font-bold ${dt.text} shrink-0`}>
              <Sparkles className="w-3 h-3" />
              Cari Saya
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className={`absolute z-50 left-0 right-0 mt-1.5 rounded-xl ${dt.casinoCard} border ${dt.border} shadow-xl shadow-black/20 overflow-hidden`}>
          {/* Last viewed player quick access */}
          {lastPlayer && !query && (
            <button
              onClick={handleMyProfile}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left transition-colors hover:bg-muted/30 ${dt.hoverBgSubtle}`}
            >
              <div className={`w-10 h-10 rounded-lg ${dt.bg} flex items-center justify-center shrink-0`}>
                <User className={`w-5 h-5 ${dt.neonText}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">Profil Saya</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span className="font-medium">{lastPlayer.gamertag}</span>
                  <TierBadge tier={lastPlayer.tier} />
                  {lastPlayer.club && (
                    <>
                      <Shield className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{lastPlayer.club}</span>
                    </>
                  )}
                </p>
              </div>
              <ArrowRight className={`w-4 h-4 ${dt.neonText} shrink-0`} />
            </button>
          )}

          {/* Divider between quick access and results */}
          {lastPlayer && !query && (
            <div className={`h-px ${dt.borderSubtle}`} />
          )}

          {/* Prompt when no query */}
          {!query && (
            <div className="px-3 sm:px-4 py-3">
              <p className="text-xs text-muted-foreground">Ketik nama kamu untuk mencari posisi di klasemen</p>
            </div>
          )}

          {/* Loading */}
          {loading && query && (
            <div className="px-3 sm:px-4 py-4 text-center">
              <Loader2 className={`w-5 h-5 mx-auto animate-spin ${dt.neonText}`} />
              <p className="text-[10px] text-muted-foreground mt-1.5">Mencari...</p>
            </div>
          )}

          {/* No results */}
          {query && !loading && !hasResults && (
            <div className="px-3 sm:px-4 py-4 text-center">
              <p className="text-xs text-muted-foreground">Tidak ditemukan</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">Coba nama lain atau periksa ejaan</p>
            </div>
          )}

          {/* Results */}
          {hasResults && !loading && (
            <div className="max-h-72 overflow-y-auto custom-scrollbar py-1">
              {results.map((player) => {
                const avatarSrc = getAvatarUrl(player.gamertag, division, player.avatar);
                return (
                  <button
                    key={player.id}
                    onClick={() => handleSelect(player)}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 text-left transition-colors hover:bg-muted/30 ${dt.hoverBgSubtle}`}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm border border-border/20">
                      <Image
                        src={avatarSrc}
                        alt={player.gamertag}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{player.gamertag}</span>
                        <TierBadge tier={player.tier} />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {player.club && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                            <Shield className="w-2.5 h-2.5 shrink-0" />
                            {player.club.name}
                          </span>
                        )}
                        {player.rank > 0 && (
                          <span className={`text-[10px] ${player.rank <= 3 ? dt.neonText : 'text-muted-foreground'}`}>
                            · #{player.rank}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Quick stats */}
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-bold ${dt.neonText}`}>{player.points} pts</p>
                      <p className="text-[9px] text-muted-foreground">
                        {player.totalWins}W {player.totalMvp > 0 ? `· ${player.totalMvp} MVP` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
