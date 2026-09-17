"use client";

import { useEffect, useState } from "react";

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener: (type: "release", listener: () => void) => void };
type WakeLockNavigator = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> } };

export function useWakeLock(active: boolean) {
  const [locked, setLocked] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const wakeLock = (navigator as WakeLockNavigator).wakeLock;
    setSupported(Boolean(wakeLock));
    if (!active || !wakeLock) { setLocked(false); return; }
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const request = async () => {
      if (document.visibilityState !== "visible" || cancelled) return;
      try {
        sentinel = await wakeLock.request("screen");
        if (cancelled) { await sentinel.release(); return; }
        setLocked(true);
        sentinel.addEventListener("release", () => { sentinel = null; setLocked(false); });
      } catch { setLocked(false); }
    };
    const visibility = () => { if (document.visibilityState === "visible" && !sentinel) void request(); };
    void request();
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", visibility); if (sentinel) void sentinel.release(); setLocked(false); };
  }, [active]);

  return { supported, locked };
}
