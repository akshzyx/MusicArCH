"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Release } from "@/lib/types"; // Changed from Track

interface AudioContextType {
  currentTrack: Release | null;
  isPlaying: boolean;
  sectionTracks: Release[];
  isRepeat: boolean;
  isShuffle: boolean;
  currentTime: number;
  duration: number;
  playTrack: (track: Release, tracks?: Release[]) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setAudioTime: (timeOrOptions: number | { volume?: number }) => void; // Updated type
  setSectionTracks: (tracks: Release[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Release | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sectionTracks, setSectionTracks] = useState<Release[]>([]);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      console.log(
        "Audio ended, isRepeat:",
        isRepeat,
        "sectionTracks:",
        sectionTracks
      );
      if (isRepeat) {
        console.log("Repeating current track:", currentTrack);
        audio.currentTime = 0;
        setCurrentTime(0);
        audio.play().catch((err) => console.error("Repeat play error:", err));
        setIsPlaying(true);
      } else {
        console.log("Moving to next track");
        nextTrack();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (audio.src !== currentTrack.file) {
      audio.src = currentTrack.file;
      audio.load();
      audio.oncanplaythrough = () => {
        if (isPlaying) {
          audio.play().catch((err) => console.error("Play error:", err));
        }
      };
    } else if (isPlaying) {
      audio.play().catch((err) => console.error("Play error:", err));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]);

  const playTrack = (track: Release, tracks: Release[] = []) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log("Resuming track at:", audio.currentTime);
        audio
          .play()
          .catch((err) => console.error("Resume playback failed:", err));
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      // Only update sectionTracks if a new list is provided, otherwise keep existing
      if (tracks.length > 0) {
        setSectionTracks(tracks);
      } else if (sectionTracks.length === 0) {
        setSectionTracks([track]); // Fallback to single track if no list provided
      }
      setCurrentTime(0);
      audio.src = track.file;
      audio.load();
      audio.oncanplaythrough = () => {
        audio.play().catch((err) => console.error("Playback failed:", err));
        setIsPlaying(true);
      };
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const isTrackPlayable = (track: Release) => {
    return !!track.file && track.file.trim() !== "";
  };

  const getTrackIndex = () => {
    return sectionTracks.findIndex((t) => t.id === currentTrack?.id);
  };

  const nextTrack = () => {
    if (!currentTrack || sectionTracks.length === 0) {
      console.log("No next track: currentTrack or sectionTracks empty");
      return;
    }
    const currentIndex = getTrackIndex();
    if (currentIndex === -1) {
      console.log(
        "Current track not found in sectionTracks, finding first playable track"
      );
      const firstPlayable = sectionTracks.find(isTrackPlayable);
      if (firstPlayable) {
        playTrack(firstPlayable, sectionTracks);
      }
      return;
    }

    let nextIndex = isShuffle
      ? Math.floor(Math.random() * sectionTracks.length)
      : (currentIndex + 1) % sectionTracks.length;

    // Skip unavailable tracks
    let attempts = 0;
    while (
      !isTrackPlayable(sectionTracks[nextIndex]) &&
      attempts < sectionTracks.length
    ) {
      nextIndex = isShuffle
        ? Math.floor(Math.random() * sectionTracks.length)
        : (nextIndex + 1) % sectionTracks.length;
      attempts++;
    }

    if (attempts >= sectionTracks.length) {
      console.log("No playable tracks found in sectionTracks");
      stopTrack();
      return;
    }

    console.log(
      "Next playable track index:",
      nextIndex,
      "track:",
      sectionTracks[nextIndex]
    );
    playTrack(sectionTracks[nextIndex], sectionTracks);
  };

  const prevTrack = () => {
    if (!currentTrack || sectionTracks.length === 0) return;
    const currentIndex = getTrackIndex();
    if (currentIndex === -1) return;

    let prevIndex = isShuffle
      ? Math.floor(Math.random() * sectionTracks.length)
      : (currentIndex - 1 + sectionTracks.length) % sectionTracks.length;

    // Skip unavailable tracks
    let attempts = 0;
    while (
      !isTrackPlayable(sectionTracks[prevIndex]) &&
      attempts < sectionTracks.length
    ) {
      prevIndex = isShuffle
        ? Math.floor(Math.random() * sectionTracks.length)
        : (prevIndex - 1 + sectionTracks.length) % sectionTracks.length;
      attempts++;
    }

    if (attempts >= sectionTracks.length) {
      console.log("No playable tracks found in sectionTracks");
      stopTrack();
      return;
    }

    playTrack(sectionTracks[prevIndex], sectionTracks);
  };

  const toggleRepeat = () => {
    setIsRepeat((prev) => {
      console.log("Toggling repeat, new value:", !prev);
      return !prev;
    });
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const setAudioTime = (timeOrOptions: number | { volume?: number }) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (typeof timeOrOptions === "number") {
      audio.currentTime = timeOrOptions;
      setCurrentTime(timeOrOptions);
    } else if (timeOrOptions.volume !== undefined) {
      audio.volume = Math.max(0, Math.min(1, timeOrOptions.volume)); // Clamp volume between 0 and 1
    }
  };

  return (
    <AudioContext.Provider
      value={{
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
        setSectionTracks,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context)
    throw new Error("useAudio must be used within an AudioProvider");
  return context;
}
