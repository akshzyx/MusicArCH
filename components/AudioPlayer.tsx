"use client";

import { useEffect, useState } from "react";
import { Howl } from "howler";

interface AudioPlayerProps {
  src: string;
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const [sound, setSound] = useState<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const howl = new Howl({
      src: [src],
      html5: true,
      onload: () => console.log("Loaded:", src),
      onloaderror: (id, error) => console.error("Load error:", error),
    });
    setSound(howl);

    return () => {
      howl.unload();
    };
  }, [src]);

  const togglePlay = () => {
    if (!sound) return;
    if (isPlaying) {
      sound.pause();
    } else {
      sound.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={togglePlay}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {isPlaying ? "Pause" : "Play"}
    </button>
  );
}
