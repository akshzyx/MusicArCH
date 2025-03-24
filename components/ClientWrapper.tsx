"use client"; // Must be the first line

import { ReactNode } from "react";
import { AudioProvider } from "@/lib/AudioContext";
import AudioPlayer from "@/components/AudioPlayer";

export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <AudioProvider>
        {children}
        <AudioPlayer />
      </AudioProvider>
    </>
  );
}
