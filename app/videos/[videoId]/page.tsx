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
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          {video.title || "Untitled Video"}
        </h1>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title || "Video Player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
        <div className="mt-4 text-white">
          <p>
            <strong>Description:</strong>{" "}
            {video.description || "No description available"}
          </p>
          <p>
            <strong>Upload Date:</strong> {video.upload_date || "N/A"}
          </p>
          <p>
            <strong>Channel:</strong> {video.channel || "N/A"}
          </p>
          <p>
            <strong>Episode Number:</strong> {video.episode_number || "N/A"}
          </p>
          <p>
            <strong>Type:</strong> {video.type || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 60;
