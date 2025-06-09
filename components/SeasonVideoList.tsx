"use client";

import Link from "next/link";

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

type SeasonVideoListProps = {
  videos: Video[];
};

export default function SeasonVideoList({ videos }: SeasonVideoListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
        >
          <Link href={`/videos/${video.id}`}>
            <div className="aspect-video bg-gray-700">
              <img
                src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                alt={`${video.title} thumbnail`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`;
                }}
              />
            </div>
          </Link>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white truncate">
              {video.title || "Untitled"} (Ep {video.episode_number}){" "}
              {video.type === "extra" && "(Extra)"}
            </h3>
            {video.channel && (
              <p className="text-gray-400 text-sm mt-1">
                Channel: {video.channel}
              </p>
            )}
            {video.upload_date && (
              <p className="text-gray-400 text-sm mt-1">
                Uploaded: {new Date(video.upload_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
