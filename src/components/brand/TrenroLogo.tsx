import React from 'react';
import Link from 'next/link';

interface TrenroLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'monochrome';
  showTagline?: boolean;
  href?: string;
}

export function TrenroMonogram({
  size = 36,
  variant = 'dark',
  className = '',
}: {
  size?: number;
  variant?: 'dark' | 'light' | 'monochrome';
  className?: string;
}) {
  const isLight = variant === 'light';
  const primaryColor = isLight ? '#FFFFFF' : '#171717';
  const copperColor = isLight ? '#D4A36A' : '#BD8B52';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none transition-transform duration-200 group-hover:scale-105 ${className}`}
      aria-label="TRENRO Monogram"
    >
      {/* Subtle hanger hook silhouette accent */}
      <path
        d="M50 8 C46 8 43 11 43 15 C43 18 45 20 48 21.5 L48 24 L52 24 L52 21.2 C54.5 19.8 56 17.2 56 14.5 C56 10.9 53.3 8 50 8 Z"
        fill={copperColor}
      />
      {/* T Top Horizontal Bar with sharp angled cuts */}
      <polygon
        points="12,24 88,24 78,34 22,34"
        fill={primaryColor}
      />
      {/* T Vertical Stem */}
      <polygon
        points="32,34 46,34 46,86 32,86"
        fill={primaryColor}
      />
      {/* R Upper Loop / Curve in rich copper gold */}
      <path
        d="M46 34 L72 34 C80 34 86 40 86 48 C86 56 80 62 72 62 L54 62 L46 54 L46 34 Z"
        fill={copperColor}
      />
      {/* Inner cutout of R loop */}
      <path
        d="M56 42 L68 42 C72 42 75 44.5 75 48 C75 51.5 72 54 68 54 L56 54 Z"
        fill={isLight ? '#171717' : '#FDFBF7'}
      />
      {/* R Dynamic Diagonal Leg with sharp chamfer */}
      <polygon
        points="56,58 70,58 88,86 74,86"
        fill={primaryColor}
      />
      {/* Copper accent wedge under T stem */}
      <polygon
        points="46,62 56,62 56,76"
        fill={copperColor}
      />
    </svg>
  );
}

export default function TrenroLogo({
  className = '',
  size = 'md',
  variant = 'dark',
  showTagline = false,
  href = '/',
}: TrenroLogoProps) {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 60,
  };

  const textSizes = {
    sm: 'text-lg tracking-[0.2em]',
    md: 'text-2xl tracking-[0.22em]',
    lg: 'text-3xl tracking-[0.25em]',
    xl: 'text-4xl tracking-[0.28em]',
  };

  const content = (
    <div className={`group inline-flex items-center gap-3 ${className}`}>
      <TrenroMonogram size={iconSizes[size]} variant={variant} />
      <div className="flex flex-col">
        <div className="flex items-center leading-none">
          <span
            className={`font-black font-sans uppercase ${textSizes[size]} ${
              isLight ? 'text-white' : 'text-[#171717]'
            }`}
          >
            TREN<span className="text-[#BD8B52]">R</span>O
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[9px] font-semibold tracking-[0.3em] uppercase mt-1 ${
              isLight ? 'text-[#D4A36A]' : 'text-[#737373]'
            }`}
          >
            Wear the Trend. Own the Look.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
