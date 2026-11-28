import { useEffect, useState } from 'react';
import { ImageBrokenIcon } from './NextGenIcons';

interface ResilientImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  className = '',
  loading = 'lazy',
  fetchPriority,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#071B1B] via-[#0A2525] to-[#071B1B] p-6 text-center text-[#A0B2B2] ${className}`}
      >
        <ImageBrokenIcon className="mb-2 h-6 w-6 text-[#F05BEA]/80" strokeWidth={1.5} />
        <span className="font-kalam text-sm font-normal text-[#FFFFFF]">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
