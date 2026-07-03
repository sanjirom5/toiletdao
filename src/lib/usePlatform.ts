"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  STALLS,
  loadName,
  saveName,
  loadMarket,
  saveMarket,
  PLATFORM_EVENT,
  type StallId,
  type Occupancy,
  type MarketState,
} from "./platform";
import { stepPrice, ease, rushMult, seedBuffer, isRushNow } from "./priceEngine";
import { mulberry32 } from "./market";
import { useMembers, type Member } from "./useMembers";

const BUF = 60; // chart history length (~1 min at 1s/tick)
const DEMAND_TARGET = 1.6; // price premium while a stall is occupied
const SIM_MIN_MS = 30_000; // simulated-member occupancy (fallback only): min duration
const SIM_VAR_MS = 30_000; // …plus up to this much

export interface StallView {
  id: StallId;
  price: number; // live display $/min
  buffer: number[]; // recent display prices
  up: boolean;
  pct: number;
  status: "available" | "mine" | "member";
  holderName?: string; // real occupant's name when status === "member"
}

type NumById = Record<StallId, number>;

export function usePlatform() {
  const membersApi = useMembers();

  const [name, setNameState] = useState<string | null>(null);
  const [market, setMarket] = useState<MarketState>({ spend: 0, occupancy: null });
  const [stalls, setStalls] = useState<StallView[]>([]);
  const [now, setNow] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [namePromptFor, setNamePromptFor] = useState<StallId | null>(null);

  // Latest-value refs so the 1s tick and callbacks never read stale state.
  const configuredRef = useRef(membersApi.configured);
  const myIdRef = useRef(membersApi.myId);
  const occByStallRef = useRef<Record<StallId, Member | null>>(membersApi.occupancy);
  const setStallRef = useRef(membersApi.setStall);
  const joinRef = useRef(membersApi.join);
  configuredRef.current = membersApi.configured;
  myIdRef.current = membersApi.myId;
  occByStallRef.current = membersApi.occupancy;
  setStallRef.current = membersApi.setStall;
  joinRef.current = membersApi.join;

  // Mutable simulation state (fallback mode) kept in refs.
  const rand = useRef<() => number>(() => 0.5);
  const priceRef = useRef<NumById>({ "1": STALLS[0].base, "2": STALLS[1].base });
  const bufRef = useRef<Record<StallId, number[]>>({ "1": [], "2": [] });
  const demandRef = useRef<NumById>({ "1": 1, "2": 1 });
  const simRef = useRef<Record<StallId, { until: number; next: number }>>({
    "1": { until: 0, next: 0 },
    "2": { until: 0, next: 0 },
  });
  const occRef = useRef<Occupancy | null>(null);
  const spendRef = useRef(0);
  const nameRef = useRef<string | null>(null);
  const reducedRef = useRef(false);

  // Advance the whole market one frame and reflect it into React state.
  const tick = useCallback((t: number) => {
    const rMult = rushMult(t);
    const occ = occRef.current;
    const shared = configuredRef.current;

    const views: StallView[] = STALLS.map((cfg) => {
      const isMine = shared
        ? occByStallRef.current[cfg.id]?.id === myIdRef.current || occ?.stall === cfg.id
        : occ?.stall === cfg.id;

      let status: StallView["status"];
      let holderName: string | undefined;
      let occupied: boolean;

      if (shared) {
        const holder = occByStallRef.current[cfg.id];
        if (isMine) {
          status = "mine";
          occupied = true;
        } else if (holder) {
          status = "member";
          holderName = holder.name;
          occupied = true;
        } else {
          status = "available";
          occupied = false;
        }
      } else {
        // Fallback: simulate a member on the stall the user isn't in, without
        // ever letting both be busy so one stays reservable.
        const sim = simRef.current[cfg.id];
        const otherId: StallId = cfg.id === "1" ? "2" : "1";
        if (!isMine && t >= sim.next) {
          const otherBusy = simRef.current[otherId].until > t;
          if (otherBusy) sim.next = t + 3_000;
          else {
            sim.until = t + SIM_MIN_MS + Math.floor(rand.current() * SIM_VAR_MS);
            sim.next = sim.until + 40_000 + Math.floor(rand.current() * 60_000);
          }
        }
        const simActive = !isMine && t < sim.until;
        occupied = isMine || simActive;
        status = isMine ? "mine" : simActive ? "member" : "available";
      }

      demandRef.current[cfg.id] = ease(demandRef.current[cfg.id], occupied ? DEMAND_TARGET : 1);

      const nextBase = stepPrice(priceRef.current[cfg.id], cfg.base, cfg.vol, cfg.min, cfg.max, rand.current);
      priceRef.current[cfg.id] = nextBase;

      const display = Math.round(nextBase * demandRef.current[cfg.id] * rMult * 100) / 100;
      const buf = bufRef.current[cfg.id];
      buf.push(display);
      if (buf.length > BUF) buf.shift();

      const ref = buf[Math.max(0, buf.length - 9)];
      const pct = ref ? ((display - ref) / ref) * 100 : 0;

      return { id: cfg.id, price: display, buffer: buf.slice(), up: display >= ref, pct: Math.round(pct * 10) / 10, status, holderName };
    });
    setStalls(views);

    // floating meter: accrue at the live rate over the elapsed slice
    if (occ) {
      const rate = views.find((v) => v.id === occ.stall)?.price ?? 0;
      const dt = t - occ.lastTickMs;
      if (dt > 0) {
        occ.accrued = Math.round((occ.accrued + rate * (dt / 60_000)) * 100) / 100;
        occ.lastTickMs = t;
        const m: MarketState = { spend: spendRef.current, occupancy: occ };
        saveMarket(m);
        setMarket({ spend: spendRef.current, occupancy: { ...occ } });
      }
    }
    setNow(t);
  }, []);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nm = loadName();
    setNameState(nm);
    nameRef.current = nm;

    const mk = loadMarket();
    setMarket(mk);
    occRef.current = mk.occupancy;
    spendRef.current = mk.spend;

    const t0 = Date.now();
    rand.current = mulberry32((t0 & 0xffffff) || 12345);
    STALLS.forEach((cfg) => {
      const seeded = seedBuffer(BUF, cfg.base, cfg.vol, cfg.min, cfg.max, cfg.seed);
      bufRef.current[cfg.id] = seeded;
      priceRef.current[cfg.id] = seeded[seeded.length - 1];
      demandRef.current[cfg.id] = 1;
      simRef.current[cfg.id] = { until: 0, next: t0 + 12_000 + (cfg.seed % 9000) };
    });

    setMounted(true);
    tick(t0);

    const sync = () => {
      const n2 = loadName();
      setNameState(n2);
      nameRef.current = n2;
      const m2 = loadMarket();
      setMarket(m2);
      occRef.current = m2.occupancy;
      spendRef.current = m2.spend;
    };
    window.addEventListener(PLATFORM_EVENT, sync);
    window.addEventListener("storage", sync);

    let id: number | undefined;
    if (!reducedRef.current) id = window.setInterval(() => tick(Date.now()), 1000);

    return () => {
      window.removeEventListener(PLATFORM_EVENT, sync);
      window.removeEventListener("storage", sync);
      if (id) clearInterval(id);
    };
  }, [tick]);

  const startOccupancy = useCallback(
    (stall: StallId, who: string) => {
      const t = Date.now();
      const occ: Occupancy = { stall, by: who, startedMs: t, accrued: 0, lastTickMs: t };
      occRef.current = occ;
      const m: MarketState = { spend: spendRef.current, occupancy: occ };
      saveMarket(m);
      setMarket({ spend: spendRef.current, occupancy: { ...occ } });
      if (reducedRef.current) tick(t);
    },
    [tick]
  );

  const doReserve = useCallback(
    async (stall: StallId, who: string) => {
      if (configuredRef.current) {
        const ok = await setStallRef.current(stall);
        if (!ok) return; // toilet was just taken — realtime will reflect it
      }
      startOccupancy(stall, who);
    },
    [startOccupancy]
  );

  const reserve = useCallback(
    (stall: StallId) => {
      if (occRef.current) return; // already holding a stall
      const who = nameRef.current;
      if (!who) {
        setNamePromptFor(stall);
        return;
      }
      void doReserve(stall, who);
    },
    [doReserve]
  );

  const join = useCallback((raw: string) => {
    const who = raw.trim().slice(0, 40) || "Member";
    saveName(who);
    setNameState(who);
    nameRef.current = who;
    if (configuredRef.current) joinRef.current(who);
  }, []);

  const confirmName = useCallback(
    (raw: string) => {
      const who = raw.trim().slice(0, 40) || "Member";
      saveName(who);
      setNameState(who);
      nameRef.current = who;
      if (configuredRef.current) joinRef.current(who);
      const pending = namePromptFor;
      setNamePromptFor(null);
      if (pending) void doReserve(pending, who);
    },
    [namePromptFor, doReserve]
  );

  const cancelName = useCallback(() => setNamePromptFor(null), []);

  const endSession = useCallback(() => {
    const occ = occRef.current;
    const t = Date.now();
    if (occ) {
      const rate = Math.round(priceRef.current[occ.stall] * demandRef.current[occ.stall] * rushMult(t) * 100) / 100;
      const finalAccrued = Math.round((occ.accrued + rate * ((t - occ.lastTickMs) / 60_000)) * 100) / 100;
      const newSpend = Math.round((spendRef.current + finalAccrued) * 100) / 100;
      spendRef.current = newSpend;
      occRef.current = null;
      const m: MarketState = { spend: newSpend, occupancy: null };
      saveMarket(m);
      setMarket(m);
    }
    if (configuredRef.current) void setStallRef.current(null); // release the shared seat
    if (reducedRef.current) tick(t);
  }, [tick]);

  const changeName = useCallback(() => {
    if (occRef.current) return; // don't swap names mid-session
    saveName(null);
    setNameState(null);
    nameRef.current = null;
  }, []);

  return {
    mounted,
    now,
    name,
    spend: market.spend,
    occupancy: market.occupancy,
    stalls,
    namePromptFor,
    rush: mounted ? isRushNow(now) : false,
    // shared roster
    configured: membersApi.configured,
    members: membersApi.members,
    myId: membersApi.myId,
    reserve,
    join,
    confirmName,
    cancelName,
    endSession,
    changeName,
  };
}
