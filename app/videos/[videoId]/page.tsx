/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { notFound } from "next/navigation";

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

  // Assuming video_url is a YouTube URL, use the video_id for embedding
  const videoId = video.video_id; // Extract video_id from the URL or use directly

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
        </div>
      </div>
    </div>
  );
}

export const revalidate = 60;
