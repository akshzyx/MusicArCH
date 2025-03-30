"use client"; // Must be the first line

import { ReactNode } from "react";
import { AudioProvider } from "@/lib/AudioContext";
import AudioPlayer from "@/components/AudioPlayer";
import { usePathname } from "next/navigation";

export default function ClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname(); // Get the current route
  const showAudioPlayer = pathname !== "/upload"; // Hide on /upload (adjust if route differs)

  return (
    <AudioProvider>
      {children}
      {showAudioPlayer && <AudioPlayer />}
    </AudioProvider>
  );
}
