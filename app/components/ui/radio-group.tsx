import { CheckIcon } from '@radix-ui/react-icons';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';

import { cn } from '~/utils';
import { Label } from './label';

const RadioGroup = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Root>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupLabel = ({ label, children }: { label?: string; children: ReactNode }) => {
  if (!label) return <>{children}</>;
  return (
    <Label className="flex space-x-2 font-normal">
      {children}
      <span>{label}</span>
    </Label>
  );
};

const RadioGroupItem = forwardRef<
  ElementRef<typeof RadioGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { label?: string }
>(({ className, label, ...props }, ref) => {
  return (
    <RadioGroupLabel label={label}>
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          `aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow flex bg-input
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50`,
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <CheckIcon className="h-3.5 w-3.5 fill-primary" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    </RadioGroupLabel>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
