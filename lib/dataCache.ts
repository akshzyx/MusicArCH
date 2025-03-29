"use client";

import { supabase } from "@/lib/supabase";
import { Era, Release } from "@/lib/types";

interface CachedData {
  eras: Era[];
  releases: Release[];
  timestamp: number;
}

const CACHE_KEY = "jojiArchData";

// Fetch data from Supabase
async function fetchAllData(): Promise<CachedData> {
  const { data: eras, error: erasError } = await supabase
    .from("eras")
    .select("id, title, album_rank, cover_image")
    .limit(50)
    .order("album_rank", { ascending: true });

  const { data: releases, error: releasesError } = await supabase
    .from("releases")
    .select("*");

  if (erasError || releasesError) {
    throw new Error("Failed to fetch data");
  }

  return {
    eras: eras || [],
    releases: releases || [],
    timestamp: Date.now(),
  };
}

// Get or fetch data
export function getCachedData(): Promise<CachedData> {
  if (typeof window === "undefined") {
    // Server-side fallback (empty data)
    return Promise.resolve({
      eras: [],
      releases: [],
      timestamp: 0,
    });
  }

  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    return Promise.resolve(JSON.parse(cached));
  }

  // Fetch and cache if not present
  return fetchAllData().then((data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  });
}

// Refetch on reload
export function refetchData(): Promise<CachedData> {
  return fetchAllData().then((data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  });
}
