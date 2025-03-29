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
    isPlaying ? pauseTrack() : playTrack(currentTrack, sectionTracks);
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 bg-gray-900/60 backdrop-blur-xl text-white py-4 px-6 rounded-xl flex items-center justify-between gap-6 shadow-2xl border border-gray-700">
      {/* Album Art & Title */}
      <div className="flex items-center gap-4 w-auto min-w-0 truncate">
        {/* <img
          src={currentTrack.albumArt || "/default.jpg"}
          alt="Album Art"
          className="w-12 h-12 rounded-lg object-cover"
        /> */}
        <span className="font-semibold text-base truncate">
          {currentTrack.title}
        </span>
      </div>

      {/* Playback Controls */}
      <div className="w-1/4 flex items-center justify-center space-x-4">
        <button
          onClick={toggleShuffle}
          className={`text-gray-400 hover:text-green-400 transition-colors ${
            isShuffle ? "text-green-400" : ""
          }`}
          title="Shuffle"
        >
          <FontAwesomeIcon icon={faShuffle} />
        </button>
        <button
          onClick={prevTrack}
          className="text-gray-400 hover:text-white transition-colors"
          title="Previous"
        >
          <FontAwesomeIcon icon={faBackward} />
        </button>
        <button
          onClick={handlePlayPause}
          className="text-gray-400 hover:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all"
          title={isPlaying ? "Pause" : "Play"}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button
          onClick={nextTrack}
          className="text-gray-400 hover:text-white transition-colors"
          title="Next"
        >
          <FontAwesomeIcon icon={faForward} />
        </button>
        <button
          onClick={toggleRepeat}
          className={`text-gray-400 hover:text-green-400 transition-colors ${
            isRepeat ? "text-green-400" : ""
          }`}
          title="Repeat"
        >
          <FontAwesomeIcon icon={faRepeat} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-1/2 flex items-center space-x-2">
        <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
        <div
          className="relative flex-1 bg-gray-600 rounded-full h-2 cursor-pointer group"
          onClick={handleProgressClick}
        >
          {/* Waveform Bar Effect */}
          <div
            className="bg-green-400 h-2 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          {/* Draggable Progress Indicator */}
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span
          className="text-xs text-gray-400 cursor-pointer"
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
