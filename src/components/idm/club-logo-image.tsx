'use client';

import Image from 'next/image';
import { getClubLogoUrl, isClubLogoPlaceholder } from '@/lib/utils';
import type { CSSProperties } from 'react';

interface ClubLogoImageProps {
  clubName: string;
  dbLogo?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Club logo image component that auto-handles unoptimized for data URI placeholders.
 * Next.js Image optimizer can't process SVG data URIs, so we skip optimization for those.
 */
export function ClubLogoImage({
  clubName,
  dbLogo,
  alt,
  width,
  height,
  fill,
  sizes,
  className,
  style,
}: ClubLogoImageProps) {
  const src = getClubLogoUrl(clubName, dbLogo);
  const isPlaceholder = isClubLogoPlaceholder(src);

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt || clubName}
        fill
        sizes={sizes}
        className={className}
        style={style}
        unoptimized={isPlaceholder}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt || clubName}
      width={width || 32}
      height={height || 32}
      className={className}
      style={style}
      unoptimized={isPlaceholder}
    />
  );
}
