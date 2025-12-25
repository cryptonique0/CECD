// frontend/src/components/ui/badge.tsx
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'border-transparent bg-blue-100 text-blue-900',
      secondary: 'border-transparent bg-slate-100 text-slate-900',
      destructive: 'border-transparent bg-red-100 text-red-900',
      outline: 'text-slate-950',
    };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className || ''}`}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
