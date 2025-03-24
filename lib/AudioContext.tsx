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
        setAudio(null);
      }
    };
  }, [audio]);

  const playTrack = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying && audio) {
        audio.pause();
        setIsPlaying(false);
      } else if (audio) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing audio:", error);
          alert("Failed to play track: " + (error as Error).message);
        }
      }
    } else {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setAudio(null); // Clear old audio instance
      }

      const newAudio = new Audio(track.file.trimEnd());
      setAudio(newAudio);
      setCurrentTrack(track);
      setIsPlaying(true);

      try {
        await newAudio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
        alert("Failed to play track: " + (error as Error).message);
        setIsPlaying(false);
        setCurrentTrack(null);
        setAudio(null);
      }

      newAudio.onended = () => {
        setIsPlaying(false);
        setCurrentTrack(null);
        setAudio(null);
      };
    }
  };

  const pauseTrack = () => {
    if (audio && isPlaying) {
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
