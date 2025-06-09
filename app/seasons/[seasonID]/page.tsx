import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { Suspense } from "react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

// Suppress the unused variable warning for Season type
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
  const resolvedParams = await params;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-700 p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <p className="text-red-300 text-lg font-medium">
            Error loading season: {seasonError?.message || "Season not found"}.
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const yearDisplay = season.year ? `${season.year}` : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl animate-fadeIn">
          <h1 className="text-4xl font-bold text-teal-400 mb-4 flex items-center">
            {season.season_name}{" "}
            <span className="ml-2 text-sm font-light text-gray-300 bg-gray-700/50 px-2 py-1 rounded-full">
              {yearDisplay}
            </span>
          </h1>
          <p className="text-gray-300 text-base mb-4">{season.description}</p>
          {season.quote && (
            <p className="text-gray-400 text-sm italic border-l-2 border-teal-400 pl-3 mb-6">
              {season.quote.replace(/"/g, '"')}
            </p>
          )}
          {season.videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {season.videos.map((video) => (
                <Link
                  href={`/videos/${video.id}`}
                  key={video.id}
                  className="block"
                >
                  <div className="bg-gray-800/70 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                      alt={video.title || "Video Thumbnail"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <h3 className="text-white text-sm font-semibold line-clamp-2">
                        {video.title || "Untitled Video"}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        Ep: {video.episode_number || "N/A"} |{" "}
                        {video.channel || "N/A"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/70 rounded-xl backdrop-blur-sm shadow-inner">
              <p className="text-gray-200 text-xl font-semibold">
                No videos found for this season.
              </p>
              <p className="text-gray-400 mt-2">Check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ seasonID: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SeasonPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
          <FontAwesomeIcon
            icon={faSpinner}
            spinPulse
            className="text-teal-400 text-4xl"
          />
        </div>
      }
    >
      <SeasonContent seasonID={resolvedParams.seasonID} />
    </Suspense>
  );
}

export const revalidate = 60;
