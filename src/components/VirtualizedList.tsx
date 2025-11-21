"use client";

import * as React from "react";
import { useRef, useMemo } from "react";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  className?: string;
  containerHeight?: number;
}

/**
 * Simple virtual scrolling implementation for long lists
 * Note: For production use, consider installing @tanstack/react-virtual for better performance
 */
export default function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 200,
  className = "",
  containerHeight = 600,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / estimateSize);
    const end = Math.min(
      start + Math.ceil(containerHeight / estimateSize) + 1,
      items.length
    );
    return { start, end };
  }, [scrollTop, estimateSize, containerHeight, items.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: `${containerHeight}px` }}
      onScroll={handleScroll}
    >
      <div style={{ height: `${items.length * estimateSize}px`, position: "relative" }}>
        {items.slice(visibleRange.start, visibleRange.end).map((item, index) => {
          const actualIndex = visibleRange.start + index;
          return (
            <div
              key={actualIndex}
              style={{
                position: "absolute",
                top: `${actualIndex * estimateSize}px`,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

