"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onError?: () => void;
}

export default function ProgressiveImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  priority = false,
  sizes,
  onError,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 animate-pulse"
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            onLoad={handleLoad}
            onError={handleError}
            priority={priority}
            sizes={sizes}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="object-cover"
            onLoad={handleLoad}
            onError={handleError}
            priority={priority}
            sizes={sizes}
            loading={priority ? undefined : "lazy"}
          />
        )}
      </motion.div>
    </div>
  );
}

