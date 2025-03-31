"use client";

import { supabase } from "@/lib/supabase";
import { Era, Release } from "@/lib/types";

interface CachedData {
  eras: Era[];
  releases: Release[];
  timestamp: number;
}

// Singleton cache instance
const DataCache = (() => {
  let cache: CachedData | null = null;

  // Fetch data from Supabase
  async function fetchData(): Promise<CachedData> {
    console.log("Fetching fresh data from Supabase");
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

    const data = {
      eras: eras || [],
      releases: releases || [],
      timestamp: Date.now(),
    };

    cache = data; // Update cache
    return data;
  }

  return {
    getCachedData: async (): Promise<CachedData> => {
      if (typeof window === "undefined") {
        return { eras: [], releases: [], timestamp: 0 };
      }
      if (cache) {
        console.log("Returning cached data");
        return cache;
      }
      return fetchData(); // Initial fetch if no cache
    },
    refetchData: async (): Promise<CachedData> => {
      return fetchData(); // Always fetch fresh data
    },
  };
})();

export const { getCachedData, refetchData } = DataCache;
