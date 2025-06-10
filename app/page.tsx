"use client";

import { useEffect, useState } from "react";
import EraCard from "@/components/EraCard";
import { Era } from "@/lib/types";
import { getCachedData, refetchData } from "@/lib/dataCache";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatedTestimonialsDemo } from "@/components/Testimonials";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Season type
type Season = {
  id: string;
  season_name: string;
  description: string;
  year: number | null;
  quote: string | null;
  videoCount?: number;
};

// SeasonCard component (styled to match EraCard, with improved UI for video count and year)
function SeasonCard({ season }: { season: Season }) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 w-full max-w-sm transition-all duration-200 hover:bg-gray-900/50 animate-fadeIn">
      <Link
        href={`/seasons/${season.id}`} // Adjust to your season route
        className="flex flex-col gap-2 w-full group"
      >
        <h4 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
          {season.season_name}
        </h4>
        <p className="text-gray-400 text-sm line-clamp-2">
          {season.description}
        </p>
        <div className="flex gap-2 mt-1">
          <span className="inline-block bg-gray-700 text-teal-400 text-xs font-medium px-2 py-1 rounded-full">
            {season.videoCount ?? 0} Video{season.videoCount !== 1 ? "s" : ""}
          </span>
          {season.year && (
            <span className="inline-block bg-gray-700 text-teal-400 text-xs font-medium px-2 py-1 rounded-full">
              Year: {season.year}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

// Utility function to get 3 random items from an array
function getRandomItems<T>(array: T[], count: number): T[] {
  if (!array || array.length === 0) return [];
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function Home() {
  const [data, setData] = useState<{ eras: Era[]; seasons: Season[] }>({
    eras: [],
    seasons: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect running - checking navigation type");
    const loadData = async () => {
      try {
        const navigationType = (
          performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming
        )?.type;
        console.log("Navigation type:", navigationType);

        const shouldRefetch =
          navigationType === "reload" || navigationType === "navigate";
        const dataToUse = shouldRefetch
          ? await refetchData()
          : await getCachedData();

        // Fetch seasons and their video counts from Supabase
        const { data: seasons, error: seasonsError } = await supabase
          .from("seasons")
          .select(
            `
            id,
            season_name,
            description,
            year,
            quote,
            videos (
              id
            )
          `
          )
          .order("year", { ascending: true })
          .limit(4);

        if (seasonsError) {
          console.error("Error fetching seasons:", seasonsError);
          throw seasonsError;
        }

        // Map seasons to include video count
        const seasonsWithVideoCount =
          seasons?.map((season) => ({
            ...season,
            videoCount: season.videos?.length || 0,
          })) || [];

        setData({ eras: dataToUse.eras, seasons: seasonsWithVideoCount });
      } catch (error) {
        console.log("Error loading data:", error);
        const cachedData = await getCachedData();
        setData({ eras: cachedData.eras, seasons: [] });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get 3 random eras for display
  const randomEras = getRandomItems(data.eras, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <FontAwesomeIcon
          icon={faSpinner}
          spinPulse
          className="text-teal-400 text-4xl"
        />
      </div>
    );
  }

  return (
    <div className="text-white min-h-screen pb-6 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto pt-4 px-4 sm:px-6 md:px-8">
        {/* Animated Testimonials Section */}
        <div className="mb-8">
          <AnimatedTestimonialsDemo />
        </div>

        {/* Explore Songs Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Explore Songs
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
            {randomEras.map((era: Era) => (
              <EraCard key={era.id} era={era} />
            ))}
            <Link
              href="/eras"
              className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 w-full max-w-sm transition-all duration-200 hover:bg-gray-900/50 animate-fadeIn group flex items-center justify-between"
            >
              <h4 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                Explore Music Eras
              </h4>
              <span className="text-teal-400 group-hover:text-teal-300">→</span>
            </Link>
          </div>
        </section>

        {/* Videos Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            Videos
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
            {data.seasons?.slice(0, 3).map((season: Season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
            <Link
              href="/seasons"
              className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-xl p-4 w-full max-w-sm transition-all duration-200 hover:bg-gray-900/50 animate-fadeIn group flex items-center justify-between"
            >
              <h4 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                Explore Seasons
              </h4>
              <span className="text-teal-400 group-hover:text-teal-300">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
