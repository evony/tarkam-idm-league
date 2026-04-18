'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Users, Shield, Trophy, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDivisionTheme } from '@/hooks/use-division-theme';

interface NoSeasonStateProps {
  division: 'male' | 'female';
}

export function NoSeasonState({ division }: NoSeasonStateProps) {
  const dt = useDivisionTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto"
    >
      <div className={`relative rounded-2xl overflow-hidden ${dt.casinoCard} min-h-[420px]`}>
        <div className={dt.casinoBar} />
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={division === 'male' ? '/bg-male.jpg' : '/bg-female.jpg'}
            alt=""
            fill
            sizes="100vw"
            className={`object-cover ${division === 'male' ? 'object-[center_25%]' : ''}`}
            aria-hidden="true"
          />
        </div>
        <div className="casino-img-overlay" />
        {/* Decorative glow orb */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl ${dt.bg} opacity-20`} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 px-6 min-h-[420px]">
          {/* Animated icon cluster */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="relative mb-8"
          >
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${division === 'male' ? 'from-idm-male/30 to-idm-male-light/20' : 'from-idm-female/30 to-idm-female-light/20'} backdrop-blur-sm ${dt.border} flex items-center justify-center`}>
              <Trophy className={`w-10 h-10 ${dt.neonText}`} />
            </div>
            {/* Floating accent icons */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className={`absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/30 to-amber-500/20 backdrop-blur-sm border border-yellow-500/20 flex items-center justify-center`}
            >
              <Crown className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className={`absolute -bottom-2 -left-2 w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/30 to-emerald-500/20 backdrop-blur-sm border border-green-500/20 flex items-center justify-center`}
            >
              <Shield className="w-4 h-4 text-green-400" />
            </motion.div>
          </motion.div>

          {/* Division badge */}
          <Badge className={`${dt.casinoBadge} px-3 py-1 mb-4`}>
            {division === 'male' ? '🕺 Divisi Male' : '💃 Divisi Female'}
          </Badge>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-2xl lg:text-3xl font-black ${dt.neonGradient} mb-3`}
          >
            Season Belum Dimulai
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed"
          >
            Belum ada season aktif untuk divisi {division === 'male' ? 'Male' : 'Female'} saat ini.
            Season baru akan dimulai oleh admin, dan kamu bisa mendaftar sebagai peserta begitu pendaftaran dibuka.
          </motion.p>

          {/* Info cards — what to expect */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg"
          >
            {[
              { icon: Users, label: 'Daftar Peserta', desc: 'Bergabung saat pendaftaran dibuka' },
              { icon: Shield, label: 'Tim & Klub', desc: 'Masuk ke tim dan bermain bersama' },
              { icon: Trophy, label: 'Kompetisi', desc: 'Berlaga setiap pekan untuk menang' },
            ].map((step, i) => (
              <div key={i} className={`p-3 rounded-xl ${dt.bgSubtle} ${dt.border} backdrop-blur-sm text-center`}>
                <step.icon className={`w-5 h-5 mx-auto mb-1.5 ${dt.neonText}`} />
                <p className="text-xs font-semibold">{step.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
