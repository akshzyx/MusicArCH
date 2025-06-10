/* eslint-disable */
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ videoId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: video, error } = await supabase
    .from("videos")
    .select("title")
    .eq("id", resolvedParams.videoId)
    .single();

  if (error || !video) {
    return {
      title: "Video Not Found - JojiArCH",
    };
  }

  return {
    title: `${video.title || "Video"} - JojiArCH`,
    description: `Watch ${
      video.title || "this video"
    } by Joji and his aliases.`,
  };
}

export default async function VideoPlayerPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const resolvedParams = await params;
  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("*")
    .eq("id", resolvedParams.videoId)
    .single();

  if (videoError || !video) {
    notFound();
  }

  // Fetch next episodes in the same season (up to 6 for 2 rows of 3)
  const currentEpisodeNumber = parseInt(video.episode_number, 10) || 0;
  const { data: videos, error: nextVideosError } = await supabase
    .from("videos")
    .select("id, title, episode_number, season_id, video_id")
    .eq("season_id", video.season_id || "")
    .gt("episode_number", video.episode_number)
    .order("episode_number", { ascending: true })
    .limit(6);

  if (nextVideosError) {
    console.error("Error fetching next episodes:", nextVideosError);
  }

  const videoId = video.video_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 sm:p-6 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="aspect-video overflow-hidden rounded-lg shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
            title={video.title || "Video Player"}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-teal-400 flex items-center animate-delay-[100ms]">
            <span className="mr-2 text-lg text-gray-400">
              {video.episode_number || "N/A"}
            </span>
            {video.title || "Thumbnail"}
          </h1>
          <div className="text-gray-400 text-sm flex items-center gap-4 mt-2 animate-delay-[200ms]">
            <span>{video.channel || "N/A"}</span>
            <span>{video.upload_date || "N/A"}</span>
          </div>
          <p className="text-gray-200 mt-4 bg-gray-800/50 backdrop-blur-md p-4 rounded-xl animate-delay-[300ms]">
            {video.description || "No description available"}
          </p>
          {/* Next Episodes Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-teal-400 mb-4 animate-delay-[400ms]">
              Next Episodes
            </h2>
            {videos && videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {videos.map((nextVideo, index) => (
                  <div
                    key={nextVideo.id}
                    className="bg-gray-800/50 backdrop-blur-md rounded-lg p-2 hover:bg-gray-700/50 transition-colors duration-200 min-w-[275px]"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <Link
                      href={`/videos/${nextVideo.id}`}
                      className="flex items-center gap-3 text-gray-300 hover:text-teal-400 transition-colors duration-200"
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${nextVideo.video_id}/hqdefault.jpg`}
                        alt={nextVideo.title || "Episode Thumbnail"}
                        width={96}
                        height={54}
                        className="rounded"
                        unoptimized
                      />
                      <div className="flex flex-col flex-1">
                        <p className="text-sm font-medium line-clamp-2 break-words">
                          {nextVideo.title || "Thumbnail"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Ep {nextVideo.episode_number || "N/A"}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-gray-400 animate-delay-[600ms]">
                No more episodes in this season.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 60;
