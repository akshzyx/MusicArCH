"use client";

import { useAudio } from "@/lib/AudioContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
  faRepeat,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

export default function AudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    sectionTracks,
    isRepeat,
    isShuffle,
    currentTime,
    duration,
    playTrack,
    pauseTrack,
    nextTrack,
    prevTrack,
    toggleRepeat,
    toggleShuffle,
    setAudioTime,
  } = useAudio();

  const [showTimeLeft, setShowTimeLeft] = useState(false);

  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(currentTrack, sectionTracks);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrack, isPlaying, sectionTracks]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    setAudioTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleToggleDuration = () => {
    setShowTimeLeft(!showTimeLeft);
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-md text-white py-4  sm:px-6 md:px-8 flex items-center justify-between gap-4 sm:gap-6 md:gap-8 shadow-lg border-t border-gray-800 z-50">
      {/* Title Section */}
      <div className="w-1/4 min-w-0 truncate text-left">
        <span className="font-semibold text-base">{currentTrack.title}</span>
      </div>

      {/* Playback Controls */}
      <div className="w-1/4 min-w-0 flex items-center justify-center space-x-4 sm:space-x-5">
        <button
          onClick={toggleShuffle}
          className={`text-sm ${
            isShuffle ? "text-green-400" : "text-gray-400"
          } hover:text-green-300 transition-colors`}
          title="Shuffle"
        >
          <FontAwesomeIcon icon={faShuffle} size="sm" />
        </button>
        <button
          onClick={prevTrack}
          className="text-gray-400 hover:text-white transition-colors"
          title="Previous"
        >
          <FontAwesomeIcon icon={faBackward} size="sm" />
        </button>
        <button
          onClick={handlePlayPause}
          className="text-white hover:text-gray-300 transition-colors"
          title={isPlaying ? "Pause" : "Play"}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="lg" />
        </button>
        <button
          onClick={nextTrack}
          className="text-gray-400 hover:text-white transition-colors"
          title="Next"
        >
          <FontAwesomeIcon icon={faForward} size="sm" />
        </button>
        <button
          onClick={toggleRepeat}
          className={`text-sm ${
            isRepeat ? "text-green-400" : "text-gray-400"
          } hover:text-green-300 transition-colors`}
          title="Repeat"
        >
          <FontAwesomeIcon icon={faRepeat} size="sm" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-1/2 min-w-0 flex items-center space-x-2">
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatTime(currentTime)}
        </span>
        <div
          className="flex-1 bg-gray-700 rounded-full h-1 cursor-pointer relative group"
          onClick={handleProgressClick}
        >
          <div
            className="bg-green-500 h-1 rounded-full transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <span
          className="text-xs text-gray-400 cursor-pointer whitespace-nowrap"
          onClick={handleToggleDuration}
        >
          {showTimeLeft
            ? `-${formatTime(duration - currentTime)}`
            : formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
