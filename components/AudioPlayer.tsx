"use client";

import { useAudio } from "@/lib/AudioContext";

export default function AudioPlayer() {
  const { currentTrack, isPlaying, playTrack, pauseTrack, stopTrack } =
    useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => (isPlaying ? pauseTrack() : playTrack(currentTrack))}
          className="text-green-500 hover:text-green-700 text-lg"
        >
          {isPlaying ? "❚❚ Pause" : "▶ Play"}
        </button>
        <span className="text-foreground">
          Now Playing: {currentTrack.title} ({currentTrack.duration})
        </span>
      </div>
      <button
        onClick={stopTrack}
        className="text-red-500 hover:text-red-700 text-lg"
      >
        Stop
      </button>
    </div>
  );
}
