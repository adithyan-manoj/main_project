import React from 'react';

/**
 * Reusable PillButton matching the modern Light SaaS reference:
 * - Rounded pill shape
 * - Variants: dark (active tab / CTA), light (inactive tab), outline (config/action button), pastel
 */
export default function PillButton({
  children,
  onClick,
  active = false,
  variant = 'default',
  icon: Icon = null,
  badge = null,
  className = '',
  size = 'md',
  disabled = false,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
  }[size] || 'px-4 py-2 text-xs gap-2';

  let variantClasses = '';

  if (active || variant === 'dark') {
    variantClasses = 'bg-gray-900 hover:bg-black text-white font-medium shadow-xs border border-gray-900';
  } else if (variant === 'outline') {
    variantClasses = 'bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 shadow-xs hover:border-gray-300';
  } else if (variant === 'pastel-pink') {
    variantClasses = 'bg-rose-50 text-rose-700 border border-rose-200/70 font-semibold';
  } else if (variant === 'pastel-blue') {
    variantClasses = 'bg-sky-50 text-sky-700 border border-sky-200/70 font-semibold';
  } else if (variant === 'pastel-purple') {
    variantClasses = 'bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold';
  } else if (variant === 'pastel-green') {
    variantClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold';
  } else {
    // Default inactive pill
    variantClasses = 'bg-white hover:bg-gray-100 text-gray-600 font-medium border border-gray-200/80 shadow-xs';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{children}</span>
      {badge && (
        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
          {badge}
        </span>
      )}
    </button>
  );
}

