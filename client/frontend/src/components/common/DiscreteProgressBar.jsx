import React from 'react';

/**
 * Reusable DiscreteProgressBar component
 * Replaces continuous progress bars with a row of discrete rounded-square blocks.
 * - Filled blocks: solid pastel accent color
 * - Empty blocks: dashed border with subtle light grey background
 */
export default function DiscreteProgressBar({
  total = 7,
  filled = 3,
  variant = 'blue', // 'blue' | 'pink' | 'purple' | 'green' | 'red'
  size = 'md',
  className = ''
}) {
  const sizeMap = {
    sm: 'w-4 h-4 rounded-[5px]',
    md: 'w-6 h-6 rounded-md',
    lg: 'w-7 h-7 rounded-lg',
  };

  const blockClass = sizeMap[size] || sizeMap.md;

  // Modern pastel filled block colors
  const variantMap = {
    blue: 'bg-sky-300 border border-sky-400/40 shadow-xs',
    pink: 'bg-rose-300 border border-rose-400/40 shadow-xs',
    red: 'bg-red-400 border border-red-500/40 shadow-xs',
    purple: 'bg-purple-300 border border-purple-400/40 shadow-xs',
    green: 'bg-emerald-300 border border-emerald-400/40 shadow-xs',
    amber: 'bg-amber-300 border border-amber-400/40 shadow-xs',
  };

  const filledClass = variantMap[variant] || variantMap.blue;
  const emptyClass = 'border border-dashed border-gray-300/80 bg-gray-50/70';

  const safeFilled = Math.min(Math.max(0, filled), total);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {Array.from({ length: total }).map((_, index) => {
        const isFilled = index < safeFilled;
        return (
          <div
            key={index}
            className={`${blockClass} transition-all duration-200 ${
              isFilled ? filledClass : emptyClass
            }`}
          />
        );
      })}
    </div>
  );
}

