import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';
import { Slot as SlotPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm leading-normal font-semibold px-3 py-4 k-transition focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary-green-500 text-primary-blue-500 shadow-sm hover:bg-primary-green-700',
        destructive:
          'bg-alert-red-600 text-white shadow-xs hover:bg-alert-red-600/90 hover:text-white/80',
        outline:
          'border border-secondary-blue-500 text-white bg-background shadow-xs hover:bg-secondary-blue-500',
        outlinePrimary:
          'border border-primary-green-500 bg-background shadow-xs text-primary-green-500 hover:bg-secondary-blue-500',
        secondary:
          'bg-transparent text-primary-green-500 shadow-xs hover:bg-secondary-blue-500',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        expandIcon:
          'group relative text-primary-foreground bg-primary hover:bg-primary/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface IconProps {
  Icon: React.ElementType;
  iconPlacement: 'left' | 'right';
}

interface IconRefProps {
  Icon?: never;
  iconPlacement?: undefined;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export type ButtonIconProps = IconProps | IconRefProps;

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonIconProps
>(
  (
    {
      className,
      variant,
      size,
      type = 'button',
      asChild = false,
      Icon,
      iconPlacement,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? SlotPrimitive.Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={type}
        {...props}
      >
        {Icon && iconPlacement === 'left' && (
          <div className="w-0 translate-x-[0%] pr-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-100 group-hover:pr-1 group-hover:opacity-100">
            <Icon />
          </div>
        )}
        <SlotPrimitive.Slottable>{props.children}</SlotPrimitive.Slottable>
        {Icon && iconPlacement === 'right' && (
          <div className="w-0 translate-x-full pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100">
            <Icon />
          </div>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
