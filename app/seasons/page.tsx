/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { Suspense } from "react";
import VideoListClient from "@/components/VideoListClient";
// import { AnimatedTestimonialsDemo } from "@/components/Testimonials";

type Season = {
  id: string;
  season_name: string;
  description: string;
  year: number | null;
  quote: string | null;
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
    title: "Seasons - JojiArCH",
    description:
      "Explore Filthy Frank seasons and videos by Joji and his aliases.",
  };
}

async function fetchSeasons() {
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
    return [];
  }

  return seasons || [];
}

export default async function VideosPage() {
  const seasonList = await fetchSeasons();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Animated Testimonials Section */}
        {/* <div className="mb-8">
          <AnimatedTestimonialsDemo />
        </div> */}
        {/* Seasons Section */}
        {/* <h1 className="text-4xl font-bold text-teal-400 mb-6 animate-fadeIn">
          Videos
        </h1> */}
        {seasonList.length > 0 ? (
          <Suspense
            fallback={
              <div className="text-center py-12 bg-gray-800/50 rounded-xl backdrop-blur-md shadow-lg">
                <p className="text-gray-300 text-xl font-semibold">
                  Loading seasons...
                </p>
              </div>
            }
          >
            <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl animate-fadeIn">
              <VideoListClient seasons={seasonList} />
            </div>
          </Suspense>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl backdrop-blur-md shadow-lg">
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
