import { cn } from "@/lib/utils";
import * as React from "react";

export function Input({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-input shadow-xs flex h-9 min-w-0 items-center rounded-md border bg-transparent transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "dark:bg-input/30",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function InputField({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex-grow bg-transparent py-1 text-base outline-none",
        "file:text-foreground md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export function InputIcon({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex aspect-square h-full items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
