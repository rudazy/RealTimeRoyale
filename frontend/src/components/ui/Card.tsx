import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  variant?: "default" | "highlighted" | "dark";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}

export function Card({
  variant = "default",
  padding = "md",
  className,
  children,
}: CardProps) {
  const baseStyles = "rounded-xl border backdrop-blur-sm";

  const variants = {
    default: "bg-white/5 border-white/10",
    highlighted: "bg-game-accent/10 border-game-accent/30",
    dark: "bg-game-darker border-white/5",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div className={cn(baseStyles, variants[variant], paddings[padding], className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-bold text-white", className)}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-400 mt-1", className)}>
      {children}
    </p>
  );
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export function CardFooter({ className, children }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-white/10", className)}>
      {children}
    </div>
  );
}