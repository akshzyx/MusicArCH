import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import SeasonVideoList from "@/components/SeasonVideoList";

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
  videos: Video[];
};

export async function generateMetadata({
  params,
}: {
  params: { seasonID: string };
}): Promise<Metadata> {
  const { data: season } = await supabase
    .from("seasons")
    .select("season_name")
    .eq("id", params.seasonID)
    .single();

  return {
    title: `${season?.season_name || "Season"} - JojiArCH`,
    description: `Watch all videos from ${
      season?.season_name || "this season"
    } by Joji and his aliases.`,
  };
}

export default async function SeasonPage({
  params,
}: {
  params: { seasonID: string };
}) {
  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select(
      `
      id,
      season_name,
      description,
      year,
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
    .eq("id", params.seasonID)
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

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          {season.season_name}
        </h1>
        <p className="text-gray-400 text-sm mb-4">{season.description}</p>
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

export const revalidate = 60;
