// frontend/src/components/ui/dropdown-menu.tsx
import React from 'react';

const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative inline-block w-full ${className || ''}`}
      {...props}
    />
  )
);
DropdownMenu.displayName = 'DropdownMenu';

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 ${className || ''}`}
      {...props}
    />
  )
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${className || ''}`}
      {...props}
    />
  )
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer ${className || ''}`}
      {...props}
    />
  )
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`my-1 h-px bg-slate-100 ${className || ''}`}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-4 py-2 text-sm font-semibold text-slate-900 ${className || ''}`}
      {...props}
    />
  )
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
};
