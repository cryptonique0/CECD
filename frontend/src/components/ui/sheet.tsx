// frontend/src/components/ui/sheet.tsx
import React from 'react';

const Sheet = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative ${className || ''}`}
      {...props}
    />
  )
);
Sheet.displayName = 'Sheet';

const SheetTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 ${className || ''}`}
      {...props}
    />
  )
);
SheetTrigger.displayName = 'SheetTrigger';

const SheetContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`fixed inset-y-0 right-0 z-50 w-3/4 border-l border-slate-200 bg-white shadow-lg transition duration-300 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm ${className || ''}`}
      {...props}
    />
  )
);
SheetContent.displayName = 'SheetContent';

const SheetHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-2 text-center sm:text-left ${className || ''}`}
      {...props}
    />
  )
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
      {...props}
    />
  )
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={`text-lg font-semibold text-slate-900 ${className || ''}`}
      {...props}
    />
  )
);
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-slate-500 ${className || ''}`}
      {...props}
    />
  )
);
SheetDescription.displayName = 'SheetDescription';

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
};
