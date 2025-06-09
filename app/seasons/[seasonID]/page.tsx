import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { Suspense } from "react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SeasonVideoList from "@/components/SeasonVideoList";

// Suppress the unused variable warning for Season type since it's used indirectly via season variable
/* eslint-disable @typescript-eslint/no-unused-vars */
type Video = {
  id: string;
  created_at: string;
  upload_date: string | null;
  channel: string | null;
  description: string | null;
  season_id: string | null;
  extra: string | null;
  title: string | null;
  video_id: string;
  video_url: string;
  episode_number: string;
  type: string;
};

type Season = {
  id: string;
  season_name: string;
  description: string;
  year: number | null;
  quote: string | null;
  videos: Video[];
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seasonID: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params; // Await the params
  const { data: season, error } = await supabase
    .from("seasons")
    .select("season_name")
    .eq("id", resolvedParams.seasonID)
    .single();

  if (error || !season) {
    return {
      title: "Season Not Found - JojiArCH",
    };
  }

  return {
    title: `${season.season_name || "Season"} - JojiArCH`,
    description: `Watch all videos from ${
      season.season_name || "this season"
    } by Joji and his aliases.`,
  };
}

async function SeasonContent({ seasonID }: { seasonID: string }) {
  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select(
      `
      id,
      season_name,
      description,
      year,
      quote,
      videos (
        id,
        created_at,
        upload_date,
        channel,
        description,
        season_id,
        extra,
        title,
        video_id,
        video_url,
        episode_number,
        type
      )
    `
    )
    .eq("id", seasonID)
    .single();

  if (seasonError || !season) {
    console.error("Error fetching season:", seasonError);
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Season</h1>
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
            <p className="text-red-300">
              Error loading season: {seasonError?.message || "Season not found"}
              . Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format year if it exists
  const yearDisplay = season.year ? `${season.year}` : "N/A";

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          {season.season_name}{" "}
          <span className="text-sm text-gray-400">{yearDisplay}</span>
        </h1>
        <p className="text-gray-400 text-sm mb-4">{season.description}</p>
        {season.quote && (
          <p className="text-gray-500 text-sm italic mb-4">
            {season.quote.replace(/"/g, '"')}
          </p>
        )}
        {season.videos.length > 0 ? (
          <SeasonVideoList videos={season.videos} />
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-300 text-xl font-semibold">
              No videos found for this season.
            </p>
            <p className="text-gray-400 mt-2">Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Define PageProps with Promise for params
interface PageProps {
  params: Promise<{ seasonID: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SeasonPage({ params }: PageProps) {
  const resolvedParams = await params; // Await the params Promise
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
          <FontAwesomeIcon icon={faSpinner} spinPulse />
        </div>
      }
    >
      <SeasonContent seasonID={resolvedParams.seasonID} />
    </Suspense>
  );
}

export const revalidate = 60;
