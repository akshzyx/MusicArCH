"use client"; // Mark as Client Component

import Link from "next/link";
import Image from "next/image";

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

export default function VideoListClient({ seasons }: { seasons: Season[] }) {
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    videoId: string
  ) => {
    const target = e.currentTarget as HTMLImageElement;
    target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; // Fallback to medium quality
    target.alt = "Thumbnail failed to load";
  };

  return (
    <>
      {seasons.map((season) => (
        <div key={season.id} className="mb-8 bg-gray-800 rounded-lg p-4">
          <Link href={`/seasons/${season.id}`}>
            <h2 className="text-2xl font-semibold text-white hover:text-yellow-400 transition-colors cursor-pointer">
              {season.season_name} ({season.videos.length} videos)
            </h2>
          </Link>
          <p className="text-gray-400 text-sm mt-2 mb-4">
            {season.description.substring(0, 150)}...
          </p>
          {season.quote && (
            <p className="text-gray-500 text-xs italic mb-4">
              &quot;{season.quote}&quot;
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {season.videos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-700 rounded-lg overflow-hidden shadow-md"
              >
                <Link href={`/videos/${video.id}`}>
                  <Image
                    src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
                    alt={`${video.title} thumbnail`}
                    className="w-full h-32 object-cover"
                    width={320}
                    height={180}
                    onError={(e) => handleImageError(e, video.video_id)}
                    unoptimized
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
      ))}
    </>
  );
}
