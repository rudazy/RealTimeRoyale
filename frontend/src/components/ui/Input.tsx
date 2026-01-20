import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-game-accent focus:border-transparent",
          "transition-all duration-200",
          error
            ? "border-game-error focus:ring-game-error"
            : "border-white/10 hover:border-white/20",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-game-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextArea({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: TextAreaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-game-accent focus:border-transparent",
          "transition-all duration-200 resize-none",
          error
            ? "border-game-error focus:ring-game-error"
            : "border-white/10 hover:border-white/20",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-game-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}