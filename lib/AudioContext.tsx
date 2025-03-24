"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Track } from "@/lib/types";

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  stopTrack: () => void;
}

const AudioContext = createContext<AudioState | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio?.pause();
        setIsPlaying(false);
      } else {
        audio?.play().catch((error) => {
          console.error("Error playing audio:", error);
          alert("Failed to play track: " + error.message);
        });
        setIsPlaying(true);
      }
    } else {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      const newAudio = new Audio(track.file.trimEnd());
      newAudio.play().catch((error) => {
        console.error("Error playing audio:", error);
        alert("Failed to play track: " + error.message);
      });
      setAudio(newAudio);
      setCurrentTrack(track);
      setIsPlaying(true);

      newAudio.onended = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
      };
    }
  };

  const pauseTrack = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const stopTrack = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setCurrentTrack(null);
      setAudio(null);
    }
  };

  return (
    <AudioContext.Provider
      value={{ currentTrack, isPlaying, playTrack, pauseTrack, stopTrack }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
