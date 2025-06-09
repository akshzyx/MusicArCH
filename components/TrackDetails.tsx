"use client";

import { Release } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faHeart } from "@fortawesome/free-solid-svg-icons";
import { useAudio } from "@/lib/AudioContext";
import { useState } from "react";
import Image from "next/image";

interface TrackDetailsProps {
  track: Release | null;
  onClose: () => void;
}

export function TrackDetails({ track, onClose }: TrackDetailsProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudio();
  const [isFavorited, setIsFavorited] = useState(false);

  if (!track) return null;

  const isTrackPlayable = !!track.file && track.file.trim() !== "";
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayPause = () => {
    if (!isTrackPlayable) return;
    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Add logic to save favorite to Supabase or local state if implemented
  };

  return (
    <div className="fixed inset-0 bg-[#0C1521] bg-opacity-95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8">
        {/* Left: Cover Image */}
        <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center">
          {track.cover_image ? (
            <Image
              src={track.cover_image}
              alt={`${track.title} cover`}
              className="w-64 h-64 md:w-72 md:h-72 object-cover rounded-lg"
            />
          ) : (
            <div className="w-64 h-64 md:w-72 md:h-72 bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No Cover Available</span>
            </div>
          )}
        </div>

        {/* Right: Track Details */}
        <div className="flex-1 text-white space-y-4">
          {/* Track Title and Close Button */}
          <div className="flex justify-between items-center">
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wide">
              {track.title}
            </h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              title="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-base md:text-lg">
            {track.notes ||
              "This track is part of a collection with a rich history. Explore more to discover its origins and impact."}
          </p>

          {/* Play and Favorite Buttons */}
          <div className="flex space-x-4">
            {isTrackPlayable && (
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <FontAwesomeIcon
                  icon={isCurrentTrack && isPlaying ? faPause : faPlay}
                  className="text-xl"
                />
              </button>
            )}
            <button
              onClick={handleFavorite}
              className={`flex items-center px-4 py-2 rounded-full border transition-colors ${
                isFavorited
                  ? "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  : "border-gray-500 text-gray-300 hover:bg-gray-500 hover:text-white"
              }`}
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`mr-2 ${
                  isFavorited ? "text-red-500" : "text-gray-300"
                }`}
              />
              {isFavorited ? "Favorited" : "Favorite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
