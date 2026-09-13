import React from 'react';

interface PreviewSkeletonProps {
  className?: string;
  themeType?: 'dark' | 'light';
}

export const PreviewSkeleton: React.FC<PreviewSkeletonProps> = ({
  className = '',
  themeType = 'dark',
}) => {
  const isDark = themeType === 'dark';
  const baseBg = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const shimmerBg = isDark ? 'bg-slate-800/80' : 'bg-slate-200/80';
  const cardBg = isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div
      className={`w-full min-h-full flex flex-col items-center select-none animate-pulse ${baseBg} ${className}`}
      aria-label="Carregando visualização..."
    >
      {/* Banner / Cover Skeleton */}
      <div className={`w-full h-36 sm:h-44 relative ${shimmerBg} overflow-hidden shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Profile Info Container */}
      <div className="w-full max-w-[420px] px-5 flex flex-col items-center -mt-12 z-10">
        {/* Avatar Shimmer */}
        <div className="relative mb-3">
          <div
            className={`w-24 h-24 rounded-full ring-4 ${
              isDark ? 'ring-slate-950 bg-slate-800' : 'ring-white bg-slate-300'
            } shadow-xl relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
          {/* Badge dot */}
          <div
            className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 ${
              isDark ? 'border-slate-950 bg-slate-700' : 'border-white bg-slate-400'
            }`}
          />
        </div>

        {/* Name Title & Pronoun lines */}
        <div className={`w-44 h-5 rounded-lg mb-2 ${shimmerBg} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
        </div>

        {/* Subtitle / Handle */}
        <div className={`w-28 h-3.5 rounded-md mb-2 ${shimmerBg} opacity-70`} />

        {/* Bio description lines */}
        <div className={`w-64 h-3 rounded-md mb-1.5 ${shimmerBg} opacity-60`} />
        <div className={`w-48 h-3 rounded-md mb-4 ${shimmerBg} opacity-50`} />

        {/* Social Icons Bar Skeletons */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-9 h-9 rounded-2xl ${shimmerBg} opacity-80 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          ))}
        </div>

        {/* Card Blocks Skeletons */}
        <div className="w-full space-y-3 pb-8">
          {/* Main Action Card 1 (Schedule style) */}
          <div className={`w-full p-4 rounded-2xl border ${cardBg} shadow-sm relative overflow-hidden`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${shimmerBg} shrink-0`} />
                <div className="space-y-1.5">
                  <div className={`w-32 h-4 rounded-md ${shimmerBg}`} />
                  <div className={`w-20 h-3 rounded-md ${shimmerBg} opacity-60`} />
                </div>
              </div>
              <div className={`w-20 h-7 rounded-xl ${shimmerBg} opacity-80`} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>

          {/* Action Card 2 (Link / Pix style) */}
          <div className={`w-full p-4 rounded-2xl border ${cardBg} shadow-sm relative overflow-hidden`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${shimmerBg} shrink-0`} />
                <div className="space-y-1.5">
                  <div className={`w-36 h-4 rounded-md ${shimmerBg}`} />
                  <div className={`w-24 h-3 rounded-md ${shimmerBg} opacity-60`} />
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full ${shimmerBg} opacity-50`} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>

          {/* Action Card 3 (Bento style 2 columns) */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border ${cardBg} shadow-sm relative overflow-hidden space-y-2`}
              >
                <div className={`w-7 h-7 rounded-lg ${shimmerBg}`} />
                <div className={`w-20 h-3.5 rounded-md ${shimmerBg}`} />
                <div className={`w-14 h-2.5 rounded-md ${shimmerBg} opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>
            ))}
          </div>

          {/* Action Card 4 (Product / Review style) */}
          <div className={`w-full p-4 rounded-2xl border ${cardBg} shadow-sm relative overflow-hidden`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${shimmerBg} shrink-0`} />
              <div className="space-y-1.5 flex-1">
                <div className={`w-28 h-4 rounded-md ${shimmerBg}`} />
                <div className={`w-40 h-3 rounded-md ${shimmerBg} opacity-60`} />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="pb-6 flex flex-col items-center gap-2">
          <div className={`w-24 h-3 rounded-full ${shimmerBg} opacity-50`} />
        </div>
      </div>
    </div>
  );
};
