"use client";

import { useCallback, useEffect, useState } from "react";
import { loadWallet, saveWallet, defaultWallet, type WalletState } from "./booking";

const EVENT = "wc-wallet-change";

/** Shared wallet state backed by localStorage; syncs across components + tabs. */
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(defaultWallet());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWallet(loadWallet());
    setMounted(true);
    const onChange = () => setWallet(loadWallet());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const update = useCallback((next: WalletState) => {
    saveWallet(next);
    setWallet(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { wallet, update, mounted };
}
