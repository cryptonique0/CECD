// frontend/src/components/ui/dialog.tsx
import React from 'react';

const Dialog = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative ${className || ''}`}
      {...props}
    />
  )
);
Dialog.displayName = 'Dialog';

const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 ${className || ''}`}
      {...props}
    />
  )
);
DialogTrigger.displayName = 'DialogTrigger';

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className || ''}`}
    >
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        {props.children}
      </div>
    </div>
  )
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}
      {...props}
    />
  )
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
      {...props}
    />
  )
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  )
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-slate-500 ${className || ''}`}
      {...props}
    />
  )
);
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
};
