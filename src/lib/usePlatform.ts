"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CABIN,
  loadReservation,
  loadSession,
  saveReservation,
  saveSession,
  statusOf,
  PLATFORM_EVENT,
  type Reservation,
  type Session,
} from "./platform";
import { SCORE, clampScore } from "./booking";
import { useWallet } from "./useWallet";

export function usePlatform() {
  const { wallet, update } = useWallet();
  const [session, setSession] = useState<Session | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [now, setNow] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setReservation(loadReservation());
    setNow(Date.now());
    setMounted(true);
    const sync = () => {
      setSession(loadSession());
      setReservation(loadReservation());
    };
    window.addEventListener(PLATFORM_EVENT, sync);
    window.addEventListener("storage", sync);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener(PLATFORM_EVENT, sync);
      window.removeEventListener("storage", sync);
      clearInterval(id);
    };
  }, []);

  // auto-expiry: forfeit on missed window; release after occupancy elapses
  useEffect(() => {
    if (!mounted || !reservation || now === 0) return;
    if (!reservation.checkedIn && now >= reservation.slotMs) {
      saveReservation(null);
      setReservation(null);
      update({ ...wallet, score: clampScore(wallet.score - SCORE.burn) });
    } else if (
      reservation.checkedIn &&
      reservation.occupiedUntil &&
      now >= reservation.occupiedUntil
    ) {
      saveReservation(null);
      setReservation(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, mounted, reservation]);

  const signIn = useCallback((name: string) => {
    const s: Session = { name: name.trim().slice(0, 40) || "Member", since: Date.now() };
    saveSession(s);
    setSession(s);
  }, []);

  const signOut = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  const book = useCallback(
    (arg: { slotMs: number; price: number; urgency: number }) => {
      if (!session) return;
      const r: Reservation = {
        by: session.name,
        slotMs: arg.slotMs,
        price: arg.price,
        urgency: arg.urgency,
        createdMs: Date.now(),
        checkedIn: false,
      };
      saveReservation(r);
      setReservation(r);
      update({
        ...wallet,
        settledValue: Math.round((wallet.settledValue + arg.price) * 100) / 100,
      });
    },
    [session, wallet, update]
  );

  const checkIn = useCallback(() => {
    if (!reservation) return;
    const r: Reservation = {
      ...reservation,
      checkedIn: true,
      occupiedUntil: Date.now() + CABIN.occupyMs,
    };
    saveReservation(r);
    setReservation(r);
    update({ ...wallet, score: clampScore(wallet.score + SCORE.checkIn) });
  }, [reservation, wallet, update]);

  const release = useCallback(() => {
    saveReservation(null);
    setReservation(null);
  }, []);

  const status = statusOf(reservation, now);
  const mine = !!reservation && !!session && reservation.by === session.name;

  return { session, reservation, status, now, mounted, mine, wallet, signIn, signOut, book, checkIn, release };
}
