import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input — pill-shaped input that is the visual signature of DEZRAIZ.
 *
 * Backwards compatible: <Input ... /> with no extra props still renders the
 * pill input directly, so any existing call-site keeps working. Pass `label`,
 * `helperText`, `error`, `leftIcon` or `rightIcon` to opt into the full field.
 *
 * Helper/error slot reserves a fixed 20px height to prevent layout shift when
 * an error toggles in/out.
 */

export interface InputProps extends React.ComponentProps<"input"> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Wrapper className (only used when label/icons/helper are present). */
  wrapperClassName?: string;
}

const baseInput = [
  "flex h-12 w-full rounded-full bg-[var(--color-zinc-100)] text-base text-[var(--color-zinc-900)]",
  "border border-[var(--color-zinc-200)]",
  "px-5 py-2",
  "transition-colors duration-150",
  "placeholder:text-[var(--color-zinc-400)]",
  "focus-visible:outline-none focus-visible:border-[var(--color-green-500)] focus-visible:ring-2 focus-visible:ring-[var(--color-green-500)]/40",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-zinc-50)]",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
].join(" ");

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      id,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      wrapperClassName,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const helperId = `${inputId}-helper`;
    const hasError = Boolean(error);
    const hasDecoration = Boolean(label || leftIcon || rightIcon || helperText || error);

    const inputClasses = cn(
      baseInput,
      leftIcon && "pl-12",
      rightIcon && "pr-12",
      hasError &&
        "border-[var(--color-state-error)] focus-visible:border-[var(--color-state-error)] focus-visible:ring-[var(--color-state-error)]/30",
      className,
    );

    const inputEl = (
      <input
        id={inputId}
        type={type}
        ref={ref}
        aria-invalid={hasError || undefined}
        aria-describedby={cn(ariaDescribedBy, hasDecoration ? helperId : undefined) || undefined}
        className={inputClasses}
        {...props}
      />
    );

    if (!hasDecoration) {
      return inputEl;
    }

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-zinc-700)]"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-zinc-400)] [&_svg]:size-5"
            >
              {leftIcon}
            </span>
          ) : null}
          {inputEl}
          {rightIcon ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-zinc-400)] [&_svg]:size-5">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {/* Reserve fixed height to avoid layout shift when error toggles */}
        <p
          id={helperId}
          className={cn(
            "min-h-5 text-xs leading-5",
            hasError ? "text-[var(--color-state-error)]" : "text-[var(--color-zinc-500)]",
          )}
          role={hasError ? "alert" : undefined}
        >
          {error ?? helperText ?? "\u00A0"}
        </p>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
