"use client";

import React from "react";
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

export default function SeasonVideoList({ videos }: { videos: Video[] }) {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    videoId: string
  ) => {
    const target = e.currentTarget as HTMLImageElement;
    target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    target.alt = "Image failed to load";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <div key={video.id} className="bg-gray-800 p-4 rounded-lg">
          <Link href={`/videos/${video.id}`}>
            <Image
              src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
              alt={video.title || "Video thumbnail"}
              className="w-full h-48 object-cover rounded"
              width={320}
              height={180}
              onError={(e) => handleImageError(e, video.video_id)}
              unoptimized
            />
          </Link>
          <h3 className="text-white mt-2">{video.title || "Untitled"}</h3>
          <p className="text-gray-400 text-sm">
            Episode: {video.episode_number}
          </p>
          <p className="text-gray-400 text-sm">Channel: {video.channel}</p>
        </div>
      ))}
    </div>
  );
}
