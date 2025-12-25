// frontend/src/components/ui/separator.tsx
import React from 'react';

const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`shrink-0 bg-slate-200 h-[1px] w-full ${className || ''}`}
      {...props}
    />
  )
);
Separator.displayName = 'Separator';

export { Separator };
