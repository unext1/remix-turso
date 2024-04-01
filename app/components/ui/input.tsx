import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '~/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border bg-input px-3 py-1 text-sm shadow-sm transition-colors',
        'file:border-0 file:text-muted-foreground file:pl-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
