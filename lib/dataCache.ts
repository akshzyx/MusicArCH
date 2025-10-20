"use client";

import { supabase } from "@/lib/supabase";
import { Era, Release, Testimonial } from "@/lib/types";

interface CachedData {
  eras: Era[];
  releases: Release[];
  testimonials: Testimonial[];
  timestamp: number;
}

const DataCache = (() => {
  let cache: CachedData | null = null;

  async function fetchData(): Promise<CachedData> {
    console.log("Fetching fresh data from Supabase");
    const [
      { data: eras, error: erasError },
      { data: releases, error: releasesError },
      { data: testimonials, error: testimonialsError },
    ] = await Promise.all([
      supabase
        .from("eras")
        .select("id, title, album_rank, cover_image")
        .limit(50)
        .order("album_rank", { ascending: true }),
      supabase.from("releases").select("*"),
      supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    if (erasError || releasesError || testimonialsError) {
      throw new Error("Failed to fetch data");
    }

    const data = {
      eras: eras || [],
      releases: releases || [],
      testimonials: testimonials || [],
      timestamp: Date.now(),
    };

    cache = data;
    return data;
  }

  return {
    getCachedData: async (): Promise<CachedData> => {
      if (typeof window === "undefined") {
        return { eras: [], releases: [], testimonials: [], timestamp: 0 };
      }
      if (cache) {
        console.log("Returning cached data");
        return cache;
      }
      return fetchData();
    },
    refetchData: async (): Promise<CachedData> => {
      return fetchData();
    },
  };
})();

export const { getCachedData, refetchData } = DataCache;
