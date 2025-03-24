"use client";

import { useAudio } from "@/lib/AudioContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
  faStop,
  faRepeat,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

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
    stopTrack,
    nextTrack,
    prevTrack,
    toggleRepeat,
    toggleShuffle,
    setAudioTime,
  } = useAudio();

  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack(currentTrack, sectionTracks);
    }
  };

  // Spacebar Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault(); // Prevent scrolling
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4 w-full">
        {/* Playback Controls */}
        <div className="flex space-x-3">
          <button
            onClick={prevTrack}
            className="text-gray-400 hover:text-white text-lg"
            title="Previous"
          >
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button
            onClick={handlePlayPause}
            className="text-green-500 hover:text-green-700 text-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button
            onClick={nextTrack}
            className="text-gray-400 hover:text-white text-lg"
            title="Next"
          >
            <FontAwesomeIcon icon={faForward} />
          </button>
          <button
            onClick={stopTrack}
            className="text-red-500 hover:text-red-700 text-lg"
            title="Stop"
          >
            <FontAwesomeIcon icon={faStop} />
          </button>
          <button
            onClick={toggleRepeat}
            className={`text-lg ${
              isRepeat ? "text-yellow-500" : "text-gray-400"
            } hover:text-yellow-700`}
            title="Repeat"
          >
            <FontAwesomeIcon icon={faRepeat} />
          </button>
          <button
            onClick={toggleShuffle}
            className={`text-lg ${
              isShuffle ? "text-blue-500" : "text-gray-400"
            } hover:text-blue-700`}
            title="Shuffle"
          >
            <FontAwesomeIcon icon={faShuffle} />
          </button>
        </div>

        {/* Track Info and Progress */}
        <div className="flex-1 flex flex-col space-y-2">
          <span className="text-foreground">
            Now Playing: {currentTrack.title} ({currentTrack.duration})
          </span>
          <div
            className="w-full bg-gray-700 rounded-full h-2 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
