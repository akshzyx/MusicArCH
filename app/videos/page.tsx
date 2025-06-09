import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";

type Season = {
  id: string;
  season_name: string;
  description: string;
  year: number | null;
  videos: Video[];
};

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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Videos - JojiArCH",
    description:
      "Explore Filthy Frank seasons and videos by Joji and his aliases.",
  };
}

export default async function VideosPage() {
  const { data: seasons, error: seasonsError } = await supabase
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
    .order("year", { ascending: true })
    .limit(3, { foreignTable: "videos" });

  if (seasonsError) {
    console.error("Error fetching seasons:", seasonsError);
    return (
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Videos</h1>
          <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
            <p className="text-red-300">
              Error loading seasons: {seasonsError.message}. Please try again
              later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const seasonList: Season[] = seasons || [];

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Videos</h1>
        {seasonList.length > 0 ? (
          seasonList.map((season) => (
            <div key={season.id} className="mb-8 bg-gray-800 rounded-lg p-4">
              <Link href={`/seasons/${season.id}`}>
                <h2 className="text-2xl font-semibold text-white hover:text-yellow-400 transition-colors cursor-pointer">
                  {season.season_name} ({season.videos.length} videos)
                </h2>
              </Link>
              <p className="text-gray-400 text-sm mt-2 mb-4">
                {season.description.substring(0, 150)}...
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {season.videos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-gray-700 rounded-lg overflow-hidden shadow-md"
                  >
                    <Link href={`/videos/${video.id}`}>
                      <img
                        src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                        alt={`${video.title} thumbnail`}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;
                        }}
                      />
                    </Link>
                    <div className="p-2">
                      <p className="text-white text-sm truncate">
                        {video.title} (Ep {video.episode_number})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-300 text-xl font-semibold">
              No seasons found.
            </p>
            <p className="text-gray-400 mt-2">
              Check back later for new Filthy Frank seasons!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const revalidate = 60;
