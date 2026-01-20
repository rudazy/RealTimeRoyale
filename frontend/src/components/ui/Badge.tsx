import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full";

  const variants = {
    default: "bg-white/10 text-white",
    success: "bg-game-success/20 text-game-success",
    warning: "bg-game-warning/20 text-game-warning",
    error: "bg-game-error/20 text-game-error",
    info: "bg-game-accent/20 text-game-accent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}