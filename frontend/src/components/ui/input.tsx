// frontend/src/components/ui/input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export { Input };
