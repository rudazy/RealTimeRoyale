"use client";

import { useState, useEffect } from "react";
import { Zap, Gamepad2 } from "lucide-react";
import { AccountPanel } from "./AccountPanel";
import { CreateRoomModal } from "./CreateRoomModal";
import { JoinRoomModal } from "./JoinRoomModal";
import { useWallet } from "@/lib/genlayer/wallet";
import { usePlayerXP } from "@/lib/hooks/useRealTimeRoyale";

interface NavbarProps {
  onRoomCreated?: (roomId: string) => void;
  onRoomJoined?: (roomId: string) => void;
  showGameActions?: boolean;
}

export function Navbar({ onRoomCreated, onRoomJoined, showGameActions = true }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { address, isConnected } = useWallet();
  const { data: playerXP } = usePlayerXP(address || null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 80;

      setIsScrolled(scrollY > 20);

      const progress = Math.min(Math.max((scrollY - 10) / threshold, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const paddingTop = Math.round(scrollProgress * 16);
  const headerHeight = 64 - Math.round(scrollProgress * 8);

  const getBorderRadius = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return Math.round(scrollProgress * 9999);
    }
    return 0;
  };
  const borderRadius = getBorderRadius();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
      style={{ paddingTop: `${paddingTop}px` }}
    >
      <div
        className="transition-all duration-500 ease-out"
        style={{
          width: '100%',
          maxWidth: isScrolled ? '80rem' : '100%',
          margin: '0 auto',
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div
          className="backdrop-blur-xl border transition-all duration-500 ease-out md:rounded-none"
          style={{
            borderColor: `oklch(0.3 0.02 0 / ${0.4 + scrollProgress * 0.4})`,
            background: `linear-gradient(135deg, oklch(0.18 0.01 0 / ${0.1 + scrollProgress * 0.3}) 0%, oklch(0.15 0.01 0 / ${0.05 + scrollProgress * 0.25}) 50%, oklch(0.16 0.01 0 / ${0.08 + scrollProgress * 0.27}) 100%)`,
            borderRadius: `${borderRadius}px`,
            borderWidth: '1px',
            borderLeftWidth: isScrolled ? '1px' : '0px',
            borderRightWidth: isScrolled ? '1px' : '0px',
            borderTopWidth: isScrolled ? '1px' : '0px',
            boxShadow: isScrolled
              ? '0 32px 64px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 oklch(0.3 0.02 0 / 0.3)'
              : 'none',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          }}
        >
          <div
            className="px-6 transition-all duration-500 mx-auto"
            style={{
              maxWidth: isScrolled ? '80rem' : '112rem',
            }}
          >
            <div
              className="flex items-center justify-between transition-all duration-500"
              style={{ height: `${headerHeight}px` }}
            >
              {/* Left: Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-pink flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold">
                  <span className="text-accent">Real Time</span>{" "}
                  <span className="text-pink">Royale</span>
                </span>
              </div>

              {/* Center: Player XP (when connected) */}
              {isConnected && playerXP !== undefined && playerXP > 0 && (
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="font-bold text-accent">{playerXP}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                {showGameActions && (
                  <>
                    <JoinRoomModal onRoomJoined={onRoomJoined} />
                    <CreateRoomModal onRoomCreated={onRoomCreated} />
                  </>
                )}
                <AccountPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
