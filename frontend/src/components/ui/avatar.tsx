// frontend/src/components/ui/avatar.tsx
import React from 'react';

const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={`relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100 ${className || ''}`}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={`aspect-square h-full w-full ${className || ''}`}
      {...props}
    />
  )
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex h-full w-full items-center justify-center bg-slate-100 font-medium text-slate-500 ${className || ''}`}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
