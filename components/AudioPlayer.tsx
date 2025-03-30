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
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

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

  const handlePlayPause = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(currentTrack, sectionTracks);
    }
  }, [currentTrack, isPlaying, pauseTrack, playTrack, sectionTracks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTrack, isPlaying, sectionTracks, handlePlayPause]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    setAudioTime((clickX / rect.width) * duration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleToggleDuration = () => setShowTimeLeft(!showTimeLeft);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-4/5 md:w-3/4 lg:w-3/4 bg-gray-900/60 backdrop-blur-xl text-white py-2 sm:py-3 md:py-4 px-4 sm:px-6 rounded-xl flex items-center justify-between gap-2 sm:gap-4 md:gap-6 shadow-2xl border border-gray-700">
      {/* Album Art & Title */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-auto min-w-0 truncate">
        <Image
          src={currentTrack.cover_image || "/default.jpg"}
          alt={`${currentTrack.title} Cover`}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg object-cover"
          width={48}
          height={48}
          onError={() => {
            currentTrack.cover_image = "/default.jpg";
          }}
        />
        <span className="font-semibold text-sm sm:text-base md:text-lg truncate">
          {currentTrack.title}
        </span>
      </div>

      {/* Playback Controls */}
      <div className="w-1/3 sm:w-1/4 flex items-center justify-center space-x-2 sm:space-x-3 md:space-x-4">
        <button
          onClick={toggleShuffle}
          className={`text-gray-400 hover:text-green-400 transition-colors text-xs sm:text-sm md:text-base ${
            isShuffle ? "text-green-400" : ""
          }`}
          title="Shuffle"
        >
          <FontAwesomeIcon icon={faShuffle} />
        </button>
        <button
          onClick={prevTrack}
          className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm md:text-base"
          title="Previous"
        >
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <button
          onClick={handlePlayPause}
          className="text-gray-400 hover:text-white w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all text-sm sm:text-base md:text-lg"
          title={isPlaying ? "Pause" : "Play"}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button
          onClick={nextTrack}
          className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm md:text-base"
          title="Next"
        >
          <FontAwesomeIcon icon={faForward} />
        </button>
        <button
          onClick={toggleRepeat}
          className={`text-gray-400 hover:text-green-400 transition-colors text-xs sm:text-sm md:text-base ${
            isRepeat ? "text-green-400" : ""
          }`}
          title="Repeat"
        >
          <FontAwesomeIcon icon={faRepeat} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-1/2 sm:w-1/2 flex items-center space-x-1 sm:space-x-2">
        <span className="text-[10px] sm:text-xs md:text-sm text-gray-400">
          {formatTime(currentTime)}
        </span>
        <div
          className="relative flex-1 bg-gray-600 rounded-full h-1 sm:h-1.5 md:h-2 cursor-pointer group"
          onClick={handleProgressClick}
        >
          {/* Waveform Bar Effect */}
          <div
            className="bg-green-400 h-1 sm:h-1.5 md:h-2 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          {/* Draggable Progress Indicator */}
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span
          className="text-[10px] sm:text-xs md:text-sm text-gray-400 cursor-pointer"
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
