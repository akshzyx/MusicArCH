import { AudioProvider } from "@/lib/AudioContext";
import AudioPlayer from "@/components/AudioPlayer";
import "./globals.css";
import { Metadata } from "next";
import { IBM_Plex_Sans_Thai_Looped } from "next/font/google";

export const metadata: Metadata = {
  title: "Music Archive",
  description: "A music archive organized by eras",
};

// Load IBM Plex Sans Thai Looped with all weights
const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ["thai", "latin"], // Include Thai and Latin characters
  weight: ["100", "200", "300", "400", "500", "600", "700"], // All weights
  variable: "--font-ibm-plex-thai-looped",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexSansThaiLooped.variable} bg-background text-foreground font-sans`}
      >
        <AudioProvider>
          {children}
          <AudioPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
