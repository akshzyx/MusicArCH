"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Track } from "@/lib/types";

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  sectionTracks: Track[];
  isRepeat: boolean;
  isShuffle: boolean;
  currentTime: number;
  duration: number;
  playTrack: (track: Track, tracks?: Track[]) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setAudioTime: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sectionTracks, setSectionTracks] = useState<Track[]>([]);
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
      if (isRepeat) {
        audio.currentTime = 0; // Reset to start for repeat
        audio.play();
      } else {
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
  }, []); // Only run once to initialize audio element

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (currentTrack.file !== audio.src) {
      audio.src = currentTrack.file;
      audio.load(); // Ensure new track is loaded
    }

    if (isPlaying) {
      audio.play().catch((err) => console.error("Play error:", err));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying]); // Sync audio with track and play state

  const playTrack = (track: Track, tracks: Track[] = []) => {
    setCurrentTrack(track);
    setSectionTracks(tracks.length > 0 ? tracks : [track]);
    setIsPlaying(true);
    setCurrentTime(0); // Reset progress for new track
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const stopTrack = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
  };

  const getTrackIndex = () => {
    return sectionTracks.findIndex((t) => t.id === currentTrack?.id);
  };

  const nextTrack = () => {
    if (!currentTrack || sectionTracks.length === 0) return;
    const currentIndex = getTrackIndex();
    if (currentIndex === -1) return;

    let nextIndex = isShuffle
      ? Math.floor(Math.random() * sectionTracks.length)
      : (currentIndex + 1) % sectionTracks.length;
    setCurrentTrack(sectionTracks[nextIndex]);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const prevTrack = () => {
    if (!currentTrack || sectionTracks.length === 0) return;
    const currentIndex = getTrackIndex();
    if (currentIndex === -1) return;

    let prevIndex = isShuffle
      ? Math.floor(Math.random() * sectionTracks.length)
      : (currentIndex - 1 + sectionTracks.length) % sectionTracks.length;
    setCurrentTrack(sectionTracks[prevIndex]);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const toggleRepeat = () => setIsRepeat((prev) => !prev);
  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const setAudioTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
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
