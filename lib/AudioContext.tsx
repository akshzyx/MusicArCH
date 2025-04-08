"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Release } from "@/lib/types";

interface AudioContextType {
  currentTrack: Release | null;
  isPlaying: boolean;
  sectionTracks: Release[];
  activePlaylist: Release[];
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
  setAudioTime: (timeOrOptions: number | { volume?: number }) => void;
  setSectionTracks: (tracks: Release[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Release | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sectionTracks, setSectionTracks] = useState<Release[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Release[]>([]); // New state for the active playlist
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
        "activePlaylist:",
        activePlaylist
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
      // Update activePlaylist only when explicitly playing a new track with a provided tracklist
      if (tracks.length > 0) {
        setActivePlaylist(tracks);
      } else if (activePlaylist.length === 0) {
        setActivePlaylist([track]); // Fallback to single track if no list provided
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
      audio.ref.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const isTrackPlayable = (track: Release) => {
    return !!track.file && track.file.trim() !== "";
  };

  const getTrackIndex = () => {
    return activePlaylist.findIndex((t) => t.id === currentTrack?.id);
  };

  const nextTrack = () => {
    if (!currentTrack || activePlaylist.length === 0) {
      console.log("No next track: currentTrack or activePlaylist empty");
      return;
    }
    const currentIndex = getTrackIndex();
    if (currentIndex === -1) {
      console.log(
        "Current track not found in activePlaylist, finding first playable track"
      );
      const firstPlayable = activePlaylist.find(isTrackPlayable);
      if (firstPlayable) {
        playTrack(firstPlayable, []);
      }
      return;
    }

    let nextIndex = isShuffle
      ? Math.floor(Math.random() * activePlaylist.length)
      : (currentIndex + 1) % activePlaylist.length;

    // Skip unavailable tracks
    let attempts = 0;
    while (
      !isTrackPlayable(activePlaylist[nextIndex]) &&
      attempts < activePlaylist.length
    ) {
      nextIndex = isShuffle
        ? Math.floor(Math.random() * activePlaylist.length)
        : (nextIndex + 1) % activePlaylist.length;
      attempts++;
    }

    if (attempts >= activePlaylist.length) {
      console.log("No playable tracks found in activePlaylist");
      stopTrack();
      return;
    }

    console.log(
      "Next playable track index:",
      nextIndex,
      "track:",
      activePlaylist[nextIndex]
    );
    // Pass an empty array to avoid updating activePlaylist
    playTrack(activePlaylist[nextIndex], []);
  };

  const prevTrack = () => {
    if (!currentTrack || activePlaylist.length === 0) return;
    const currentIndex = getTrackIndex();
    if (currentIndex === -1) return;

    let prevIndex = isShuffle
      ? Math.floor(Math.random() * activePlaylist.length)
      : (currentIndex - 1 + activePlaylist.length) % activePlaylist.length;

    // Skip unavailable tracks
    let attempts = 0;
    while (
      !isTrackPlayable(activePlaylist[prevIndex]) &&
      attempts < activePlaylist.length
    ) {
      prevIndex = isShuffle
        ? Math.floor(Math.random() * activePlaylist.length)
        : (prevIndex - 1 + activePlaylist.length) % activePlaylist.length;
      attempts++;
    }

    if (attempts >= activePlaylist.length) {
      console.log("No playable tracks found in activePlaylist");
      stopTrack();
      return;
    }

    // Pass an empty array to avoid updating activePlaylist
    playTrack(activePlaylist[prevIndex], []);
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
      audio.volume = Math.max(0, Math.min(1, timeOrOptions.volume));
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        sectionTracks,
        activePlaylist, // Expose activePlaylist for debugging if needed
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
