/* eslint-disable @typescript-eslint/no-unused-vars */
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

  // Fetch next episodes in the same season
  const currentEpisodeNumber = parseInt(video.episode_number, 10) || 0;
  const { data: nextVideos, error: nextVideosError } = await supabase
    .from("videos")
    .select("id, title, episode_number, season_id, video_id")
    .eq("season_id", video.season_id || "")
    .gt("episode_number", video.episode_number)
    .order("episode_number", { ascending: true })
    .limit(4);

  if (nextVideosError) {
    console.error("Error fetching next episodes:", nextVideosError);
  }

  const videoId = video.video_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="aspect-video overflow-hidden rounded-xl shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
            title={video.title || "Video Player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-teal-400 flex items-center animate-fadeIn">
            <span className="mr-3 text-lg text-gray-300">
              {video.episode_number || "N/A"}
            </span>
            {video.title || "Untitled Video"}
          </h1>
          <div className="text-gray-400 text-sm flex items-center mt-2 animate-fadeIn delay-100">
            <span className="mr-4">{video.channel || "N/A"}</span>
            <span>{video.upload_date || "N/A"}</span>
          </div>
          <p className="text-gray-200 mt-3 bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg animate-fadeIn delay-200">
            {video.description || "No description available"}
          </p>
          {/* Next Episodes Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-teal-400 mb-4 animate-fadeIn delay-300">
              Next Episodes
            </h2>
            {nextVideos && nextVideos.length > 0 ? (
              <ul className="space-y-3">
                {nextVideos.map((nextVideo, index) => (
                  <li
                    key={nextVideo.id}
                    className="bg-gray-800/50 backdrop-blur-md rounded-lg p-3 hover:bg-gray-900/50 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <Link
                      href={`/videos/${nextVideo.id}`}
                      className="flex items-center text-gray-300 hover:text-teal-400 transition-colors"
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${nextVideo.video_id}/hqdefault.jpg`}
                        alt={nextVideo.title || "Episode Thumbnail"}
                        width={64}
                        height={36}
                        className="rounded mr-3"
                        unoptimized
                      />
                      <span className="mr-3 text-sm text-gray-400">
                        Ep {nextVideo.episode_number || "N/A"}
                      </span>
                      <span className="text-sm font-medium">
                        {nextVideo.title || "Untitled Video"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-3 text-gray-400 animate-fadeIn delay-400">
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
