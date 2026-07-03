"use client";

// Shared-state hook backed by Supabase. Subscribes to the `members` table and
// exposes the ordered roster of names plus who occupies each toilet. When
// Supabase isn't configured it returns an inert, empty API and the terminal
// runs in local/simulated mode.

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured, getClientId } from "./supabaseClient";
import type { StallId } from "./platform";

export interface Member {
  id: string;
  name: string;
  stall: StallId | null;
  held_at: string | null;
  joined_at: string;
}

const HOLD_TTL_MS = 3 * 60 * 1000; // a hold older than this is treated as released

export interface MembersApi {
  configured: boolean;
  members: Member[]; // ordered by joined_at (the live roster)
  myId: string;
  occupancy: Record<StallId, Member | null>;
  join: (name: string) => void; // add / rename me in the roster
  setStall: (stall: StallId | null) => Promise<boolean>; // false if the toilet was just taken
}

const EMPTY: Record<StallId, Member | null> = { "1": null, "2": null };

export function useMembers(): MembersApi {
  const [members, setMembers] = useState<Member[]>([]);
  const myId = getClientId();
  const myIdRef = useRef(myId);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;
    let cancelled = false;

    const load = async () => {
      const { data } = await client.from("members").select("*").order("joined_at", { ascending: true });
      if (!cancelled && data) setMembers(data as Member[]);
    };
    load();

    const channel = client
      .channel("members-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "members" }, load)
      .subscribe();

    // Free any toilet whose holder vanished (closed the tab) so it never sticks.
    const sweep = window.setInterval(() => {
      const cutoff = new Date(Date.now() - HOLD_TTL_MS).toISOString();
      void client.from("members").update({ stall: null, held_at: null }).not("stall", "is", null).lt("held_at", cutoff);
    }, 30_000);

    return () => {
      cancelled = true;
      client.removeChannel(channel);
      clearInterval(sweep);
    };
  }, []);

  const join = useCallback((name: string) => {
    if (!isSupabaseConfigured || !supabase) return;
    void supabase.from("members").upsert({ id: myIdRef.current, name }, { onConflict: "id" });
  }, []);

  const setStall = useCallback(async (stall: StallId | null): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return true;
    const patch = stall
      ? { stall, held_at: new Date().toISOString() }
      : { stall: null, held_at: null };
    const { error } = await supabase.from("members").update(patch).eq("id", myIdRef.current);
    return !error; // unique-index violation → the toilet was already taken
  }, []);

  // Derive occupancy, ignoring holds that have gone stale.
  const now = Date.now();
  const fresh = (m: Member) => !m.held_at || now - Date.parse(m.held_at) < HOLD_TTL_MS;
  const occupancy: Record<StallId, Member | null> = isSupabaseConfigured
    ? {
        "1": members.find((m) => m.stall === "1" && fresh(m)) ?? null,
        "2": members.find((m) => m.stall === "2" && fresh(m)) ?? null,
      }
    : EMPTY;

  return { configured: isSupabaseConfigured, members, myId, occupancy, join, setStall };
}
