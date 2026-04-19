'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  const [iframeError, setIframeError] = useState(false);

  const youtubeId = getYouTubeId(videoUrl);
  const isYouTube = youtubeId !== null;
  const youtubeWatchUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;

  useEffect(() => {
    if (!isOpen || !isYouTube) return;
    const timer = setTimeout(() => {
      setIframeError(true);
    }, 6000);
    return () => {
      clearTimeout(timer);
      setIframeError(false);
    };
  }, [isOpen, isYouTube, videoUrl]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="relative z-10 w-full max-w-4xl"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Video player'}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute -top-10 right-0 sm:-top-12 sm:-right-12 flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors z-20"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
            {title && (
              <div className="mb-2 px-1">
                <h3 className="text-sm font-semibold text-white/90 truncate">{title}</h3>
              </div>
            )}
            <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/40">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                {isYouTube ? (
                  <>
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={title ?? 'YouTube video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                      onError={() => setIframeError(true)}
                    />
                    {iframeError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
                        <img
                          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                          alt={title ?? 'Video thumbnail'}
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                        <div className="relative z-10 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center">
                            <Play className="w-7 h-7 text-red-500 fill-red-500" />
                          </div>
                          <p className="text-sm text-white/70 text-center px-4">Video tidak dapat diputar di environment ini</p>
                          {youtubeWatchUrl && (
                            <a
                              href={youtubeWatchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Watch on YouTube
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="absolute inset-0 h-full w-full"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              {isYouTube && youtubeWatchUrl && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-t border-white/10">
                  <span className="text-xs text-white/50">Tidak bisa memutar video?</span>
                  <a
                    href={youtubeWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Buka di YouTube
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
