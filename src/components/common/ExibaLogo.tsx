import React from 'react';

interface ExibaLogoProps {
  className?: string;
  variant?: 'full' | 'symbol' | 'horizontal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  height?: number | string;
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
}

export const ExibaLogo: React.FC<ExibaLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  height,
  theme = 'light',
  showSubtitle = false,
}) => {
  // Height presets
  const sizeHeights = {
    xs: 20,
    sm: 26,
    md: 32,
    lg: 40,
    xl: 52,
    custom: height || 32,
  };

  const currentHeight = typeof height === 'number' ? height : sizeHeights[size];

  // Colors for I and B: dark slate in light mode, crisp white in dark mode
  const textDark = theme === 'dark' ? '#F8FAFC' : '#1E232E';

  if (variant === 'symbol') {
    return (
      <svg
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: currentHeight, width: 'auto', display: 'inline-block' }}
        className={`select-none ${className}`}
        aria-label="Exiba Ícone"
      >
        <defs>
          <linearGradient id="exiba-sym-blue-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          <linearGradient id="exiba-sym-play-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* Top bar with left rounded corner */}
        <path
          d="M 12 12 H 88 C 93 12 96 16 93 20 L 87 28 C 85 30 82 30 78 30 H 12 C 5.37 30 0 24.63 0 18 C 0 11.37 5.37 12 12 12 Z"
          fill="url(#exiba-sym-blue-purple)"
        />

        {/* Center Play Triangle */}
        <path
          d="M 18 36 L 58 50 L 18 64 Z"
          fill="url(#exiba-sym-play-grad)"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(147, 51, 234, 0.25))' }}
        />

        {/* Bottom bar with left rounded corner */}
        <path
          d="M 12 70 H 88 C 93 70 96 74 93 78 L 87 86 C 85 88 82 88 78 88 H 12 C 5.37 88 0 82.63 0 76 C 0 69.37 5.37 70 12 70 Z"
          fill="url(#exiba-sym-blue-purple)"
          transform="matrix(1 0 0 -1 0 158)"
        />
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg
        viewBox="0 0 540 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: currentHeight, width: 'auto', display: 'inline-block' }}
        className="select-none overflow-visible"
        aria-label="Exiba Logo"
      >
        <defs>
          {/* Gradients matching the original logo */}
          <linearGradient id="exiba-gradient-blue-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0066FF" />
            <stop offset="60%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          <linearGradient id="exiba-gradient-x-left" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          <linearGradient id="exiba-gradient-x-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          <linearGradient id="exiba-gradient-a" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          <linearGradient id="exiba-gradient-play-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* === LETTER E === */}
        <g id="letter-E">
          {/* Top horizontal rounded bar */}
          <path
            d="M 16 22 H 98 C 103 22 106 25 103 29 L 98 37 C 96 39 93 40 89 40 H 16 C 7.16 40 0 32.84 0 24 C 0 15.16 7.16 22 16 22 Z"
            fill="url(#exiba-gradient-blue-purple)"
          />
          {/* Central Play Icon Triangle */}
          <path
            d="M 20 48 L 64 68 L 20 88 Z"
            fill="url(#exiba-gradient-play-purple)"
          />
          {/* Bottom horizontal rounded bar */}
          <path
            d="M 16 96 H 98 C 103 96 106 99 103 103 L 98 111 C 96 113 93 114 89 114 H 16 C 7.16 114 0 106.84 0 98 C 0 89.16 7.16 96 16 96 Z"
            fill="url(#exiba-gradient-blue-purple)"
          />
        </g>

        {/* === LETTER X === */}
        <g id="letter-X" transform="translate(136, 0)">
          {/* Diagonal 1: bottom-left to top-right */}
          <path
            d="M 6 114 L 62 22 H 90 L 34 114 H 6 Z"
            fill="url(#exiba-gradient-x-left)"
          />
          {/* Diagonal 2: top-left to bottom-right */}
          <path
            d="M 6 22 H 34 L 90 114 H 62 L 6 22 Z"
            fill="url(#exiba-gradient-x-right)"
          />
        </g>

        {/* === LETTER I === */}
        <g id="letter-I" transform="translate(262, 0)">
          <rect
            x="0"
            y="22"
            width="17"
            height="92"
            rx="3"
            fill={textDark}
          />
        </g>

        {/* === LETTER B === */}
        <g id="letter-B" transform="translate(305, 0)">
          {/* Outer B Shape */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 0 22 H 48 C 66.78 22 80 32.5 80 47.5 C 80 56.5 73.5 64 63 67 C 76 70.5 83 79 83 91 C 83 105.5 68 114 48 114 H 0 V 22 Z 
               M 18 39 V 58 H 45 C 53.5 58 59 53.5 59 48.5 C 59 43.5 53.5 39 45 39 H 18 Z 
               M 18 75 V 97 H 47 C 56 97 62 92.5 62 86 C 62 79.5 56 75 47 75 H 18 Z"
            fill={textDark}
          />
        </g>

        {/* === LETTER A === */}
        <g id="letter-A" transform="translate(415, 0)">
          {/* Main Triangle A contour */}
          <path
            d="M 52 22 L 104 114 H 80 L 67 91 H 37 L 24 114 H 0 L 52 22 Z M 52 50 L 42 74 H 62 L 52 50 Z"
            fill="url(#exiba-gradient-a)"
          />
          {/* Play triangle inside the A crossbar */}
          <path
            d="M 42 70 L 68 83 L 42 96 Z"
            fill="url(#exiba-gradient-play-purple)"
          />
        </g>
      </svg>

      {showSubtitle && (
        <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          Studio
        </span>
      )}
    </div>
  );
};
