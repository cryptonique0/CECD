// frontend/src/components/ui/select.tsx
import React from 'react';

const Select = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative inline-block w-full ${className || ''}`}
      {...props}
    />
  )
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    />
  )
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={`block truncate ${className || ''}`}
      {...props}
    />
  )
);
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`absolute top-full mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${className || ''}`}
      {...props}
    />
  )
);
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className || ''}`}
      {...props}
    />
  )
);
SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
};
